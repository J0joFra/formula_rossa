export async function getHeroImages() {
  const ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;

  if (!ACCESS_KEY) {
    console.warn('Unsplash key missing, using fallback');
    return [];
  }

  try {
    const queries = ['formula one ferrari', 'scuderia ferrari f1'];

    const results = await Promise.all(
      queries.map(async (q) => {
        const res = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=5&orientation=landscape&client_id=${ACCESS_KEY}`
        );
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data?.results) ? data.results : [];
      })
    );

    const all = [...results[0], ...results[1]];
    const seen = new Set();
    return all
      .filter((img) => {
        if (!img?.id || seen.has(img.id)) return false;
        seen.add(img.id);
        return true;
      })
      .slice(0, 10);
  } catch (err) {
    console.error('Unsplash fetch failed:', err);
    return [];
  }
}