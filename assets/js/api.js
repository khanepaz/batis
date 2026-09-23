/* لایه‌ی دسترسی به داده. تنها جایی که می‌داند داده از کجا می‌آید. */
window.DataAPI = (() => {
  const C = window.BATIS_CONFIG || window.KHANEPAZ_CONFIG;

  async function getJSON(name) {
    const url = C.mode === 'api' ? `${C.apiBase}/${name}` : `${C.dataPath}${name}.json`;
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`${url} → ${res.status}`);
    return res.json();
  }

  function localComments() {
    try { return JSON.parse(localStorage.getItem(C.commentsStorageKey) || '[]'); }
    catch { return []; }
  }

  async function loadAll() {
    const [site, categories, items, tutorials, gallery, comments] = await Promise.all(
      ['site', 'categories', 'items', 'tutorials', 'gallery', 'comments'].map(getJSON)
    );
    return {
      site,
      categories: categories.sort((a, b) => (a.order || 0) - (b.order || 0)),
      items,
      recipes: items,
      tutorials,
      gallery,
      comments: [...localComments(), ...comments]
    };
  }

  async function addComment(comment) {
    if (C.mode === 'api') {
      const res = await fetch(`${C.apiBase}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(comment)
      });
      if (!res.ok) throw new Error('ثبت نظر ناموفق بود');
      return res.json();
    }
    const saved = { ...comment, id: 'local-' + Date.now(), local: true };
    const list = localComments();
    list.unshift(saved);
    localStorage.setItem(C.commentsStorageKey, JSON.stringify(list.slice(0, 50)));
    return saved;
  }

  return { loadAll, addComment };
})();
