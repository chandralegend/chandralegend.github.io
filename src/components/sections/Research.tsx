import { publications, scholar } from "@/lib/content";
import ResearchList from "@/components/ui/ResearchList";

export default function Research() {
  return (
    <section id="research" className="section research" data-moon="research" aria-labelledby="research-title">
      <div className="container research__grid">
        <header className="section-head research__head">
          <p className="eyebrow" data-scramble>
            03 — Research
          </p>
          <h2 id="research-title" className="display-lg" data-reveal="lines">
            Making language models cheaper — and more <em>reliable</em>.
          </h2>
          <p className="lede" data-reveal="fade">
            Papers on what it really takes to run AI in production: when small open models can replace big APIs, and how
            the structure of your code can do the prompt engineering.
          </p>
        </header>

        <div className="research__stats" data-reveal="fade">
          <div className="research__big">
            <span className="research__num" data-count={scholar.citations}>
              {scholar.citations}
            </span>
            <span className="research__caption">citations · Google Scholar · {scholar.asOf}</span>
          </div>
          <dl className="research__mini">
            <div>
              <dt>h-index</dt>
              <dd>{scholar.hIndex}</dd>
            </div>
            <div>
              <dt>i10-index</dt>
              <dd>{scholar.i10}</dd>
            </div>
            <div>
              <dt>Papers</dt>
              <dd>{publications.length}</dd>
            </div>
          </dl>
          <a className="link-arrow" href={scholar.href} target="_blank" rel="noreferrer" data-cursor="Open">
            Google Scholar <span aria-hidden="true">↗</span>
          </a>
        </div>

        <ResearchList items={publications} />
      </div>
    </section>
  );
}
