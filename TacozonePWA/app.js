const $=(id)=>document.getElementById(id);
const state={
  settings:{
    branchName:localStorage.getItem("branchName")||"Tacozone - Main",
    strictStock:localStorage.getItem("strictStock")||"1",
    sound:localStorage.getItem("sound")||"1",
  },
  categories:[
    {id:"tacos",name:"TACOS"},
    {id:"burger",name:"BURGER"},
    {id:"pizza",name:"PIZZA"},
    {id:"drinks",name:"DRINKS"},
    {id:"dessert",name:"DESSERT"},
  ],
  products:[
    {id:"t1",cat:"tacos",name:"Taco Chicken",price:450,stock:20},
    {id:"t2",cat:"tacos",name:"Taco Beef",price:500,stock:15},
    {id:"t3",cat:"tacos",name:"Taco Mix",price:550,stock:12},
    {id:"t4",cat:"tacos",name:"Taco XL",price:650,stock:10},
    {id:"b1",cat:"burger",name:"Classic Burger",price:600,stock:18},
    {id:"b2",cat:"burger",name:"Cheese Burger",price:650,stock:14},
    {id:"b3",cat:"burger",name:"Double Burger",price:800,stock:9},
    {id:"b4",cat:"burger",name:"Chicken Burger",price:650,stock:16},
    {id:"p1",cat:"pizza",name:"Pizza Margherita",price:900,stock:8},
    {id:"p2",cat:"pizza",name:"Pizza Pepperoni",price:1000,stock:7},
    {id:"p3",cat:"pizza",name:"Pizza Chicken",price:1000,stock:7},
    {id:"p4",cat:"pizza",name:"Pizza Mix",price:1100,stock:6},
    {id:"d1",cat:"drinks",name:"Cola",price:150,stock:40},
    {id:"d2",cat:"drinks",name:"Water",price:80,stock:60},
    {id:"d3",cat:"drinks",name:"Juice",price:180,stock:25},
    {id:"d4",cat:"drinks",name:"Energy Drink",price:250,stock:20},
    {id:"s1",cat:"dessert",name:"Brownie",price:300,stock:10},
    {id:"s2",cat:"dessert",name:"Ice Cream",price:250,stock:12},
  ],
  cart:[],
  orders:loadOrders(),
  activeCat:localStorage.getItem("activeCat")||"tacos",
};

function loadOrders(){try{return JSON.parse(localStorage.getItem("orders")||"[]")}catch{return []}}
function saveOrders(){localStorage.setItem("orders",JSON.stringify(state.orders))}
function money(x){return (Math.round(x*100)/100).toFixed(2)}

function setView(name){
  document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.view===name));
  document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id===`view-${name}`));
  if(name==="dash") renderDash();
  if(name==="kds") renderKds();
}

function renderCategories(){
  const row=$("catRow"); row.innerHTML="";
  state.categories.forEach(c=>{
    const b=document.createElement("button");
    b.className="cat"+(state.activeCat===c.id?" active":"");
    b.textContent=c.name;
    b.onclick=()=>{state.activeCat=c.id;localStorage.setItem("activeCat",state.activeCat);renderCategories();renderProducts();};
    row.appendChild(b);
  });
}

function filterProducts(){
  const q=($("search").value||"").trim().toLowerCase();
  return state.products.filter(p=>p.cat===state.activeCat && (!q||p.name.toLowerCase().includes(q)));
}

function renderProducts(){
  const grid=$("prodGrid"); grid.innerHTML="";
  filterProducts().forEach(p=>{
    const card=document.createElement("div");
    card.className="prod";
    card.innerHTML=`<div class="pname">${p.name}</div><div class="pprice">${money(p.price)} DA</div><div class="pmeta">Stock: ${p.stock}</div>`;
    card.onclick=()=>addToCart(p.id);
    grid.appendChild(card);
  });
}

function findCartItem(pid){return state.cart.find(x=>x.pid===pid)}
function addToCart(pid){
  const p=state.products.find(x=>x.id===pid); if(!p) return;
  const strict=state.settings.strictStock==="1";
  const ci=findCartItem(pid);
  const want=(ci?.qty||0)+1;
  if(strict && want>p.stock){alert(`Stock غير كاف: ${p.name}
المتوفر: ${p.stock}`);return;}
  if(ci) ci.qty++; else state.cart.push({pid,qty:1});
  renderCart();
}
function changeQty(pid,delta){
  const ci=findCartItem(pid); if(!ci) return;
  const p=state.products.find(x=>x.id===pid);
  const strict=state.settings.strictStock==="1";
  const next=ci.qty+delta;
  if(next<=0) state.cart=state.cart.filter(x=>x.pid!==pid);
  else{
    if(strict && next>p.stock){alert(`Stock غير كاف: ${p.name}
المتوفر: ${p.stock}`);return;}
    ci.qty=next;
  }
  renderCart();
}
function removeItem(pid){state.cart=state.cart.filter(x=>x.pid!==pid);renderCart();}

