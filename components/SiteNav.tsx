"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { copy } from "@/constants/copy";

// "Still Water" (app/checkin/) is a deliberately isolated visual direction —
// see AGENTS.md and app/checkin/checkin.css. It renders its own equivalent
// nav (CheckinNav in app/checkin/page.tsx) instead of this Lamplight one.
const LINKS = [
  { href: "/", label: copy.navCompanionLabel },
  { href: "/checkin", label: copy.navCheckinLabel },
  { href: "/gauge-preview", label: copy.navGaugeLabel },
] as const;

export function SiteNav() {
  const pathname = usePathname();

  if (pathname?.startsWith("/checkin")) {
    return null;
  }

  return (
    <nav
      aria-label={copy.navLabel}
      className="flex items-center gap-16 border-b border-paper-hairline bg-paper-app px-screen-gutter py-10"
    >
      {LINKS.map((link) => {
        const isActive = link.href === "/" ? pathname === "/" : pathname?.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            className={
              isActive
                ? "text-caption font-medium text-sage-650"
                : "text-caption font-medium text-ink-500 hover:text-ink-900"
            }
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
