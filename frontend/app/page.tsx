import { fetchArticles } from '../lib/strapi';

function formatDate(value: string) {
  if (!value) {
    return null;
  }

  try {
    const formatter = new Intl.DateTimeFormat('en', {
      dateStyle: 'medium',
    });
    return formatter.format(new Date(value));
  } catch (error) {
    console.error('Failed to format date', error);
    return value;
  }
}

export default async function HomePage() {
  let articles;
  let errorMessage: string | null = null;

  try {
    articles = await fetchArticles();
  } catch (error) {
    console.error('Failed to load articles from Strapi', error);
    errorMessage =
      error instanceof Error ? error.message : 'Unable to load content from Strapi.';
    articles = [];
  }

  return (
    <main>
      <section>
        <h1>Latest stories</h1>
        <p>
          Content is sourced live from the Strapi backend hosted on Strapi Cloud. Publish a
          new Article entry and it will appear here automatically.
        </p>
      </section>

      {errorMessage ? (
        <p role="alert" className="error">
          {errorMessage}
        </p>
      ) : null}

      {!errorMessage && articles.length === 0 ? (
        <p>No articles are published yet. Create one in Strapi to see it here.</p>
      ) : null}

      <div className="articles">
        {articles.map((article) => {
          const updated = formatDate(article.updatedAt);

          return (
            <article key={article.id}>
              <h2>{article.title}</h2>
              {updated ? <p className="meta">Updated {updated}</p> : null}
              <p>
                <strong>Slug:</strong> {article.slug}
              </p>
            </article>
          );
        })}
      </div>
    </main>
  );
}
