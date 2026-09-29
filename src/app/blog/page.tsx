import type { Metadata } from "next";
import Link from "next/link";
import { formatDate, getPosts } from "@/lib/blog";
import { site } from "@/lib/content";
import Footer from "@/components/sections/Footer";
import PageMoon from "@/components/ui/PageMoon";

export const metadata: Metadata = {
  title: "Writing",
  description: `Long-form notes by ${site.name} on building AI systems that hold up in production.`,
  alternates: { canonical: "/blog/" },
  openGraph: { type: "website", url: "/blog/", title: `Writing — ${site.name}` },
};

export default function Blog() {
  const posts = getPosts();

  return (
    <>
      <main id="main" className="blog">
        <div className="container">
          <header className="blog__head">
            <p className="eyebrow">Writing</p>
            <h1 className="display-lg">
              Notes from the <em>lit side</em>.
            </h1>
            <p className="lede">
              The longer version of what I post: AI news worth a second look, and what building with it actually
              teaches you.
            </p>
            <a className="blog__rss" href="/blog/feed.xml">
              RSS <span aria-hidden="true">↗</span>
            </a>
          </header>

          {posts.length ? (
            <ol className="post-list">
              {posts.map((p) => (
                <li key={p.slug}>
                  <Link className="post-row" href={`/blog/${p.slug}/`}>
                    <time className="post-row__date" dateTime={p.date}>
                      {formatDate(p.date, "short")}
                    </time>
                    <span className="post-row__body">
                      <span className="post-row__title">
                        {p.title}
                        {p.draft && <span className="post-row__draft">Draft</span>}
                      </span>
                      <span className="post-row__desc">{p.description}</span>
                    </span>
                    <span className="post-row__meta">
                      {p.minutes} min <span aria-hidden="true">↗</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          ) : (
            <p className="blog__empty">The first article is on its way. Until then, the moon is still here.</p>
          )}
        </div>
      </main>
      <Footer />
      <PageMoon />
    </>
  );
}
