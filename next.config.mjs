/**
 * The demo ships as a folder of static files, so it can be opened from a
 * laptop, a USB stick or GitHub Pages without a server.
 *
 * NEXT_PUBLIC_BASE_PATH is set only when the site is served from a subfolder,
 * as GitHub Pages does at /<repo>/. Locally it is empty and nothing changes.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};
export default nextConfig;
