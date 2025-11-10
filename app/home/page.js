"use client";
import { motion } from "framer-motion";
import SiteShell from "@/components/SiteShell";

export default function HomePage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-6xl px-4 py-24">
        <motion.h2
          className="h2"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          NIVIMC Studio
        </motion.h2>
        <p className="p mt-6 max-w-3xl">
          We design and engineer interfaces with surgical simplicity. Strategy first, typography that breathes, and code that ships clean.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {["Design Systems","Marketing Sites","Web Apps"].map((t,i)=> (
            <motion.div key={t} className="border border-white/10 rounded-2xl p-6" initial={{opacity:0,y:12}} whileInView={{opacity:1,y:0}} transition={{delay:i*0.05}} viewport={{ once:true}}>
              <h3 className="text-xl font-semibold">{t}</h3>
              <p className="p mt-2">Minimal surfaces. Maximum intention. Always responsive, always fast.</p>
            </motion.div>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
