async function verifyRoutes() {
  const routes = [
    "/",
    "/about",
    "/services",
    "/contact",
    "/blog",
    "/blog/static-vs-dynamic-qr-codes",
    "/privacy",
    "/terms",
  ];

  console.log("Starting verification of routes on http://localhost:3001...\n");

  for (const route of routes) {
    const res = await fetch("http://localhost:3001" + route);
    const html = await res.text();

    const canonicalMatch =
      html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) ||
      html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
    const ogUrlMatch = html.match(/<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i);
    const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
    const jsonLdMatch = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);

    console.log(`Route: ${route} (HTTP ${res.status})`);
    console.log(`  Canonical: ${canonicalMatch ? canonicalMatch[1] : "NONE"}`);
    console.log(`  OG URL:    ${ogUrlMatch ? ogUrlMatch[1] : "NONE"}`);
    console.log(`  OG Image:  ${ogImageMatch ? ogImageMatch[1] : "NONE"}`);

    if (jsonLdMatch) {
      try {
        const parsed = JSON.parse(jsonLdMatch[1]);
        const types = parsed["@graph"]
          ? `@graph [${parsed["@graph"].map((g) => g["@type"]).join(", ")}]`
          : parsed["@type"];
        console.log(`  JSON-LD:   Valid (${types})`);
      } catch (err) {
        console.log(`  JSON-LD:   INVALID: ${err.message}`);
      }
    } else {
      console.log(`  JSON-LD:   None`);
    }

    // Verify no stray domain
    if (html.includes("ucode.app")) {
      console.error(`  ERROR: Found stray "ucode.app" in ${route}!`);
    }
    if (html.includes("qr-eight-omega.vercel.app")) {
      console.error(`  ERROR: Found stray "qr-eight-omega.vercel.app" in ${route}!`);
    }

    console.log("");
  }
}

verifyRoutes().catch(console.error);
