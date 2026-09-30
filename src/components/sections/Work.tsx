import { projects } from "@/lib/content";
import ProjectGlyph from "@/components/ui/ProjectGlyph";
import TiltCard from "@/components/ui/TiltCard";

export default function Work() {
  return (
    <section id="work" className="work" data-moon="work" data-hscroll aria-labelledby="work-title">
      <div className="work__track" data-hscroll-track>
        <div className="work__intro">
          <p className="eyebrow" data-scramble>
            02 — Now building
          </p>
          <h2 id="work-title" className="display-lg" data-reveal="lines">
            Products I’m <em>building</em> now.
          </h2>
          <p className="lede" data-reveal="fade">
            At Leaf Monkey Labs, a small studio in Colombo: AI that does real work for real customers, with the
            deterministic parts done properly.
          </p>
          <p className="work__hint" aria-hidden="true">
            <span>Keep scrolling</span>
            <span className="work__hint-arrow">→</span>
          </p>
        </div>

        {projects.map((p, i) => (
          <article key={p.id} className="project" data-hscroll-item aria-labelledby={`project-${p.id}`}>
            <TiltCard className="project__card">
              <div className="project__top">
                <span>{String(i + 1).padStart(2, "0")}</span>
                <span className="project__status">
                  <span className="project__dot" aria-hidden="true" />
                  {p.status}
                </span>
              </div>
              <ProjectGlyph type={p.glyph} />
              <div className="project__body">
                <h3 id={`project-${p.id}`} className="project__name">
                  {p.name}
                </h3>
                <p className="project__tagline">{p.tagline}</p>
                <p className="project__desc">{p.description}</p>
                <ul className="chips">
                  {p.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
              <a className="project__link" href={p.href} target="_blank" rel="noreferrer" data-cursor="Visit">
                <span>
                  <span className="sr-only">{p.name}: </span>
                  {p.href.replace("https://", "")}
                </span>
                <span aria-hidden="true">↗</span>
              </a>
            </TiltCard>
          </article>
        ))}

        <div className="work__outro">
          <a className="work__more" href="https://leafmonkey.org" target="_blank" rel="noreferrer" data-cursor="Open">
            <span className="work__more-kicker">The studio</span>
            <span className="work__more-title">
              Leaf Monkey Labs <span aria-hidden="true">↗</span>
            </span>
          </a>
        </div>
      </div>
      <div className="work__progress" aria-hidden="true">
        <span data-hscroll-progress />
      </div>
    </section>
  );
}
