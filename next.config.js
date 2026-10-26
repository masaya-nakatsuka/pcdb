/** @type {import('next').NextConfig} */
const legacyCostPerformanceArticles = [1, 6, 11, 21, 22]
const legacyCpuArticles = [2, 3]
const legacyMobileArticles = [4, 5, 7, 8, 9, 10, 12, 13, 14, 15, 19, 26, 27]
const legacyVideoEditingArticles = [16, 20]
const legacyGamingArticles = [17]
const legacyBalancedArticles = [18, 23, 24, 25]

function blogRedirects(ids, destination) {
  return ids.map((id) => ({
    source: `/blog/article${id}`,
    destination,
    permanent: true,
  }))
}

const nextConfig = {
  outputFileTracingRoot: __dirname,
  async headers() {
    return [{
      source: "/business/:path*",
      headers: [
        { key: "Content-Security-Policy", value: "default-src 'none'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "no-referrer" },
        { key: "Cache-Control", value: "no-cache" },
      ],
    }, {
      source: "/fumi/:path*",
      headers: [
        { key: "Content-Security-Policy", value: "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'none'; worker-src 'self' blob:; object-src 'none'; base-uri 'none'; form-action 'none'; frame-src 'none'; frame-ancestors 'none'" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "no-referrer" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), bluetooth=()" },
        { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
        { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        { key: "Strict-Transport-Security", value: "max-age=31536000" },
        { key: "Cache-Control", value: "no-cache" },
      ],
    }]
  },
  async rewrites() {
    return [{ source: "/business", destination: "/business/index.html" }]
  },
  async redirects() {
    return [
      { source: "/fumi", destination: "/fumi/index.html", permanent: false },
      { source: "/soroban", destination: "/soroban/index.html", permanent: false },
      ...blogRedirects(legacyCostPerformanceArticles, '/blog/article33'),
      ...blogRedirects(legacyCpuArticles, '/blog/article36'),
      ...blogRedirects(legacyGamingArticles, '/blog/article34'),
      ...blogRedirects(legacyVideoEditingArticles, '/blog/article35'),
      ...blogRedirects(legacyMobileArticles, '/blog/article28'),
      ...blogRedirects(legacyBalancedArticles, '/blog/article29'),
    ]
  },
}

module.exports = nextConfig
