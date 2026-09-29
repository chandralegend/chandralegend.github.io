import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/blog";
import { site } from "@/lib/content";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getPosts().filter((p) => !p.draft);
  return [
    { url: `${site.url}/`, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    ...(posts.length
      ? [{ url: `${site.url}/blog/`, lastModified: new Date(posts[0].date), changeFrequency: "weekly" as const, priority: 0.8 }]
      : []),
    ...posts.map((p) => ({
      url: `${site.url}/blog/${p.slug}/`,
      lastModified: new Date(p.updated ?? p.date),
      changeFrequency: "yearly" as const,
      priority: 0.7,
    })),
  ];
}
