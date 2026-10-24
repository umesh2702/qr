import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, QrCode, ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AdBanner } from "@/components/AdBanner";
import { UcreatesBanner } from "@/components/UcreatesBanner";
import { ARTICLES } from "@/lib/articles";
import { getAbsoluteUrl } from "@/lib/site-url";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return ARTICLES.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = ARTICLES.find((a) => a.slug === slug);

  if (!article) {
    return {
      title: "Article Not Found",
    };
  }

  const postUrl = getAbsoluteUrl(`/blog/${article.slug}`);

  return {
    title: article.title,
    description: article.summary,
    alternates: {
      canonical: postUrl,
    },
    openGraph: {
      title: article.title,
      description: article.summary,
      url: postUrl,
      type: "article",
      publishedTime: article.publishedAt,
      authors: ["UCode Technical Research Team"],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.summary,
    },
  };
}

/**
 * Basic markdown parser converting clean markdown string to structured elements
 */
function renderArticleContent(content: string) {
  const sections = content.split("\n\n");

  return sections.map((sec, idx) => {
    const trimmed = sec.trim();
    if (!trimmed) return null;

    // Heading 3
    if (trimmed.startsWith("### ")) {
      return (
        <h3
          key={idx}
          className="text-xl font-semibold tracking-tight text-neutral-900 mt-8 mb-3"
        >
          {trimmed.replace("### ", "")}
        </h3>
      );
    }

    // Heading 4
    if (trimmed.startsWith("#### ")) {
      return (
        <h4
          key={idx}
          className="text-base font-semibold tracking-tight text-neutral-900 mt-6 mb-2"
        >
          {trimmed.replace("#### ", "")}
        </h4>
      );
    }

    // Blockquote
    if (trimmed.startsWith("> ")) {
      return (
        <blockquote
          key={idx}
          className="p-4 my-4 rounded-xl border-l-2 border-neutral-900 bg-neutral-50 text-neutral-800 text-sm italic"
        >
          {trimmed.replace(/^>\s*/gm, "")}
        </blockquote>
      );
    }

    // Code block
    if (trimmed.startsWith("```")) {
      const codeLines = trimmed.replace(/^```[a-z]*\n?/i, "").replace(/```$/, "");
      return (
        <pre
          key={idx}
          className="p-4 my-4 rounded-xl bg-neutral-900 text-neutral-100 text-xs font-mono overflow-x-auto"
        >
          <code>{codeLines}</code>
        </pre>
      );
    }

    // Bullet list
    if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
      const items = trimmed
        .split("\n")
        .filter((l) => l.trim().startsWith("* ") || l.trim().startsWith("- "))
        .map((l) => l.replace(/^[*\-]\s+/, ""));

      return (
        <ul key={idx} className="my-3 space-y-2 list-disc list-inside text-sm text-neutral-600">
          {items.map((it, i) => (
            <li key={i} className="leading-relaxed">
              <span dangerouslySetInnerHTML={{ __html: formatInline(it) }} />
            </li>
          ))}
        </ul>
      );
    }

    // Numbered list
    if (/^\d+\.\s/.test(trimmed)) {
      const items = trimmed
        .split("\n")
        .filter((l) => /^\d+\.\s/.test(l.trim()))
        .map((l) => l.replace(/^\d+\.\s+/, ""));

      return (
        <ol key={idx} className="my-3 space-y-2 list-decimal list-inside text-sm text-neutral-600">
          {items.map((it, i) => (
            <li key={i} className="leading-relaxed">
              <span dangerouslySetInnerHTML={{ __html: formatInline(it) }} />
            </li>
          ))}
        </ol>
      );
    }

    // Standard paragraph
    return (
      <p
        key={idx}
        className="my-3 text-sm sm:text-base text-neutral-600 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }}
      />
    );
  });
}

/**
 * Replaces **bold** and `code` tags safely
 */
function formatInline(str: string): string {
  return str
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-neutral-900">$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-neutral-100 font-mono text-xs text-neutral-900">$1</code>');
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const article = ARTICLES.find((a) => a.slug === slug);

  if (!article) {
    notFound();
  }

  const postUrl = getAbsoluteUrl(`/blog/${article.slug}`);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
    headline: article.title,
    description: article.summary,
    url: postUrl,
    datePublished: article.publishedAt,
    author: {
      "@type": "Organization",
      name: "UCode Technical Research Team",
    },
    publisher: {
      "@type": "Organization",
      name: "UCreates",
      url: "https://ucreates.io",
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 antialiased">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header />

      <main className="flex-1 py-10 md:py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Back button */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Research Library</span>
          </Link>

          {/* Article Header */}
          <header className="space-y-3 pb-6 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-400">
              <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                {article.category}
              </span>
              <span>&bull;</span>
              <span>Published {article.publishedAt}</span>
              <span>&bull;</span>
              <span>{article.readTime}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-tight">
              {article.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-500 leading-relaxed font-normal">
              {article.summary}
            </p>
          </header>

          {/* Generator Callout Widget */}
          <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center flex-shrink-0">
                <QrCode className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-xs font-semibold text-slate-900">
                  Ready to generate this QR code?
                </h2>
                <p className="text-[11px] text-slate-500">
                  {article.generatorWorkflow}
                </p>
              </div>
            </div>
            <Link
              href="/#generator"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors flex-shrink-0"
            >
              <span>Open Generator</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Ad slot in content */}
          <AdBanner slotId="article-content-top" format="leaderboard" />

          {/* Main Article Body */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-6 sm:p-8">
            {renderArticleContent(article.content)}
          </div>

          {/* Contextual UCreates Agency banner */}
          <div className="pt-4">
            <UcreatesBanner context={article.category === "Business" ? "menu" : "general"} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
