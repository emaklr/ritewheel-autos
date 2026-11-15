import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { VehicleCard } from "@/components/vehicle-card";
import { VehicleFinder } from "@/components/vehicle-finder";
import { getFeaturedVehicles } from "@/lib/vehicles";

const categories = [
  { label: "SUVs", type: "SUV", image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=760&q=78" },
  { label: "Sedans", type: "Sedan", image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=760&q=78" },
  { label: "Coupes", type: "Coupe", image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=760&q=78" },
  { label: "Luxury", type: "Luxury", image: "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=760&q=78" },
];

export default async function HomePage() {
  const vehicles = await getFeaturedVehicles();

  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero">
          <div className="hero-image">
            <Image
              src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=2200&q=88"
              alt="Premium luxury vehicle photographed in a dark studio"
              fill
              priority
              sizes="100vw"
            />
          </div>
          <div className="hero-overlay" />
          <div className="hero-content">
            <div className="hero-copy">
              <span className="eyebrow">THE RITEWHEEL COLLECTION</span>
              <h1>Find the car<br />that <em>moves you.</em></h1>
              <p>Discover exceptional vehicles, get thoughtful recommendations and make your next car feel like yours.</p>
              <div className="hero-actions">
                <Link href="/inventory" className="button button-gold">Explore inventory <span aria-hidden="true">→</span></Link>
                <Link href="/concierge" className="button button-outline">Meet your AI Concierge <span aria-hidden="true">↗</span></Link>
              </div>
              <div className="hero-note">
                <span><i /> Curated vehicle discovery</span>
                <span><i /> Personalised recommendations</span>
              </div>
            </div>
          </div>
        </section>

        <VehicleFinder />

        <section className="section container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">EXPLORE YOUR OPTIONS</span>
              <h2>Find your kind of drive.</h2>
              <p>Start with the style that fits your everyday life.</p>
            </div>
            <Link href="/inventory" className="text-link">Explore all vehicles <span aria-hidden="true">→</span></Link>
          </div>
          <div className="category-grid">
            {categories.map((category) => (
              <Link key={category.label} href={`/inventory?bodyType=${encodeURIComponent(category.type)}`} className="category-card">
                <Image src={category.image} alt={`${category.label} vehicle category`} fill sizes="(max-width: 760px) 50vw, 25vw" />
                <span>{category.label} <span aria-hidden="true">↗</span></span>
              </Link>
            ))}
          </div>
        </section>

        <section className="section-tight container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">THE COLLECTION</span>
              <h2>Exceptional vehicles.</h2>
              <p>A considered selection of vehicles to help you explore what feels right.</p>
            </div>
            <Link href="/inventory" className="text-link">View all inventory <span aria-hidden="true">→</span></Link>
          </div>
          {vehicles.length ? (
            <div className="vehicle-grid">
              {vehicles.map((vehicle, index) => <VehicleCard key={vehicle.id} vehicle={vehicle} priority={index === 0} />)}
            </div>
          ) : (
            <div className="empty-state">
              <h3>Our collection is being updated.</h3>
              <p>Check back soon or tell our team what kind of vehicle you are looking for.</p>
              <Link href="/contact" className="text-link">Contact Ritewheel ↗</Link>
            </div>
          )}
          {vehicles.some((vehicle) => vehicle.isDemo) ? (
            <p className="demo-notice">Demo catalogue: vehicle records, specifications and prices on this preview are illustrative and are not current dealership stock or offers.</p>
          ) : null}
        </section>

        <section className="feature-strip">
          <div className="container feature-strip-inner">
            <div className="feature-item"><span className="feature-icon">⌕</span><div><strong>Discover with clarity</strong><p>Explore vehicle details and compare the things that matter to you.</p></div></div>
            <div className="feature-item"><span className="feature-icon">✦</span><div><strong>Get thoughtful guidance</strong><p>Use AI recommendations as a helpful starting point, grounded in the catalogue.</p></div></div>
            <div className="feature-item"><span className="feature-icon">↗</span><div><strong>Talk to real people</strong><p>Ask the dealership for information, a test drive or help sourcing a vehicle.</p></div></div>
          </div>
        </section>

        <section className="section container">
          <div className="promo-grid">
            <Link href="/concierge" className="promo-card">
              <Image src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=78" alt="Premium vehicle on the road" fill sizes="(max-width: 760px) 100vw, 50vw" />
              <span className="eyebrow">A MORE PERSONAL SEARCH</span>
              <h3>Meet your personal car concierge.</h3>
              <p>Tell us what matters to you. Explore real matches and understand your options.</p>
              <span className="text-link">Start a conversation ↗</span>
            </Link>
            <Link href="/studio" className="promo-card">
              <Image src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=78" alt="Sculpted sports car exterior" fill sizes="(max-width: 760px) 100vw, 50vw" />
              <span className="eyebrow">MAKE IT YOURS</span>
              <h3>Imagine your next vehicle, your way.</h3>
              <p>Explore supported colours, wheels and interior options in the Design Studio.</p>
              <span className="text-link">Explore the Design Studio ↗</span>
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
