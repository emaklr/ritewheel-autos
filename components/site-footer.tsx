import Link from "next/link";
import { getPublicDealershipSettings } from "@/lib/dealership-settings";

export async function SiteFooter() {
  const settings = await getPublicDealershipSettings();
  const address = [
    settings.addressLine,
    settings.city,
    settings.state,
    settings.country,
  ].filter(Boolean).join(", ");

  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand-block">
          <Link href="/" className="brand" aria-label={settings.displayName + " home"}>
            <span className="brand-mark" aria-hidden="true">R</span>
            <span className="brand-name">{settings.displayName}</span>
          </Link>
          <p>Discover confidently. Personalise thoughtfully. Find your next vehicle with {settings.displayName}.</p>
        </div>
        <div className="footer-links">
          <div>
            <span className="footer-heading">Explore</span>
            <Link href="/inventory">Inventory</Link>
            <Link href="/concierge">AI Concierge</Link>
            <Link href="/studio">Design Studio</Link>
          </div>
          <div>
            <span className="footer-heading">Ritewheel</span>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/source-vehicle">Request a vehicle</Link>
            <Link href="/garage">My Garage</Link>
          </div>
          <div className="footer-public-contact">
            <span className="footer-heading">Contact</span>
            {settings.contactPhone ? <a href={"tel:" + settings.contactPhone}>{settings.contactPhone}</a> : null}
            {settings.contactEmail ? <a href={"mailto:" + settings.contactEmail}>{settings.contactEmail}</a> : null}
            {settings.whatsappNumber ? (
              <a href={"https://wa.me/" + settings.whatsappNumber} target="_blank" rel="noreferrer">Chat on WhatsApp ↗</a>
            ) : null}
            {address ? <p>{address}</p> : null}
            {settings.openingHours ? <p className="footer-opening-hours">{settings.openingHours}</p> : null}
            {!settings.contactPhone && !settings.contactEmail && !settings.whatsappNumber ? <Link href="/contact">Send us a message</Link> : null}
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} {settings.displayName}</span>
        <span>Vehicle information is subject to dealership confirmation.</span>
      </div>
    </footer>
  );
}
