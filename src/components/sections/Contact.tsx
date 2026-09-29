import { contactHref, contactTarget, doors, site, socials } from "@/lib/content";
import Clock from "@/components/ui/Clock";
import Magnetic from "@/components/ui/Magnetic";

export default function Contact() {
  return (
    <section id="contact" className="section contact" data-moon="contact" aria-labelledby="contact-title">
      <div className="container">
        <p className="eyebrow contact__eyebrow" data-scramble>
          06 — Contact · Full moon
        </p>
        <h2 id="contact-title" className="contact__title" data-reveal="lines">
          Let’s build what’s <em>next</em>.
        </h2>

        <ul className="doors">
          {doors.map((d, i) => (
            <li key={d.title} data-reveal="fade" data-delay={i * 0.08}>
              <a className="door" href={contactHref(d.subject)} data-cursor="Write" {...contactTarget}>
                <span className="door__index">{d.index}</span>
                <span className="door__title">{d.title}</span>
                <span className="door__body">{d.body}</span>
                <span className="door__cta">
                  {d.cta}
                  <span className="door__arrow" aria-hidden="true">
                    →
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>

        <div className="contact__meta" data-moon="moonset">
          <div className="contact__col">
            <p className="eyebrow">Reach me</p>
            <Magnetic strength={0.2}>
              <a className="contact__primary" href={contactHref()} {...contactTarget}>
                <span>{site.email || "Message me on LinkedIn"}</span> <span aria-hidden="true">↗</span>
              </a>
            </Magnetic>
            <p className="contact__avail">
              <span className="dot" aria-hidden="true" /> Open to {site.availability.join(" · ").toLowerCase()}
            </p>
          </div>
          <div className="contact__col">
            <p className="eyebrow">Elsewhere</p>
            <ul className="socials">
              {socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noreferrer">
                    <span>{s.label}</span>
                    <span className="socials__handle">{s.handle}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="contact__col">
            <p className="eyebrow">Local time</p>
            <p className="contact__time">
              <Clock />
            </p>
            <p className="contact__place">
              {site.location.city}, {site.location.country} · GMT+5:30
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
