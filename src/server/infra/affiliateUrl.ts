const MOSHIMO_AMAZON_CLICK_BASE =
  'https://af.moshimo.com/af/c/click?a_id=5146445&p_id=170&pc_id=185&pl_id=4062&url='

const AMAZON_ASIN_RE = /(?:\/dp\/|%2Fdp%2F)([A-Z0-9]{10})(?=$|[/?&#%])/i

type ProductLinkFields = {
  url: string | null
  af_url: string | null
}

function extractAmazonAsin(...values: Array<string | null | undefined>): string | null {
  for (const value of values) {
    if (!value) {
      continue
    }

    const match = value.match(AMAZON_ASIN_RE)
    if (match) {
      return match[1].toUpperCase()
    }
  }

  return null
}

export function buildMoshimoAmazonUrl(asin: string): string {
  return `${MOSHIMO_AMAZON_CLICK_BASE}${encodeURIComponent(`https://www.amazon.co.jp/dp/${asin}`)}`
}

export function normalizeAffiliateUrl<T extends ProductLinkFields>(product: T): T {
  const asin = extractAmazonAsin(product.url, product.af_url)
  if (!asin) {
    return product
  }

  return {
    ...product,
    af_url: buildMoshimoAmazonUrl(asin),
  }
}

export function normalizeAffiliateUrls<T extends ProductLinkFields>(products: T[]): T[] {
  return products.map(normalizeAffiliateUrl)
}
