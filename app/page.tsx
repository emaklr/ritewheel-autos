import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { VehicleCard } from "@/components/vehicle-card";
import { VehicleFinder } from "@/components/vehicle-finder";
import { getFeaturedVehicles } from "@/lib/vehicles";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { items: featured, isDemoMode } = await getFeaturedVehicles(3);

  return (
    <>
      <SiteHeader active="/" />
      <main>
        <section className="hero">
          <div className="hero-image">
            <Image src="/images/vehicles/mercedes-gle.webp" alt="Mercedes-Benz GLE demonstration vehicle" fill priority sizes="100vw" />
          </div>
          <div className="hero-overlay" />
          <div className="hero-content">
            <div className="hero-copy">
              <div className="hero-kicker"><span /> THE RITEWHEEL COLLECTION</div>
              <h1>Find the car<br />that <em>moves you.</em></h1>
              <p>Discover exceptional vehicles, compare your options and find the one that fits the way you live.</p>
              <div className="hero-actions">
                <Link href="/inventory" className="button button-gold">Explore inventory <span aria-hidden="true">→</span></Link>
                <Link href="/concierge" className="button button-outline">Meet the AI Concierge</Link>
              </div>
            </div>
          </div>
        </section>

        <div className="finder-wrap"><VehicleFinder /></div>

        <section className="section">
          <div className="container">
            <div className="section-heading">
              <div><span className="eyebrow">EXPLORE YOUR STYLE</span><h2>Browse by category</h2><p>Start with the kind of vehicle that suits your everyday.</p></div>
              <Link href="/inventory" className="text-link">View all vehicles →</Link>
            </div>
            <div className="category-grid">
              <Link href="/inventory?bodyType=SUV" className="category-card">
                <Image src="/images/vehicles/mercedes-gle.webp" alt="" fill sizes="(max-width: 700px) 50vw, 33vw" />
                <div><strong>SUVs</strong><span>Space, comfort and capability</span></div>
              </Link>
              <Link href="/inventory?make=BMW" className="category-card">
                <Image src="/images/vehicles/bmw-x6.webp" alt="" fill sizes="(max-width: 700px) 50vw, 33vw" />
                <div><strong>Performance</strong><span>Designed to make every drive count</span></div>
              </Link>
              <Link href="/inventory?make=Land%20Rover" className="category-card">
                <Image src="/images/vehicles/range-rover-sport.webp" alt="" fill sizes="(max-width: 700px) 50vw, 33vw" />
                <div><strong>Luxury</strong><span>Comfort with a confident presence</span></div>
              </Link>
            </div>
          </div>
        </section>

        <section className="section section-alt">
          <div className="container">
            <div className="section-heading">
              <div><span className="eyebrow">A CONSIDERED COLLECTION</span><h2>Exceptional vehicles</h2><p>Explore a selection of vehicles and open each listing for its details.</p></div>
              <Link href="/inventory" className="text-link">View all inventory →</Link>
            </div>
            {isDemoMode && <p className="notice notice-spaced">Demo catalogue: the database is not connected yet. These sample listings are clearly marked and have no verified prices or availability.</p>}
            {featured.length > 0 ? (
              <div className="vehicle-grid">{featured.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}</div>
            ) : (
              <div className="empty-state"><h2>Our collection is being updated</h2><p>There are no featured vehicles published right now. Browse the inventory or contact the dealership for help.</p><Link href="/inventory" className="button button-outline">Browse inventory</Link></div>
            )}
          </div>
        </section>

        <section className="section">
          <div className="container feature-split">
            <div className="feature-panel">
              <span className="eyebrow">A BETTER WAY TO DISCOVER</span>
              <h3>Your personal car concierge.</h3>
              <p>Describe what matters to you. Ritewheel’s AI Concierge will help narrow the search to vehicles that match your needs once the AI service is connected.</p>
              <Link href="/concierge" className="text-link">Explore AI Concierge →</Link>
            </div>
            <div className="feature-panel">
              <span className="eyebrow">MAKE IT YOURS</span>
              <h3>Imagine your next drive.</h3>
              <p>Explore supported colours, wheels and interior choices with the upcoming asset-backed Design Studio.</p>
              <Link href="/inventory" className="text-link">Explore vehicles →</Link>
            </div>
          </div>
        </section>

        <section className="section section-compact">
          <div className="container">
            <div className="feature-panel feature-panel-centered">
              <span className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</span>
              <h3>Find a vehicle that feels like yours.</h3>
              <p>Browse the collection or speak with the dealership about what you are looking for.</p>
              <div className="hero-actions"><Link href="/inventory" className="button button-gold">Explore inventory</Link><Link href="/contact" className="button button-outline">Talk to the team</Link></div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}