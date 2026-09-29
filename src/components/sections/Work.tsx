import type { Project } from "@/lib/content";
import ProjectGlyph from "@/components/ui/ProjectGlyph";
import TiltCard from "@/components/ui/TiltCard";

export default function Work({ projects, stars }: { projects: Project[]; stars: number }) {
  return (
    <section id="work" className="work" data-moon="work" data-hscroll aria-labelledby="work-title">
      <div className="work__track" data-hscroll-track>
        <div className="work__intro">
          <p className="eyebrow" data-scramble>
            02 — Selected work
          </p>
          <h2 id="work-title" className="display-lg" data-reveal="lines">
            Things I’ve built — and keep <em>building</em>.
          </h2>
          <p className="lede" data-reveal="fade">
            Open-source tools for making AI behave: agents you can audit, typed prompting, a friendlier shell.{" "}
            <span className="nowrap">{stars}★ on GitHub</span> and counting.
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
                <span>
                  {p.status ?? "Open source"} · ★ {p.stars}
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
              <a className="project__link" href={p.href} target="_blank" rel="noreferrer" data-cursor="Open">
                <span>
                  View <span className="sr-only">{p.name}</span> on GitHub
                </span>
                <span aria-hidden="true">↗</span>
              </a>
            </TiltCard>
          </article>
        ))}

        <div className="work__outro">
          <a className="work__more" href="https://github.com/chandralegend" target="_blank" rel="noreferrer" data-cursor="Open">
            <span className="work__more-kicker">More on GitHub</span>
            <span className="work__more-title">
              @chandralegend <span aria-hidden="true">↗</span>
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