function calcTotals(){
  let sub=0;
  for(const it of state.cart){
    const p=state.products.find(x=>x.id===it.pid);
    if(p) sub+=p.price*it.qty;
  }
  const discPct=Number($("discount").value||0);
  const disc=sub*(Math.max(0,Math.min(100,discPct))/100);
  return {sub,disc,grand:sub-disc};
}

function renderCart(){
  const cart=$("cart"); cart.innerHTML="";
  for(const it of state.cart){
    const p=state.products.find(x=>x.id===it.pid); if(!p) continue;
    const div=document.createElement("div");
    div.className="cart-item";
    div.innerHTML=`
      <div>
        <div class="row1"><div class="name">${p.name}</div><div class="qty">x ${it.qty}</div></div>
        <div class="row2">
          <button class="smallbtn yellow">+1</button>
          <button class="smallbtn yellow">-1</button>
          <button class="smallbtn red">حذف</button>
        </div>
      </div>
      <div class="right">${money(p.price*it.qty)} DA</div>`;
    const btns=div.querySelectorAll("button");
    btns[0].onclick=()=>changeQty(it.pid,+1);
    btns[1].onclick=()=>changeQty(it.pid,-1);
    btns[2].onclick=()=>removeItem(it.pid);
    cart.appendChild(div);
  }
  const t=calcTotals();
  $("subTotal").textContent=money(t.sub)+" DA";
  $("discValue").textContent=money(t.disc)+" DA";
  $("grandTotal").textContent=money(t.grand)+" DA";
}

function beep(){
  if(state.settings.sound!=="1") return;
  try{
    const ctx=new (window.AudioContext||window.webkitAudioContext)();
    const o=ctx.createOscillator(); const g=ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.value=880; o.type="sine";
    g.gain.setValueAtTime(0.001,ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.2,ctx.currentTime+0.01);
    g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.25);
    o.start(); o.stop(ctx.currentTime+0.26);
  }catch{}
}

function createOrder(payment){
  if(state.cart.length===0){alert("السلة فارغة");return;}
  const totals=calcTotals();
  const order={
    id:"O"+Date.now().toString().slice(-7),
    at:new Date().toISOString(),
    branch:state.settings.branchName,
    type:$("orderType").value,
    note:$("orderNote").value||"",
    discountPct:Number($("discount").value||0),
    subTotal:totals.sub,
    discount:totals.disc,
    total:totals.grand,
    payment,
    status:"NEW",
    items: state.cart.map(it=>{
      const p=state.products.find(x=>x.id===it.pid);
      return {name:p?.name||it.pid,qty:it.qty,price:p?.price||0};
    })
  };
  for(const it of state.cart){
    const p=state.products.find(x=>x.id===it.pid);
    if(p) p.stock=Math.max(0,p.stock-it.qty);
  }
  state.orders.unshift(order); saveOrders();
  state.cart=[]; $("orderNote").value=""; $("discount").value="0"; renderCart();
  beep();
  alert(`تم إنشاء الطلب ${order.id} ✅\nتم إرساله إلى المطبخ (KDS)`);
}

function holdOrder(){
  if(state.cart.length===0){alert("السلة فارغة");return;}
  const totals=calcTotals();
  const order={
    id:"H"+Date.now().toString().slice(-7),
    at:new Date().toISOString(),
    branch:state.settings.branchName,
    type:$("orderType").value,
    note:$("orderNote").value||"",
    discountPct:Number($("discount").value||0),
    subTotal:totals.sub,
    discount:totals.disc,
    total:totals.grand,
    payment:"HOLD",
    status:"NEW",
    items: state.cart.map(it=>{
      const p=state.products.find(x=>x.id===it.pid);
      return {name:p?.name||it.pid,qty:it.qty,price:p?.price||0};
    })
  };
  state.orders.unshift(order); saveOrders();
  state.cart=[]; renderCart();
  alert(`تم حفظ الطلب مفتوح ${order.id} ✅`);
  beep();
}

