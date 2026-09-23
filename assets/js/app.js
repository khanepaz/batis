/* ==========================================================
   Batis | منطق صفحه
   داده‌ها فقط از DataAPI؛ رندر و تعامل اینجا.
   ========================================================== */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&', '<': '<', '>': '>', '"': '"', "'": '&#39;' }[c]));
  const fa = n => Number(n).toLocaleString('fa-IR');
  const faRate = n => (Number(n) || 0).toFixed(1).replace('.', '٫');
  const faDate = d => {
    try { return new Date(d).toLocaleDateString('fa-IR'); } catch { return d || ''; }
  };
  const norm = s => String(s || '').toLowerCase().replace(/[\u064B-\u065F]/g, '');

  const CFG = window.BATIS_CONFIG || window.KHANEPAZ_CONFIG;
  let S = { site: {}, categories: [], items: [], tutorials: [], gallery: [], comments: [] };
  let browseCat = 'all', browseShown = CFG.browsePageSize;

  const itemBy = id => S.items.find(r => r.id === id);
  const catBy = slug => S.categories.find(c => c.slug === slug);
  const countIn = slug => S.items.filter(r => r.category === slug).length;

  function art(item, cls = '', extra = '', eager = false) {
    if (item.image) {
      return `<div class="art ${cls}" style="${extra}"><img src="${esc(item.image)}" alt="${esc(item.title || item.caption || '')}" loading="${eager ? 'eager' : 'lazy'}"></div>`;
    }
    const a = item.art || {};
    return `<div class="art ${cls}" style="--from:${esc(a.from || '#e85d04')};--to:${esc(a.to || '#9d0208')};${extra}"><span class="em">${a.emoji || '💪'}</span></div>`;
  }
  const stars = r => `<span class="stars" style="--r:${Number(r) || 0}" aria-hidden="true">★★★★★</span>`;

  function card(r, opts = {}) {
    const cat = catBy(r.category);
    return `<article class="card ${opts.cls || ''}" data-item="${esc(r.id)}" tabindex="0" role="button" aria-label="${esc(r.title)}">
      ${art(r)}
      <span class="badge">${cat ? esc(cat.name) : ''}</span>
      ${opts.ribbon ? '<span class="ribbon" title="ویژه">★</span>' : ''}
      ${opts.isNew ? '<span class="new-dot">جدید</span>' : ''}
      <div class="card-body">
        <h3>${esc(r.title)}</h3>
        <p>${esc(r.excerpt)}</p>
        <div class="meta">
          <span>${esc((r.body && r.body.level) || '')}</span>
          ${stars(r.rating)}<span class="rate-n">${faRate(r.rating)}</span>
        </div>
        ${opts.date ? `<div class="date">${faDate(r.created)}</div>` : ''}
      </div></article>`;
  }

  function renderNav() {
    const dd = S.categories.map(c => `<button data-cat="${c.slug}"><span class="em">${c.icon}</span>${esc(c.name)}</button>`).join('');
    $('#catDDList').innerHTML = `<button data-cat="all"><span class="em">📖</span>همه‌ی حرکتها</button>${dd}`;
    $('#sbCats').innerHTML = S.categories.map(c =>
      `<li><button data-cat="${c.slug}"><span>${c.icon}</span>${esc(c.name)}<span class="n">${fa(countIn(c.slug))}</span></button></li>`).join('');
    const email = S.site.social?.email;
    $('#sbFoot').innerHTML = `batis${email ? `<br><a href="mailto:${esc(email)}">${esc(email)}</a>` : ''}`;
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
    $('#catGrid').innerHTML = S.categories.filter(c => c.slug !== 'all').map(c => `
      <button class="cat" data-cat="${c.slug}">
        <span class="cat-ic" aria-hidden="true">${c.icon}</span>
        <span><b>${esc(c.name)}</b><small>${esc(c.desc || '')}</small><small>${fa(countIn(c.slug))} حرکت</small></span>
      </button>`).join('');
  }

  function renderFeatured() {
    const list = S.items.filter(r => r.featured).sort((a, b) => b.votes - a.votes).slice(0, 6);
    $('#featuredGrid').innerHTML = list.map(r => card(r, { ribbon: true })).join('');
  }

  function renderBrowse() {
    const chips = [{ slug: 'all', name: 'همه', n: S.items.length }, ...S.categories.filter(c => c.slug !== 'all').map(c => ({ slug: c.slug, name: c.name, n: countIn(c.slug) }))];
    $('#chips').innerHTML = chips.map(c => `<button class="chip ${browseCat === c.slug ? 'on' : ''}" data-cat="${c.slug}" role="tab" aria-selected="${browseCat === c.slug}">${esc(c.name)} <span>${fa(c.n)}</span></button>`).join('');
    let list = browseCat === 'all' ? S.items : S.items.filter(r => r.category === browseCat);
    list = list.slice(0, browseShown);
    $('#browseGrid').innerHTML = list.map(r => card(r)).join('');
    const total = browseCat === 'all' ? S.items.length : countIn(browseCat);
    $('#moreBtn').hidden = browseShown >= total;
    const cat = catBy(browseCat);
    $('#browseInfo').textContent = cat ? `${cat.name}: ${fa(total)} حرکت` : 'همه‌ی حرکتها را ببینید یا با دسته‌بندی محدود کنید.';
  }

  function renderTutorials() {
    $('#tutGrid').innerHTML = S.tutorials.map(t => `
      <button class="tut" style="--c:${esc(t.color || '#e0980b')}" data-tutorial="${esc(t.id)}">
        ${t.image ? `<span class="tut-photo"><img src="${esc(t.image)}" alt="${esc(t.title)}" loading="lazy"></span>` : ''}
        <span class="tut-ic" aria-hidden="true">${t.icon}</span>
        <h3>${esc(t.title)}</h3>
        <p>${esc(t.summary)}</p>
        <span class="tut-meta"><span>${esc(t.level)}</span><span>${fa(t.duration)} دقیقه</span><span>${fa((t.steps || []).length)} مرحله</span></span>
      </button>`).join('');
  }

  function renderGallery() {
    $('#galleryGrid').innerHTML = S.gallery.map(g => `
      <button class="g-item" data-gallery="${esc(g.id)}" aria-label="${esc(g.caption)}">
        ${art(g, '', `--ratio:${esc(g.ratio || '1/1')}`)}
        <span class="g-cap">${esc(g.caption)}</span>
      </button>`).join('');
  }

  function renderLatest() {
    const list = [...S.items].sort((a, b) => new Date(b.created) - new Date(a.created)).slice(0, CFG.latestCount);
    $('#latestRow').innerHTML = list.map((r, i) => card(r, { cls: 'mini', isNew: i < 2, date: true })).join('');
  }

  function renderBest() {
    const list = [...S.items].sort((a, b) => b.rating - a.rating || b.votes - a.votes).slice(0, CFG.bestCount);
    $('#bestList').innerHTML = list.map((r, i) => `
      <li><a class="rank ${i < 3 ? 'rank-top' : ''}" href="#item=${esc(r.id)}" data-item="${esc(r.id)}">
        <span class="rank-n" aria-label="رتبه ${fa(i + 1)}">${fa(i + 1)}</span>
        <span class="thumb">${art(r)}</span>
        <div><h3>${esc(r.title)}</h3>
          <div class="meta">${stars(r.rating)}<span class="rate-n">${faRate(r.rating)}</span><span>${fa(r.votes)} رأی</span></div>
        </div></a></li>`).join('');
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
      return `<article class="cm">
        <div class="cm-top">
          <span class="avatar" style="--c:${AV[i % AV.length]}" aria-hidden="true">${esc([...c.name][0] || '؟')}</span>
          <div><b>${esc(c.name)}${c.local ? '<span class="mine">نظر شما</span>' : ''}</b><small>${faDate(c.date)}</small></div>
          ${stars(c.rating)}
        </div>
        <p>${esc(c.text)}</p>
        ${r ? `<button class="on" data-item="${esc(r.id)}">درباره‌ی «${esc(r.title)}»</button>` : ''}
      </article>`;
    }).join('');
  }

  function renderCommentForm() {
    $('#cmItem').innerHTML = '<option value="">کلی</option>' + S.items.map(r => `<option value="${esc(r.id)}">${esc(r.title)}</option>`).join('');
    $('#rateStars').innerHTML = [1,2,3,4,5].map(n => `<button type="button" data-rate="${n}" aria-label="${fa(n)}">★</button>`).join('');
  }

  function renderFooter() {
    if ($('#footDesc')) $('#footDesc').textContent = S.site.description || '';
    if ($('#footNote')) $('#footNote').textContent = S.site.footerNote || '';
    if ($('#footCats')) $('#footCats').innerHTML = S.categories.filter(c => c.slug !== 'all').slice(0, 6).map(c => `<li><a href="#categories" data-cat="${c.slug}">${esc(c.name)}</a></li>`).join('');
    const soc = S.site.social || {};
    const links = [];
    if (soc.instagram) links.push(`<li><a href="${esc(soc.instagram)}" target="_blank" rel="noopener">اینستاگرام</a></li>`);
    if (soc.telegram) links.push(`<li><a href="${esc(soc.telegram)}" target="_blank" rel="noopener">تلگرام</a></li>`);
    if (soc.bale) links.push(`<li><a href="${esc(soc.bale)}" target="_blank" rel="noopener">بله</a></li>`);
    if (soc.email) links.push(`<li><a href="mailto:${esc(soc.email)}">${esc(soc.email)}</a></li>`);
    if ($('#footContact')) $('#footContact').innerHTML = links.join('');
  }

  function renderCarousel() {
    const items = (S.site.carousel || []).map(s => ({ ...s, r: itemBy(s.itemId) })).filter(s => s.r);
    if (!items.length) { $('#carousel').hidden = true; return; }
    $('#carouselEl').innerHTML = items.map((s, i) => `
      <article class="slide ${i === 0 ? 'on' : ''}" data-item="${esc(s.r.id)}">
        <div class="slide-art">${art(s.r, '', '', true)}</div>
        <div class="slide-body">
          <span class="badge">${esc(s.badge || '')}</span>
          <h3>${esc(s.title || s.r.title)}</h3>
          <p>${esc(s.text || s.r.excerpt)}</p>
          <button class="btn btn-green" data-item="${esc(s.r.id)}">مشاهده حرکت</button>
        </div>
      </article>`).join('');
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
  const CLOSE_BTN = `<button class="icon-btn m-close" data-close aria-label="بستن"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button>`;

  function lockScroll() {
    const any = modal.classList.contains('open') || $('#searchLayer').classList.contains('open') || $('#sidebar').classList.contains('open');
    document.body.style.overflow = any ? 'hidden' : '';
  }
  function openModal(html, label) {
    if (!modal.classList.contains('open')) lastFocus = document.activeElement;
    panel.innerHTML = html;
    panel.setAttribute('aria-label', label || '');
    modal.inert = false;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    panel.scrollTop = 0;
    panel.focus({ preventScroll: true });
    lockScroll();
  }
  function closeModal() {
    if (!modal.classList.contains('open')) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    modal.inert = true;
    if (location.hash.startsWith('#item=')) history.replaceState(null, '', location.pathname + location.search);
    lockScroll();
    lastFocus && lastFocus.focus && lastFocus.focus({ preventScroll: true });
  }

  function modalArt(r) {
    return art(r, 'm-art');
  }

  function openItem(id) {
    const r = itemBy(id);
    if (!r) return;
    const cat = catBy(r.category);
    const b = r.body || {};
    const rel = S.items.filter(x => x.category === r.category && x.id !== r.id).slice(0, 4);
    history.replaceState(null, '', '#item=' + r.id);

    const equip = (b.equipment || []).map(e => `<span class="chip">${esc(e)}</span>`).join('') || '—';
    const muscles = (b.muscleGroups || []).map(m => `<span class="chip">${esc(m)}</span>`).join('') || '—';
    const setsHtml = (b.sets || []).map(s =>
      `<li><b>${esc(s.reps || '')}</b> تکرار · استراحت ${fa(s.restSec || 0)} ثانیه${s.note ? ' · ' + esc(s.note) : ''}</li>`
    ).join('') || '<li>—</li>';
    const cuesHtml = (b.cues || []).map(c => `<li>${esc(c)}</li>`).join('') || '';
    const tipsHtml = (b.tips || []).map(t => `<li>${esc(t)}</li>`).join('') || '';
    const aparat = b.aparat
      ? `<div class="video-wrap"><iframe src="${esc(b.aparat)}" allowfullscreen allow="autoplay; encrypted-media" style="width:100%;aspect-ratio:16/9;border:0;border-radius:12px"></iframe></div>`
      : '';

    openModal(`
      ${CLOSE_BTN}
      <div class="m-head">${modalArt(r)}
        <div class="m-title">
          <h2>${esc(r.title)}</h2>
          <div class="m-chips">
            ${cat ? `<span>${cat.icon} ${esc(cat.name)}</span>` : ''}
            ${b.level ? `<span>سطح: ${esc(b.level)}</span>` : ''}
            ${b.durationMin ? `<span>${fa(b.durationMin)} دقیقه</span>` : ''}
            ${b.primaryMuscle ? `<span>عضله اصلی: ${esc(b.primaryMuscle)}</span>` : ''}
            <span>${stars(r.rating)} ${faRate(r.rating)} (${fa(r.votes)} رأی)</span>
          </div>
        </div>
      </div>
      <div class="m-body">
        <p class="m-lead">${esc(r.excerpt)}</p>
        ${aparat}
        <div class="ing">
          <h3>تجهیزات</h3>
          <div class="chip-row">${equip}</div>
        </div>
        <div class="ing">
          <h3>گروه‌های عضلانی</h3>
          <div class="chip-row">${muscles}</div>
        </div>
        <div>
          <h3>ست‌ها و تکرار</h3>
          <ol class="steps">${setsHtml}</ol>
        </div>
        ${cuesHtml ? `<div><h3>نکات اجرایی</h3><ol class="steps">${cuesHtml}</ol></div>` : ''}
        ${tipsHtml ? `<div class="tip"><b>نکته‌های مهم:</b><ul>${tipsHtml}</ul></div>` : ''}
        <div class="m-actions">
          <button class="btn btn-green" data-action="share">کپی پیوند حرکت</button>
          <button class="btn btn-ghost" data-action="print">چاپ حرکت</button>
        </div>
        ${rel.length ? `<div class="m-related"><h3>حرکتهای مشابه</h3><div class="row">${rel.map(x => `<button data-item="${esc(x.id)}">${esc(x.title)}</button>`).join('')}</div></div>` : ''}
      </div>`, r.title);
  }

  function openTutorial(id) {
    const t = S.tutorials.find(x => x.id === id);
    if (!t) return;
    openModal(`
      ${CLOSE_BTN}
      <div class="m-head">
        <div class="m-title">
          <h2>${esc(t.title)}</h2>
          <div class="m-chips"><span>${esc(t.level)}</span><span>${fa(t.duration)} دقیقه</span><span>${fa((t.steps || []).length)} مرحله</span></div></div></div>
      <div class="m-body">
        <p class="m-lead">${esc(t.summary)}</p>
        <div><h3>مراحل</h3><ol class="steps">${(t.steps || []).map(s => `<li>${esc(s)}</li>`).join('')}</ol></div>
        ${t.note ? `<div class="tip"><b>یادت باشد:</b>${esc(t.note)}</div>` : ''}
      </div>`, t.title);
  }

  function openGallery(id) {
    const g = S.gallery.find(x => x.id === id);
    if (!g) return;
    openModal(`${CLOSE_BTN}<div class="m-body">${art(g, 'm-art')}<p>${esc(g.caption)}</p>${g.itemId ? `<button class="btn btn-green" data-item="${esc(g.itemId)}">مشاهده حرکت</button>` : ''}</div>`, g.caption);
  }

  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2800);
  }

  function bind() {
    document.addEventListener('click', e => {
      const t = e.target.closest('[data-item]');
      if (t) { e.preventDefault(); openItem(t.dataset.item); return; }
      const tut = e.target.closest('[data-tutorial]');
      if (tut) { openTutorial(tut.dataset.tutorial); return; }
      const gal = e.target.closest('[data-gallery]');
      if (gal) { openGallery(gal.dataset.gallery); return; }
      const cat = e.target.closest('[data-cat]');
      if (cat) {
        browseCat = cat.dataset.cat;
        browseShown = CFG.browsePageSize;
        renderBrowse();
        document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      if (e.target.closest('[data-close]')) { closeModal(); return; }
      if (e.target.closest('[data-action="share"]')) {
        navigator.clipboard?.writeText(location.href).then(() => toast('پیوند کپی شد'));
        return;
      }
      if (e.target.closest('[data-action="print"]')) { window.print(); return; }
      if (e.target.closest('#moreBtn')) {
        browseShown += CFG.browsePageSize;
        renderBrowse();
        return;
      }
      if (e.target.closest('#openSidebar')) {
        $('#sidebar').classList.add('open');
        $('#sidebar').setAttribute('aria-hidden', 'false');
        $('#scrim').classList.add('on');
        lockScroll();
        return;
      }
      if (e.target.closest('#closeSidebar') || e.target.closest('#scrim')) {
        $('#sidebar').classList.remove('open');
        $('#sidebar').setAttribute('aria-hidden', 'true');
        $('#scrim').classList.remove('on');
        lockScroll();
        return;
      }
      if (e.target.closest('#openSearch') || e.target.closest('[data-search]')) {
        const q = e.target.closest('[data-search]')?.dataset.search || '';
        $('#searchLayer').classList.add('open');
        $('#searchLayer').setAttribute('aria-hidden', 'false');
        $('#searchInput').value = q;
        $('#searchInput').focus();
        if (q) doSearch(q);
        lockScroll();
        return;
      }
      if (e.target.closest('#closeSearch')) {
        $('#searchLayer').classList.remove('open');
        $('#searchLayer').setAttribute('aria-hidden', 'true');
        lockScroll();
        return;
      }
      if (e.target.closest('#themeBtn')) {
        const cur = document.documentElement.getAttribute('data-theme');
        const next = cur === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        try { localStorage.setItem('batis-theme', next); } catch {}
        return;
      }
      if (e.target.closest('#toTop')) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const rateBtn = e.target.closest('[data-rate]');
      if (rateBtn) {
        $$('#rateStars button').forEach(b => b.classList.toggle('on', Number(b.dataset.rate) <= Number(rateBtn.dataset.rate)));
        $('#rateStars').dataset.value = rateBtn.dataset.rate;
        return;
      }
    });

    $('#heroSearch')?.addEventListener('submit', e => {
      e.preventDefault();
      const q = $('#heroInput').value.trim();
      if (!q) return;
      $('#searchLayer').classList.add('open');
      $('#searchInput').value = q;
      doSearch(q);
      lockScroll();
    });

    $('#searchInput')?.addEventListener('input', e => doSearch(e.target.value));

    $('#cmForm')?.addEventListener('submit', async e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const rating = Number($('#rateStars').dataset.value || 5);
      const comment = {
        name: fd.get('name'),
        text: fd.get('text'),
        itemId: fd.get('itemId') || '',
        rating,
        date: new Date().toISOString().slice(0, 10)
      };
      try {
        const saved = await DataAPI.addComment(comment);
        S.comments.unshift(saved);
        renderComments();
        e.target.reset();
        $('#cmHint').textContent = 'نظر شما ثبت شد و پس از تأیید مدیر نمایش داده می‌شود.';
        toast('نظر ثبت شد');
      } catch (err) {
        $('#cmHint').textContent = 'خطا در ثبت نظر';
      }
    });

    window.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        closeModal();
        $('#searchLayer').classList.remove('open');
        $('#sidebar').classList.remove('open');
        $('#scrim').classList.remove('on');
        lockScroll();
      }
      if (e.key === '/' && !e.target.matches('input,textarea')) {
        e.preventDefault();
        $('#openSearch')?.click();
      }
    });

    if (location.hash.startsWith('#item=')) {
      openItem(location.hash.slice(6));
    }
  }

  function doSearch(q) {
    q = norm(q);
    if (!q) { $('#searchResults').innerHTML = ''; return; }
    const hits = S.items.filter(r => {
      const cat = catBy(r.category);
      const hay = norm([r.title, r.excerpt, cat && cat.name, (r.tags || []).join(' '), JSON.stringify(r.body || {})].join(' '));
      return hay.includes(q);
    }).slice(0, 12);
    $('#searchResults').innerHTML = hits.length
      ? hits.map(r => `<button data-item="${esc(r.id)}">${esc(r.title)} <small>${esc(r.excerpt)}</small></button>`).join('')
      : '<p>نتیجه‌ای پیدا نشد.</p>';
  }

  async function init() {
    try {
      S = await DataAPI.loadAll();
      renderAll();
      bind();
    } catch (e) {
      console.error(e);
      $('#loader').innerHTML = '<p>خطا در بارگذاری داده. صفحه را رفرش کنید.</p>';
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
