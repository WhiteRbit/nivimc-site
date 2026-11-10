// Saves Sculpt to the viewer's private space in the Claude artifact's database
// (data/users/<id>/), so the log follows them to every device.
//
// Documents: "sculpt" holds settings, the weekly plan, custom exercises and checkpoints;
// "day-YYYY-MM-DD" holds one logged day. Older Bikini Pro Training documents
// ("log-YYYY-MM-DD", "milestones") are read once and converted, never deleted.

import { EXERCISE_BY_ID, customId } from "./exercises";
import { LEGACY_NAMES, bikiniDay } from "./bikini";

const STATE_DOC = "sculpt";
const DAY_PREFIX = "day-";
const SAVE_DELAY = 800; // coalesce typing into one write per pause

const clean = (v) => JSON.parse(JSON.stringify(v ?? null));

// The documents a state is stored as: id → body.
export function docsFromState(state) {
  const docs = {
    [STATE_DOC]: clean({
      version: state.version,
      settings: state.settings,
      plan: state.plan,
      custom: state.custom ?? [],
      milestones: state.milestones ?? {},
    }),
  };
  for (const [k, day] of Object.entries(state.logs ?? {})) docs[DAY_PREFIX + k] = clean(day);
  return docs;
}

// Converts one day from the old Bikini Pro Training app ({entries: {name: [{w, r, ok}]}}).
export function convertLegacyDay(dateKey, log, custom) {
  const planned = bikiniDay(dateKey);
  const exercises = Object.entries(log.entries ?? {})
    .map(([name, sets]) => {
      let exId = LEGACY_NAMES[name];
      if (!exId) {
        exId = customId(name);
        if (!EXERCISE_BY_ID[exId] && !custom.some((c) => c.id === exId)) custom.push({ id: exId, name: name.slice(0, 80) });
      }
      const has = (v) => v !== "" && v != null;
      const logged = (sets ?? []).filter((x) => x && (has(x.w) || has(x.r)));
      return {
        exId,
        targetSets: Math.max(1, (sets ?? []).length),
        targetReps: planned.ex?.find((e) => e.exId === exId)?.reps ?? "10-12",
        sets: logged.map((x) => ({ weight: has(x.w) ? String(x.w) : "", reps: has(x.r) ? String(x.r) : "", done: Boolean(x.ok) })),
      };
    })
    .filter((e) => e.sets.length);
  if (!exercises.length) return null;
  return {
    title: planned.title,
    exercises,
    stage: "done",
    completed: true,
    notes: "From the Bikini Pro Training app.",
  };
}

// Applies stored documents over the in-memory state. Documents with a local save still
// waiting are skipped, so a snapshot never undoes what the person just typed.
export function applyDocs(state, docs, skip = new Set()) {
  let next = state;
  const s = docs[STATE_DOC];
  if (s && !skip.has(STATE_DOC)) {
    next = {
      ...next,
      settings: { ...next.settings, ...s.settings },
      plan: s.plan ?? next.plan,
      custom: s.custom ?? next.custom,
      milestones: s.milestones ?? next.milestones,
    };
  }
  const logs = { ...next.logs };
  let changed = false;
  for (const [id, body] of Object.entries(docs)) {
    if (!id.startsWith(DAY_PREFIX) || skip.has(id)) continue;
    logs[id.slice(DAY_PREFIX.length)] = body;
    changed = true;
  }
  return changed ? { ...next, logs } : next;
}

// Old Bikini Pro Training documents → { logs, custom, milestones } to merge in once.
export function legacyFromDocs(docs, existingCustom = []) {
  const custom = [...existingCustom];
  const logs = {};
  for (const [id, body] of Object.entries(docs)) {
    if (!id.startsWith("log-")) continue;
    const day = convertLegacyDay(id.slice(4), body, custom);
    if (day) logs[id.slice(4)] = day;
  }
  return { logs, custom, milestones: docs.milestones?.done ?? {} };
}

/**
 * Connects to the database. Resolves null when this view has no database (signed out,
 * not granted). `onDocs(docs, {definitive})` gets every stored document as id → body;
 * `onStatus(status)` gets "synced", "slow", "saving", "saved" or "error".
 */
export async function connectCloud({ onDocs, onStatus }) {
  const claude = typeof window !== "undefined" ? window.claude : null;
  if (!claude?.use) return null;
  const [db, user] = await Promise.all([claude.use("db"), claude.use("user")]);
  const uid = db && user ? await user.id() : null;
  if (!uid) return null;
  const col = db.collection(`data/users/${uid}`);

  const sent = new Map(); // doc id → JSON last written or received
  const timers = new Map(); // doc id → pending save timer
  const chains = new Map(); // doc id → promise of the write in flight (one at a time)
  let latest = {};

  const slow = setTimeout(() => onStatus("slow"), 10000);
  const unsubscribe = col.onSnapshot(
    (snap) => {
      if (!snap.metadata.fromCache) {
        clearTimeout(slow);
        onStatus("synced");
      }
      const docs = {};
      for (const d of snap.docs) {
        const body = d.data();
        if (!body) continue;
        docs[d.id] = body;
        if (!timers.has(d.id)) sent.set(d.id, JSON.stringify(body));
      }
      onDocs(docs, { definitive: !snap.metadata.fromCache, pending: new Set(timers.keys()) });
    },
    () => {
      clearTimeout(slow);
      onStatus("error");
    },
  );

  const write = (id) => {
    timers.delete(id);
    const body = latest[id];
    if (!body) return;
    const json = JSON.stringify(body);
    if (sent.get(id) === json) return;
    sent.set(id, json);
    onStatus("saving");
    const run = (chains.get(id) ?? Promise.resolve())
      .then(() => col.doc(id).set(body))
      .then(() => onStatus(timers.size ? "saving" : "saved"))
      .catch((e) => {
        sent.delete(id); // try again on the next change
        onStatus(e?.code === "quota_exceeded" ? "full" : "error");
      });
    chains.set(id, run);
  };

  return {
    // Writes every document whose body changed since it was last written or received.
    save(state) {
      latest = docsFromState(state);
      for (const [id, body] of Object.entries(latest)) {
        if (sent.get(id) === JSON.stringify(body)) continue;
        clearTimeout(timers.get(id));
        timers.set(
          id,
          setTimeout(() => write(id), SAVE_DELAY),
        );
      }
    },
    stop() {
      clearTimeout(slow);
      unsubscribe();
    },
  };
}
