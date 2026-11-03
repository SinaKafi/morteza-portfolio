import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: "export",
  // The project sits inside a directory that has its own lockfile; pin the
  // tracing root here so builds do not warn about it.
  outputFileTracingRoot: import.meta.dirname,
};

export default nextConfig;
