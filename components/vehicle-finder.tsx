const makes = ["Mercedes-Benz", "BMW", "Toyota", "Land Rover", "Lexus", "Porsche"];

export function VehicleFinder() {
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
            <option value="SUV">SUV</option>
            <option value="Sedan">Sedan</option>
            <option value="Coupe">Coupe</option>
            <option value="Pickup">Pickup</option>
          </select>
        </label>
        <label className="field">
          <span>Maximum budget</span>
          <select name="maxBudget" defaultValue="">
            <option value="">Any budget</option>
            <option value="50000000">Up to ₦50m</option>
            <option value="80000000">Up to ₦80m</option>
            <option value="120000000">Up to ₦120m</option>
            <option value="200000000">Up to ₦200m</option>
          </select>
        </label>
        <button className="button button-gold finder-submit" type="submit">Search vehicles <span aria-hidden="true">→</span></button>
      </form>
      <div className="finder-assist">Not sure what you need? <a href="/concierge">Let the AI Concierge help you <span aria-hidden="true">↗</span></a></div>
    </section>
  );
}
