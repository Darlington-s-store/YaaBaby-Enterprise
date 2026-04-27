import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter, Youtube } from "lucide-react";

export const Footer = () => (
  <footer className="bg-primary text-primary-foreground mt-20">
    <div className="container-x mx-auto max-w-7xl py-16 grid lg:grid-cols-12 gap-10">
      <div className="lg:col-span-4">
        <div className="flex items-center gap-2 font-display text-2xl font-bold mb-4">
          <span className="size-9 rounded-xl bg-gradient-gold grid place-items-center text-accent-foreground font-black">Y</span>
          YAA <span className="text-gradient-gold">BABY</span>
        </div>
        <p className="text-primary-foreground/70 text-sm leading-relaxed max-w-sm">
          Ghana's curated marketplace for everything you love — from electronics and fashion to beauty and home essentials. Authenticated, fast, fair.
        </p>
        <div className="flex gap-3 mt-6">
          {[Instagram, Facebook, Twitter, Youtube].map((Icon, i) => (
            <a key={i} href="#" className="size-10 rounded-full grid place-items-center bg-white/5 hover:bg-accent hover:text-accent-foreground transition">
              <Icon className="size-4" />
            </a>
          ))}
        </div>
      </div>

      {[
        { title: "Shop", links: [["All products","/shop"],["New arrivals","/shop"],["Bestsellers","/shop"],["Flash deals","/shop?sale=true"]] },
        { title: "Help", links: [["Contact","/about"],["Shipping","/about"],["Returns","/about"],["Track order","/account"]] },
        { title: "Company", links: [["About","/about"],["Careers","/about"],["Press","/about"],["Sustainability","/about"]] },
      ].map((col) => (
        <div key={col.title} className="lg:col-span-2">
          <div className="text-xs uppercase tracking-widest text-accent mb-4 font-semibold">{col.title}</div>
          <ul className="space-y-2.5 text-sm text-primary-foreground/70">
            {col.links.map(([label,href]) => (
              <li key={label}><Link to={href} className="hover:text-accent transition">{label}</Link></li>
            ))}
          </ul>
        </div>
      ))}

      <div className="lg:col-span-2">
        <div className="text-xs uppercase tracking-widest text-accent mb-4 font-semibold">Pay with</div>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1.5 rounded-md bg-white/10 text-xs font-medium">Paystack</span>
          <span className="px-3 py-1.5 rounded-md bg-white/10 text-xs font-medium">MoMo</span>
          <span className="px-3 py-1.5 rounded-md bg-white/10 text-xs font-medium">Visa</span>
          <span className="px-3 py-1.5 rounded-md bg-white/10 text-xs font-medium">Mastercard</span>
          <span className="px-3 py-1.5 rounded-md bg-white/10 text-xs font-medium">Cash on delivery</span>
        </div>
      </div>
    </div>
    <div className="border-t border-white/10">
      <div className="container-x mx-auto max-w-7xl py-5 text-xs text-primary-foreground/60 flex flex-col sm:flex-row gap-3 justify-between">
        <span>© {new Date().getFullYear()} YAA BABY ENT. All rights reserved.</span>
        <span>Made with care in Ghana 🇬🇭</span>
      </div>
    </div>
  </footer>
);
