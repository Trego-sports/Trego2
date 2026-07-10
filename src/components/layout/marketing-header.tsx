import { Link } from "@tanstack/react-router";
import { ChevronRightIcon, LogInIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import tregoLogo from "@/static/trego1.avif";

const navigationItems = [
  { label: "How it works", href: "#how" },
  { label: "Live games", href: "#games" },
  { label: "For hosts", href: "#hosts" },
];

export function MarketingHeader() {
  return (
    <header className="marketing-header relative z-20 mx-auto flex max-w-[1500px] items-center justify-between gap-4">
      <a
        href="/"
        className="group flex min-h-14 items-center gap-3 rounded-full bg-white/92 py-2 pl-2 pr-5 shadow-[0_0_0_1px_rgba(0,0,0,0.07),0_16px_38px_rgba(23,36,59,0.12)] backdrop-blur transition-[background-color,box-shadow,transform] duration-200 hover:bg-white hover:shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_18px_44px_rgba(23,36,59,0.16)] active:scale-[0.96]"
      >
        <img
          src={tregoLogo}
          alt="Trego"
          className="h-12 w-12 rounded-full object-contain outline outline-1 -outline-offset-1 outline-black/10"
        />
        <span>
          <span className="block text-xl font-black leading-none text-[#17243B]">Trego</span>
          <span className="mt-0.5 block text-[11px] font-black uppercase tracking-[0.12em] text-[#E8791F]">
            Play starts here
          </span>
        </span>
      </a>

      <nav
        aria-label="Primary navigation"
        className="hidden items-center gap-1 rounded-full bg-white/72 p-1 text-sm font-extrabold text-[#596373] shadow-[0_0_0_1px_rgba(0,0,0,0.06)] backdrop-blur md:flex"
      >
        {navigationItems.map((item) => (
          <a
            key={item.href}
            className="inline-flex min-h-10 items-center rounded-full px-4 transition-[background-color,color,transform] duration-200 hover:bg-white hover:text-[#17243B] active:scale-[0.96]"
            href={item.href}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <Button
          render={<Link to="/login" />}
          variant="outline"
          className="hidden min-h-12 rounded-full border-black/10 bg-white px-5 font-black text-[#17243B] shadow-[0_14px_28px_rgba(23,36,59,0.14)] transition-[background-color,box-shadow,transform] hover:bg-[#FFF1E3] active:scale-[0.96] sm:inline-flex"
        >
          Sign in
          <ChevronRightIcon className="size-4" />
        </Button>
        <Button
          render={<Link to="/login" aria-label="Sign in" />}
          variant="outline"
          size="icon-lg"
          className="min-h-12 rounded-full border-black/10 bg-white text-[#17243B] shadow-[0_14px_28px_rgba(23,36,59,0.14)] transition-[background-color,transform] hover:bg-[#FFF1E3] active:scale-[0.96] sm:hidden"
        >
          <LogInIcon className="size-5" />
        </Button>
      </div>
    </header>
  );
}
