import type { NextConfig } from "next";

/**
 * GitHub Pages serves a project site from `/<repo>/`, so every emitted URL —
 * pages, `_next/static` chunks, fonts, the OG card — has to carry that prefix.
 * The deploy workflow sets this; it is empty locally so `next dev` stays at the
 * root. Without it the HTML loads but every asset 404s against the origin root.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: "export",
  basePath,
  // The project sits inside a directory that has its own lockfile; pin the
  // tracing root here so builds do not warn about it.
  outputFileTracingRoot: import.meta.dirname,
};

export default nextConfig;
