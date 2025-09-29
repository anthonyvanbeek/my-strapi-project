const STRAPI_API_URL = process.env.STRAPI_API_URL ?? 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

export type Article = {
  id: number;
  title: string;
  slug: string;
  content: unknown;
  updatedAt: string;
};

type StrapiArticleResponse = {
  data: Array<{
    id: number;
    attributes: {
      Title?: string;
      Content?: unknown;
      slug?: string;
      updatedAt?: string;
      publishedAt?: string;
    };
  }>;
};

function getHeaders(): HeadersInit {
  if (!STRAPI_API_TOKEN) {
    return {};
  }

  return {
    Authorization: `Bearer ${STRAPI_API_TOKEN}`,
  };
}

export async function fetchArticles(): Promise<Article[]> {
  const url = new URL('/api/articles', STRAPI_API_URL);
  url.searchParams.set('sort', 'updatedAt:desc');
  url.searchParams.set('publicationState', 'live');

  const response = await fetch(url.href, {
    headers: getHeaders(),
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`Strapi request failed (${response.status})`);
  }

  const payload = (await response.json()) as StrapiArticleResponse;
  const items = Array.isArray(payload.data) ? payload.data : [];

  return items
    .map(({ id, attributes }) => ({
      id,
      title: attributes?.Title ?? 'Untitled article',
      slug: attributes?.slug ?? '',
      content: attributes?.Content ?? null,
      updatedAt: attributes?.updatedAt ?? attributes?.publishedAt ?? '',
    }))
    .filter((article) => Boolean(article.slug));
}
