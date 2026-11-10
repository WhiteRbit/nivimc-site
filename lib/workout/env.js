// Where this build runs. The website (Next.js) leaves SCULPT_TARGET unset; the Claude
// artifact build (scripts/build-sculpt-artifact.mjs) sets it to "artifact".
export const IS_ARTIFACT = process.env.SCULPT_TARGET === "artifact";

// Exercise photos: site root on the website, files published beside the page in the artifact.
export const PHOTO_BASE = IS_ARTIFACT ? "workout-photos/" : "/workout-photos/";
