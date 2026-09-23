/* v2p1 - upload & media helpers for Batis admin */
(function(){
  const A = "https://api.github.com";
  async function uploadFile(path, contentB64, token, message) {
    const url = `${A}/repos/khanepaz/batis/contents/${path}`;
    let sha;
    try {
      const r = await fetch(url, { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" } });
      if (r.ok) { const j = await r.json(); sha = j.sha; }
    } catch {}
    const body = { message: message || `upload ${path}`, content: contentB64, branch: "main" };
    if (sha) body.sha = sha;
    const res = await fetch(url, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
  window.AdminUpload = { uploadFile };
})();
