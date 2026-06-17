/** @type {import('next').NextConfig} */
const legacyCostPerformanceArticles = [1, 2, 3, 6, 11, 21, 22]
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
  async redirects() {
    return [
      ...blogRedirects(legacyCostPerformanceArticles, '/blog/article33'),
      ...blogRedirects(legacyGamingArticles, '/blog/article34'),
      ...blogRedirects(legacyVideoEditingArticles, '/blog/article35'),
      ...blogRedirects(legacyMobileArticles, '/blog/article28'),
      ...blogRedirects(legacyBalancedArticles, '/blog/article29'),
    ]
  },
}

module.exports = nextConfig
