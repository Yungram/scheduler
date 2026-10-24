import {firebaseConfig} from "./firebase-config.js";

// ---------- data ----------
const DOW=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const DOWL=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const MONTHS=["January","February","March","April","May","June","July","August","September","October","November","December"];

// The Work and Gym Week grid: [start hour, end hour, kind, label, detail]
const SCHEDULE=[
 {t:"Office",b:[[5.75,6.75,"life","Wake, breakfast, get ready"],[6.75,17,"work","Office","7 AM – 5 PM"],[17,17.5,"life","Snack + reset"],[17.5,19.5,"task","Daily tasks","2 h"],[19.5,20,"life","Pre-gym snack, pack bag"],[20,22,"gym","Gym"],[22,22.75,"life","Dinner"],[22.75,23.5,"rest","Shower, wind down"],[23.5,25,"rest","Sleep ~11:30","Up 6:45"]]},
 {t:"Home",b:[[6.75,7.25,"life","Wake, breakfast"],[7.25,8,"task","Morning tasks"],[8,16,"work","Work from home","8 AM – 4 PM"],[16,16.5,"life","Snack"],[16.5,19.5,"task","Daily tasks","Best focus block"],[19.5,20,"life","Pre-gym snack"],[20,22,"gym","Gym"],[22,22.5,"life","Dinner"],[22.5,23,"rest","Shower, wind down"],[23,25,"rest","Sleep by 11","Up 5:45"]]},
 {t:"Office",b:[[5.75,6.75,"life","Wake, breakfast, get ready"],[6.75,17,"work","Office","7 AM – 5 PM"],[17,18.5,"task","Errands + groceries"],[18.5,19.5,"life","Dinner"],[19.5,21,"task","Meal prep","Thu–Sat meals"],[21,22,"task","Kitchen cleanup + chores"],[22,23,"life","Free time"],[23,23.5,"rest","Wind down"],[23.5,25,"rest","Sleep ~11:30","Up 6:45"]]},
 {t:"Home",b:[[6.75,7.25,"life","Wake, breakfast"],[7.25,8,"task","Morning tasks"],[8,16,"work","Work from home","8 AM – 4 PM"],[16,16.5,"life","Snack"],[16.5,18.5,"task","Daily tasks","Best focus block"],[18.5,19.5,"task","Prep for Friday"],[19.5,20,"life","Pre-gym snack"],[20,22,"gym","Gym"],[22,22.5,"life","Dinner","Prepped"],[22.5,23,"rest","Shower, wind down"],[23,25,"rest","Sleep by 11","Up 5:45"]]},
 {t:"Office",b:[[5.75,6.75,"life","Wake, breakfast, get ready"],[6.75,17,"work","Office","7 AM – 5 PM"],[17,17.5,"life","Snack + reset"],[17.5,19.5,"task","Light tasks or free"],[19.5,20,"life","Pre-gym snack, pack bag"],[20,22,"gym","Gym"],[22,23,"life","Dinner"],[23,25,"life","Free night"]]},
 {t:"Off",b:[[8,9,"life","Sleep in, breakfast"],[9,12,"task","Weekly cleaning"],[12,13,"life","Lunch"],[13,19.5,"life","Free afternoon"],[19.5,20,"life","Pre-gym snack"],[20,22,"gym","Gym"],[22,23,"life","Dinner"],[23,25,"life","Free night"]]},
 {t:"Off",b:[[8,9,"life","Breakfast"],[9,10,"task","Plan the week"],[10,12,"life","Free"],[12,13,"life","Lunch"],[13,14.5,"task","Laundry"],[14.5,19,"life","Free"],[19,20,"life","Dinner"],[20,21.5,"task","Meal prep","Mon–Wed meals"],[21.5,22.25,"task","Kitchen cleanup"],[22.25,23,"rest","Wind down"],[23,25,"rest","Sleep by 11","Up 5:45"]]}
];
const GYM={0:"Legs",1:"tue",3:"thu",4:"Lower",5:"Upper"};

// Every-week items; `at` is the schedule block they belong to.
const WEEKLY=[
 {id:"wed-groceries",dow:2,at:17,text:"Groceries for the meal prep",mins:45},
 {id:"wed-prep",dow:2,at:19.5,text:"Meal prep for Thursday to Saturday",mins:90},
 {id:"wed-kitchen",dow:2,at:21,text:"Kitchen reset: stovetop, counters, sink, old leftovers; quick wipe of your bathroom",mins:30},
 {id:"thu-garbage",dow:3,at:18.5,text:"Garbage, recycling and green bin to the curb",mins:10},
 {id:"thu-friday",dow:3,at:18.5,text:"Lay out clothes and pack Friday's lunch",mins:15},
 {id:"sat-vacuum",dow:5,at:9,text:"Vacuum every floor and the stairs",mins:40},
 {id:"sat-mop",dow:5,at:9,text:"Mop kitchen, entry and bathrooms",mins:20},
 {id:"sat-baths",dow:5,at:9,text:"Toilets, sinks and mirrors in your bathrooms",mins:20},
 {id:"sat-guest",dow:5,at:9,text:"Guest bathroom: flush the toilet, run the taps",mins:2},
 {id:"sat-lawn",dow:5,at:9,text:"Mow and trim the lawn, sweep the walk",mins:30,months:[4,5,6,7,8,9,10]},
 {id:"sun-plan",dow:6,at:9,text:"Plan the week: calendar and to-dos",mins:30},
 {id:"sun-laundry",dow:6,at:13,text:"Laundry and towels: wash, dry, fold, put away",mins:90},
 {id:"sun-prep",dow:6,at:20,text:"Meal prep for Monday to Wednesday",mins:90},
 {id:"sun-kitchen",dow:6,at:21.5,text:"Kitchen cleanup",mins:30}
];

