type MetaAttribute = 'name' | 'property';

export const SITE_URL = 'https://partypass.pl';
export const OG_IMAGE_URL = `${SITE_URL}/og-image.jpg`;

export function upsertMeta(
  attribute: MetaAttribute,
  key: string,
  content: string
): void {
  let element = document.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${key}"]`
  );

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
}
