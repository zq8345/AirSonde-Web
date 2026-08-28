import { SITE } from '../data/site';
import { categoryLabel, productHref, productTypePhrase, sensorLabels, type Product } from './products';

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
  const { name, model, category, sensors, highlights, specs } = product.data;
  // W29: the product's address is its model, so the machine-readable url and
  // @id follow it. ⚠️ @id changing means crawlers see a new entity id for an
  // existing product — that is inherent to the move, not an oversight.
  const path = productHref(product);
  const typePhrase = productTypePhrase(category);

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${SITE.url}${path}#product`,
    name,
    sku: model,
    mpn: model,
    // the raw enum is an internal value; only ship it when it names a real
    // category ('other' names nothing a buyer or a crawler can use)
    ...(typePhrase ? { category: categoryLabel(category) } : {}),
    url: `${SITE.url}${path}`,
    image: imageUrls,
    description:
      `${name} (${model}) — ` +
      (typePhrase ? `${typePhrase} measuring ` : 'measuring ') +
      `${sensorLabels(sensors).join(', ')}. Manufactured by ${SITE.brand} for OEM and ODM programmes under the customer's own brand.`,
    brand: { '@type': 'Brand', name: SITE.brand },
    manufacturer: { '@id': ORG_ID },
    ...(highlights?.length ? { slogan: highlights[0] } : {}),
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Measured parameters',
        value: sensorLabels(sensors).join(', '),
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
      url: `${SITE.url}${productHref(product)}`,
    })),
  };
}
