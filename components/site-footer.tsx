import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div>
          <Link href="/" className="brand footer-brand">
            <span className="brand-mark">R</span>
            <span className="brand-name">RITEWHEEL <b>AUTOS</b></span>
          </Link>
          <p className="footer-copy">Discover confidently. Personalise thoughtfully. Get help from real people when it matters.</p>
        </div>
        <div className="footer-links">
          <div><span className="footer-heading">Explore</span><Link href="/inventory">Inventory</Link><Link href="/concierge">AI Concierge</Link></div>
          <div><span className="footer-heading">Ritewheel</span><Link href="/about">About</Link><Link href="/contact">Contact</Link></div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Ritewheel Autos</span>
        <span>Premium vehicle discovery</span>
      </div>
    </footer>
  );
}