"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Logo } from "@/components/brand/Logo";
import { Button, PhoneIcon } from "@/components/ui/Button";
import { OpenBadge } from "@/components/ui/OpenBadge";
import { services } from "@/content/services";
import { photos } from "@/lib/photos";
import { site, telHref } from "@/lib/site";
import { useDismissed } from "@/lib/session-flag";

const links = [
  { href: "/projects", label: "Projects" },
  { href: "/services/storm-hail-damage", label: "Storm & hail" },
  { href: "/financing", label: "Financing" },
  { href: "/about", label: "About" },
  { href: "/reviews", label: "Reviews" },
];

const BANNER_KEY = "halden-hail-banner";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [bannerDismissed, dismissBanner] = useDismissed(BANNER_KEY);
  const [prevPath, setPrevPath] = useState(pathname);
  const lastY = useRef(0);
  const megaTimer = useRef<number>(undefined);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setHidden(y > 420 && y > lastY.current + 4);
      if (y < lastY.current - 4 || y < 420) setHidden(false);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on navigation (state adjusted during render, not in an effect).
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setMenuOpen(false);
    setMegaOpen(false);
  }

  useEffect(() => {
    if (menuOpen) window.__lenis?.stop();
    else window.__lenis?.start();
    document.documentElement.style.overflow = menuOpen ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && (setMenuOpen(false), setMegaOpen(false));
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const openMega = () => {
    window.clearTimeout(megaTimer.current);
    setMegaOpen(true);
  };
  const closeMega = () => {
    megaTimer.current = window.setTimeout(() => setMegaOpen(false), 140);
  };

  const showBanner = !bannerDismissed && !scrolled && !menuOpen;
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header
      className={clsx(
        "theme-ink fixed inset-x-0 top-0 z-[80] !bg-transparent transition-transform duration-500 ease-[var(--ease-out-expo)]",
        hidden && !menuOpen && !megaOpen && "-translate-y-full",
      )}
      style={{ viewTransitionName: "site-header" }}
    >
      {/* Hail-season banner */}
      <div
        className={clsx(
          "grid overflow-hidden bg-copper text-ink transition-[grid-template-rows] duration-500 ease-[var(--ease-out-expo)]",
          showBanner ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
        inert={!showBanner}
      >
        <div className="min-h-0">
          <div className="wrap flex min-h-10 items-center justify-between gap-4 py-2 text-[0.84rem] font-semibold">
            <p className="flex items-center gap-2.5">
              <HailIcon />
              <span>
                Hail season is here.{" "}
                <span className="hidden sm:inline">Free roof inspections across Tarrant County, booked within 48 hours.</span>
              </span>
            </p>
            <div className="flex items-center gap-1">
              <Link href="/free-inspection" tabIndex={showBanner ? 0 : -1} className="whitespace-nowrap underline decoration-ink/40 underline-offset-4 hover:decoration-ink">
                Book yours →
              </Link>
              <button
                type="button"
                onClick={dismissBanner}
                tabIndex={showBanner ? 0 : -1}
                aria-label="Dismiss hail season banner"
                className="-mr-2 grid h-9 w-9 place-items-center rounded-full hover:bg-ink/10"
              >
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div
        className={clsx(
          "relative transition-[background-color,backdrop-filter,border-color] duration-500",
          scrolled || megaOpen ? "border-b border-line bg-ink/82 backdrop-blur-xl" : "border-b border-transparent",
        )}
      >
        <div className="wrap flex h-[var(--header-h)] items-center justify-between gap-6">
          <Link href="/" className="relative z-10 -m-2 p-2">
            <Logo />
            <span className="sr-only"> — home</span>
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            <div onMouseEnter={openMega} onMouseLeave={closeMega} className="relative">
              <button
                type="button"
                aria-expanded={megaOpen}
                aria-controls="mega-services"
                onClick={() => setMegaOpen((v) => !v)}
                className={clsx(
                  "flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[0.93rem] font-medium transition-colors hover:text-stone",
                  isActive("/services") ? "text-stone" : "text-muted",
                )}
              >
                Services
                <svg viewBox="0 0 12 12" className={clsx("h-2.5 w-2.5 transition-transform duration-300", megaOpen && "rotate-180")} aria-hidden>
                  <path d="M2 4.5 6 8l4-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </button>
            </div>
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={clsx(
                  "relative rounded-full px-4 py-2.5 text-[0.93rem] font-medium transition-colors hover:text-stone",
                  isActive(l.href) ? "text-stone" : "text-muted",
                )}
              >
                {l.label}
                {isActive(l.href) && <span aria-hidden className="chev absolute bottom-0.5 left-1/2 -translate-x-1/2 text-copper" />}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a href={telHref} className="hidden items-center gap-2 rounded-full px-3 py-2.5 text-[0.93rem] font-semibold xl:flex">
              <PhoneIcon className="text-copper" />
              {site.phoneDisplay}
            </a>
            <span className="hidden sm:block">
              <Button href="/free-inspection">Free inspection</Button>
            </span>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="relative z-10 grid h-12 w-12 place-items-center rounded-full border border-line lg:hidden"
            >
              <span aria-hidden className="relative block h-3 w-5">
                <span className={clsx("absolute left-0 h-[2px] w-5 bg-current transition-all duration-500", menuOpen ? "top-[5px] rotate-45" : "top-0")} />
                <span className={clsx("absolute left-0 h-[2px] w-5 bg-current transition-all duration-500", menuOpen ? "top-[5px] -rotate-45" : "top-[10px]")} />
              </span>
            </button>
          </div>
        </div>

        {/* Services mega menu (desktop) */}
        <div
          id="mega-services"
          onMouseEnter={openMega}
          onMouseLeave={closeMega}
          className={clsx(
            "absolute inset-x-0 top-full hidden border-b border-line bg-ink/95 backdrop-blur-xl transition-[opacity,transform,visibility] duration-500 ease-[var(--ease-out-expo)] lg:block",
            megaOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-3 opacity-0",
          )}
        >
          <div className="wrap grid grid-cols-[1fr_1fr_1fr_1fr] gap-4 py-8">
            {services.map((s, i) => (
              <Link
                key={s.slug}
                href={`/services/${s.slug}`}
                className={clsx("group relative overflow-hidden rounded-sm", i === 0 ? "row-span-2" : "")}
                tabIndex={megaOpen ? 0 : -1}
              >
                <div className={clsx("relative overflow-hidden bg-slate", i === 0 ? "h-full min-h-72" : "aspect-[16/8]")}>
                  <Image
                    src={photos[s.hero]}
                    alt=""
                    fill
                    sizes="25vw"
                    className="object-cover opacity-70 transition-[transform,opacity] duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105 group-hover:opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="t-eyebrow text-copper-2">0{i + 1}</p>
                    <p className="mt-1 font-display text-lg font-bold uppercase leading-none tracking-[-0.02em]">{s.title}</p>
                    {i === 0 && <p className="mt-2 max-w-xs text-sm text-muted">{s.tagline}</p>}
                  </div>
                </div>
              </Link>
            ))}
            <Link
              href="/services"
              tabIndex={megaOpen ? 0 : -1}
              className="flex aspect-[16/8] flex-col justify-between rounded-sm border border-line p-4 transition-colors hover:border-copper"
            >
              <span className="t-eyebrow text-muted">All services</span>
              <span className="font-display text-lg font-bold uppercase leading-none">See everything we do →</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={clsx(
          "theme-ink fixed inset-0 z-[-1] flex flex-col overflow-y-auto pt-[calc(var(--header-h)+1rem)] transition-[clip-path] duration-700 ease-[var(--ease-in-out-quart)] lg:hidden",
          menuOpen ? "[clip-path:polygon(0_0,50%_0,100%_0,100%_100%,0_100%)]" : "pointer-events-none [clip-path:polygon(0_0,50%_0,100%_0,100%_0,0_0)]",
        )}
        inert={!menuOpen}
      >
        <nav aria-label="Mobile" className="wrap flex flex-1 flex-col">
          <ul className="flex flex-col">
            {[{ href: "/services", label: "Services" }, ...links, { href: "/service-areas", label: "Service areas" }, { href: "/contact", label: "Contact" }].map((l, i) => (
              <li
                key={l.href}
                className={clsx("border-b border-line transition-[opacity,transform] duration-700 ease-[var(--ease-out-expo)]", menuOpen ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0")}
                style={{ transitionDelay: menuOpen ? `${120 + i * 45}ms` : "0ms" }}
              >
                <Link href={l.href} tabIndex={menuOpen ? 0 : -1} className="flex items-center justify-between py-4 font-display text-[1.65rem] font-extrabold uppercase leading-none tracking-[-0.03em]">
                  {l.label}
                  <span className="t-eyebrow text-faint">0{i + 1}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-auto flex flex-col gap-3 py-8">
            <OpenBadge className="text-muted" />
            <a href={telHref} tabIndex={menuOpen ? 0 : -1} className="font-display text-2xl font-bold">
              {site.phoneDisplay}
            </a>
            <Button href="/free-inspection" size="lg" className="w-full">
              Book a free inspection
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}

function HailIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0" aria-hidden>
      <path d="M5 11a4 4 0 0 1 .6-7.9A5 5 0 0 1 15 5a3.5 3.5 0 0 1 0 7H5z" fill="currentColor" />
      <circle cx="6.5" cy="15" r="1.4" fill="currentColor" />
      <circle cx="10.5" cy="17" r="1.4" fill="currentColor" />
      <circle cx="14" cy="14.8" r="1.4" fill="currentColor" />
    </svg>
  );
}
