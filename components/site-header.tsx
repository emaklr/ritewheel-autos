import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/inventory", label: "Inventory" },
  { href: "/concierge", label: "AI Concierge" },
  { href: "/studio", label: "Design Studio" },
  { href: "/source-vehicle", label: "Source a vehicle" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="brand" aria-label="Ritewheel Autos home">
          <span className="brand-mark" aria-hidden="true">R</span>
          <span className="brand-name">RITEWHEEL<span> AUTOS</span></span>
        </Link>

        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>{link.label}</Link>
          ))}
        </nav>

        <div className="header-actions">
          <Link href="/garage" className="header-compare">My Garage</Link>
          <Link href="/compare" className="header-compare">Compare</Link>
          <Link href="/contact" className="button button-gold button-small">Get in touch <span aria-hidden="true">↗</span></Link>
        </div>

        <details className="mobile-menu">
          <summary aria-label="Open navigation menu"><span/><span/><span/></summary>
          <nav aria-label="Mobile navigation">
            {links.map((link) => (
              <Link key={link.href} href={link.href}>{link.label}</Link>
            ))}
            <Link href="/garage">My Garage</Link>
            <Link href="/compare">Compare vehicles</Link>
            <Link href="/contact">Get in touch</Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
