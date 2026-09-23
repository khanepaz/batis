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
  else if(tab==="items"){const L=data.items||[];c.innerHTML=`<div class="card"><div class="card-h"><h3>${L.length} حرکت</h3><button class="btn btn-primary btn-sm" id="add">+ جدید</button></div><table class="tbl"><thead><tr><th>عنوان</th><th>دسته</th><th>سطح</th><th></th></tr></thead><tbody>${L.map((r,i)=>`<tr><td>${r.title}</td><td>${r.category}</td><td>${(r.body&&r.body.level)||"-"}</td><td><button data-e="${i}">ویرایش</button> <button data-d="${i}">حذف</button></td></tr>`).join("")}</tbody></table></div>`;
    $("#add").onclick=()=>{data.items.push({id:"item-"+Date.now(),title:"حرکت جدید",category:"upper",excerpt:"",created:new Date().toISOString().slice(0,10),featured:false,tags:[],rating:5,votes:0,art:{emoji:"💪",from:"#e85d04",to:"#9d0208"},image:"",body:{level:"متوسط",equipment:[],muscleGroups:[],primaryMuscle:"",sets:[{reps:"8-12",restSec:90,note:""}],durationMin:10,cues:[],tips:[],aparat:"",difficulty:3}});mark("items");render("items")};
    $$("[data-d]").forEach(b=>b.onclick=()=>{if(confirm("حذف؟")){data.items.splice(+b.dataset.d,1);mark("items");render("items")}});
    $$("[data-e]").forEach(b=>b.onclick=()=>editItem(+b.dataset.e));
  }
  else if(tab==="categories"){const L=data.categories||[];c.innerHTML=`<div class="card"><div class="card-h"><h3>دسته‌ها</h3><button class="btn btn-primary btn-sm" id="addC">+ دسته</button></div><ul>${L.map((x,i)=>`<li>${x.icon} ${x.name} <button data-dc="${i}">حذف</button></li>`).join("")}</ul></div>`;
    $("#addC").onclick=()=>{data.categories.push({slug:"new-"+Date.now(),name:"دسته جدید",icon:"💪",desc:"",order:L.length,image:""});mark("categories");render("categories")};
    $$("[data-dc]").forEach(b=>b.onclick=()=>{data.categories.splice(+b.dataset.dc,1);mark("categories");render("categories")});
  }
  else if(tab==="site"){const s=data.site||{};c.innerHTML=`<div class="card"><label>نام<input id="sn" value="${s.name||""}"></label><label>هیرو عنوان<input id="sh" value="${s.heroTitle||""}"></label><label>هیرو توضیح<textarea id="sl">${s.heroLead||""}</textarea></label><button class="btn btn-primary" id="ss">اعمال</button></div>`;
    $("#ss").onclick=()=>{data.site.name=$("#sn").value;data.site.heroTitle=$("#sh").value;data.site.heroLead=$("#sl").value;mark("site");toast("اعمال شد — ذخیره را بزن")};
  }
  else if(tab==="comments"){const L=data.comments||[];c.innerHTML=`<div class="card"><h3>نظرات</h3><ul>${L.map((x,i)=>`<li><b>${x.name}</b>: ${x.text} <button data-x="${i}">حذف</button></li>`).join("")||"<li>خالی</li>"}</ul></div>`;
    $$("[data-x]").forEach(b=>b.onclick=()=>{data.comments.splice(+b.dataset.x,1);mark("comments");render("comments")});
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