function renderKds(){
  const board=$("kdsBoard"); board.innerHTML="";
  const orders=state.orders.filter(o=>o.payment!=="HOLD").slice(0,30);
  orders.forEach(o=>{
    const card=document.createElement("div");
    card.className="kcard";
    const sClass=o.status==="NEW"?"s-new":(o.status==="IN_PROGRESS"?"s-prog":"s-ready");
    const sText=o.status==="NEW"?"NEW":(o.status==="IN_PROGRESS"?"IN PROGRESS":"READY");
    card.innerHTML=`
      <div class="khead"><div class="kid">${o.id} • ${o.type}</div><div class="kstatus ${sClass}">${sText}</div></div>
      <div class="hint">Branch: ${o.branch} • ${new Date(o.at).toLocaleString()}</div>
      <div class="kitems">
        ${o.items.map(i=>`<div>• ${i.name} <span class="hint">x ${i.qty}</span></div>`).join("")}
        ${o.note?`<div class="hint">Note: ${o.note}</div>`:""}
      </div>
      <div class="kactions">
        <button class="btn btn-yellow">IN PROGRESS</button>
        <button class="btn btn-green">READY</button>
      </div>`;
    const btns=card.querySelectorAll("button");
    btns[0].onclick=()=>{o.status="IN_PROGRESS";saveOrders();renderKds();};
    btns[1].onclick=()=>{o.status="READY";saveOrders();renderKds();};
    board.appendChild(card);
  });
  if(orders.length===0) board.innerHTML=`<div class="hint">لا توجد طلبات بعد. افتح POS وأنشئ طلب، أو اضغط "إنشاء طلب تجريبي".</div>`;
}

function renderDash(){
  const now=new Date();
  const start=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  const orders=state.orders.filter(o=>new Date(o.at)>=start && o.payment!=="HOLD");
  const sales=orders.reduce((a,o)=>a+o.total,0);
  const low=state.products.filter(p=>p.stock<=5).length;
  $("dSales").textContent=money(sales)+" DA";
  $("dOrders").textContent=String(orders.length);
  $("dLow").textContent=String(low);

  const map=new Map();
  for(const o of orders) for(const it of o.items) map.set(it.name,(map.get(it.name)||0)+it.qty);
  const top=[...map.entries()].sort((a,b)=>b[1]-a[1]).slice(0,10);
  const topDiv=$("topItems"); topDiv.innerHTML="";
  if(top.length===0) topDiv.innerHTML=`<div class="hint">لا يوجد بيانات اليوم بعد.</div>`;
  top.forEach(([name,qty])=>{
    const row=document.createElement("div"); row.className="trow";
    row.innerHTML=`<div>${name}</div><div class="right">${qty}</div>`;
    topDiv.appendChild(row);
  });

  const last=$("lastOrders"); last.innerHTML="";
  const lastList=orders.slice(0,10);
  if(lastList.length===0) last.innerHTML=`<div class="hint">لا يوجد طلبات.</div>`;
  lastList.forEach(o=>{
    const row=document.createElement("div"); row.className="trow";
    row.innerHTML=`<div>${o.id} • ${o.type}</div><div class="right">${money(o.total)} DA</div>`;
    last.appendChild(row);
  });
}

function bind(){
  document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>setView(b.dataset.view));
  $("search").addEventListener("input",renderProducts);
  $("btnClear").onclick=()=>{if(confirm("مسح السلة؟")){state.cart=[];renderCart();}};
  $("btnHold").onclick=holdOrder;
  $("btnCash").onclick=()=>createOrder("CASH");
  $("btnCard").onclick=()=>createOrder("CARD");
  $("btnSeed").onclick=()=>{state.cart=[{pid:"t1",qty:2},{pid:"d1",qty:2}];renderCart();createOrder("CASH");setView("kds");};
  $("btnSound").onclick=()=>{state.settings.sound=state.settings.sound==="1"?"0":"1";localStorage.setItem("sound",state.settings.sound);$("btnSound").textContent=`صوت تنبيه: ${state.settings.sound==="1"?"تشغيل":"إيقاف"}`;};
  $("btnSound").textContent=`صوت تنبيه: ${state.settings.sound==="1"?"تشغيل":"إيقاف"}`;

  $("branchName").value=state.settings.branchName;
  $("strictStock").value=state.settings.strictStock;
  $("btnSaveSettings").onclick=()=>{
    state.settings.branchName=$("branchName").value.trim()||"Tacozone - Main";
    state.settings.strictStock=$("strictStock").value;
    localStorage.setItem("branchName",state.settings.branchName);
    localStorage.setItem("strictStock",state.settings.strictStock);
    alert("تم الحفظ ✅");
  };
}

bind();
renderCategories();
renderProducts();
renderCart();
renderDash();
