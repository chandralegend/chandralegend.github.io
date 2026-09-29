import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="lost">
      <div className="container lost__inner">
        <p className="eyebrow">404 — Lost in orbit</p>
        <h1 className="lost__title">
          This page drifted to the <em>dark side</em>.
        </h1>
        <Link className="pill pill--solid pill--lg" href="/">
          <span>Back to the moon</span>
          <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </main>
  );
}
