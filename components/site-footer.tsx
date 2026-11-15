import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand-block">
          <Link href="/" className="brand" aria-label="Ritewheel Autos home">
            <span className="brand-mark" aria-hidden="true">R</span>
            <span className="brand-name">RITEWHEEL<span> AUTOS</span></span>
          </Link>
          <p>Discover confidently. Personalise thoughtfully. Find your next vehicle with Ritewheel.</p>
        </div>
        <div className="footer-links">
          <div><span className="footer-heading">Explore</span><Link href="/inventory">Inventory</Link><Link href="/concierge">AI Concierge</Link><Link href="/studio">Design Studio</Link></div>
          <div><span className="footer-heading">Ritewheel</span><Link href="/about">About</Link><Link href="/contact">Contact</Link><Link href="/source-vehicle">Request a vehicle</Link><Link href="/garage">My Garage</Link></div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Ritewheel Autos</span>
        <span>Vehicle information is subject to dealership confirmation.</span>
      </div>
    </footer>
  );
}
