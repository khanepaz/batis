(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/&/g, '&'+'amp;').replace(/</g, '&'+'lt;').replace(/>/g, '&'+'gt;').replace(/"/g, '&'+'quot;').replace(/'/g, '&#39;');
  const fa = n => Number(n).toLocaleString('fa-IR');
  const faRate = n => (Number(n) || 0).toFixed(1).replace('.', '٫');
  const faDate = d => { try { return new Date(d).toLocaleDateString('fa-IR'); } catch { return d || ''; } };
  const norm = s => String(s || '').toLowerCase().replace(/[\u064B-\u065F]/g, '');
  const CFG = window.BATIS_CONFIG || window.KHANEPAZ_CONFIG;
  let S = { site: {}, categories: [], items: [], tutorials: [], gallery: [], comments: [] };
  let browseCat = 'all', browseShown = CFG.browsePageSize;
  const itemBy = id => S.items.find(r => r.id === id);
  const catBy = slug => S.categories.find(c => c.slug === slug);
  const countIn = slug => S.items.filter(r => r.category === slug).length;
  function art(item, cls = '', extra = '', eager = false) {
    if (item.image) return `<div class="art ${cls}" style="${extra}"><img src="${esc(item.image)}" alt="${esc(item.title || item.caption || '')}" loading="${eager ? 'eager' : 'lazy'}"></div>`;
    const a = item.art || {};
    return `<div class="art ${cls}" style="--from:${esc(a.from || '#e85d04')};--to:${esc(a.to || '#9d0208')};${extra}"><span class="em">${a.emoji || '💪'}</span></div>`;
  }
  const stars = r => `<span class="stars" style="--r:${Number(r) || 0}" aria-hidden="true">★★★★★</span>`;
  function card(r, opts = {}) {
    const cat = catBy(r.category);
    return `<article class="card ${opts.cls || ''}" data-item="${esc(r.id)}" tabindex="0" role="button" aria-label="${esc(r.title)}">${art(r)}<span class="badge">${cat ? esc(cat.name) : ''}</span>${opts.ribbon ? '<span class="ribbon" title="ویژه">★</span>' : ''}${opts.isNew ? '<span class="new-dot">جدید</span>' : ''}<div class="card-body"><h3>${esc(r.title)}</h3><p>${esc(r.excerpt)}</p><div class="meta"><span>${esc((r.body && r.body.level) || '')}</span>${stars(r.rating)}<span class="rate-n">${faRate(r.rating)}</span></div>${opts.date ? `<div class="date">${faDate(r.created)}</div>` : ''}</div></article>`;
  }
  function renderNav() {
    const dd = S.categories.map(c => `<button data-cat="${c.slug}"><span class="em">${c.icon}</span>${esc(c.name)}</button>`).join('');
    $('#catDDList').innerHTML = `<button data-cat="all"><span class="em">📖</span>همه‌ی حرکتها</button>${dd}`;
    $('#sbCats').innerHTML = S.categories.map(c => `<li><button data-cat="${c.slug}"><span>${c.icon}</span>${esc(c.name)}<span class="n">${fa(countIn(c.slug))}</span></button></li>`).join('');
    $('#sbFoot').innerHTML = `<span style="color:var(--muted);font-size:.85rem">Batis</span>`;
  }
  function renderHero() {
    $('#heroTitle').textContent = S.site.heroTitle;
    $('#heroLead').textContent = S.site.heroLead;
    const freq = {};
    S.items.forEach(r => (r.tags || []).forEach(t => freq[t] = (freq[t] || 0) + 1));
    const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 6).map(e => e[0]);
    $('#heroTags').innerHTML = top.map(t => `<button class="tag" data-search="${esc(t)}">${esc(t)}</button>`).join('');
    $('#stats').textContent = `${fa(S.items.length)} حرکت در ${fa(S.categories.length)} دسته و ${fa(S.tutorials.length)} آموزش`;
  }
  function renderCategories() {
    $('#catGrid').innerHTML = S.categories.filter(c => c.slug !== 'all').map(c => `<button class="cat" data-cat="${c.slug}"><span class="cat-ic" aria-hidden="true">${c.icon}</span><span><b>${esc(c.name)}</b><small>${esc(c.desc || '')}</small><small>${fa(countIn(c.slug))} حرکت</small></span></button>`).join('');
  }
  function renderFeatured() {
    const list = S.items.filter(r => r.featured).sort((a, b) => b.votes - a.votes).slice(0, 6);
    $('#featuredGrid').innerHTML = list.map(r => card(r, { ribbon: true })).join('');
  }
  function renderBrowse() {
    const chips = [{ slug: 'all', name: 'همه', n: S.items.length }, ...S.categories.filter(c => c.slug !== 'all').map(c => ({ slug: c.slug, name: c.name, n: countIn(c.slug) }))];
    $('#chips').innerHTML = chips.map(c => `<button class="chip ${browseCat === c.slug ? 'on' : ''}" data-cat="${c.slug}" role="tab">${esc(c.name)} <span>${fa(c.n)}</span></button>`).join('');
    let list = browseCat === 'all' ? S.items : S.items.filter(r => r.category === browseCat);
    list = list.slice(0, browseShown);
    $('#browseGrid').innerHTML = list.map(r => card(r)).join('');
    const total = browseCat === 'all' ? S.items.length : countIn(browseCat);
    $('#moreBtn').hidden = browseShown >= total;
    const cat = catBy(browseCat);
    $('#browseInfo').textContent = cat ? `${cat.name}: ${fa(total)} حرکت` : 'همه‌ی حرکتها را ببینید یا با دسته‌بندی محدود کنید.';
  }
  function renderTutorials() {
    $('#tutGrid').innerHTML = S.tutorials.map(t => `<button class="tut" style="--c:${esc(t.color || '#e0980b')}" data-tutorial="${esc(t.id)}"><span class="tut-ic">${t.icon}</span><h3>${esc(t.title)}</h3><p>${esc(t.summary)}</p><span class="tut-meta"><span>${esc(t.level)}</span><span>${fa(t.duration)} دقیقه</span></span></button>`).join('');
  }
  function renderGallery() {
    $('#galleryGrid').innerHTML = S.gallery.map(g => `<button class="g-item" data-gallery="${esc(g.id)}" aria-label="${esc(g.caption)}">${art(g, '', `--ratio:${esc(g.ratio || '1/1')}`)}<span class="g-cap">${esc(g.caption)}</span></button>`).join('');
  }
  function renderLatest() {
    const list = [...S.items].sort((a, b) => new Date(b.created) - new Date(a.created)).slice(0, CFG.latestCount);
    $('#latestRow').innerHTML = list.map((r, i) => card(r, { cls: 'mini', isNew: i < 2, date: true })).join('');
  }
  function renderBest() {
    const list = [...S.items].sort((a, b) => b.rating - a.rating || b.votes - a.votes).slice(0, CFG.bestCount);
    $('#bestList').innerHTML = list.map((r, i) => `<li><a class="rank ${i < 3 ? 'rank-top' : ''}" href="#item=${esc(r.id)}" data-item="${esc(r.id)}"><span class="rank-n">${fa(i + 1)}</span><span class="thumb">${art(r)}</span><div><h3>${esc(r.title)}</h3><div class="meta">${stars(r.rating)}<span class="rate-n">${faRate(r.rating)}</span></div></div></a></li>`).join('');
  }
  function renderStory() {
    const st = S.site.story || {};
    if ($('#storyYears')) $('#storyYears').textContent = st.years || '';
    if ($('#storyText')) $('#storyText').innerHTML = `<h2>${esc(st.title || '')}</h2>${(st.paragraphs || []).map(p => `<p>${esc(p)}</p>`).join('')}<p class="sig">تیم Batis</p>`;
  }
  const AV = ['#f5c451', '#f19bb2', '#9bbf6a', '#f6a56a', '#b8a2e0'];
  function renderComments() {
    $('#cmList').innerHTML = S.comments.map((c, i) => {
      const r = c.itemId && itemBy(c.itemId);
      return `<article class="cm"><div class="cm-top"><span class="avatar" style="--c:${AV[i % AV.length]}">${esc([...c.name][0] || '؟')}</span><div><b>${esc(c.name)}</b><small>${faDate(c.date)}</small></div>${stars(c.rating)}</div><p>${esc(c.text)}</p>${r ? `<button class="on" data-item="${esc(r.id)}">درباره‌ی «${esc(r.title)}»</button>` : ''}</article>`;
    }).join('');
  }
  function renderCommentForm() {
    $('#cmItem').innerHTML = '<option value="">کلی</option>' + S.items.map(r => `<option value="${esc(r.id)}">${esc(r.title)}</option>`).join('');
    $('#rateStars').innerHTML = [1,2,3,4,5].map(n => `<button type="button" data-rate="${n}">★</button>`).join('');
  }
  function renderFooter() {
    if ($('#footDesc')) $('#footDesc').textContent = S.site.description || '';
    if ($('#footNote')) $('#footNote').textContent = S.site.footerNote || '';
    if ($('#footCats')) $('#footCats').innerHTML = S.categories.filter(c => c.slug !== 'all').slice(0, 6).map(c => `<li><a href="#categories" data-cat="${c.slug}">${esc(c.name)}</a></li>`).join('');
    const soc = S.site.social || {};
    const items = [
      { key: 'instagram', label: 'اینستاگرام', href: soc.instagram || '' },
      { key: 'telegram', label: 'تلگرام', href: soc.telegram || '' },
      { key: 'bale', label: 'بله', href: soc.bale || '' },
      { key: 'email', label: 'ایمیل', href: soc.email ? ('mailto:' + soc.email) : '', text: soc.email || '' }
    ];
    if ($('#footContact')) {
      $('#footContact').innerHTML = items.map(it => it.href
        ? `<li><span class="foot-contact-label">${it.label}</span><a href="${esc(it.href)}"${it.key !== 'email' ? ' target="_blank" rel="noopener"' : ''}>${it.key === 'email' ? esc(it.text) : 'مشاهده'}</a></li>`
        : `<li><span class="foot-contact-label">${it.label}</span><span style="opacity:.5">—</span></li>`).join('');
    }
  }
  function renderCarousel() {
    const el = $('#carouselEl'), section = $('#carousel');
    if (!el || !section) return;
    const items = (S.site.carousel || []).map(s => ({ ...s, r: itemBy(s.itemId) })).filter(s => s.r);
    if (!items.length) { section.hidden = true; return; }
    section.hidden = false;
    el.innerHTML = items.map((s, i) => `<article class="slide ${i === 0 ? 'on' : ''}" role="group" aria-hidden="${i !== 0}"><div class="slide-art">${art(s.r, '', '', true)}</div><div class="slide-body"><span class="badge">${esc(s.badge || '')}</span><h3>${esc(s.title || s.r.title)}</h3><p>${esc(s.text || s.r.excerpt)}</p><button class="btn btn-green" data-item="${esc(s.r.id)}">مشاهده حرکت</button></div></article>`).join('') +
      `<button type="button" class="car-btn next" aria-label="بعدی">‹</button><button type="button" class="car-btn prev" aria-label="قبلی">›</button><div class="dots">${items.map((_, i) => `<button type="button" aria-current="${i === 0}"></button>`).join('')}</div>`;
    const slides = $$('.slide', el), dots = $$('.dots button', el);
    let i = 0, timer = null;
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const go = n => {
      i = (n + items.length) % items.length;
      slides.forEach((s, k) => { s.classList.toggle('on', k === i); s.setAttribute('aria-hidden', String(k !== i)); });
      dots.forEach((d, k) => d.setAttribute('aria-current', String(k === i)));
    };
    const stop = () => { clearInterval(timer); timer = null; };
    const play = () => { stop(); if (!reduceMotion && items.length > 1) timer = setInterval(() => go(i + 1), 5500); };
    $('.prev', el)?.addEventListener('click', () => { go(i - 1); play(); });
    $('.next', el)?.addEventListener('click', () => { go(i + 1); play(); });
    dots.forEach((d, k) => d.addEventListener('click', () => { go(k); play(); }));
    el.addEventListener('mouseenter', stop);
    el.addEventListener('mouseleave', play);
    let x0 = null;
    el.addEventListener('pointerdown', e => { x0 = e.clientX; });
    el.addEventListener('pointerup', e => { if (x0 === null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 50) { go(dx > 0 ? i - 1 : i + 1); play(); } });
    go(0); play();
  }
  function renderAll() {
    renderNav(); renderHero(); renderCarousel(); renderCategories();
    renderFeatured(); renderBrowse(); renderTutorials(); renderGallery();
    renderLatest(); renderBest(); renderStory(); renderComments();
    renderCommentForm(); renderFooter();
    $('#loader').style.display = 'none';
  }
  const modal = $('#modal'), panel = $('#modalPanel');
  let lastFocus = null;
  const CLOSE_BTN = `<button class="icon-btn m-close" data-close aria-label="بستن"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6 6 18"/></svg></button>`;
  function lockScroll() {
    const any = modal.classList.contains('open') || $('#searchLayer').classList.contains('open') || $('#sidebar').classList.contains('open');
    document.body.style.overflow = any ? 'hidden' : '';
  }
  function openModal(html, label) {
    if (!modal.classList.contains('open')) lastFocus = document.activeElement;
    panel.innerHTML = html; panel.setAttribute('aria-label', label || '');
    modal.inert = false; modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false');
    panel.scrollTop = 0; panel.focus({ preventScroll: true }); lockScroll();
  }
  function closeModal() {
    if (!modal.classList.contains('open')) return;
    modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); modal.inert = true;
    if (location.hash.startsWith('#item=')) history.replaceState(null, '', location.pathname + location.search);
    lockScroll(); lastFocus && lastFocus.focus && lastFocus.focus({ preventScroll: true });
  }
  function openItem(id) {
    const r = itemBy(id); if (!r) return;
    const cat = catBy(r.category); const b = r.body || {};
    const rel = S.items.filter(x => x.category === r.category && x.id !== r.id).slice(0, 4);
    history.replaceState(null, '', '#item=' + r.id);
    const equip = (b.equipment || []).map(e => `<span class="chip">${esc(e)}</span>`).join('') || '—';
    const muscles = (b.muscleGroups || []).map(m => `<span class="chip">${esc(m)}</span>`).join('') || '—';
    const setsHtml = (b.sets || []).map(s => `<li><b>${esc(s.reps || '')}</b> تکرار · استراحت ${fa(s.restSec || 0)} ثانیه</li>`).join('') || '<li>—</li>';
    const cuesHtml = (b.cues || []).map(c => `<li>${esc(c)}</li>`).join('');
    const tipsHtml = (b.tips || []).map(t => `<li>${esc(t)}</li>`).join('');
    const aparat = b.aparat ? `<div class="video-wrap"><iframe src="${esc(b.aparat)}" allowfullscreen style="width:100%;aspect-ratio:16/9;border:0"></iframe></div>` : '';
    openModal(`${CLOSE_BTN}<div class="m-head">${art(r, 'm-art')}<div class="m-title"><h2>${esc(r.title)}</h2><div class="m-chips">${cat ? `<span>${cat.icon} ${esc(cat.name)}</span>` : ''}${b.level ? `<span>سطح: ${esc(b.level)}</span>` : ''}<span>${stars(r.rating)} ${faRate(r.rating)}</span></div></div></div><div class="m-body"><p class="m-lead">${esc(r.excerpt)}</p>${aparat}<div class="ing"><h3>تجهیزات</h3><div class="chip-row">${equip}</div></div><div class="ing"><h3>گروه‌های عضلانی</h3><div class="chip-row">${muscles}</div></div><div><h3>ست‌ها و تکرار</h3><ol class="steps">${setsHtml}</ol></div>${cuesHtml ? `<div><h3>نکات اجرایی</h3><ol class="steps">${cuesHtml}</ol></div>` : ''}${tipsHtml ? `<div class="tip"><b>نکته‌های مهم:</b><ul>${tipsHtml}</ul></div>` : ''}<div class="m-actions"><button class="btn btn-green" data-action="share">کپی پیوند</button><button class="btn btn-ghost" data-action="print">چاپ</button></div>${rel.length ? `<div class="m-related"><h3>مشابه</h3><div class="row">${rel.map(x => `<button data-item="${esc(x.id)}">${esc(x.title)}</button>`).join('')}</div></div>` : ''}</div>`, r.title);
  }
  function openTutorial(id) {
    const t = S.tutorials.find(x => x.id === id); if (!t) return;
    openModal(`${CLOSE_BTN}<div class="m-head"><div class="m-title"><h2>${esc(t.title)}</h2><div class="m-chips"><span>${esc(t.level)}</span><span>${fa(t.duration)} دقیقه</span></div></div></div><div class="m-body"><p class="m-lead">${esc(t.summary)}</p><div><h3>مراحل</h3><ol class="steps">${(t.steps || []).map(s => `<li>${esc(s)}</li>`).join('')}</ol></div></div>`, t.title);
  }
  function openGallery(id) {
    const g = S.gallery.find(x => x.id === id); if (!g) return;
    openModal(`${CLOSE_BTN}<div class="m-body">${art(g, 'm-art')}<p>${esc(g.caption)}</p></div>`, g.caption);
  }
  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2800); }
  function bind() {
    document.addEventListener('click', e => {
      const t = e.target.closest('[data-item]'); if (t) { e.preventDefault(); openItem(t.dataset.item); return; }
      const tut = e.target.closest('[data-tutorial]'); if (tut) { openTutorial(tut.dataset.tutorial); return; }
      const gal = e.target.closest('[data-gallery]'); if (gal) { openGallery(gal.dataset.gallery); return; }
      const cat = e.target.closest('[data-cat]'); if (cat) { browseCat = cat.dataset.cat; browseShown = CFG.browsePageSize; renderBrowse(); document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth' }); return; }
      if (e.target.closest('[data-close]')) { closeModal(); return; }
      if (e.target.closest('[data-action="share"]')) { navigator.clipboard?.writeText(location.href).then(() => toast('پیوند کپی شد')); return; }
      if (e.target.closest('[data-action="print"]')) { window.print(); return; }
      if (e.target.closest('#moreBtn')) { browseShown += CFG.browsePageSize; renderBrowse(); return; }
      if (e.target.closest('#openSidebar')) { $('#sidebar').classList.add('open'); $('#scrim').classList.add('on'); lockScroll(); return; }
      if (e.target.closest('#closeSidebar') || e.target.closest('#scrim')) { $('#sidebar').classList.remove('open'); $('#scrim').classList.remove('on'); lockScroll(); return; }
      if (e.target.closest('#openSearch') || e.target.closest('[data-search]')) {
        const q = e.target.closest('[data-search]')?.dataset.search || '';
        $('#searchLayer').classList.add('open'); $('#searchInput').value = q; $('#searchInput').focus(); if (q) doSearch(q); lockScroll(); return;
      }
      if (e.target.closest('#closeSearch')) { $('#searchLayer').classList.remove('open'); lockScroll(); return; }
      if (e.target.closest('#themeBtn')) {
        const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next); try { localStorage.setItem('batis-theme', next); } catch {} return;
      }
      if (e.target.closest('#toTop')) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
      const rateBtn = e.target.closest('[data-rate]');
      if (rateBtn) { $$('#rateStars button').forEach(b => b.classList.toggle('on', Number(b.dataset.rate) <= Number(rateBtn.dataset.rate))); $('#rateStars').dataset.value = rateBtn.dataset.rate; return; }
    });
    $('#heroSearch')?.addEventListener('submit', e => { e.preventDefault(); const q = $('#heroInput').value.trim(); if (!q) return; $('#searchLayer').classList.add('open'); $('#searchInput').value = q; doSearch(q); lockScroll(); });
    $('#searchInput')?.addEventListener('input', e => doSearch(e.target.value));
    $('#cmForm')?.addEventListener('submit', async e => {
      e.preventDefault(); const fd = new FormData(e.target); const rating = Number($('#rateStars').dataset.value || 5);
      const comment = { name: fd.get('name'), text: fd.get('text'), itemId: fd.get('itemId') || '', rating, date: new Date().toISOString().slice(0, 10) };
      try { const saved = await DataAPI.addComment(comment); S.comments.unshift(saved); renderComments(); e.target.reset(); toast('نظر ثبت شد'); } catch { toast('خطا در ثبت نظر'); }
    });
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape') { closeModal(); $('#searchLayer').classList.remove('open'); $('#sidebar').classList.remove('open'); $('#scrim').classList.remove('on'); lockScroll(); }
      if (e.key === '/' && !e.target.matches('input,textarea')) { e.preventDefault(); $('#openSearch')?.click(); }
    });
    if (location.hash.startsWith('#item=')) openItem(location.hash.slice(6));
  }
  function doSearch(q) {
    q = norm(q); if (!q) { $('#searchResults').innerHTML = ''; return; }
    const hits = S.items.filter(r => { const cat = catBy(r.category); return norm([r.title, r.excerpt, cat && cat.name, (r.tags || []).join(' ')].join(' ')).includes(q); }).slice(0, 12);
    $('#searchResults').innerHTML = hits.length ? hits.map(r => `<button data-item="${esc(r.id)}">${esc(r.title)} <small>${esc(r.excerpt)}</small></button>`).join('') : '<p>نتیجه‌ای پیدا نشد.</p>';
  }
  async function init() {
    try { S = await DataAPI.loadAll(); renderAll(); bind(); }
    catch (e) { console.error(e); $('#loader').innerHTML = '<p>خطا در بارگذاری داده.</p>'; }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
