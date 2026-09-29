import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeShiki from "@shikijs/rehype";
import rehypeStringify from "rehype-stringify";

/**
 * Blog posts are Markdown files in /content/blog, named `<slug>.md`, with frontmatter:
 *
 *   title: "…"             required
 *   description: "…"       required — used for the lede, link previews and RSS
 *   date: 2026-10-05       required (YYYY-MM-DD)
 *   updated: 2026-10-07    optional
 *   tags: [agents, llms]   optional
 *   linkedin: https://…    optional — the LinkedIn post that discusses it
 *   draft: true            hidden from the build unless BLOG_DRAFTS=1
 */
const DIR = path.join(process.cwd(), "content/blog");

export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated?: string;
  tags: string[];
  linkedin?: string;
  draft: boolean;
  minutes: number;
};

export type Post = PostMeta & { html: string };

const showDrafts = process.env.BLOG_DRAFTS === "1";

function isoDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value ?? "").slice(0, 10);
}

function readFile(file: string): { meta: PostMeta; body: string } {
  const slug = file.replace(/\.md$/, "");
  const { data, content } = matter(fs.readFileSync(path.join(DIR, file), "utf8"));
  if (!data.title || !data.description || !data.date) {
    throw new Error(`content/blog/${file}: title, description and date are required`);
  }
  const words = content.trim().split(/\s+/).length;
  return {
    body: content,
    meta: {
      slug,
      title: String(data.title),
      description: String(data.description),
      date: isoDate(data.date),
      updated: data.updated ? isoDate(data.updated) : undefined,
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      linkedin: data.linkedin ? String(data.linkedin) : undefined,
      draft: Boolean(data.draft),
      minutes: Math.max(1, Math.round(words / 230)),
    },
  };
}

function files(): string[] {
  if (!fs.existsSync(DIR)) return [];
  return fs.readdirSync(DIR).filter((f) => f.endsWith(".md") && !f.startsWith("_"));
}

/** Published posts, newest first. Drafts are included only when BLOG_DRAFTS=1. */
export function getPosts(): PostMeta[] {
  return files()
    .map((f) => readFile(f).meta)
    .filter((p) => showDrafts || !p.draft)
    .sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Static export refuses a dynamic route with zero pages, so before the first post exists
 * the [slug] routes emit a single placeholder that renders as not-found.
 */
export const EMPTY_SLUG = "_";

export function postParams(): { slug: string }[] {
  const posts = getPosts();
  return posts.length ? posts.map((p) => ({ slug: p.slug })) : [{ slug: EMPTY_SLUG }];
}

export async function getPost(slug: string): Promise<Post | null> {
  const file = `${slug}.md`;
  if (!files().includes(file)) return null;
  const { meta, body } = readFile(file);
  if (meta.draft && !showDrafts) return null;

  const html = String(
    await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype)
      .use(rehypeSlug)
      .use(rehypeAutolinkHeadings, { behavior: "wrap" })
      .use(rehypeShiki, { theme: "vesper" })
      .use(rehypeStringify)
      .process(body),
  );
  return { ...meta, html };
}

export function formatDate(iso: string, style: "long" | "short" = "long") {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: style === "long" ? "long" : "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
