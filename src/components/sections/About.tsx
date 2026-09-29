import { manifesto, pillars, publications, scholar } from "@/lib/content";

export default function About({ stars }: { stars: number }) {
  const firstAuthor = publications.find((p) => p.note === "First author");
  const stats = [
    { value: scholar.citations, label: "Citations on Google Scholar" },
    { value: firstAuthor?.citations ?? 0, label: "On a single first-author paper" },
    { value: stars, label: "GitHub stars across my open source" },
    { value: publications.length, label: "Papers, from smart homes to LLMs" },
  ];

  return (
    <section id="about" className="section about" data-moon="about" aria-labelledby="about-title">
      <div className="container about__grid">
        <div className="about__label">
          <p className="eyebrow" data-scramble>
            01 — About
          </p>
          <h2 id="about-title" className="sr-only">
            About Chandra
          </h2>
        </div>

        <p className="about__statement" data-scrub-words>
          {manifesto}
        </p>

        <ul className="pillars">
          {pillars.map((p, i) => (
            <li key={p.title} className="pillar" data-reveal="fade" data-delay={i * 0.1}>
              <span className="pillar__index">{p.index}.</span>
              <h3 className="pillar__title">{p.title}</h3>
              <p>{p.body}</p>
            </li>
          ))}
        </ul>

        <dl className="stats">
          {stats.map((s) => (
            <div key={s.label} className="stat" data-reveal="fade">
              <dt className="stat__label">{s.label}</dt>
              <dd className="stat__num" data-count={s.value}>
                {s.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
