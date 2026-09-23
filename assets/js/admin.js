(async()=>{
  const parts=["v2p0.js","v2p1.js","v2p2.js","v2p3.js","v2p4.js","v2p5.js"];
  const base=document.currentScript.src.replace(/admin\.js$/,"");
  let code="";
  for(const p of parts){
    const r=await fetch(base+p+"?t="+Date.now(),{cache:"no-cache"});
    if(!r.ok) throw new Error("load "+p);
    code+=await r.text();
  }
  const s=document.createElement("script");
  s.textContent=code;
  document.body.appendChild(s);
})().catch(e=>{console.error(e);alert("خطا: "+e.message)});