// The four-week rotation: [day, task, minutes, months it appears in (omit for every month)]
const ROT=[
 {n:1,title:"Kitchen",items:[
  ["Sat","Empty and wipe the fridge, toss expired food",30],
  ["Sat","Clean oven and microwave inside",30],
  ["Sat","Wipe cabinet fronts, handles and backsplash",20],
  ["Sat","Clean dishwasher filter, run it empty with cleaner",15],
  ["Sun","Change your bed sheets",10],
  ["Sat","Replace the fridge water filter, if it has one",5,[1,7]],
  ["Sat","Vacuum the fridge coils behind the bottom grille",20,[7]],
  ["Sat","Walk around outside: roof shingles, siding, foundation cracks, downspouts draining away from the house",30,[4]],
  ["Sat","Turn the outdoor tap back on; check the hose and look inside for leaks",10,[5]],
  ["Sat","Deep-clean the garage or storage area",60,[6]]]},
 {n:2,title:"Bathrooms",items:[
  ["Sat","Scrub tubs, showers and grout in the bathrooms you use",30],
  ["Sat","Guest bathroom: dust, wipe surfaces, check for leaks or a running toilet",10],
  ["Sat","Descale showerheads and taps",15],
  ["Sat","Wash bath mats and shower curtain",10],
  ["Sat","Wipe exhaust fan covers, cabinets and baseboards",20],
  ["Sat","Clear hair from shower and sink drains",10],
  ["Wed","Restock toilet paper, soap and cleaning supplies",10],
  ["Sat","Toilet leak test: food colouring in each tank, check the bowl after 15 min",15,[4]],
  ["Sat","Clean gutters and downspouts",45,[5,11]],
  ["Sat","Reseal grout; recaulk tubs and showers where it's cracked",45,[7]]]},
 {n:3,title:"Bedrooms and living areas",items:[
  ["Sat","Vacuum under beds, couches and cushions",30],
  ["Sat","Dust baseboards, blinds, shelves and ceiling fans",30],
  ["Sat","Air out the two guest bedrooms: open windows, dust surfaces, vacuum",25],
  ["Sat","Declutter one room or closet",20],
  ["Sun","Change your bed sheets",10],
  ["Sat","Clean the vacuum's filter and brush roll",15,[2,5,8,11]],
  ["Sat","Rotate the mattress",10,[4,10]],
  ["Sat","Wash pillows and the duvet",15,[4,10]],
  ["Sat","Wash the guest beds' sheets if no one has used them; they still collect dust",10,[4,10]],
  ["Sat","Wash windows inside and out; put the screens back in",60,[5]],
  ["Sat","Clean window and patio door tracks",20,[6]]]},
 {n:4,title:"Maintenance and systems",items:[
  ["Sat","Check the furnace filter; replace every 1–3 months",10],
  ["Sat","Test smoke and carbon monoxide alarms",10],
  ["Sat","Test GFCI outlets: press Test, then Reset",5],
  ["Sat","Check the fire extinguisher gauge is in the green",2],
  ["Sat","Clean range hood filter and dryer lint trap housing",20],
  ["Sat","Look under every sink for leaks, including the guest bathroom",15],
  ["Sat","Clean washer gasket and run a cleaning cycle",15],
  ["Wed","Wipe light switches, door handles and remotes",15],
  ["Sat","Clean the HRV filter, if you have one",15,[1,4,7,10]],
  ["Sat","Check for ice at doors and vents; watch window sills for condensation",10,[12,1,2,3]],
  ["Sat","Turn the main water shut-off fully off and on so it doesn't seize",10,[4]],
  ["Sat","Book an air conditioner tune-up",5,[4]],
  ["Sat","Clear leaves and debris around the outdoor AC unit",10,[5]],
  ["Sat","Switch ceiling fans to counter-clockwise",5,[5]],
  ["Sat","Clean the dryer vent duct all the way to the outside",30,[6]],
  ["Sat","Check exterior caulking around windows and doors",20,[8]],
  ["Sat","Flush the water heater and test its relief valve",45,[9]],
  ["Sat","Book a furnace inspection; run the heat once before the first cold night",10,[9]],
  ["Sat","Replace the furnace humidifier pad, if you have one",15,[10]],
  ["Sat","Shut off and drain the outdoor tap; store the hose",15,[10]],
  ["Sat","Stock ice melt and check the shovel",10,[10]],
  ["Sat","Check door and window weatherstripping for drafts",20,[11]],
  ["Sat","Switch ceiling fans to clockwise",5,[11]],
  ["Sat","Replace smoke and CO alarm batteries",15,[11]],
  ["Sat","Check the emergency kit: water, food, batteries, medication",15,[11]]]}
];
const ONCE=[
 "Start a 3-month radon test on the lowest floor you live on (fall or winter)",
 "Find the main water shut-off and label it",
 "Check the date on the back of every alarm: replace smoke alarms over 10 years old and CO alarms over 7–10",
 "Get a kitchen fire extinguisher if you don't have one",
 "Put together a 72-hour emergency kit",
 "Find where the furnace, HRV and dryer vent outside, so you can keep them clear of snow",
 "Look up your city's sidewalk snow-clearing deadline"
];
const AT={Wed:21,Sat:9,Sun:13};

