import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure Turbopack uses the project workspace root (avoids picking an upper-level lockfile)
  turbopack: {
    root: path.resolve(__dirname),
  } as any,
};

export default nextConfig;
