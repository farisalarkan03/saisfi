/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',         // output ke folder /out untuk Cloudflare Pages
  trailingSlash: true,      // wajib untuk static hosting di Cloudflare
  images: {
    unoptimized: true,      // wajib saat output: 'export'
    domains: ["api.dicebear.com", "images.unsplash.com"],
  },
};

export default nextConfig;
