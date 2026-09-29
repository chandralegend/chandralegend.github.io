import { roles, site } from "@/lib/content";
import MoonIcon from "@/components/ui/MoonIcon";

export default function Hero() {
  return (
    <section id="top" className="hero" data-moon="hero" aria-labelledby="hero-title">
      <div className="hero__inner container" data-hero-inner>
        <p className="eyebrow hero__eyebrow" data-hero-fade>
          <span className="dot" aria-hidden="true" />
          {site.roleLine}
        </p>

        <h1 id="hero-title" className="hero__name">
          <span className="hero__line" data-hero-line>
            {site.firstName}
          </span>{" "}
          <span className="hero__line hero__line--last" data-hero-line>
            {site.lastName}
          </span>
        </h1>

        <div className="hero__intro">
          <p className="hero__tagline" data-hero-fade>
            {site.tagline}
          </p>
          <ul className="hero__roles" data-hero-fade>
            {roles.map((r) => (
              <li key={r.org}>
                <span>{r.title}</span>
                <a href={r.href} target="_blank" rel="noreferrer">
                  @{r.org}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="hero__footer container" data-hero-fade>
        <p className="hero__meaning">
          <MoonIcon phase={0.3} />
          <span>{site.nameMeaning}</span>
        </p>
        <p className="hero__hint">Hover the moon to explore its dark side</p>
        <a href="#about" className="hero__scroll" data-cursor="Scroll">
          <span>Scroll — watch it wax</span>
          <span className="hero__scroll-line" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
