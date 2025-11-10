"use client";
import SiteShell from "@/components/SiteShell";

export default function ContactPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-3xl px-4 py-24">
        <h1 className="h2">Contact</h1>
        <p className="p mt-6">Project inquiries, collaborations, or to audit your current site.</p>
        <form className="mt-10 grid gap-4">
          <input required placeholder="Your name" className="bg-transparent border border-white/20 rounded-xl px-4 py-3" />
          <input required type="email" placeholder="Email" className="bg-transparent border border-white/20 rounded-xl px-4 py-3" />
          <textarea rows="5" placeholder="Tell me about your project" className="bg-transparent border border-white/20 rounded-xl px-4 py-3" />
          <button className="btn w-fit">Send</button>
        </form>
        <p className="text-sm text-neutral-400 mt-4">Or email: hello@nivimc.com</p>
      </section>
    </SiteShell>
  );
}
