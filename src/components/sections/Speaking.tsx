import { contactHref, contactTarget, talkFormats } from "@/lib/content";
import Magnetic from "@/components/ui/Magnetic";
import TalkList from "@/components/ui/TalkList";

export default function Speaking() {
  return (
    <section id="speaking" className="section speaking" data-moon="speaking" aria-labelledby="speaking-title">
      <div className="container speaking__grid">
        <header className="section-head speaking__head">
          <p className="eyebrow" data-scramble>
            05 — Speaking
          </p>
          <h2 id="speaking-title" className="display-lg" data-reveal="lines">
            Talks that hold up in <em>production</em>.
          </h2>
          <p className="lede" data-reveal="fade">
            I speak about building AI people can depend on — for engineers, founders and students.
          </p>
          <ul className="chips chips--lg" data-reveal="fade" aria-label="Formats">
            {talkFormats.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <div data-reveal="fade">
            <Magnetic>
              <a className="pill pill--solid pill--lg" href={contactHref("Speaking invitation")} {...contactTarget}>
                <span>Invite me to speak</span>
                <span aria-hidden="true">↗</span>
              </a>
            </Magnetic>
          </div>
        </header>

        <TalkList />
      </div>
    </section>
  );
}
