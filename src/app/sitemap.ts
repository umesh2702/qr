import { MetadataRoute } from "next";
import { ARTICLES } from "@/lib/articles";
import { getAbsoluteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  // Core public indexable pages (reliable canonical endpoints)
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: getAbsoluteUrl("/"),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: getAbsoluteUrl("/blog"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: getAbsoluteUrl("/services"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: getAbsoluteUrl("/about"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: getAbsoluteUrl("/contact"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: getAbsoluteUrl("/privacy"),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: getAbsoluteUrl("/terms"),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Published guide & research articles derived from the source-of-truth articles registry
  const blogRoutes: MetadataRoute.Sitemap = ARTICLES.map((article) => ({
    url: getAbsoluteUrl(`/blog/${article.slug}`),
    lastModified: new Date(article.publishedAt),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...blogRoutes];
}
