import Link from "next/link";
import { formatDate, getPosts } from "@/lib/blog";

/** The three newest published posts, just above Contact. Renders nothing until the first post exists. */
export default function Writing() {
  const posts = getPosts()
    .filter((p) => !p.draft)
    .slice(0, 3);
  if (!posts.length) return null;

  return (
    <section id="writing" className="section writing" data-moon="writing" aria-labelledby="writing-title">
      <div className="container">
        <header className="section-head writing__head">
          <p className="eyebrow" data-scramble>
            From the blog
          </p>
          <h2 id="writing-title" className="display-lg" data-reveal="lines">
            Recent <em>writing</em>.
          </h2>
        </header>

        <ol className="post-list writing__list">
          {posts.map((p) => (
            <li key={p.slug} data-reveal="fade">
              <Link className="post-row" href={`/blog/${p.slug}/`}>
                <time className="post-row__date" dateTime={p.date}>
                  {formatDate(p.date, "short")}
                </time>
                <span className="post-row__body">
                  <span className="post-row__title">{p.title}</span>
                  <span className="post-row__desc">{p.description}</span>
                </span>
                <span className="post-row__meta">
                  {p.minutes} min <span aria-hidden="true">↗</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>

        <div className="writing__more" data-reveal="fade">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- full load, so homepage scroll pins never leak into the blog */}
          <a className="pill" href="/blog/">
            <span>All writing</span>
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}
