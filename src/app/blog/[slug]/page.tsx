import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, QrCode, ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AdBanner } from "@/components/AdBanner";
import { UcreatesBanner } from "@/components/UcreatesBanner";
import { ARTICLES } from "@/lib/articles";

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
      title: "Article Not Found | UCode Blog",
    };
  }

  return {
    title: `${article.title} | UCode Research`,
    description: article.summary,
    alternates: {
      canonical: `https://ucode.app/blog/${article.slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.summary,
      url: `https://ucode.app/blog/${article.slug}`,
      type: "article",
      publishedTime: article.publishedAt,
      authors: ["UCode Technical Research Team"],
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
          className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-8 mb-3"
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
          className="text-lg font-bold tracking-tight text-slate-900 dark:text-white mt-6 mb-2"
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
          className="p-4 my-4 rounded-xl border-l-4 border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-slate-800 dark:text-slate-200 text-sm italic"
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
          className="p-4 my-4 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto border border-slate-800"
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
        <ul key={idx} className="my-3 space-y-2 list-disc list-inside text-sm text-slate-700 dark:text-slate-300">
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
        <ol key={idx} className="my-3 space-y-2 list-decimal list-inside text-sm text-slate-700 dark:text-slate-300">
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
        className="my-3 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed"
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
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900 dark:text-white">$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-xs text-indigo-600 dark:text-indigo-400">$1</code>');
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const article = ARTICLES.find((a) => a.slug === slug);

  if (!article) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.summary,
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
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header />

      <main className="flex-1 py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Back button */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Articles</span>
          </Link>

          {/* Article Header */}
          <header className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-md">
                {article.category}
              </span>
              <span className="flex items-center gap-1 text-slate-500">
                <Calendar className="w-3.5 h-3.5" />
                <span>Published {article.publishedAt}</span>
              </span>
              <span className="flex items-center gap-1 text-slate-500">
                <Clock className="w-3.5 h-3.5" />
                <span>{article.readTime}</span>
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              {article.title}
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              {article.summary}
            </p>
          </header>

          {/* Generator Callout Widget */}
          <div className="p-5 rounded-2xl border border-indigo-200/80 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/80 to-sky-50/60 dark:from-indigo-950/30 dark:to-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Ready to generate this QR code?
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {article.generatorWorkflow}
                </p>
              </div>
            </div>
            <Link
              href="/#generator"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors flex-shrink-0"
            >
              <span>Launch Generator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Ad slot in content */}
          <AdBanner slotId="article-content-top" format="leaderboard" />

          {/* Main Article Body */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm">
            {renderArticleContent(article.content)}
          </div>

          {/* Contextual UCreates Agency banner */}
          <div className="pt-6">
            <UcreatesBanner context={article.category === "Business" ? "menu" : "general"} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
