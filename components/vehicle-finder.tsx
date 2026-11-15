export function VehicleFinder() {
  return (
    <form action="/inventory" method="get" className="finder-panel">
      <div className="finder-intro">
        <span className="eyebrow">START YOUR SEARCH</span>
        <h2>Find your vehicle</h2>
        <p>Tell us what matters. We’ll help narrow the collection.</p>
      </div>
      <label className="finder-field"><span>Make</span><select name="make" defaultValue=""><option value="">Any make</option><option>Mercedes-Benz</option><option>BMW</option><option>Land Rover</option></select></label>
      <label className="finder-field"><span>Body type</span><select name="bodyType" defaultValue=""><option value="">Any type</option><option value="SUV">SUV</option><option value="Sedan">Sedan</option><option value="Coupe">Coupe</option><option value="Pickup">Pickup</option></select></label>
      <label className="finder-field"><span>Maximum budget</span><select name="maxPrice" defaultValue=""><option value="">Any budget</option><option value="30000000">Up to ₦30 million</option><option value="50000000">Up to ₦50 million</option><option value="80000000">Up to ₦80 million</option><option value="150000000">Up to ₦150 million</option></select><input type="hidden" name="currency" value="NGN" /></label>
      <button className="button button-gold finder-submit" type="submit">Search vehicles <span aria-hidden="true">→</span></button>
    </form>
  );
}