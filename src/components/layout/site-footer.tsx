import { Link } from "@tanstack/react-router";
import { DumbbellIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type FooterLinkTarget = "/" | "/privacy" | "/terms" | "/login";

interface SiteFooterProps {
  className?: string;
  contentClassName?: string;
}

export function SiteFooter({ className, contentClassName }: SiteFooterProps) {
  return (
    <footer className={cn("w-full border-t border-[#243448] bg-[#0b1c30] py-6 text-white", className)}>
      <div
        className={cn(
          "mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-5 md:flex-row md:px-8",
          contentClassName,
        )}
      >
        <div className="flex flex-col items-center gap-2 md:items-start">
          <span className="flex items-center gap-2 text-sm font-bold">
            <DumbbellIcon className="size-5" />
            Trego
          </span>
          <span className="text-xs font-medium text-[#d3e4fe]">
            © 2026 Trego Sports Coordination. All rights reserved.
          </span>
        </div>
        <nav className="flex flex-wrap justify-center gap-4 md:gap-6">
          <FooterLink to="/privacy">Privacy Policy</FooterLink>
          <FooterLink to="/terms">Terms of Service</FooterLink>
          <FooterLink to="/privacy">Cookie Policy</FooterLink>
          <FooterLink to="/login">Support</FooterLink>
          <FooterLink to="/login">Contact Us</FooterLink>
        </nav>
      </div>
    </footer>
  );
}

function FooterLink({ to, children }: { to: FooterLinkTarget; children: string }) {
  return (
    <Link to={to} className="text-xs font-medium text-[#d3e4fe] transition hover:text-white">
      {children}
    </Link>
  );
}
