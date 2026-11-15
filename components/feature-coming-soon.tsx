import Link from "next/link";

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  detail: string;
};

export function FeatureComingSoon({ eyebrow, title, description, detail }: Props) {
  return (
    <section className="feature-coming-soon">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p className="feature-coming-lead">{description}</p>
      <div className="feature-coming-detail">{detail}</div>
      <div className="hero-actions">
        <Link href="/inventory" className="button button-gold">Explore inventory →</Link>
        <Link href="/" className="button button-outline">Back to homepage</Link>
      </div>
      <span className="coming-label">RITEWHEEL · RELEASE 1 IN PROGRESS</span>
    </section>
  );
}
