import { motion } from "framer-motion";
import { stats } from "@/data/catalog";

const About = () => (
  <div>
    <section className="bg-hero text-primary-foreground py-20 lg:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-[var(--gradient-radial-gold)] opacity-50" />
      <div className="container-x mx-auto max-w-3xl text-center relative">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs uppercase tracking-widest text-accent font-semibold mb-4">Our story</motion.p>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-4xl lg:text-6xl font-black leading-tight mb-6">
          Built for the way <span className="text-gradient-gold italic">Ghana shops.</span>
        </motion.h1>
        <p className="text-lg text-primary-foreground/80 leading-relaxed">
          YAA BABY ENT. is a curated marketplace for everything you love — sourced from the brands you trust, delivered with the care you deserve.
        </p>
      </div>
    </section>

    <section className="container-x mx-auto max-w-5xl py-20 grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
      {stats.map((s) => (
        <div key={s.label}>
          <div className="font-display text-4xl font-bold text-primary">{s.value}</div>
          <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
        </div>
      ))}
    </section>

    <section className="container-x mx-auto max-w-3xl pb-24 prose prose-lg text-foreground/80">
      <p>We started YAA BABY ENT. with a simple belief: shopping in Ghana should feel as effortless and beautiful as the products themselves. Whether you're picking up a new pair of headphones, a signature fragrance, or the perfect gift, we're here to make it easy — authenticated, fast, and fair.</p>
      <p>From our warehouse in Accra to your doorstep nationwide, every order is handled with care. We work directly with verified brands and partners, so you know what you're buying is the real thing — every single time.</p>
      <p className="font-display italic text-2xl text-primary not-prose">"Everything you love. In one storefront."</p>
    </section>
  </div>
);

export default About;
