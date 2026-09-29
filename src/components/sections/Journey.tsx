import { alsoAt, journey } from "@/lib/content";
import MoonIcon from "@/components/ui/MoonIcon";

export default function Journey() {
  return (
    <section id="journey" className="section journey" data-moon="journey" aria-labelledby="journey-title">
      <div className="container journey__grid">
        <header className="section-head journey__head">
          <p className="eyebrow" data-scramble>
            04 — Journey
          </p>
          <h2 id="journey-title" className="display-lg" data-reveal="lines">
            Every phase, <em>so far</em>.
          </h2>
          <p className="lede" data-reveal="fade">
            From smart-home research at Moratuwa to technical leadership at Stekz and applied AI research at Leaf Monkey Labs.
          </p>
        </header>

        <div className="timeline">
          <span className="timeline__line" data-journey-line aria-hidden="true" />
          <ol>
            {journey.map((item) => (
              <li key={`${item.org}-${item.title}`} className="timeline__item" data-reveal="fade">
                <MoonIcon phase={item.phase} className="timeline__moon" />
                <p className="timeline__period">{item.period}</p>
                <div>
                  <h3 className="timeline__title">{item.title}</h3>
                  <p className="timeline__org">
                    {item.href ? (
                      <a href={item.href} target="_blank" rel="noreferrer">
                        {item.org} <span aria-hidden="true">↗</span>
                      </a>
                    ) : (
                      item.org
                    )}
                  </p>
                  <p className="timeline__note">{item.note}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {alsoAt.length > 0 && (
          <p className="journey__also" data-reveal="fade">
            Previously also at {alsoAt.join(" and ")}.
          </p>
        )}
      </div>
    </section>
  );
}
