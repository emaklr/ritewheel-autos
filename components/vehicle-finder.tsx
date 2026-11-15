import Link from "next/link";
import { getAvailableVehicleCategories, getAvailableVehicleMakes } from "@/lib/vehicles";

const budgetOptions = [
  ["50000000", "Up to ₦50m"],
  ["80000000", "Up to ₦80m"],
  ["120000000", "Up to ₦120m"],
  ["200000000", "Up to ₦200m"],
];

export async function VehicleFinder() {
  const [makes, categories] = await Promise.all([
    getAvailableVehicleMakes(),
    getAvailableVehicleCategories(),
  ]);

  return (
    <section className="finder-wrap" aria-labelledby="finder-title">
      <div className="finder-heading">
        <div>
          <span className="eyebrow">START YOUR SEARCH</span>
          <h2 id="finder-title">Find your vehicle</h2>
        </div>
        <p>Start with the essentials. Refine your search in the collection.</p>
      </div>
      <form action="/inventory" className="finder-form">
        <label className="field">
          <span>Make</span>
          <select name="make" defaultValue="">
            <option value="">Any make</option>
            {makes.map((make) => <option key={make} value={make}>{make}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Body type</span>
          <select name="bodyType" defaultValue="">
            <option value="">Any body type</option>
            {categories.map(({ bodyType }) => <option key={bodyType} value={bodyType}>{bodyType}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Maximum budget (NGN)</span>
          <select name="maxBudget" defaultValue="">
            <option value="">Any budget</option>
            {budgetOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <input type="hidden" name="currency" value="NGN" />
        <button className="button button-gold finder-submit" type="submit">Search vehicles <span aria-hidden="true">→</span></button>
      </form>
      <div className="finder-assist">Not sure what you need? <Link href="/concierge">Let the AI Concierge help you <span aria-hidden="true">↗</span></Link></div>
    </section>
  );
}
