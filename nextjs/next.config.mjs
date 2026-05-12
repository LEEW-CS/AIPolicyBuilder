/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The page is fully client-rendered (the policy template runs in the
  // browser so we never have to transmit the user's answers to a server
  // when generating their PDF/DOCX). If you later want to deploy this as
  // a fully static export — e.g. to GitHub Pages or any S3-style host —
  // uncomment the next line and run `next build` to produce ./out.
  // output: 'export',
  images: {
    // The Cloudstaff logo is loaded from cloudstaff.com — allow it.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.cloudstaff.com',
        pathname: '/wp-content/uploads/**',
      },
    ],
  },
};

export default nextConfig;