// ---------- dates ----------
const pad=n=>String(n).padStart(2,"0");
const iso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const parse=s=>{const[y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d)};
const addDays=(d,n)=>{const x=new Date(d.getFullYear(),d.getMonth(),d.getDate());x.setDate(x.getDate()+n);return x};
const dowOf=d=>(d.getDay()+6)%7;
const monday=d=>addDays(d,-dowOf(d));
const ymOf=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}`;
const isoWeekNo=d=>{const t=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));const k=t.getUTCDay()||7;t.setUTCDate(t.getUTCDate()+4-k);const y0=new Date(Date.UTC(t.getUTCFullYear(),0,1));return Math.ceil(((t-y0)/864e5+1)/7)};
const slug=t=>t.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,48);
const short=d=>`${MONTHS[d.getMonth()].slice(0,3)} ${d.getDate()}`;
const fmtT=h=>{const hh=Math.floor(h)%24,mm=Math.round((h-Math.floor(h))*60);return `${hh%12||12}${mm?":"+pad(mm):""} ${hh<12?"AM":"PM"}`};
ROT.forEach(w=>w.items.forEach(it=>{it.slug=slug(it[1])}));
const inMonth=(months,m)=>!months||months.includes(m);

// Push and Pull swap every week: even ISO weeks are Push on Tuesday.
function gymName(dw,date){const v=GYM[dw];if(v!=="tue"&&v!=="thu")return v;const even=isoWeekNo(date)%2===0;return (v==="tue")===even?"Push":"Pull"}

// ---------- state ----------
const state={weeks:{},months:{},meta:{},todos:{}};
const checkedAt=(store,doc,key)=>state[store][doc]&&state[store][doc].checks?state[store][doc].checks[key]:undefined;

// Everything scheduled on one date. Catch-up Saturdays (29th–31st) list the month's unfinished rotation items.
function itemsFor(date){
  const out=[],dw=dowOf(date),wk=iso(monday(date)),m=date.getMonth()+1,dn=date.getDate(),ds=iso(date),mon=ymOf(date);
  out.push({key:`daily:${ds}`,group:"daily",store:"weeks",doc:wk,text:"Dishes, counters and a 10-minute tidy",kind:"chore",at:null,mins:15});
  if(GYM[dw]!==undefined)out.push({key:`gym:${dw}`,group:`gym:${dw}`,store:"weeks",doc:wk,text:`Gym: ${gymName(dw,date)}`,kind:"gym",at:20});
  WEEKLY.forEach(w=>{if(w.dow===dw&&inMonth(w.months,m))out.push({key:w.id,group:w.id,store:"weeks",doc:wk,text:w.text,kind:"chore",at:w.at,mins:w.mins})});
  const code={2:"Wed",5:"Sat",6:"Sun"}[dw];
  if(code){
    const n=Math.ceil(dn/7);
    if(n<=4){
      ROT[n-1].items.forEach(it=>{if(it[0]===code&&inMonth(it[3],m))out.push({key:`w${n}:${it.slug}`,store:"months",doc:mon,text:it[1],kind:"rot",at:AT[code],mins:it[2],seasonal:!!it[3],focus:ROT[n-1].title})});
    }else if(code==="Sat"){
      ROT.forEach(w=>w.items.forEach(it=>{
        if(!inMonth(it[3],m))return;
        const key=`w${w.n}:${it.slug}`,c=checkedAt("months",mon,key);
        if(!c||iso(new Date(c))===ds)out.push({key,store:"months",doc:mon,text:it[1],kind:"rot",at:9,mins:it[2],extra:true,focus:"Catch-up"});
      }));
    }
  }
  return out;
}

function weekStats(W){
  let total=0,done=0,gym=0,gymT=0;
  for(let i=0;i<7;i++)itemsFor(addDays(W,i)).forEach(it=>{
    if(it.extra)return;total++;const c=!!checkedAt(it.store,it.doc,it.key);if(c)done++;
    if(it.kind==="gym"){gymT++;if(c)gym++}
  });
  const wk=iso(W),tds=Object.values(state.todos).filter(t=>t.week===wk),tdDone=tds.filter(t=>t.doneAt).length;
  return {total:total+tds.length,done:done+tdDone,gym,gymT};
}
function startWeek(){
  let min=null;const see=s=>{if(s&&(!min||s<min))min=s};
  ["weeks","months","meta"].forEach(st=>Object.values(state[st]).forEach(d=>Object.values((d&&d.checks)||{}).forEach(see)));
  Object.values(state.todos).forEach(t=>see(t.createdAt));
  return monday(min?new Date(min):new Date());
}
const GROUPS=[{g:"daily",name:"Dishes, counters and a 10-minute tidy",daily:true},
  ...[0,1,3,4,5].map(dw=>({g:`gym:${dw}`,name:`Gym on ${DOWL[dw]}`})),
  ...WEEKLY.map(w=>({g:w.id,name:w.text}))];
function occurrences(W,g){const r=[];for(let i=0;i<7;i++){const d=addDays(W,i);itemsFor(d).forEach(it=>{if(it.group===g)r.push([d,it])})}return r}
function streak(gr,today){
  const S=startWeek(),ts=iso(today);let n=0;
  if(gr.daily){let d=today;while(d>=S){const c=checkedAt("weeks",iso(monday(d)),`daily:${iso(d)}`);if(c)n++;else if(iso(d)!==ts)break;d=addDays(d,-1)}return {n,unit:n===1?"day":"days"}}
  let W=monday(today);
  while(W>=S){
    const occ=occurrences(W,gr.g);
    if(occ.length){const[d,it]=occ[0];if(checkedAt(it.store,it.doc,it.key))n++;else if(iso(d)<ts)break}
    W=addDays(W,-7);
  }
  return {n,unit:n===1?"week":"weeks"};
}
function slipping(today){
  const S=startWeek(),cur=monday(today),res=[];
  GROUPS.forEach(gr=>{
    let s=0,d=0;
    for(let k=1;k<=8;k++){const W=addDays(cur,-7*k);if(W<S)break;occurrences(W,gr.g).forEach(([,it])=>{s++;if(checkedAt(it.store,it.doc,it.key))d++})}
    if(s>=2&&s-d>=2&&d/s<.5)res.push({name:gr.name,missed:s-d,of:s});
  });
  return res.sort((a,b)=>b.missed-a.missed).slice(0,6);
}

// ---------- storage ----------
// With Firebase configured, data lives in Firestore under users/<your uid>/ and syncs between devices.
// Without it (placeholders still in firebase-config.js), everything stays in this browser.
const FB="https://www.gstatic.com/firebasejs/10.14.1/";
const LKEY="scheduler-v1";
let fb=null,uid=null,mode="connecting",unsubs=[];
function saveLocal(){try{localStorage.setItem(LKEY,JSON.stringify(state))}catch(e){}}
function loadLocal(){try{const s=JSON.parse(localStorage.getItem(LKEY)||"{}");["weeks","months","meta","todos"].forEach(k=>{if(s&&s[k])state[k]=s[k]})}catch(e){}}
function persist(path,data){
  if(mode==="local"){saveLocal();return}
  if(!fb||!uid)return;
  const ref=fb.F.doc(fb.db,`users/${uid}/${path}`);
  (data===null?fb.F.deleteDoc(ref):fb.F.setDoc(ref,data)).catch(e=>{mode="error";setStatus(e&&e.code)});
}
function setStatus(code){
  const el=document.getElementById("status");
  const offline=typeof navigator!=="undefined"&&navigator.onLine===false;
  const txt={connecting:"Connecting",signedout:"Signed out",sync:offline?"Offline, will sync":"Synced",local:"Saved on this device only",error:code==="permission-denied"?"No access: check the database rules":"Not saving, retrying"}[mode];
  el.className="status "+(mode==="sync"&&!offline?"ok":mode==="connecting"||mode==="signedout"?"":"warn");
  el.lastElementChild.textContent=txt;
  document.getElementById("signout").hidden=!(fb&&uid);
}
function newId(){return fb&&uid?fb.F.doc(fb.F.collection(fb.db,`users/${uid}/todos`)).id:"t"+Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
function subscribe(){
  const F=fb.F,base=`users/${uid}`;
  const err=e=>{mode="error";setStatus(e&&e.code)};
  const coll=store=>F.onSnapshot(F.collection(fb.db,`${base}/${store}`),snap=>{
    const o={};snap.docs.forEach(d=>{o[d.id]=d.data()});state[store]=o;if(mode==="error")mode="sync";setStatus();render();
  },err);
  unsubs=[coll("weeks"),coll("months"),coll("todos"),
    F.onSnapshot(F.doc(fb.db,`${base}/meta/once`),s=>{state.meta=s.exists()?{once:s.data()}:{};render()},err)];
}
async function signIn(){
  const{A,auth}=fb,provider=new A.GoogleAuthProvider();
  try{await A.signInWithPopup(auth,provider)}
  catch(e){
    if(e&&(e.code==="auth/popup-blocked"||e.code==="auth/operation-not-supported-in-this-environment"))await A.signInWithRedirect(auth,provider);
    else if(e&&e.code!=="auth/popup-closed-by-user"&&e.code!=="auth/cancelled-popup-request"){const m=document.getElementById("gate-msg");if(m)m.textContent=`Sign-in failed (${e.code||"unknown error"}). Check that this site's address is in Firebase's authorized domains.`}
  }
}
async function init(){
  if(!firebaseConfig||!firebaseConfig.apiKey||firebaseConfig.apiKey.startsWith("YOUR_")){mode="local";loadLocal();setStatus();render();return}
  try{
    const[{initializeApp},A,F]=await Promise.all([import(FB+"firebase-app.js"),import(FB+"firebase-auth.js"),import(FB+"firebase-firestore.js")]);
    const app=initializeApp(firebaseConfig);
    let db;
    try{db=F.initializeFirestore(app,{localCache:F.persistentLocalCache({tabManager:F.persistentMultipleTabManager()})})}catch(e){db=F.getFirestore(app)}
    const auth=A.getAuth(app);
    fb={A,F,db,auth};
    A.onAuthStateChanged(auth,user=>{
      unsubs.forEach(u=>u());unsubs=[];
      state.weeks={};state.months={};state.meta={};state.todos={};
      if(!user){uid=null;mode="signedout";setStatus();render();return}
      uid=user.uid;mode="sync";setStatus();render();subscribe();
    });
  }catch(e){
    mode="local";loadLocal();setStatus();render();
  }
}
window.addEventListener("online",()=>setStatus());
window.addEventListener("offline",()=>setStatus());

// ---------- actions ----------
function toggle(store,doc,key,on){
  const checks={...((state[store][doc]&&state[store][doc].checks)||{})};
  if(on)checks[key]=new Date().toISOString();else delete checks[key];
  const data={checks};state[store]={...state[store],[doc]:data};
  persist(`${store}/${doc}`,data);render();
}
function addTodo(title,when){
  const i=when.indexOf(":"),t=when.slice(0,i),v=when.slice(i+1);
  const date=t==="d"?v:null,week=t==="d"?iso(monday(parse(v))):v;
  const data={title,date,week,createdAt:new Date().toISOString(),doneAt:null};
  const id=newId();
  state.todos={...state.todos,[id]:data};persist("todos/"+id,data);render();
}
function toggleTodo(id,on){const t=state.todos[id];if(!t)return;const data={...t,doneAt:on?new Date().toISOString():null};state.todos={...state.todos,[id]:data};persist("todos/"+id,data);render()}
function delTodo(id){const o={...state.todos};delete o[id];state.todos=o;persist("todos/"+id,null);render()}

// ---------- rendering ----------
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const cid=(...p)=>"c-"+p.join("-").replace(/[^a-zA-Z0-9_-]/g,"_");
function itemRow(it,dot){
  const c=checkedAt(it.store,it.doc,it.key);
  return `<label class="item"><input type="checkbox" id="${cid(it.store,it.doc,it.key)}" data-s="${it.store}" data-d="${it.doc}" data-k="${esc(it.key)}"${c?" checked":""}><span>${dot?`<i class="kd ${it.kind}"></i>`:""}${esc(it.text)}${it.mins?`<span class="min">${it.mins} min</span>`:""}${it.seasonal?`<span class="badge">Seasonal</span>`:""}${it.extra?`<span class="badge">Catch-up</span>`:""}</span></label>`;
}
function todoRow(id,t,today,dot){
  const sub=[];
  if(t.week<iso(monday(today))&&!t.doneAt)sub.push(`Carried over from the week of ${short(parse(t.week))}`);
  else if(t.date&&t.date!==iso(today))sub.push(DOWL[dowOf(parse(t.date))]);
  return `<div class="todo"><label class="item"><input type="checkbox" id="${cid("todo",id)}" data-todo="${esc(id)}"${t.doneAt?" checked":""}><span>${dot?`<i class="kd todo"></i>`:""}${esc(t.title)}${sub.length?`<span class="sub">${sub.join(" · ")}</span>`:""}</span></label><button type="button" class="x" data-del="${esc(id)}" aria-label="Delete ${esc(t.title)}">×</button></div>`;
}
const meter=(d,t)=>`<div class="meter" role="img" aria-label="${d} of ${t} done"><i style="width:${t?Math.round(d/t*100):0}%"></i></div>`;
const todosList=(arr,today,empty)=>arr.length?`<div class="list">${arr.map(([id,t])=>todoRow(id,t,today)).join("")}</div>`:`<p class="empty">${empty}</p>`;
const byCreated=(a,b)=>(a[1].createdAt||"").localeCompare(b[1].createdAt||"");

function dayTitle(dw,date){const g=GYM[dw]!==undefined?gymName(dw,date):"Rest";return `${SCHEDULE[dw].t} · ${g}`}

function renderToday(){
  // Until 5 AM it is still the previous day's schedule (you're up late, not starting a new day).
  const clock=new Date(),late=clock.getHours()<5,now=late?addDays(clock,-1):clock;
  const ds=iso(now),dw=dowOf(now),wk=iso(monday(now)),items=itemsFor(now);
  const hr=clock.getHours()+clock.getMinutes()/60+(late?24:0);
  const used=new Set();
  const blocks=SCHEDULE[dw].b.map(([s,e,k,l,sub])=>{
    const its=items.filter(i=>i.at===s);its.forEach(i=>used.add(i));
    const reg=its.filter(i=>i.kind!=="rot"),rot=its.filter(i=>i.kind==="rot");
    const label=k==="gym"?`Gym: ${gymName(dw,now)}`:l;
    const isNow=hr>=s&&hr<e,past=hr>=e;
    let inner="";
    if(reg.length&&k!=="gym")inner+=`<div class="list">${reg.map(i=>itemRow(i)).join("")}</div>`;
    if(k==="gym"&&reg.length)inner+=`<div class="list">${reg.map(i=>itemRow({...i,text:"Done"})).join("")}</div>`;
    if(rot.length)inner+=`<span class="grp-h">${rot[0].extra?"Catch-up: this month's unfinished rotation":`Week ${Math.ceil(now.getDate()/7)} focus: ${esc(rot[0].focus)}`}</span><div class="list">${rot.map(i=>itemRow(i)).join("")}</div>`;
    return `<div class="b${isNow?" now":""}${past&&!isNow?" past":""}"><time>${fmtT(s)}</time><div class="k ${k}"><div class="lbl">${esc(label)}${sub?`<em>${esc(sub)}</em>`:""}${isNow?`<span class="nowtag">Now</span>`:""}</div>${inner}</div></div>`;
  }).join("");
  const any=items.filter(i=>!used.has(i));
  const T=Object.entries(state.todos);
  const tToday=T.filter(([,t])=>t.date===ds).sort(byCreated);
  const tWeek=T.filter(([,t])=>t.week===wk&&!t.date).sort(byCreated);
  const tCarry=T.filter(([,t])=>t.week<wk&&(!t.doneAt||iso(new Date(t.doneAt))===ds)).sort(byCreated);
  const all=[...items.map(i=>!!checkedAt(i.store,i.doc,i.key)),...tToday.map(([,t])=>!!t.doneAt)];
  const done=all.filter(Boolean).length;
  return `<div class="bar"><h1>${DOWL[dw]}, ${MONTHS[now.getMonth()]} ${now.getDate()}</h1><span class="muted">${dayTitle(dw,now)}</span></div>
  <div class="today">
    <section class="blocks" aria-label="Today's schedule">${blocks}</section>
    <div class="side">
      <section class="panel"><div class="bar"><h2>Today</h2><span class="count">${done} of ${all.length} done</span></div>${meter(done,all.length)}
        ${any.length?`<span class="grp-h">Anytime today</span><div class="list">${any.map(i=>itemRow(i)).join("")}</div>`:""}</section>
      <section class="panel"><h2>To-dos</h2>
        <span class="grp-h">Today</span>${todosList(tToday,now,"Nothing set for today. Add one above.")}
        <span class="grp-h">This week, any day</span>${todosList(tWeek,now,"Nothing else this week.")}
        ${tCarry.length?`<span class="grp-h">Carried over</span>${todosList(tCarry,now,"")}`:""}
      </section>
    </div>
  </div>`;
}

let weekOff=0;
function renderWeek(){
  const today=new Date(),W=addDays(monday(today),7*weekOff),wk=iso(W),ts=iso(today),T=Object.entries(state.todos);
  const st=weekStats(W),E=addDays(W,6);
  const days=[0,1,2,3,4,5,6].map(i=>{
    const d=addDays(W,i),ds=iso(d),items=itemsFor(d);
    const order=it=>it.kind==="gym"?-1:it.at===null?100:it.at;
    items.sort((a,b)=>order(a)-order(b));
    const td=T.filter(([,t])=>t.date===ds).sort(byCreated);
    return `<article class="day${ds===ts?" is-today":""}"><header><b>${DOW[i]} ${d.getDate()}</b><span>${dayTitle(i,d)}</span></header>
      <div class="list">${items.map(it=>itemRow(it,true)).join("")}${td.map(([id,t])=>todoRow(id,t,today,true)).join("")}</div></article>`;
  }).join("");
  const tWeek=T.filter(([,t])=>t.week===wk&&!t.date).sort(byCreated);
  const tCarry=weekOff===0?T.filter(([,t])=>t.week<wk&&!t.doneAt).sort(byCreated):[];
  return `<div class="bar"><h1>Week of ${short(W)}–${short(E)}</h1>
    <div style="display:flex;gap:6px;flex-wrap:wrap"><button type="button" data-wk="-1" aria-label="Previous week">‹ Prev</button>${weekOff?`<button type="button" data-wk="0">This week</button>`:""}<button type="button" data-wk="1" aria-label="Next week">Next ›</button></div></div>
  <section class="panel"><div class="bar"><span class="muted">Gym ${st.gym} of ${st.gymT} · ${isoWeekNo(W)%2===0?"Push Tuesday, Pull Thursday":"Pull Tuesday, Push Thursday"}</span><span class="count">${st.done} of ${st.total} done</span></div>${meter(st.done,st.total)}
    <p class="note"><i class="kd gym"></i>Gym <i class="kd chore" style="margin-left:10px"></i>Every week <i class="kd rot" style="margin-left:10px"></i>Rotation <i class="kd todo" style="margin-left:10px"></i>To-do</p></section>
  <div class="days">${days}</div>
  <div class="two">
    <section class="panel"><h2>Any day this week</h2>${todosList(tWeek,today,"No undated to-dos for this week.")}</section>
    ${weekOff===0?`<section class="panel"><h2>Carried over</h2>${todosList(tCarry,today,"Nothing left over from earlier weeks.")}</section>`:""}
  </div>`;
}

let monthOff=0;
function renderChores(){
  const today=new Date(),M=new Date(today.getFullYear(),today.getMonth()+monthOff,1),m=M.getMonth()+1,mon=ymOf(M),name=MONTHS[m-1];
  const curN=monthOff===0?(today.getDate()>28?5:Math.ceil(today.getDate()/7)):0;
  const label={Wed:"Wednesday evening",Sat:"Saturday morning",Sun:"Sunday"};
  let done=0,total=0;
  const weeks=ROT.map(w=>{
    const its=w.items.filter(it=>inMonth(it[3],m));
    const mins=its.reduce((a,it)=>a+it[2],0);
    let h=`<article class="wk${w.n===curN?" current":""}"><header><span class="tag">Week ${w.n} · ${name.slice(0,3)} ${(w.n-1)*7+1}–${w.n*7}</span><h3>${w.title}</h3><span class="min" style="margin:0">About ${Math.round(mins/5)*5} min of extra work</span></header>`;
    ["Wed","Sat","Sun"].forEach(k=>{
      const g=its.filter(it=>it[0]===k);if(!g.length)return;
      h+=`<div class="grp"><span class="grp-h">${label[k]}</span>${g.map(it=>{const key=`w${w.n}:${it.slug}`;total++;if(checkedAt("months",mon,key))done++;return itemRow({store:"months",doc:mon,key,text:it[1],mins:it[2],seasonal:!!it[3]})}).join("")}</div>`;
    });
    return h+"</article>";
  }).join("");
  const once=ONCE.map(t=>itemRow({store:"meta",doc:"once",key:"once:"+slug(t),text:t})).join("");
  const year=MONTHS.map((nm,mi)=>{
    const list=[];ROT.forEach(w=>w.items.forEach(it=>{if(it[3]&&it[3].includes(mi+1))list.push([w.n,it])}));
    const mins=list.reduce((a,[,it])=>a+it[2],0);
    return `<div class="mo${mi===today.getMonth()?" current":""}"><h3>${nm}<span>${list.length?`+${mins} min`:""}</span></h3>${list.length?`<ul>${list.map(([n,it])=>`<li><b>Wk ${n}</b><span>${esc(it[1])}</span></li>`).join("")}</ul>`:`<p class="empty" style="margin-top:6px">Nothing extra.</p>`}</div>`;
  }).join("");
  return `<div class="bar"><h1>${name} rotation</h1>
    <div style="display:flex;gap:6px;flex-wrap:wrap"><button type="button" data-mo="-1" aria-label="Previous month">‹ Prev</button>${monthOff?`<button type="button" data-mo="0">This month</button>`:""}<button type="button" data-mo="1" aria-label="Next month">Next ›</button></div></div>
  <section class="panel"><div class="bar"><span class="muted">Week 1 is the 1st–7th, Week 2 the 8th–14th, and so on. The 29th–31st are catch-up days.</span><span class="count">${done} of ${total} done</span></div>${meter(done,total)}</section>
  <div class="weeks">${weeks}</div>
  <div class="two">
    <section><h2>Every week</h2>
      <ul class="ref">
        <li><span class="kk">Daily</span><span>Dishes or load the dishwasher, wipe kitchen counters, 10-minute tidy.</span></li>
        <li><span class="kk">Wednesday</span><span>Groceries, meal prep for Thursday to Saturday, then a kitchen reset and a quick wipe of your bathroom.</span></li>
        <li><span class="kk">Thursday</span><span>Garbage, recycling and green bin to the curb before the gym, for Friday pickup.</span></li>
        <li><span class="kk">Saturday</span><span>Vacuum, mop, your bathrooms, flush the guest toilet and run its taps, then the week's focus area. Lawn from April to October.</span></li>
        <li><span class="kk">Sunday</span><span>Plan the week, laundry and towels, meal prep for Monday to Wednesday, kitchen cleanup.</span></li>
        <li><span class="kk">Dec–Mar</span><span>After each snowfall, shovel and salt the driveway, walk and steps. Keep the furnace and dryer vents outside clear.</span></li>
      </ul>
      <h2 style="margin-top:12px">When guests stay</h2>
      <ul class="ref">
        <li><span class="kk">Before</span><span>Fresh sheets, towels out, guest bathroom cleaned top to bottom, toilet paper and soap stocked, quick vacuum and dust of their room. About 45 min, the day before.</span></li>
        <li><span class="kk">After</span><span>Wash the guest sheets and towels, clean the guest bathroom, empty the bins, remake the bed.</span></li>
      </ul>
    </section>
    <section><h2>One-time setup</h2><p class="note">Do these once, then they stay done.</p><div class="list">${once}</div></section>
  </div>
  <section style="display:grid;gap:12px"><h2>Year at a glance</h2><div class="year">${year}</div></section>`;
}

function renderHistory(){
  const today=new Date(),cur=monday(today),S=startWeek();
  const rows=[];
  for(let k=0;k<12;k++){const W=addDays(cur,-7*k);if(W<S)break;rows.push([W,weekStats(W)])}
  const cs=weekStats(cur);
  const mon=ymOf(today),m=today.getMonth()+1;let rd=0,rt=0;
  ROT.forEach(w=>w.items.forEach(it=>{if(!inMonth(it[3],m))return;rt++;if(checkedAt("months",mon,`w${w.n}:${it.slug}`))rd++}));
  const streaks=GROUPS.map(g=>({name:g.name,...streak(g,today)})).filter(s=>s.n>=2).sort((a,b)=>b.n-a.n).slice(0,8);
  const slip=slipping(today);
  const pct=s=>s.total?Math.round(s.done/s.total*100):0;
  return `<div class="bar"><h1>History</h1><span class="muted">Tracking since the week of ${short(S)}</span></div>
  <div class="tiles">
    <div class="tile"><b>${pct(cs)}%</b><span>This week so far (${cs.done} of ${cs.total})</span></div>
    <div class="tile"><b>${cs.gym} of ${cs.gymT}</b><span>Gym sessions this week</span></div>
    <div class="tile"><b>${rd} of ${rt}</b><span>${MONTHS[m-1]} rotation items done</span></div>
  </div>
  <section class="panel"><h2>Weekly completion</h2>
    <div class="hrows">${rows.map(([W,s],i)=>`<div class="hrow${i===0?" cur":""}"><span class="w">${i===0?"This week":short(W)}</span>${meter(s.done,s.total)}<span class="p">${pct(s)}%</span><span class="g">Gym ${s.gym}/${s.gymT}</span></div>`).join("")}</div>
    ${rows.length<2?`<p class="note">Past weeks appear here as you use the app. Everything counts: every-week chores, rotation items, gym sessions and to-dos.</p>`:""}
  </section>
  <div class="two">
    <section class="panel"><h2>Streaks</h2>${streaks.length?`<ul class="rank">${streaks.map(s=>`<li><span>${esc(s.name)}</span><b>${s.n} ${s.unit}</b></li>`).join("")}</ul>`:`<p class="empty">No streaks yet. Anything you do two weeks in a row (two days for the daily tidy) shows up here.</p>`}</section>
    <section class="panel"><h2>Keeps slipping</h2>${slip.length?`<ul class="rank">${slip.map(s=>`<li><span>${esc(s.name)}</span><b>missed ${s.missed} of ${s.of}</b></li>`).join("")}</ul>`:`<p class="empty">Nothing missed more than half the time over the last 8 finished weeks.</p>`}</section>
  </div>`;
}

let view="today";
function render(){
  const a=document.activeElement,fid=a&&a.id&&a.closest&&a.closest("#view")?a.id:null;
  document.querySelectorAll(".tab").forEach(t=>t.setAttribute("aria-selected",String(t.dataset.view===view)));
  if(mode==="signedout"){
    document.getElementById("add").hidden=true;
    document.getElementById("view").innerHTML=`<section class="panel gate"><h1>Sign in to your week</h1><p class="note">Your schedule, chores and to-dos are saved to your account, so they match on every device.</p><div><button type="button" id="signin" class="primary">Sign in with Google</button></div><p class="note" id="gate-msg" role="status"></p></section>`;
    return;
  }
  document.getElementById("add").hidden=!(view==="today"||view==="week");
  document.getElementById("view").innerHTML=`<div style="display:grid;gap:20px">${{today:renderToday,week:renderWeek,chores:renderChores,history:renderHistory}[view]()}</div>`;
  if(fid){const el=document.getElementById(fid);if(el)el.focus()}
}
function fillWhen(){
  const today=new Date(),sel=document.getElementById("add-when"),W=monday(today),opts=[[`d:${iso(today)}`,"Today"],[`d:${iso(addDays(today,1))}`,"Tomorrow"]];
  for(let i=dowOf(today)+2;i<7;i++)opts.push([`d:${iso(addDays(W,i))}`,DOWL[i]]);
  opts.push([`w:${iso(W)}`,"Any day this week"],[`w:${iso(addDays(W,7))}`,"Next week"]);
  const prev=sel.value;sel.innerHTML=opts.map(([v,l])=>`<option value="${v}">${l}</option>`).join("");
  if(opts.some(o=>o[0]===prev))sel.value=prev;
}

document.addEventListener("change",e=>{
  const t=e.target;
  if(t.dataset&&t.dataset.k!==undefined)toggle(t.dataset.s,t.dataset.d,t.dataset.k,t.checked);
  else if(t.dataset&&t.dataset.todo!==undefined)toggleTodo(t.dataset.todo,t.checked);
});
document.addEventListener("click",e=>{
  const b=e.target.closest("button");if(!b)return;
  if(b.id==="signin")signIn();
  else if(b.id==="signout"){if(fb)fb.A.signOut(fb.auth)}
  else if(b.dataset.view){view=b.dataset.view;try{history.replaceState(null,"","#"+view)}catch(_){}render()}
  else if(b.dataset.del!==undefined)delTodo(b.dataset.del);
  else if(b.dataset.wk!==undefined){weekOff=b.dataset.wk==="0"?0:weekOff+Number(b.dataset.wk);render()}
  else if(b.dataset.mo!==undefined){monthOff=b.dataset.mo==="0"?0:monthOff+Number(b.dataset.mo);render()}
});
document.getElementById("add").addEventListener("submit",e=>{
  e.preventDefault();const inp=document.getElementById("add-title"),v=inp.value.trim();if(!v)return;
  addTodo(v,document.getElementById("add-when").value);inp.value="";inp.focus();
});

const h=(location.hash||"").slice(1);if(["today","week","chores","history"].includes(h))view=h;
let lastDay=iso(new Date());
setInterval(()=>{const d=iso(new Date());if(d!==lastDay){lastDay=d;fillWhen()}if(!document.getElementById("view").contains(document.activeElement))render()},60000);
fillWhen();setStatus();render();init();
if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
