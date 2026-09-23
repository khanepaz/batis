(()=>{
const O="batis",R="batis",B="main",A="https://api.github.com",K="kp_admin_token";
const F={site:"data/site.json",categories:"data/categories.json",items:"data/items.json",tutorials:"data/tutorials.json",gallery:"data/gallery.json",comments:"data/comments.json"};
let token="",data={},dirty=new Set(),shas={};
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const toast=(m,ok=true)=>{const t=$("#toast");t.textContent=m;t.className="toast show"+(ok?"":" err");setTimeout(()=>t.classList.remove("show"),2800)};
const mark=k=>{dirty.add(k);$("#saveStatus").textContent="تغییرات ذخیره‌نشده";$("#saveAllBtn").hidden=false};
async function gh(path,opt={}){const r=await fetch(A+path,{...opt,headers:{Authorization:`Bearer ${token}`,Accept:"application/vnd.github+json","Content-Type":"application/json",...(opt.headers||{})}});if(!r.ok)throw new Error(await r.text());return r.status===204?null:r.json()}
async function loadFile(path){const j=await gh(`/repos/${O}/${R}/contents/${path}?ref=${B}`);shas[path]=j.sha;return JSON.parse(decodeURIComponent(escape(atob(j.content.replace(/\n/g,"")))))}
async function saveFile(path,obj){const content=btoa(unescape(encodeURIComponent(JSON.stringify(obj,null,2))));const body={message:`admin: update ${path}`,content,branch:B,sha:shas[path]};const j=await gh(`/repos/${O}/${R}/contents/${path}`,{method:"PUT",body:JSON.stringify(body)});shas[path]=j.content.sha;return j}
async function loadAll(){const keys=Object.keys(F);const vals=await Promise.all(keys.map(k=>loadFile(F[k])));keys.forEach((k,i)=>data[k]=vals[i]);dirty.clear();$("#saveStatus").textContent="همه‌چیز ذخیره‌شده";$("#saveAllBtn").hidden=true}
async function saveAll(){for(const k of dirty){await saveFile(F[k],data[k])}dirty.clear();$("#saveStatus").textContent="ذخیره شد";$("#saveAllBtn").hidden=true;toast("ذخیره شد")}
const T={dashboard:"داشبورد",items:"حرکتها",categories:"دسته‌ها",carousel:"کاروسل",tutorials:"آموزش",gallery:"گالری",comments:"نظرات",site:"تنظیمات"};
function render(tab){
  $("#pageTitle").textContent=T[tab]||tab;
  const c=$("#content");
  if(tab==="dashboard"){const s=[["حرکت",data.items?.length||0],["دسته",data.categories?.length||0],["آموزش",data.tutorials?.length||0],["گالری",data.gallery?.length||0],["نظر",data.comments?.length||0],["کاروسل",data.site?.carousel?.length||0]];c.innerHTML=`<div class="grid">${s.map(([n,v])=>`<div class="stat"><b>${v}</b><span>${n}</span></div>`).join("")}</div>`}
  else if(tab==="items"){const L=data.items||[];c.innerHTML=`<div class="card"><div style="display:flex;justify-content:space-between;align-items:center"><h3>حرکتها (${L.length})</h3></div><ul style="list-style:none;padding:0">${L.map((x,i)=>`<li style="padding:.6rem 0;border-bottom:1px solid var(--border,#333);display:flex;gap:.5rem;align-items:center"><b style="flex:1">${x.title||x.id}</b><button data-edit="${i}">ویرایش</button><button data-del="${i}">حذف</button></li>`).join("")||"<li>خالی</li>"}</ul></div>`;
    $$("[data-edit]").forEach(b=>b.onclick=()=>editItem(+b.dataset.edit));
    $$("[data-del]").forEach(b=>b.onclick=()=>{data.items.splice(+b.dataset.del,1);mark("items");render("items")});
  }
  else if(tab==="categories"){const L=data.categories||[];c.innerHTML=`<div class="card"><h3>دسته‌ها (${L.length})</h3><ul>${L.map(x=>`<li>${x.icon||""} ${x.name} <code>${x.slug}</code></li>`).join("")}</ul></div>`}
  else if(tab==="site"){
    const s=data.site||{};
    c.innerHTML=`<div class="card"><h3>تنظیمات سایت</h3>
      <label>عنوان هیرو<input id="st" value="${s.heroTitle||""}"></label>
      <label>متن هیرو<textarea id="sl" rows="3">${s.heroLead||""}</textarea></label>
      <label>توضیح فوتر<textarea id="sd" rows="2">${s.description||""}</textarea></label>
      <label>یادداشت فوتر<input id="sn" value="${s.footerNote||""}"></label>
      <h4>شبکه‌های اجتماعی</h4>
      <label>اینستاگرام<input id="si" dir="ltr" value="${(s.social&&s.social.instagram)||""}"></label>
      <label>تلگرام<input id="stg" dir="ltr" value="${(s.social&&s.social.telegram)||""}"></label>
      <label>بله<input id="sb" dir="ltr" value="${(s.social&&s.social.bale)||""}"></label>
      <label>ایمیل<input id="se" dir="ltr" value="${(s.social&&s.social.email)||""}"></label>
      <button class="btn btn-primary" id="ss">اعمال در حافظه</button></div>`;
    $("#ss").onclick=()=>{data.site.heroTitle=$("#st").value;data.site.heroLead=$("#sl").value;data.site.description=$("#sd").value;data.site.footerNote=$("#sn").value;data.site.social=data.site.social||{};data.site.social.instagram=$("#si").value;data.site.social.telegram=$("#stg").value;data.site.social.bale=$("#sb").value;data.site.social.email=$("#se").value;mark("site");toast("اعمال شد — ذخیره را بزن")};
  }
  else if(tab==="comments"){const L=data.comments||[];c.innerHTML=`<div class="card"><h3>نظرات</h3><ul>${L.map((x,i)=>`<li><b>${x.name}</b>: ${x.text} <button data-x="${i}">حذف</button></li>`).join("")||"<li>خالی</li>"}</ul></div>`;
    $$("[data-x]").forEach(b=>b.onclick=()=>{data.comments.splice(+b.dataset.x,1);mark("comments");render("comments")});
  }
  else if(tab==="carousel"){
    if(!data.site) data.site={};
    if(!Array.isArray(data.site.carousel)) data.site.carousel=[];
    const L=data.site.carousel;
    c.innerHTML=`<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem"><h3 style="margin:0">اسلایدهای کاروسل (${L.length})</h3><button type="button" class="btn btn-primary" id="carAdd">+ اسلاید جدید</button></div>
    <p style="color:var(--muted,#888);font-size:.9rem;margin-bottom:1rem">هر اسلاید به یک حرکت وصل می‌شود و در صفحه اصلی به‌صورت کاروسل نمایش داده می‌شود.</p>
    <div id="carList">${L.map((s,i)=>`
      <div class="card" style="margin-bottom:.85rem;padding:1rem;border:1px solid var(--border,#333)">
        <div style="display:flex;gap:.5rem;flex-wrap:wrap;align-items:flex-end">
          <label style="flex:1;min-width:140px">حرکت
            <select data-car="${i}" data-f="itemId">${(data.items||[]).map(r=>`<option value="${r.id}" ${r.id===(s.itemId||'')?'selected':''}>${r.title||r.id}</option>`).join("")}</select>
          </label>
          <label style="flex:1;min-width:100px">برچسب
            <input data-car="${i}" data-f="badge" value="${(s.badge||'').replace(/"/g,'&quot;')}">
          </label>
          <label style="flex:2;min-width:140px">عنوان
            <input data-car="${i}" data-f="title" value="${(s.title||'').replace(/"/g,'&quot;')}">
          </label>
        </div>
        <label style="display:block;margin-top:.6rem">متن
          <textarea data-car="${i}" data-f="text" rows="2">${s.text||''}</textarea>
        </label>
        <div style="margin-top:.6rem;display:flex;gap:.5rem">
          <button type="button" class="btn btn-ghost btn-sm" data-car-up="${i}" ${i===0?'disabled':''}>↑</button>
          <button type="button" class="btn btn-ghost btn-sm" data-car-dn="${i}" ${i===L.length-1?'disabled':''}>↓</button>
          <button type="button" class="btn btn-ghost btn-sm" data-car-del="${i}" style="color:#e11">حذف</button>
        </div>
      </div>`).join("")||'<p>هنوز اسلایدی نیست. «اسلاید جدید» را بزنید.</p>'}</div></div>`;

    const applyField=(i,f,v)=>{data.site.carousel[i][f]=v;mark("site")};
    $$("[data-car][data-f]").forEach(el=>{
      const ev=el.tagName==="SELECT"||el.tagName==="INPUT"?"change":"input";
      el.addEventListener(ev,()=>applyField(+el.dataset.car,el.dataset.f,el.value));
      if(el.tagName==="TEXTAREA") el.addEventListener("input",()=>applyField(+el.dataset.car,el.dataset.f,el.value));
    });
    $("#carAdd")&&($("#carAdd").onclick=()=>{
      const first=(data.items||[])[0];
      data.site.carousel.push({itemId:first?first.id:"",badge:"ویژه",title:first?first.title:"اسلاید جدید",text:first?(first.excerpt||""):"",image:""});
      mark("site");render("carousel");
    });
    $$("[data-car-del]").forEach(b=>b.onclick=()=>{data.site.carousel.splice(+b.dataset.carDel,1);mark("site");render("carousel")});
    $$("[data-car-up]").forEach(b=>b.onclick=()=>{const i=+b.dataset.carUp;if(i<1)return;const a=data.site.carousel;const t=a[i];a[i]=a[i-1];a[i-1]=t;mark("site");render("carousel")});
    $$("[data-car-dn]").forEach(b=>b.onclick=()=>{const i=+b.dataset.carDn;const a=data.site.carousel;if(i>=a.length-1)return;const t=a[i];a[i]=a[i+1];a[i+1]=t;mark("site");render("carousel")});
  }
  else if(tab==="tutorials"){
    const L=data.tutorials||[];
    c.innerHTML=`<div class="card"><h3>آموزش‌ها (${L.length})</h3><ul>${L.map((x,i)=>`<li><b>${x.title||x.id}</b> — ${x.level||""} <button data-tdel="${i}">حذف</button></li>`).join("")||"<li>خالی</li>"}</ul></div>`;
    $$("[data-tdel]").forEach(b=>b.onclick=()=>{data.tutorials.splice(+b.dataset.tdel,1);mark("tutorials");render("tutorials")});
  }
  else if(tab==="gallery"){
    const L=data.gallery||[];
    c.innerHTML=`<div class="card"><h3>گالری (${L.length})</h3><ul>${L.map((x,i)=>`<li>${x.caption||x.id} <button data-gdel="${i}">حذف</button></li>`).join("")||"<li>خالی</li>"}</ul></div>`;
    $$("[data-gdel]").forEach(b=>b.onclick=()=>{data.gallery.splice(+b.dataset.gdel,1);mark("gallery");render("gallery")});
  }
  else {c.innerHTML=`<div class="card"><p>بخش ${T[tab]||tab} — از داشبورد یا حرکات شروع کنید. ذخیره همه تغییرات با دکمه ذخیره.</p></div>`}
}
function editItem(i){const r=data.items[i];if(!r)return;const b=r.body||{};const html=`<div class="modal-box"><h3>ویرایش حرکت</h3><label>عنوان<input id="it" value="${r.title||""}"></label><label>دسته<input id="ic" value="${r.category||""}"></label><label>خلاصه<textarea id="ie">${r.excerpt||""}</textarea></label><label>سطح<input id="il" value="${b.level||""}"></label><button class="btn btn-primary" id="is">ذخیره در حافظه</button><button class="btn btn-ghost" data-close>بستن</button></div>`;
  const m=$("#modal");m.hidden=false;$("#modalBox").innerHTML=html;
  $("#is").onclick=()=>{r.title=$("#it").value;r.category=$("#ic").value;r.excerpt=$("#ie").value;r.body=r.body||{};r.body.level=$("#il").value;mark("items");m.hidden=true;render("items");toast("اعمال شد")};
  m.querySelector("[data-close]").onclick=()=>m.hidden=true;
}
async function login(tok){token=tok;await gh("/user");sessionStorage.setItem(K,tok);$("#loginScreen").hidden=true;$("#app").hidden=false;await loadAll();render("dashboard")}
function init(){
  const saved=sessionStorage.getItem(K);if(saved)$("#tokenInput").value=saved;
  $("#loginForm").onsubmit=async e=>{e.preventDefault();try{await login($("#tokenInput").value.trim())}catch(err){$("#loginError").hidden=false;$("#loginError").textContent="توکن نامعتبر یا دسترسی ناکافی"}};
  $("#loginBtn").onclick=()=>$("#loginForm").requestSubmit();
  $$("[data-tab]").forEach(b=>b.onclick=()=>{$$("[data-tab]").forEach(x=>x.classList.remove("active"));b.classList.add("active");render(b.dataset.tab)});
  $("#saveAllBtn").onclick=()=>saveAll().catch(e=>toast(String(e),false));
  $("#logoutBtn").onclick=()=>{sessionStorage.removeItem(K);location.reload()};
  $("#modal").addEventListener("click",e=>{if(e.target.matches(".modal-backdrop,[data-close]"))$("#modal").hidden=true});
}
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",init):init();
})();
