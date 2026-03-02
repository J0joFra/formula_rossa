export async function getHeroImages() {
  const ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
  const queries = ['formula one ferrari', 'scuderia ferrari f1'];
  
  const results = await Promise.all(
    queries.map(q =>
      fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=5&orientation=landscape&client_id=${ACCESS_KEY}`)
        .then(r => r.json())
        .then(d => d.results)
    )
  );

  // Unisce e deduplica
  const all = [...results[0], ...results[1]];
  const seen = new Set();
  return all.filter(img => {
    if (seen.has(img.id)) return false;
    seen.add(img.id);
    return true;
  }).slice(0, 10);
}