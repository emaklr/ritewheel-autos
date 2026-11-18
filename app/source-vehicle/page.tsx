import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SourcingRequestForm } from "@/components/sourcing-request-form";

export const metadata: Metadata = {
  title: "Request a vehicle",
  description: "Tell Ritewheel what vehicle you are looking for and let the dealership review your sourcing request.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SourceVehiclePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const make = first(params.make)?.trim().slice(0, 80) || undefined;
  const model = first(params.model)?.trim().slice(0, 80) || undefined;
  const minYearRaw = Number(first(params.minYear));
  const maxYearRaw = Number(first(params.maxYear));
  const budgetRaw = Number(first(params.budget));
  const validYear = (value: number) => Number.isInteger(value) && value >= 1900 && value <= 2100;
  const minYear = validYear(minYearRaw) ? minYearRaw : undefined;
  const maxYear = validYear(maxYearRaw) ? maxYearRaw : undefined;
  const yearRangeValid = minYear === undefined || maxYear === undefined || minYear <= maxYear;
  const budget = Number.isFinite(budgetRaw) && budgetRaw > 0 && budgetRaw <= 999_999_999_999 ? budgetRaw : undefined;
  const currencyRaw = first(params.currency);
  const currency = currencyRaw === "NGN" || currencyRaw === "USD" || currencyRaw === "GBP" || currencyRaw === "EUR" ? currencyRaw : undefined;
  const conditionRaw = first(params.condition);
  const conditionPreference = conditionRaw === "Brand new" || conditionRaw === "New"
    ? "Brand new"
    : conditionRaw === "Used" ? "Used" : "No preference";
  const mileageRaw = first(params.mileagePreference);
  const mileagePreference = mileageRaw === "Under 30,000 km" || mileageRaw === "Under 60,000 km" || mileageRaw === "Under 100,000 km"
    ? mileageRaw
    : "No preference";
  const initialValues = {
    requestedMake: make,
    requestedModel: model,
    minYear: yearRangeValid ? minYear : undefined,
    maxYear: yearRangeValid ? maxYear : undefined,
    budget: budget && currency ? budget : undefined,
    currency: budget && currency ? currency : undefined,
    conditionPreference,
    mileagePreference,
    requiredSpecifications: first(params.specifications)?.trim().slice(0, 2_000) || undefined,
  };
  return (
    <>
      <SiteHeader />
      <main className="container contact-page sourcing-page">
        <div className="contact-page-layout">
          <section className="contact-intro">
            <span className="eyebrow">LOOKING FOR SOMETHING SPECIFIC?</span>
            <h1>Let us help you find it.</h1>
            <p>
              Tell us about the vehicle you have in mind. Share your preferred model, year, budget and the details
              that matter. The Ritewheel team will review your brief and let you know what may be possible.
            </p>
            <div className="contact-trust-note">
              A sourcing request is the start of a conversation, not a promise that a vehicle is available or can
              be obtained. The dealership must verify a real vehicle, its condition, price and availability before
              making an offer.
            </div>
            <p className="contact-privacy-note">
              You can submit a request without creating an account. Your details are used to respond to this request.
            </p>
            <Link href="/inventory" className="text-link sourcing-back-link">← Back to inventory</Link>
          </section>

          <section className="contact-form-panel" aria-label="Vehicle sourcing request form">
            <span className="eyebrow">YOUR VEHICLE BRIEF</span>
            <h2>What are you looking for?</h2>
            {process.env.DATABASE_URL ? (
              <SourcingRequestForm initialValues={initialValues} />
            ) : (
              <div className="enquiry-disabled" role="status">
                <strong>Vehicle requests are not connected yet.</strong>
                <p>The sourcing form becomes active once the dealership database is configured. You can continue exploring the demo catalogue in the meantime.</p>
              </div>
            )}
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
