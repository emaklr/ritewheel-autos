import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container not-found">
      <div>
        <span className="eyebrow">404 · NOT FOUND</span>
        <h1>This page has moved.</h1>
        <p>The vehicle or page you requested may no longer be available.</p>
        <Link href="/inventory" className="button button-gold">Browse inventory</Link>
      </div>
    </main>
  );
}