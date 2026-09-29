import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate, getPost, getPosts, postParams } from "@/lib/blog";
import { contactHref, contactTarget, site } from "@/lib/content";
import Footer from "@/components/sections/Footer";
import PageMoon from "@/components/ui/PageMoon";

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return postParams();
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) return {};
  const url = `/blog/${post.slug}/`;
  const image = `/blog/${post.slug}/og.png`;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: url },
    robots: post.draft ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      authors: [site.url],
      tags: post.tags,
      images: [{ url: image, width: 1200, height: 630, alt: post.title }],
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.description, images: [image] },
  };
}

export default async function Article({ params }: { params: Promise<Params> }) {
  const post = await getPost((await params).slug);
  if (!post) notFound();

  const posts = getPosts();
  const i = posts.findIndex((p) => p.slug === post.slug);
  const newer = i > 0 ? posts[i - 1] : undefined;
  const older = i >= 0 ? posts[i + 1] : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    url: `${site.url}/blog/${post.slug}/`,
    image: `${site.url}/blog/${post.slug}/og.png`,
    keywords: post.tags.join(", "),
    author: { "@type": "Person", name: site.name, url: site.url },
  };

  return (
    <>
      <main id="main" className="article">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <div className="container article__wrap">
          <Link className="article__back" href="/blog/">
            <span aria-hidden="true">←</span> All writing
          </Link>

          <header className="article__head">
            <p className="eyebrow">
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span aria-hidden="true">·</span>
              {post.minutes} min read
              {post.draft && <span className="post-row__draft">Draft</span>}
            </p>
            <h1 className="article__title">{post.title}</h1>
            <p className="lede article__lede">{post.description}</p>
          </header>

          <div className="prose" dangerouslySetInnerHTML={{ __html: post.html }} />

          <footer className="article__foot">
            {post.tags.length > 0 && (
              <ul className="article__tags" aria-label="Tags">
                {post.tags.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            )}

            <div className="article__author">
              <p>
                Written by <strong>{site.name}</strong>, AI engineer and researcher in {site.location.city}.
                {post.linkedin ? " Disagree, or have something to add? The conversation is on LinkedIn." : " Replies welcome."}
              </p>
              <div className="article__actions">
                {post.linkedin && (
                  <a className="pill pill--solid" href={post.linkedin} target="_blank" rel="noreferrer">
                    <span>Discuss on LinkedIn</span>
                    <span aria-hidden="true">↗</span>
                  </a>
                )}
                <a className="pill" href={contactHref(`Re: ${post.title}`)} {...contactTarget}>
                  <span>Reply by email</span>
                </a>
              </div>
            </div>

            {(newer || older) && (
              <nav className="article__pager" aria-label="More writing">
                {older ? (
                  <Link href={`/blog/${older.slug}/`}>
                    <span className="eyebrow">Previous</span>
                    <span>{older.title}</span>
                  </Link>
                ) : (
                  <span />
                )}
                {newer && (
                  <Link href={`/blog/${newer.slug}/`} className="article__pager-next">
                    <span className="eyebrow">Next</span>
                    <span>{newer.title}</span>
                  </Link>
                )}
              </nav>
            )}
          </footer>
        </div>
      </main>
      <Footer />
      <PageMoon />
    </>
  );
}
