"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/inventory", label: "Inventory" },
  { href: "/concierge", label: "AI Concierge" },
  { href: "/about", label: "About" }
];

export function SiteHeader({ active = "" }: { active?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="brand" aria-label="Ritewheel Autos home" onClick={() => setMenuOpen(false)}>
          <span className="brand-mark">R</span>
          <span className="brand-name">RITEWHEEL <b>AUTOS</b></span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={active === link.href ? "nav-link active" : "nav-link"}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <Link href="/garage" className="header-shortcut">My Garage</Link>
          <Link href="/compare" className="header-shortcut header-compare">Compare</Link>
          <Link href="/contact" className="button button-gold button-small">Get in touch</Link>
          <button type="button" className="mobile-menu-button" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>
            <span></span><span></span>
          </button>
        </div>
      </div>
      {menuOpen && (
        <nav className="mobile-menu" aria-label="Mobile navigation">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={active === link.href ? "nav-link active" : "nav-link"} onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
          <Link href="/garage" className="nav-link" onClick={() => setMenuOpen(false)}>My Garage</Link>
          <Link href="/compare" className="nav-link" onClick={() => setMenuOpen(false)}>Compare vehicles</Link>
          <Link href="/contact" className="button button-gold" onClick={() => setMenuOpen(false)}>Get in touch</Link>
        </nav>
      )}
    </header>
  );
}