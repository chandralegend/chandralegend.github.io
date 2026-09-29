import { marquee } from "@/lib/content";

function Group({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul className="marquee__group" aria-hidden={hidden || undefined}>
      {marquee.map((word, i) => (
        <li key={word} className={`marquee__item ${i % 2 ? "marquee__item--italic" : ""}`}>
          {word}
          <span className="marquee__star" aria-hidden="true">
            ✦
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function Marquee() {
  return (
    <div className="marquee" data-marquee>
      <div className="marquee__track" data-marquee-track>
        <Group />
        <Group hidden />
      </div>
    </div>
  );
}
