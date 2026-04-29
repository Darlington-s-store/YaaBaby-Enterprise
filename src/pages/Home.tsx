import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowRight, Truck, ShieldCheck, RotateCcw, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/ProductCard";
import { products, categories, heroSlides, stats, testimonials } from "@/data/catalog";
import heroImg from "@/assets/hero-merch.jpg";

const Marquee = () => (
  <div className="bg-primary text-primary-foreground py-3 overflow-hidden border-y border-accent/20">
    <div className="marquee flex gap-12 whitespace-nowrap text-sm font-medium">
      {Array.from({ length: 2 }).map((_, k) => (
        <div key={k} className="flex gap-12 shrink-0">
          {["⚡ Flash sale up to 40% off", "🚚 Free delivery over GH₵500", "✨ New: Maison Yaa fragrances", "🎁 Earn 5% back as store credit", "💳 Pay with Paystack & MoMo", "🇬🇭 Authenticated, ships across Ghana"].map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      ))}
    </div>
  </div>
);

const Countdown = () => {
  const [time, setTime] = useState({ h: 23, m: 59, s: 59 });
  useEffect(() => {
    const i = setInterval(() => {
      setTime((t) => {
        let { h, m, s } = t;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 23; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(i);
  }, []);
  const cell = (n: number, label: string) => (
    <div className="flex flex-col items-center">
      <div className="bg-primary text-primary-foreground rounded-xl px-4 py-3 min-w-[64px] text-center font-mono text-2xl lg:text-3xl font-bold tabular-nums">
        {String(n).padStart(2, "0")}
      </div>
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-2">{label}</span>
    </div>
  );
  return (
    <div className="flex items-center gap-3">
      {cell(time.h, "hrs")}<span className="text-2xl text-muted-foreground">:</span>
      {cell(time.m, "min")}<span className="text-2xl text-muted-foreground">:</span>
      {cell(time.s, "sec")}
    </div>
  );
};

const Home = () => {
  const featured = products.slice(0, 4);
  const trending = products.slice(2, 8);

  return (
    <>
      {/* HERO — full-bleed background image */}
      <section className="relative overflow-hidden text-primary-foreground min-h-[640px] lg:min-h-[720px] flex items-center">
        <img
          src={heroImg}
          alt="Curated YAA BABY products"
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
        {/* Cinematic overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/75 to-primary/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[var(--gradient-radial-gold)] opacity-40 mix-blend-overlay" />

        <div className="container-x mx-auto max-w-7xl relative grid lg:grid-cols-12 gap-10 items-center py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6 lg:col-span-7"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-white/10 backdrop-blur px-4 py-1.5 text-xs uppercase tracking-widest">
              <Sparkles className="size-3.5 text-accent" /> {heroSlides[0].eyebrow}
            </div>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-[0.95] font-black drop-shadow-lg">
              Everything you love.<br />
              <span className="text-gradient-gold italic">In one storefront.</span>
            </h1>
            <p className="text-lg text-primary-foreground/90 max-w-xl leading-relaxed">
              Electronics, fashion, beauty, and home — curated, authenticated, and delivered across Ghana in 24 hours.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button size="lg" asChild className="bg-gold text-accent-foreground hover:opacity-90 shadow-gold rounded-full font-semibold h-12 px-7">
                <Link to="/shop">Shop the edit <ArrowRight className="ml-2 size-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="rounded-full h-12 px-7 bg-white/10 border-white/30 hover:bg-white/20 text-primary-foreground backdrop-blur">
                <Link to="/about">Our story</Link>
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-4 pt-8 border-t border-white/15 max-w-xl">
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="font-display text-2xl lg:text-3xl font-bold text-accent">{s.value}</div>
                  <div className="text-xs text-primary-foreground/70 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="hidden lg:block lg:col-span-5"
          >
            <div className="bg-card/95 backdrop-blur-xl text-foreground p-6 rounded-3xl shadow-elegant max-w-sm ml-auto">
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => <Star key={i} className="size-4 fill-accent text-accent" />)}
              </div>
              <p className="text-sm leading-snug text-muted-foreground italic">"Genuine, fast, and packaged beautifully. The detail is unmatched in Accra."</p>
              <div className="mt-3 pt-3 border-t flex items-center gap-3">
                <div className="size-10 rounded-full bg-emerald-gold grid place-items-center text-primary-foreground font-bold text-sm">A</div>
                <div>
                  <div className="text-sm font-semibold">Ama Owusu</div>
                  <div className="text-xs text-muted-foreground">Verified buyer · Accra</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Marquee />

      {/* CATEGORIES */}
      <section className="container-x mx-auto max-w-7xl py-16 lg:py-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs uppercase tracking-widest text-accent font-semibold mb-2">Categories</p>
            <h2 className="font-display text-3xl lg:text-4xl font-bold">Shop by category</h2>
          </div>
          <Link to="/shop" className="text-sm font-medium text-primary hover:underline hidden sm:inline-flex items-center gap-1">
            All categories <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/shop?cat=${c.id}`}
                className="group block aspect-[4/5] rounded-2xl bg-gradient-soft border border-border p-5 flex-col flex justify-between hover:border-accent hover:shadow-elegant transition-all hover:-translate-y-1"
              >
                <div className="text-4xl group-hover:scale-110 transition-transform">{c.icon}</div>
                <div>
                  <div className="font-display font-semibold text-sm leading-tight">{c.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{c.count} items</div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FLASH SALE */}
      <section className="bg-emerald-gold relative overflow-hidden">
        <div className="container-x mx-auto max-w-7xl py-14 lg:py-20 relative">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="text-primary-foreground space-y-5">
              <p className="text-xs uppercase tracking-widest text-accent font-semibold">Limited time</p>
              <h2 className="font-display text-4xl lg:text-5xl font-black leading-[1.05]">
                Flash sale.<br />Up to <span className="text-accent italic">40% off.</span>
              </h2>
              <p className="text-primary-foreground/80 max-w-md">Hand-picked bestsellers at our lowest prices this season. Ends when the timer runs out.</p>
              <div className="bg-white/95 rounded-2xl p-5 inline-block">
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">Ends in</p>
                <Countdown />
              </div>
              <div>
                <Button asChild size="lg" className="bg-gold text-accent-foreground hover:opacity-90 rounded-full h-12 px-7 font-semibold">
                  <Link to="/shop?sale=true">Shop the sale <ArrowRight className="ml-2 size-4" /></Link>
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {featured.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        </div>
      </section>

      {/* TRENDING */}
      <section className="container-x mx-auto max-w-7xl py-16 lg:py-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs uppercase tracking-widest text-accent font-semibold mb-2">Trending now</p>
            <h2 className="font-display text-3xl lg:text-4xl font-bold">What everyone's loving</h2>
          </div>
          <Link to="/shop" className="text-sm font-medium text-primary hover:underline hidden sm:inline-flex items-center gap-1">
            View all <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {trending.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </section>

      {/* PROMISE STRIP */}
      <section className="bg-soft border-y">
        <div className="container-x mx-auto max-w-7xl py-12 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Truck, title: "24-hour delivery", text: "Free across Ghana on orders above GH₵500" },
            { icon: ShieldCheck, title: "100% authentic", text: "Sourced from verified brands and partners" },
            { icon: RotateCcw, title: "30-day returns", text: "Easy, no-questions-asked returns" },
            { icon: Sparkles, title: "Loyalty rewards", text: "Earn 5% back on every order" },
          ].map((f) => (
            <div key={f.title} className="flex items-start gap-4">
              <div className="size-12 rounded-xl bg-gradient-emerald-gold grid place-items-center text-accent-foreground shrink-0">
                <f.icon className="size-5" />
              </div>
              <div>
                <div className="font-semibold text-sm lg:text-base">{f.title}</div>
                <div className="text-xs lg:text-sm text-muted-foreground mt-1">{f.text}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="container-x mx-auto max-w-7xl py-16 lg:py-24">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-widest text-accent font-semibold mb-2">Loved by customers</p>
          <h2 className="font-display text-3xl lg:text-4xl font-bold">Stories from our community</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border rounded-2xl p-7 shadow-card"
            >
              <div className="flex gap-0.5 mb-4">
                {[...Array(t.rating)].map((_, k) => <Star key={k} className="size-4 fill-accent text-accent" />)}
              </div>
              <p className="text-foreground/85 leading-relaxed mb-6 font-display italic text-lg">"{t.quote}"</p>
              <div>
                <div className="font-semibold text-sm">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="container-x mx-auto max-w-7xl pb-20">
        <div className="rounded-3xl bg-hero text-primary-foreground p-10 lg:p-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-[var(--gradient-radial-gold)] opacity-50" />
          <div className="relative max-w-2xl">
            <h2 className="font-display text-3xl lg:text-5xl font-bold leading-tight mb-3">
              Get <span className="text-gradient-gold italic">10% off</span> your first order.
            </h2>
            <p className="text-primary-foreground/75 mb-6">Join the YAA BABY list for early access to drops, members-only deals, and styling notes.</p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md" onSubmit={(e) => e.preventDefault()}>
              <Input placeholder="your@email.com" className="h-12 rounded-full bg-white/10 border-white/20 text-primary-foreground placeholder:text-primary-foreground/50" />
              <Button type="submit" size="lg" className="bg-gold text-accent-foreground hover:opacity-90 rounded-full h-12 px-7 font-semibold whitespace-nowrap">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
