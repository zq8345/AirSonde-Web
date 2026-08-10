import { SITE } from '../data/site';
import type { Product } from './products';

const ORG_ID = `${SITE.url}/#organization`;

/**
 * Structured data is how an AI or a search crawler learns that this is a
 * product, what its model number is and who makes it. Nothing here may state
 * something the page itself does not.
 */
export function organisationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE.brand,
    url: SITE.url,
    description: SITE.organisationDescription,
    email: SITE.email,
    logo: `${SITE.url}/favicon.svg`,
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'sales',
        email: SITE.email,
        availableLanguage: ['en'],
      },
    ],
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE.url}/#website`,
    url: SITE.url,
    name: SITE.brand,
    inLanguage: 'en',
    publisher: { '@id': ORG_ID },
  };
}

export function productSchema(product: Product, imageUrls: string[]) {
  const { slug, name, model, category, sensors, highlights, specs } = product.data;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${SITE.url}/products/${slug}/#product`,
    name,
    sku: model,
    mpn: model,
    category,
    url: `${SITE.url}/products/${slug}/`,
    image: imageUrls,
    description: `${name} (${model}) — ${category} indoor air quality monitor measuring ${sensors.join(', ')}. Manufactured by ${SITE.brand} for OEM and ODM programmes under the customer's own brand.`,
    brand: { '@type': 'Brand', name: SITE.brand },
    manufacturer: { '@id': ORG_ID },
    ...(highlights?.length ? { slogan: highlights[0] } : {}),
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Measured parameters',
        value: sensors.join(', '),
      },
      ...Object.entries(specs ?? {}).map(([key, value]) => ({
        '@type': 'PropertyValue',
        name: key,
        value,
      })),
    ],
  };
}

export function breadcrumbSchema(trail: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function itemListSchema(products: Product[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'AirSonde indoor air quality monitors',
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: product.data.name,
      url: `${SITE.url}/products/${product.data.slug}/`,
    })),
  };
}
