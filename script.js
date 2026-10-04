/* ============================================================
   STORAGE — tries localStorage, falls back to in-memory silently
   ============================================================ */
const memStore = {};
const storage = {
  get(k){ try{ const v = localStorage.getItem(k); return v===null ? null : v; }catch(e){ return memStore[k] ?? null; } },
  set(k,v){ try{ localStorage.setItem(k,v); }catch(e){ memStore[k]=v; } }
};

/* ============================================================
   ACTION DATABASE
   ============================================================ */
const ACTIONS = [
  // ---- AIR ----
  {id:'burn-trash', type:'air', title:'Burning household garbage or plastic', kw:['burning trash','burning garbage','burn plastic','open burning','burning waste','burn rubbish'],
   cause:'Open burning releases dense particulate matter and, when plastic is involved, dioxins and furans — with none of the filtration a proper incinerator or landfill provides.',
   prevent:['Segregate wet and dry waste and hand it to municipal collection instead of burning it','Compost kitchen and garden waste rather than burning it','Take recyclables (plastic, paper, metal) to a recycling point']},
  {id:'car-idle', type:'air', title:'Leaving a car engine idling', kw:['car idle','idling engine','engine running parked','warming up car'],
   cause:'An idling engine burns fuel while going nowhere, releasing CO, NOx and fine particulates for zero distance travelled.',
   prevent:['Switch off the engine if you\'ll be stopped more than ~30 seconds','Keep the engine serviced — a well-tuned engine burns cleaner','Carpool or combine short trips to cut total idle time']},
  {id:'firecrackers', type:'air', title:'Bursting firecrackers', kw:['firecrackers','fireworks','bursting crackers','diwali crackers'],
   cause:'Fireworks release sulfur compounds and a dense burst of particulate matter that can spike a city\'s air quality index for days afterward.',
   prevent:['Choose certified low-emission "green" crackers where available','Celebrate with lights, music or community events instead','Keep any use short, and away from hospitals and residential clusters']},
  {id:'stubble-burning', type:'air', title:'Burning crop stubble after harvest', kw:['stubble burning','crop residue burning','burning fields','burning straw'],
   cause:'Field burning sends dense smoke and particulate matter across entire regions, a major driver of seasonal smog downwind of farmland.',
   prevent:['Use residue as mulch or turn it into biochar/compost','Use a "happy seeder" or similar machine to sow through stubble','Explore government buy-back or subsidy schemes for residue']},
  {id:'diesel-generator', type:'air', title:'Running a diesel generator often', kw:['diesel generator','genset','backup generator','power cut generator'],
   cause:'Diesel gensets emit soot and NOx at a much higher rate than the grid power they replace, especially when poorly maintained.',
   prevent:['Reserve the generator for genuine outages, not convenience','Have it serviced on schedule to keep combustion efficient','Consider a solar or battery backup for regular short outages']},
  {id:'indoor-woodfire', type:'air', title:'Cooking over wood or coal indoors', kw:['wood stove','cooking on coal','chulha','indoor cooking fire'],
   cause:'Solid-fuel indoor cooking is one of the most concentrated personal air-pollution exposures that exists, especially without ventilation.',
   prevent:['Switch to LPG, biogas or an induction stove where possible','Cook near a window or under a vented hood','Ask about local clean-cookstove subsidy programmes']},
  {id:'drive-short-trip', type:'air', title:'Driving for very short trips', kw:['short car trip','drive instead of walk','drive to nearby shop'],
   cause:'Short trips rarely let an engine reach efficient operating temperature, so emissions per kilometre are higher than on a longer drive.',
   prevent:['Walk or cycle for trips under ~2 km when it\'s safe to do so','Use public transit where it covers the route','Batch errands into a single longer trip instead of several short ones']},
  {id:'spray-paint', type:'air', title:'Spray painting indoors without ventilation', kw:['spray paint','painting indoors','aerosol spray'],
   cause:'Aerosol paints release volatile organic compounds (VOCs) that build up quickly in an unventilated room.',
   prevent:['Paint outdoors or in a well-ventilated space','Choose water-based, low-VOC paints where available','Wear a proper respirator mask for larger jobs']},
  {id:'leaf-burning', type:'air', title:'Burning fallen leaves or yard waste', kw:['burning leaves','yard waste burning','garden waste fire'],
   cause:'Smouldering leaf piles burn incompletely, producing a smoky, particulate-heavy plume close to ground level.',
   prevent:['Compost leaves into mulch instead','Use municipal green-waste collection if available','Mow leaves into the lawn as natural fertiliser']},
  {id:'old-vehicle', type:'air', title:'Driving a poorly maintained vehicle', kw:['old car emissions','unserviced vehicle','smoky exhaust','puc certificate'],
   cause:'A poorly tuned engine burns fuel incompletely, multiplying particulate and CO output compared with a well-maintained one.',
   prevent:['Get regular servicing and emissions checks','Renew your Pollution Under Control (PUC) certificate on schedule','Replace worn air filters, which restore combustion efficiency']},

  // ---- WATER ----
  {id:'cooking-oil-drain', type:'water', title:'Pouring used cooking oil down the drain', kw:['cooking oil down sink','pour oil drain','grease down sink'],
   cause:'Oil solidifies inside pipes and, once it reaches a water body, forms a film that blocks oxygen exchange for aquatic life.',
   prevent:['Cool the oil and pour it into a sealed container for the bin','Check if your area has a used-oil recycling drop-off','Never rinse an oily pan straight into an open drain']},
  {id:'chemicals-sink', type:'water', title:'Pouring paint or chemicals down the sink', kw:['paint down sink','chemicals down drain','pesticide disposal sink'],
   cause:'Most household drains lead to treatment systems that are not built to fully filter out solvents, paint, or pesticide residue.',
   prevent:['Take leftover paint and chemicals to a hazardous-waste facility','Buy only the quantity you need for a job','Rinse containers into absorbent material (like sand), not water']},
  {id:'overfertilise', type:'water', title:'Over-fertilising a lawn or garden', kw:['too much fertiliser','over fertilizing garden','excess pesticide'],
   cause:'Excess nitrogen and phosphorus wash off with the next rain and feed algal blooms downstream, which then strip oxygen from the water as they decay.',
   prevent:['Follow the recommended dosage on the label, not more','Switch to compost or organic feed where practical','Leave an unfertilised buffer strip near any drain or waterway']},
  {id:'litter-waterway', type:'water', title:'Littering near a river, lake or beach', kw:['littering beach','trash near river','dumping near lake'],
   cause:'Litter left near water is one storm away from being carried straight into the waterway, where it breaks down into microplastics over years.',
   prevent:['Carry litter out with you — always','Join or organise a local shoreline clean-up','Use a bin with a lid so wind can\'t carry litter off']},
  {id:'single-use-plastic', type:'water', title:'Using single-use plastic bottles or bags', kw:['plastic bottle', 'single use plastic', 'plastic bag'],
   cause:'A large share of ocean plastic starts as single-use packaging that never gets captured by collection systems.',
   prevent:['Carry a reusable bottle and bag as a default habit','Choose products with minimal or recyclable packaging','Support local refill or bulk-buy stores where available']},
  {id:'flush-medicine', type:'water', title:'Flushing old medicine or wet wipes', kw:['flush medicine','flushing wipes','flush pills toilet'],
   cause:'Flushed pharmaceuticals pass through many treatment plants largely intact, and wipes contribute to blockages and microplastic residue.',
   prevent:['Return unused medicine to a pharmacy take-back programme','Bin wipes and medication instead of flushing them','Check packaging for proper disposal instructions']},
  {id:'car-wash-street', type:'water', title:'Washing a car on the street with a hose', kw:['washing car street','hose car wash driveway'],
   cause:'Soap, oil residue and grime rinse straight into storm drains, which in most cities flow to a waterway without treatment.',
   prevent:['Wash on grass so runoff filters through soil','Use a commercial car wash that recycles its water','Choose a biodegradable, phosphate-free soap']},
  {id:'industrial-effluent', type:'water', title:'Discharging industrial effluent untreated', kw:['industrial effluent','factory waste water','untreated discharge'],
   cause:'Untreated effluent can carry heavy metals and toxins directly into rivers, a classic and heavily regulated point-source of contamination.',
   prevent:['Install and maintain an effluent treatment plant (ETP)','Monitor discharge against regulatory limits regularly','Explore closed-loop water reuse within the facility']},
  {id:'running-tap', type:'water', title:'Leaving the tap running unnecessarily', kw:['tap running','wasting water','leaving faucet on'],
   cause:'Wasted fresh water adds pressure to treatment and supply systems that are already stretched, especially in water-stressed regions.',
   prevent:['Turn the tap off while brushing teeth or soaping up','Fix dripping taps promptly — they add up fast','Install a low-flow aerator on frequently used taps']},
  {id:'excess-detergent', type:'water', title:'Overusing detergents or phosphate soaps', kw:['too much detergent','phosphate soap','excess soap laundry'],
   cause:'Phosphate-heavy detergents are a direct feedstock for the same algal blooms that fertiliser runoff causes.',
   prevent:['Use phosphate-free, biodegradable detergents','Measure doses instead of guessing — most people overuse it','Run full loads rather than frequent small ones']},
  {id:'construction-debris-water', type:'water', title:'Dumping construction debris near water', kw:['construction debris river','dumping rubble near water'],
   cause:'Loose debris and sediment smother riverbeds and reduce the light and oxygen aquatic plants and fish depend on.',
   prevent:['Dispose of debris only at designated sites','Use silt fencing on any site near a waterway','Cover exposed soil piles before heavy rain']},

  // ---- SOUND ----
  {id:'honking', type:'sound', title:'Honking the horn unnecessarily', kw:['honking horn','car horn traffic','unnecessary honking'],
   cause:'A single horn blast reads close to 90 decibels — chronic honking is one of the largest contributors to urban noise pollution.',
   prevent:['Reserve the horn for genuine safety alerts','Support and respect posted no-honking zones','Allow a little extra travel time so patience costs less']},
  {id:'loud-music-night', type:'sound', title:'Playing loud music or speakers late at night', kw:['loud music night','loudspeaker late night','party noise'],
   cause:'The WHO recommends keeping night-time ambient noise under 30 dB for restful sleep — loud speakers after dark can push neighbours well past that.',
   prevent:['Switch to headphones after quiet hours begin','Keep speaker volume down and facing indoors','Check local noise ordinances for permitted hours']},
  {id:'firecrackers-noise', type:'sound', title:'Bursting firecrackers near homes', kw:['loud firecrackers','crackers noise','fireworks noise pets'],
   cause:'Firework bursts can exceed 140 dB, well past the pain threshold, and are especially distressing for infants, the elderly, and animals.',
   prevent:['Choose lower-decibel "silent" or green crackers','Set them off away from residential blocks, hospitals and shelters','Warn neighbours in advance so pets can be moved indoors']},
  {id:'construction-odd-hours', type:'sound', title:'Running construction machinery at odd hours', kw:['construction noise night','machinery early morning noise'],
   cause:'Heavy equipment run outside permitted hours turns an unavoidable daytime nuisance into a chronic sleep-disrupting one.',
   prevent:['Schedule loud work within locally permitted daytime hours','Use noise barriers or enclosures around fixed equipment','Maintain machinery — worn parts run louder than serviced ones']},
  {id:'revving-engine', type:'sound', title:'Revving engines or modified exhausts', kw:['revving engine','loud exhaust','modified silencer'],
   cause:'Modified exhausts can push a motorcycle or car well past standard limits in short, sharp bursts that carry far in quiet streets.',
   prevent:['Keep exhaust systems stock or within legal limits','Avoid revving in residential areas, especially at night','Report persistent offenders to local traffic enforcement']},
  {id:'loudspeaker-event', type:'sound', title:'Running loudspeakers for events or announcements', kw:['loudspeaker event','public announcement noise','festival speakers'],
   cause:'Event speakers often run for hours at levels that exceed residential decibel limits, well beyond what the WHO calls harmful.',
   prevent:['Use directional speakers aimed away from housing','Set a volume cap and a firm end time in advance','Choose venues buffered from residential blocks']},
  {id:'leaf-blower', type:'sound', title:'Using a leaf blower or power tool at high volume', kw:['leaf blower noise','power tool loud','lawn mower noise'],
   cause:'Two-stroke leaf blowers and mowers commonly run near 90 dB, the same range as a subway train, for extended stretches.',
   prevent:['Choose quieter electric or battery-powered tools','Limit use to reasonable daytime hours','Use ear protection if you\'re the one operating it']},
  {id:'loud-tv-shared', type:'sound', title:'Playing TV or audio too loud in shared housing', kw:['tv too loud apartment','loud speaker shared wall'],
   cause:'Sound carries further through shared walls and floors than most people expect, turning a personal choice into a neighbour\'s disruption.',
   prevent:['Use headphones during late hours','Keep bass-heavy audio low — low frequencies travel through walls easiest','Add a rug or soft furnishing to dampen sound transfer']},
  {id:'industrial-noise', type:'sound', title:'Running industrial machinery without soundproofing', kw:['factory noise','industrial machinery loud','workshop noise'],
   cause:'Continuous machinery noise above 85 dB risks hearing damage for workers and nearby residents alike over time.',
   prevent:['Install acoustic enclosures around the loudest equipment','Provide and enforce ear protection for workers','Schedule the loudest processes away from residential hours']},
];

/* ============================================================
   TIER SYSTEM
   ============================================================ */
const TIERS = [
  {min:0,   label:'🌱 Beginner'},
  {min:100, label:'🌿 Eco Helper'},
  {min:250, label:'🌳 Green Guardian'},
  {min:450, label:'🏆 Pollution Fighter'}
];
const BADGE_TIERS = [0,100,250,450];

/* ============================================================
   STATE
   ============================================================ */
let state = {
  points: parseInt(storage.get('sig_points') || '0', 10),
  logged: JSON.parse(storage.get('sig_logged') || '[]'),
  streak: parseInt(storage.get('sig_streak') || '0', 10),
  lastVisit: storage.get('sig_lastvisit') || null,
  history: JSON.parse(storage.get('sig_history') || '[]')
};

function todayStr(){ return new Date().toISOString().slice(0,10); }

function bumpStreak(){
  const today = todayStr();
  if(state.lastVisit === today) return; // already counted today
  const y = new Date(); y.setDate(y.getDate()-1);
  const yesterday = y.toISOString().slice(0,10);
  if(state.lastVisit === yesterday){ state.streak += 1; }
  else if(state.lastVisit !== today){ state.streak = state.streak===0 ? 1 : 1; }
  state.lastVisit = today;
  storage.set('sig_streak', String(state.streak));
  storage.set('sig_lastvisit', state.lastVisit);
}

function saveState(){
  storage.set('sig_points', String(state.points));
  storage.set('sig_logged', JSON.stringify(state.logged));
  storage.set('sig_history', JSON.stringify(state.history));
}

function currentTier(pts){
  let t = TIERS[0];
  for(const tier of TIERS){ if(pts >= tier.min) t = tier; }
  return t;
}
function nextTier(pts){
  return TIERS.find(t => t.min > pts) || null;
}

/* ============================================================
   RENDER DASHBOARD
   ============================================================ */
function renderDashboard(){
  document.getElementById('navPts').textContent = state.points;
  document.getElementById('dashPts').firstChild.textContent = state.points;
  document.getElementById('tierBadge').textContent = currentTier(state.points).label;
  document.getElementById('streakNum').textContent = state.streak;
  document.getElementById('loggedCount').textContent = state.logged.length;

  const nt = nextTier(state.points);
  const prevMin = currentTier(state.points).min;
  const span = nt ? (nt.min - prevMin) : 1;
  const progressed = nt ? (state.points - prevMin) : span;
  const pct = Math.min(100, Math.round((progressed/span)*100));
  document.getElementById('progFill').style.width = pct + '%';
  document.getElementById('progNow').textContent = state.points + ' pts';
  document.getElementById('progNext').textContent = nt ? ('Next tier at ' + nt.min) : 'Top tier reached';

  // most-fixed front
  const counts = {air:0, water:0, sound:0};
  state.history.forEach(h => { if(counts[h.type]!==undefined) counts[h.type]++; });
  const lead = Object.entries(counts).sort((a,b)=>b[1]-a[1])[0];
  document.getElementById('typeLead').textContent = (lead && lead[1]>0) ? (lead[0][0].toUpperCase()+lead[0].slice(1)) : '—';

  // badges
  document.querySelectorAll('.badge').forEach(b=>{
    const tier = parseInt(b.dataset.tier,10);
    b.classList.toggle('unlocked', state.points >= tier);
  });

  // log list
  const list = document.getElementById('logList');
  if(state.history.length === 0){
    list.innerHTML = '<li style="color:var(--ink-soft); border-bottom:none;">Nothing logged yet — search above and hit "Log this fix."</li>';
  } else {
    list.innerHTML = state.history.slice().reverse().slice(0,12).map(h =>
      `<li><span class="lname">${h.title}</span><span class="lpts">+${h.pts}</span></li>`
    ).join('');
  }

  // gauge
  updateGauge();
}

function updateGauge(){
  const n = Math.min(state.history.length, 10);
  const pct = n/10; // 0..1
  const angleDeg = -90 + (pct*180); // -90 (left) to +90 (right)
  document.getElementById('gaugeNeedle').style.transform = `rotate(${angleDeg}deg)`;
  const colors = ['#C64545','#E17B3D','#E4B93B','#4C9A6A'];
  const arc = document.getElementById('gaugeArc');
  const dash = 283 - (pct*283*0.9);
  arc.setAttribute('stroke-dashoffset', dash);
  let color = colors[0];
  if(pct>0.75) color = colors[3]; else if(pct>0.4) color = colors[2]; else if(pct>0.15) color = colors[1];
  arc.setAttribute('stroke', color);
  const labels = ['Unread','Faint','Reading','Improving','Clear'];
  const idx = Math.min(4, Math.floor(pct*5));
  document.getElementById('gaugeNum').textContent = state.history.length===0 ? 'Unread' : labels[idx];
}

/* ============================================================
   TOAST
   ============================================================ */
let toastTimer;
function showToast(msg){
  const t = document.getElementById('toast');
  document.getElementById('toastText').textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> t.classList.remove('show'), 2600);
}

/* ============================================================
   SEARCH
   ============================================================ */
const typeMeta = {
  air:{label:'Air Pollution', color:'air'},
  water:{label:'Water Pollution', color:'water'},
  sound:{label:'Sound Pollution', color:'sound'}
};

function scoreMatch(action, q){
  q = q.toLowerCase().trim();
  if(!q) return 0;
  let score = 0;
  if(action.title.toLowerCase().includes(q)) score += 3;
  action.kw.forEach(k => { if(k.includes(q) || q.includes(k)) score += 2; });
  q.split(/\s+/).forEach(word=>{
    if(word.length<3) return;
    if(action.title.toLowerCase().includes(word)) score += 1;
    action.kw.forEach(k=>{ if(k.includes(word)) score += 1; });
  });
  return score;
}

function search(q){
  return ACTIONS.map(a => ({a, s:scoreMatch(a,q)}))
    .filter(x=>x.s>0)
    .sort((x,y)=>y.s-x.s)
    .map(x=>x.a);
}

function renderSuggestions(q){
  const box = document.getElementById('suggestions');
  if(!q){ box.innerHTML=''; return; }
  const results = search(q).slice(0,6);
  if(results.length===0){ box.innerHTML=''; return; }
  box.innerHTML = results.map(r =>
    `<div class="sugg-item" data-id="${r.id}"><span>${r.title}</span><span class="tag result-tag ${r.type}">${r.type}</span></div>`
  ).join('');
  box.querySelectorAll('.sugg-item').forEach(el=>{
    el.addEventListener('click', ()=>{
      document.getElementById('searchInput').value = ACTIONS.find(a=>a.id===el.dataset.id).title;
      box.innerHTML='';
      renderResult(el.dataset.id);
    });
  });
}

function renderResult(id){
  const a = ACTIONS.find(x=>x.id===id);
  const area = document.getElementById('resultArea');
  if(!a){
    area.innerHTML = `<p class="empty-note">No exact match yet — try a simpler word, like "horn", "plastic", or "oil". This index covers ${ACTIONS.length} everyday actions and keeps growing.</p>`;
    return;
  }
  const already = state.logged.includes(a.id);
  const meta = typeMeta[a.type];
  area.innerHTML = `
    <div class="result-card ${a.type}">
      <span class="result-tag ${a.type}">${meta.label}</span>
      <h3>${a.title}</h3>
      <p class="cause">${a.cause}</p>
      <h5>How to prevent it</h5>
      <ul class="prevlist">
        ${a.prevent.map(p=>`<li><span class="check">✓</span><span>${p}</span></li>`).join('')}
      </ul>
      <div class="result-foot">
        <button class="logbtn" id="logBtn" ${already ? 'disabled' : ''}>
          ${already ? 'Already logged ✓' : 'Log this fix · +10 pts'}
        </button>
        ${already ? '<span class="logged-note">You\'ve already banked this one — try another action.</span>' : ''}
      </div>
    </div>
  `;
  if(!already){
    document.getElementById('logBtn').addEventListener('click', ()=> logAction(a));
  }
}

function logAction(a){
  bumpStreak();
  const isNew = !state.logged.includes(a.id);
  const pts = isNew ? 10 : 2;
  state.points += pts;
  if(isNew) state.logged.push(a.id);
  state.history.push({id:a.id, title:a.title, type:a.type, pts});
  saveState();
  renderDashboard();
  showToast(`Logged: ${a.title} · +${pts} pts`);
  renderResult(a.id);
  document.getElementById('resultArea').scrollIntoView({behavior:'smooth', block:'nearest'});
}

/* wire up search inputs */
const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', (e)=> renderSuggestions(e.target.value));
searchInput.addEventListener('keydown', (e)=>{
  if(e.key==='Enter'){
    document.getElementById('suggestions').innerHTML='';
    const results = search(e.target.value);
    renderResult(results.length ? results[0].id : null);
  }
});
document.getElementById('searchBtn').addEventListener('click', ()=>{
  document.getElementById('suggestions').innerHTML='';
  const results = search(searchInput.value);
  renderResult(results.length ? results[0].id : null);
});

/* example chips */
const chipExamples = ['burning plastic','car horn','cooking oil down sink','loud music at night','leaf blower','over fertilising'];
document.getElementById('chipRow').innerHTML = chipExamples.map(c=>`<button class="chip" type="button">${c}</button>`).join('');
document.querySelectorAll('.chip').forEach(ch=>{
  ch.addEventListener('click', ()=>{
    searchInput.value = ch.textContent;
    const results = search(ch.textContent);
    renderResult(results.length ? results[0].id : null);
    document.getElementById('search').scrollIntoView({behavior:'smooth', block:'start'});
  });
});

/* click outside suggestions to close */
document.addEventListener('click', (e)=>{
  if(!e.target.closest('.searchbox') && !e.target.closest('#suggestions')){
    document.getElementById('suggestions').innerHTML='';
  }
});

/* ============================================================
   TABS
   ============================================================ */
document.querySelectorAll('.tabbtn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.tabbtn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.tabpanel').forEach(p=>p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('panel-'+btn.dataset.t).classList.add('active');
  });
});
document.querySelectorAll('.frontcard').forEach(card=>{
  card.addEventListener('click', ()=>{
    const t = card.dataset.tab;
    document.querySelectorAll('.tabbtn').forEach(b=>b.classList.toggle('active', b.dataset.t===t));
    document.querySelectorAll('.tabpanel').forEach(p=>p.classList.toggle('active', p.id==='panel-'+t));
    document.getElementById('deepdive').scrollIntoView({behavior:'smooth', block:'start'});
  });
});

/* ============================================================
   GENERIC POINTS AWARD (used by idea / report / cleanup / tip)
   ============================================================ */
function awardPoints(amount, title, type){
  bumpStreak();
  state.points += amount;
  state.history.push({id:'misc-'+Date.now(), title, type: type||'other', pts:amount});
  saveState();
  renderDashboard();
  renderLeaderboard();
  showToast(`${title} · +${amount} pts`);
}
function onceADay(key){
  const today = todayStr();
  const last = storage.get(key);
  if(last === today) return false;
  storage.set(key, today);
  return true;
}

/* ============================================================
   DETERMINISTIC "RANDOM" — same input always gives same demo numbers
   ============================================================ */
function hashStr(s){
  let h = 2166136261;
  for(let i=0;i<s.length;i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function mulberry32(seed){
  return function(){
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function rngFor(name){ return mulberry32(hashStr(name.trim().toLowerCase())); }

/* ============================================================
   CITY / AREA DATABASE (demo data — not a live feed)
   ============================================================ */
const CITY_DB = {
  'delhi':      {aqi:187, water:'Poor',     noise:82, profile:'traffic+industry'},
  'mumbai':     {aqi:132, water:'Moderate', noise:80, profile:'traffic+coastal'},
  'kolkata':    {aqi:158, water:'Poor',     noise:78, profile:'traffic+industry'},
  'ahmedabad':  {aqi:140, water:'Moderate', noise:76, profile:'industry'},
  'nagpur':     {aqi:98,  water:'Good',     noise:68, profile:'moderate'},
  'pune':       {aqi:105, water:'Moderate', noise:74, profile:'traffic'},
  'nashik':     {aqi:88,  water:'Good',     noise:66, profile:'moderate'},
  'hyderabad':  {aqi:96,  water:'Moderate', noise:72, profile:'traffic'},
  'chennai':    {aqi:78,  water:'Moderate', noise:75, profile:'coastal'},
  'bengaluru':  {aqi:72,  water:'Moderate', noise:77, profile:'traffic'},
  'bangalore':  {aqi:72,  water:'Moderate', noise:77, profile:'traffic'},
  'jaipur':     {aqi:150, water:'Moderate', noise:73, profile:'dust+traffic'},
  'lucknow':    {aqi:172, water:'Poor',     noise:79, profile:'traffic+industry'},
  'patna':      {aqi:165, water:'Poor',     noise:77, profile:'traffic'},
  'indore':     {aqi:110, water:'Moderate', noise:70, profile:'moderate'},
  'surat':      {aqi:118, water:'Moderate', noise:71, profile:'industry'},
};
const MAIN_CITIES = ['mumbai','pune','nashik','nagpur','delhi','bengaluru','hyderabad','chennai','kolkata','ahmedabad'];
const MORE_CITIES = ['jaipur','lucknow','patna','indore','surat'];

function titleCase(s){ return s.replace(/\b\w/g, c=>c.toUpperCase()); }

function aqiMeta(aqi){
  if(aqi<=50) return {label:'Good', cls:'status-good', color:'var(--aqi-good)'};
  if(aqi<=100) return {label:'Moderate', cls:'status-moderate', color:'var(--aqi-moderate)'};
  if(aqi<=150) return {label:'Poor', cls:'status-poor', color:'var(--aqi-unhealthy)'};
  if(aqi<=200) return {label:'Very Poor', cls:'status-verypoor', color:'var(--aqi-unhealthy)'};
  return {label:'Severe', cls:'status-severe', color:'var(--aqi-severe)'};
}
function waterMeta(w){
  const m = {Good:{cls:'status-good'}, Moderate:{cls:'status-moderate'}, Poor:{cls:'status-poor'}};
  return m[w] || m.Moderate;
}
function noiseMeta(db){
  if(db<65) return {label:'Calm', cls:'status-good'};
  if(db<75) return {label:'Elevated', cls:'status-moderate'};
  if(db<85) return {label:'High', cls:'status-poor'};
  return {label:'Very High', cls:'status-verypoor'};
}

function getProfile(query){
  const key = query.trim().toLowerCase();
  if(CITY_DB[key]) return {name: titleCase(key), verified:true, ...CITY_DB[key]};
  // deterministic demo generation for any other search term
  const r = rngFor(key || 'unknown');
  const aqi = Math.round(55 + r()*160);
  const waters = ['Good','Moderate','Poor'];
  const water = waters[Math.floor(r()*3)];
  const noise = Math.round(58 + r()*32);
  const profiles = ['traffic','industry','moderate','dust+traffic','traffic+industry'];
  const profile = profiles[Math.floor(r()*profiles.length)];
  return {name: query.trim() ? titleCase(query.trim()) : 'Your area', verified:false, aqi, water, noise, profile};
}

function pm25FromAqi(aqi){ return Math.max(4, Math.round(aqi*0.42)); }
function pm10FromAqi(aqi){ return Math.max(8, Math.round(aqi*0.62)); }

function whyFactors(profile){
  const map = {
    'traffic': ['🚗 Heavy traffic through the day'],
    'industry': ['🏭 Nearby industrial activity'],
    'traffic+industry': ['🚗 Heavy traffic', '🏭 Nearby industries'],
    'traffic+coastal': ['🚗 Heavy traffic', '🌊 Humid coastal air trapping particulates'],
    'coastal': ['🌊 Coastal humidity affecting dispersal'],
    'dust+traffic': ['🏗️ Construction dust', '🚗 Heavy traffic'],
    'moderate': ['🚗 Moderate traffic', '🗑️ Some waste burning nearby'],
  };
  const base = map[profile.profile] || map.moderate;
  const extra = [];
  if(profile.aqi>140) extra.push('🗑️ Waste burning/dumping in the area');
  if(profile.noise>78) extra.push('🔊 High traffic noise through peak hours');
  return base.concat(extra);
}

function personalSuggestion(profile){
  const a = aqiMeta(profile.aqi);
  if(profile.aqi>150) return 'Today, try avoiding long outdoor workouts near busy roads — and keep a mask handy if you need to be out for a while.';
  if(profile.aqi>100) return "Air's a bit rough today. Fine for most errands, but maybe skip the outdoor run.";
  if(profile.noise>78) return 'Noise is running high here — avoid lingering near heavy traffic and keep unnecessary honking to a minimum.';
  if(profile.water==='Poor') return "Don't assume water is safe just because it looks clean — stick to properly tested or treated water for drinking.";
  return "Conditions look fairly manageable today — still worth keeping the basics up: don't burn waste, and go easy on the horn.";
}

/* ---- illustration svg per profile ---- */
function illustrationSVG(profile){
  const a = aqiMeta(profile.aqi);
  if(profile.profile.includes('industry')){
    return `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice"><rect width="400" height="300" fill="#EAF3FB"/><rect y="230" width="400" height="70" fill="#CFE6C9"/><rect x="230" y="120" width="130" height="110" fill="#8892A0"/><rect x="255" y="70" width="25" height="60" fill="#8892A0"/><rect x="310" y="50" width="25" height="80" fill="#78828F"/><circle cx="270" cy="55" r="16" fill="#C7CBCF" opacity=".8"/><circle cx="290" cy="35" r="20" fill="#C7CBCF" opacity=".7"/><circle cx="325" cy="30" r="18" fill="#C7CBCF" opacity=".8"/><circle cx="60" cy="70" r="30" fill="${a.color}" opacity=".55"/></svg>`;
  }
  if(profile.profile.includes('coastal')){
    return `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice"><rect width="400" height="300" fill="#EAF3FB"/><rect y="210" width="400" height="90" fill="#2A7F8E" opacity=".35"/><rect y="240" width="400" height="60" fill="#2A7F8E" opacity=".55"/><circle cx="330" cy="55" r="28" fill="${a.color}" opacity=".6"/><path d="M0 220 Q50 205 100 220 T200 220 T300 220 T400 220" stroke="#2A7F8E" stroke-width="4" fill="none" opacity=".5"/></svg>`;
  }
  if(profile.profile.includes('dust')){
    return `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice"><rect width="400" height="300" fill="#F1EADB"/><rect y="230" width="400" height="70" fill="#D9C9A6"/><rect x="60" y="150" width="60" height="80" fill="#B9A57E"/><rect x="140" y="120" width="50" height="110" fill="#A8926A"/><circle cx="300" cy="90" r="26" fill="${a.color}" opacity=".55"/><g opacity=".5"><circle cx="200" cy="200" r="5" fill="#8a7a55"/><circle cx="220" cy="190" r="4" fill="#8a7a55"/><circle cx="180" cy="210" r="4" fill="#8a7a55"/></g></svg>`;
  }
  // default: traffic
  return `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice"><rect width="400" height="300" fill="#EAF3FB"/><rect y="230" width="400" height="70" fill="#CFE6C9"/><circle cx="330" cy="60" r="26" fill="${a.color}" opacity=".6"/><rect x="30" y="190" width="110" height="45" rx="8" fill="#1C2321"/><circle cx="55" cy="238" r="12" fill="#333"/><circle cx="120" cy="238" r="12" fill="#333"/><rect x="180" y="200" width="90" height="35" rx="8" fill="#D9583B"/><circle cx="200" cy="238" r="10" fill="#333"/><circle cx="255" cy="238" r="10" fill="#333"/></svg>`;
}

/* ============================================================
   AREA SEARCH RENDER
   ============================================================ */
let currentAreaProfile = null;

function renderAreaResult(query){
  const profile = getProfile(query);
  currentAreaProfile = profile;
  const aMeta = aqiMeta(profile.aqi);
  const wMeta = waterMeta(profile.water);
  const nMeta = noiseMeta(profile.noise);
  const pm25 = pm25FromAqi(profile.aqi), pm10 = pm10FromAqi(profile.aqi);
  const co = (0.4 + (profile.aqi/300)).toFixed(1);
  const no2 = Math.round(15 + profile.aqi*0.25);
  const o3 = Math.round(20 + profile.aqi*0.15);

  let explain = '';
  if(aMeta.label==='Good') explain = "Air's in good shape right now — a fine day to be outside.";
  else if(aMeta.label==='Moderate') explain = "Nothing alarming, but sensitive groups might notice it on longer outdoor stretches.";
  else if(aMeta.label==='Poor') explain = "The air isn't at its best today. If you have breathing problems, try avoiding long outdoor activities, especially near busy roads.";
  else if(aMeta.label==='Very Poor') explain = "This is rough air. Cut outdoor time where you can, and mask up if you need to be out for a while.";
  else explain = "This counts as severe. Stay indoors where possible — this is not a day for outdoor exercise.";

  const el = document.getElementById('areaResult');
  el.innerHTML = `
    <div class="area-head">
      <div>
        <span class="area-badges"><span class="demo-badge">Demo data</span>${profile.verified?'':'<span class="demo-badge" style="background:var(--sound);">No matching station — illustrative profile</span>'}</span>
        <h3>${profile.name}</h3>
      </div>
      <span class="updated">Last updated: just now (demo)</span>
    </div>
    <div class="area-grid">
      <div class="metricstack">
        <div class="metriccard">
          <svg class="micon" viewBox="0 0 48 48" fill="none" stroke="#E4A93B" stroke-width="2.4" stroke-linecap="round"><path d="M6 32c3-6 9-9 14-6 2-8 12-10 16-2 5 0 8 4 6 8"/></svg>
          <div><h4>Air Quality Index</h4><p>${explain}</p><span class="statuspill ${aMeta.cls}">${aMeta.label}</span></div>
          <div class="mnum">${profile.aqi}<span>AQI</span></div>
        </div>
        <div class="subgrid">
          <div class="subitem"><b>${pm25}</b><span>PM2.5</span></div>
          <div class="subitem"><b>${pm10}</b><span>PM10</span></div>
          <div class="subitem"><b>${co}</b><span>CO (mg/m³)</span></div>
          <div class="subitem"><b>${no2}</b><span>NO₂ (µg/m³)</span></div>
          <div class="subitem"><b>${o3}</b><span>O₃ (µg/m³)</span></div>
        </div>
        <div class="metriccard">
          <svg class="micon" viewBox="0 0 48 48" fill="none" stroke="#2A7F8E" stroke-width="2.4" stroke-linecap="round"><path d="M24 6c8 11 13 18 13 25a13 13 0 1 1-26 0c0-7 5-14 13-25z"/></svg>
          <div><h4>Water quality</h4><p>Based on typical monitoring reports for this kind of area.</p><span class="statuspill ${wMeta.cls}">${profile.water}</span></div>
          <div class="mnum">${profile.water[0]}<span>rating</span></div>
        </div>
        <div class="metriccard">
          <svg class="micon" viewBox="0 0 48 48" fill="none" stroke="#D9583B" stroke-width="2.4" stroke-linecap="round"><path d="M4 20v8h6l9 8V12l-9 8H4z"/><path d="M27 16a12 12 0 0 1 0 16"/></svg>
          <div><h4>Ambient noise</h4><p>${nMeta.label==='Calm'?'Comfortably quiet for most of the day.':'Worth avoiding long exposure near the loudest stretches.'}</p><span class="statuspill ${nMeta.cls}">${nMeta.label}</span></div>
          <div class="mnum">${profile.noise}<span>dB avg</span></div>
        </div>
      </div>
      <div class="area-side">
        <div class="area-image">${illustrationSVG(profile)}<div class="imgcap">${profile.name} — representative illustration</div></div>
        <div class="why-card">
          <h5>🧠 Why might pollution be higher here?</h5>
          <p style="font-size:12.5px; color:var(--ink-soft); margin-bottom:10px;">Possible contributing factors include:</p>
          <ul class="why-list">${whyFactors(profile).map(f=>`<li>${f}</li>`).join('')}</ul>
        </div>
        <div class="suggest-card">
          <h5>🌱 For today</h5>
          <p>"${personalSuggestion(profile)}"</p>
        </div>
      </div>
    </div>
    <p style="font-size:12.5px; color:var(--ink-soft); margin-top:6px;">Pollution can look different from one place to another. Traffic, industries, waste and everyday activities all play a role.</p>
  `;
  el.classList.add('show');
  el.scrollIntoView({behavior:'smooth', block:'start'});

  document.getElementById('hotspotCityName').textContent = profile.name;
  renderZoneField(profile);
}

document.getElementById('areaBtn').addEventListener('click', ()=>{
  const q = document.getElementById('areaInput').value;
  if(q.trim()) renderAreaResult(q);
});
document.getElementById('areaInput').addEventListener('keydown', (e)=>{
  if(e.key==='Enter' && e.target.value.trim()) renderAreaResult(e.target.value);
});
document.getElementById('areaInput').addEventListener('input', (e)=>{
  const q = e.target.value.trim().toLowerCase();
  const box = document.getElementById('areaSuggestions');
  if(!q){ box.innerHTML=''; return; }
  const matches = Object.keys(CITY_DB).filter(c=>c.includes(q)).slice(0,5);
  box.innerHTML = matches.map(c=>`<div class="sugg-item" data-c="${c}"><span>${titleCase(c)}</span><span class="tag result-tag air" style="background:var(--paper-dim); color:var(--ink-soft);">AQI ${CITY_DB[c].aqi}</span></div>`).join('');
  box.querySelectorAll('.sugg-item').forEach(it=>{
    it.addEventListener('click', ()=>{
      document.getElementById('areaInput').value = titleCase(it.dataset.c);
      box.innerHTML='';
      renderAreaResult(it.dataset.c);
    });
  });
});
const areaChipExamples = ['Nashik','Mumbai','Delhi','Bengaluru','Chennai'];
document.getElementById('areaChipRow').innerHTML = areaChipExamples.map(c=>`<button class="chip" type="button">${c}</button>`).join('');
document.querySelectorAll('#areaChipRow .chip').forEach(ch=>{
  ch.addEventListener('click', ()=>{
    document.getElementById('areaInput').value = ch.textContent;
    renderAreaResult(ch.textContent);
  });
});

/* ============================================================
   CITY GRID
   ============================================================ */
function cityCardHTML(key){
  const c = CITY_DB[key]; const m = aqiMeta(c.aqi);
  const pct = Math.min(100, Math.round((c.aqi/250)*100));
  return `<div class="citycard" data-c="${key}">
    <div class="cname">${titleCase(key)}</div>
    <div class="caqi" style="color:${m.color};">${c.aqi}</div>
    <div class="cbar"><i style="width:${pct}%; background:${m.color};"></i></div>
    <div class="cstatus">${m.label}</div>
    <div class="ctime">Updated 12 min ago (demo)</div>
  </div>`;
}
function renderCityGrid(showAll){
  const list = showAll ? MAIN_CITIES.concat(MORE_CITIES) : MAIN_CITIES;
  document.getElementById('cityGrid').innerHTML = list.map(cityCardHTML).join('');
  document.querySelectorAll('.citycard').forEach(card=>{
    card.addEventListener('click', ()=>{
      document.getElementById('areaInput').value = titleCase(card.dataset.c);
      renderAreaResult(card.dataset.c);
      document.getElementById('areasearch').scrollIntoView({behavior:'smooth', block:'start'});
    });
  });
}
renderCityGrid(false);
document.getElementById('viewMoreCities').addEventListener('click', (e)=>{
  renderCityGrid(true);
  e.target.style.display='none';
});

/* ============================================================
   INDIA MAP PICKER — approximate lat/long placed as % over the
   embedded Google Maps iframe (ll=22.6,80.5 z=5)
   ============================================================ */
const MAP_CITY_COORDS = {
  delhi:      {lat:28.70, lon:77.10},
  mumbai:     {lat:19.10, lon:72.90},
  kolkata:    {lat:22.60, lon:88.40},
  chennai:    {lat:13.10, lon:80.30},
  bengaluru:  {lat:12.97, lon:77.60},
  hyderabad:  {lat:17.40, lon:78.50},
  pune:       {lat:18.50, lon:73.90},
  nagpur:     {lat:21.10, lon:79.10},
  nashik:     {lat:20.00, lon:73.80},
  ahmedabad:  {lat:23.00, lon:72.60},
  jaipur:     {lat:26.90, lon:75.80},
  lucknow:    {lat:26.80, lon:80.90},
  patna:      {lat:25.60, lon:85.10},
  indore:     {lat:22.70, lon:75.80},
  surat:      {lat:21.20, lon:72.80},
};
const MAP_BOUNDS = {latMin:8, latMax:37, lonMin:68, lonMax:97};
function latLonToPct(lat, lon){
  const x = (lon - MAP_BOUNDS.lonMin) / (MAP_BOUNDS.lonMax - MAP_BOUNDS.lonMin) * 100;
  const y = (MAP_BOUNDS.latMax - lat) / (MAP_BOUNDS.latMax - MAP_BOUNDS.latMin) * 100;
  return {x, y};
}
function renderMapPins(){
  const layer = document.getElementById('mapPinLayer');
  layer.innerHTML = Object.keys(MAP_CITY_COORDS).map(key=>{
    const {lat,lon} = MAP_CITY_COORDS[key];
    const {x,y} = latLonToPct(lat,lon);
    const c = CITY_DB[key];
    const m = aqiMeta(c.aqi);
    return `<button class="mappin" style="left:${x}%; top:${y}%;" data-c="${key}" type="button">
      <span class="pintip">${titleCase(key)} · AQI ${c.aqi}</span>
      <span class="dot" style="background:${m.color};"></span>
    </button>`;
  }).join('');
  layer.querySelectorAll('.mappin').forEach(pin=>{
    pin.addEventListener('click', ()=>{
      const key = pin.dataset.c;
      const c = CITY_DB[key];
      const m = aqiMeta(c.aqi);
      document.getElementById('mapSelName').textContent = titleCase(key);
      document.getElementById('mapSelMeta').textContent = `AQI ${c.aqi} · ${m.label} · Noise ${c.noise} dB`;
      document.getElementById('mapSelected').classList.add('show');
      document.getElementById('reportLocation').value = titleCase(key);
      document.getElementById('trafficLocation').value = titleCase(key);
      document.getElementById('areaInput').value = titleCase(key);
      renderAreaResult(key);
    });
  });
}
renderMapPins();
document.getElementById('mapSelReportBtn').addEventListener('click', ()=>{
  setTimeout(()=> document.getElementById('reportLocation').focus(), 500);
});

/* ============================================================
   HOTSPOT ZONE MAP
   ============================================================ */
const ZONE_TEMPLATES = [
  {name:'City Center', sources:'Traffic congestion, construction, market waste'},
  {name:'Industrial Belt', sources:'Factory emissions, industrial effluent'},
  {name:'Highway Corridor', sources:'Vehicle exhaust, honking, diesel trucks'},
  {name:'Riverside', sources:'Sewage discharge, dumped waste, runoff'},
  {name:'Residential North', sources:'Household waste burning, local traffic'},
  {name:'Green Belt', sources:'Minimal — mostly background traffic drift'},
];
function zoneClass(v){
  if(v<=80) return 'zone-good';
  if(v<=120) return 'zone-moderate';
  if(v<=170) return 'zone-poor';
  return 'zone-severe';
}
function renderZoneField(profile){
  const r = rngFor(profile.name+'-zones');
  const field = document.getElementById('zoneField');
  const zones = ZONE_TEMPLATES.map((z,i)=>{
    const jitter = Math.round((r()-0.5)*70);
    let aqi = Math.max(35, profile.aqi + jitter - (z.name==='Green Belt'?45:0) + (z.name==='Industrial Belt'?25:0));
    const noise = Math.max(48, profile.noise + Math.round((r()-0.5)*16));
    const complaints = Math.round(r()*40);
    return {...z, aqi, noise, complaints};
  });
  field.innerHTML = zones.map((z,i)=>`
    <div class="zonenode ${zoneClass(z.aqi)}" data-i="${i}"><b>${z.name}</b><span>${z.aqi} AQI</span></div>
  `).join('');
  window.__zones = zones;
  field.querySelectorAll('.zonenode').forEach(node=>{
    node.addEventListener('click', ()=>{
      field.querySelectorAll('.zonenode').forEach(n=>n.classList.remove('active'));
      node.classList.add('active');
      const z = zones[node.dataset.i];
      const panel = document.getElementById('zonePanel');
      panel.innerHTML = `
        <h4>${z.name}</h4>
        <div class="zstats">
          <div class="zstat"><b>${z.aqi}</b><span>AQI</span></div>
          <div class="zstat"><b>${z.noise} dB</b><span>Noise</span></div>
          <div class="zstat"><b>${z.complaints}</b><span>Reported complaints</span></div>
        </div>
        <p class="zsources"><b>Main sources:</b> ${z.sources}</p>
      `;
      panel.classList.add('show');
    });
  });
  document.getElementById('zonePanel').classList.remove('show');
}
renderZoneField({name:'Nashik', aqi:88, noise:66, profile:'moderate'});

/* ============================================================
   REPORT / TRAFFIC / IDEA FORMS
   ============================================================ */
function genReportId(prefix){ return (prefix||'POL') + '-2026-' + (1000 + Math.floor(Math.random()*9000)); }

/* ============================================================
   REPORTS FEED — no backend, just session/localStorage
   ============================================================ */
const SAMPLE_REPORTS = [
  {id:'POL-2026-4821', kind:'pollution', type:'Air pollution', location:'MG Road, Nashik', desc:'Thick smoke from roadside garbage burning most evenings.', status:'review', when:'2 days ago'},
  {id:'POL-2026-3390', kind:'pollution', type:'Water pollution', location:'Godavari Ghat, Nashik', desc:'Plastic waste and oil film visible near the ghat steps.', status:'resolved', when:'5 days ago'},
  {id:'TRF-2026-1187', kind:'traffic', type:'Excessive honking', location:'FC Road, Pune', desc:'Constant honking near the college gate during peak hours.', status:'submitted', when:'1 day ago'},
  {id:'POL-2026-2765', kind:'pollution', type:'Sound pollution', location:'Laxmi Road, Pune', desc:'Loudspeakers well past permitted hours on weekends.', status:'review', when:'3 days ago'},
  {id:'TRF-2026-0942', kind:'traffic', type:'Visible vehicle smoke', location:'Ring Road, Nagpur', desc:'Old bus route emitting dense black smoke on every trip.', status:'submitted', when:'6 hours ago'},
];
let reports = (function(){
  try{ const saved = JSON.parse(storage.get('sig_reports')); if(Array.isArray(saved) && saved.length) return saved; }catch(e){}
  return SAMPLE_REPORTS.slice();
})();
function saveReports(){ storage.set('sig_reports', JSON.stringify(reports)); }

function statusMeta(s){
  if(s==='resolved') return {label:'🟢 Resolved', cls:'resolved'};
  if(s==='review') return {label:'🔵 Under review', cls:'review'};
  return {label:'🟡 Submitted', cls:'submitted'};
}
function reportCardHTML(r){
  const sm = statusMeta(r.status);
  return `<div class="reportcard">
    <div class="rkind ${r.kind}">${r.kind==='traffic' ? '🚦' : '📢'}</div>
    <div class="rmid">
      <div class="rtop"><span class="rtype">${r.type}</span><span class="rid">${r.id}</span></div>
      <div class="rdesc">${r.desc}</div>
      <div class="rloc">📍 ${r.location}</div>
    </div>
    <div class="rright">
      <span class="statuspill ${sm.cls}">${sm.label}</span>
      <span class="rwhen">${r.when}</span>
    </div>
  </div>`;
}
function renderReports(){
  const listEl = document.getElementById('reportsList');
  const count = reports.length;
  document.getElementById('reportsCount').textContent = count;
  document.getElementById('reportsFeedCount').textContent = count + ' logged';
  listEl.innerHTML = count ? reports.map(reportCardHTML).join('') : '<div class="reportsempty">No reports yet — be the first to flag something below.</div>';
}
document.getElementById('reportsToggle').addEventListener('click', ()=>{
  document.getElementById('reportsPanel').classList.toggle('open');
});
renderReports();

document.getElementById('reportPhoto').addEventListener('change', (e)=>{
  const label = document.getElementById('reportFileLabel');
  if(e.target.files.length){ label.textContent = '📷 ' + e.target.files[0].name; label.classList.add('has-file'); }
});

document.getElementById('reportForm').addEventListener('submit', (e)=>{
  e.preventDefault();
  const id = genReportId('POL');
  const type = document.getElementById('reportType').value;
  const location = document.getElementById('reportLocation').value || 'Unspecified area';
  const desc = document.getElementById('reportDesc').value;
  document.getElementById('reportResult').innerHTML = `
    <div class="idbox">
      <div class="rid">Report ID: ${id}</div>
      <p style="font-size:14px; color:var(--ink-soft);">Logged as <b>${type}</b>. Thanks for flagging it — genuine reports help build a real picture of what's happening on the ground.</p>
      <div class="stepper">
        <div class="step active">🟡 Submitted</div>
        <div class="step">🔵 Under review</div>
        <div class="step">🟢 Resolved</div>
      </div>
    </div>
  `;
  document.getElementById('reportResult').classList.add('show');
  reports.unshift({id, kind:'pollution', type: type || 'Other', location, desc: desc || 'No further details given.', status:'submitted', when:'just now'});
  saveReports();
  renderReports();
  document.getElementById('reportsPanel').classList.add('open');
  e.target.reset();
  document.getElementById('reportFileLabel').textContent = '📷 Tap to attach a photo';
  document.getElementById('reportFileLabel').classList.remove('has-file');
  awardPoints(30, 'Pollution report submitted', 'report');
});

document.getElementById('trafficForm').addEventListener('submit', (e)=>{
  e.preventDefault();
  const id = genReportId('TRF');
  const type = document.getElementById('trafficType').value;
  const location = document.getElementById('trafficLocation').value || 'Unspecified location';
  const desc = document.getElementById('trafficDesc').value;
  document.getElementById('trafficResult').innerHTML = `
    <div class="idbox">
      <div class="rid">Report ID: ${id}</div>
      <div class="pipeline">Report <b>→</b> Verification <b>→</b> Authority review <b>→</b> Possible action</div>
      <span class="penalty-tag">Sample / demo penalty — not an actual legal fine</span>
    </div>
  `;
  document.getElementById('trafficResult').classList.add('show');
  reports.unshift({id, kind:'traffic', type: type || 'Other', location, desc: desc || 'No further details given.', status:'submitted', when:'just now'});
  saveReports();
  renderReports();
  document.getElementById('reportsPanel').classList.add('open');
  e.target.reset();
  awardPoints(30, 'Traffic violation reported', 'report');
});

document.getElementById('ideaForm').addEventListener('submit', (e)=>{
  e.preventDefault();
  document.getElementById('ideaResult').innerHTML = `
    <div class="thankyou"><p>Thank you! 🌱 Small ideas can create big changes.</p></div>
  `;
  document.getElementById('ideaResult').classList.add('show');
  e.target.reset();
  awardPoints(20, 'Idea submitted', 'idea');
});

/* pointsource cards: idea/report scroll, cleanup/tip award directly (once a day) */
document.querySelectorAll('.psource').forEach(card=>{
  const txt = card.querySelector('span').textContent;
  card.style.cursor='pointer';
  card.addEventListener('click', ()=>{
    if(txt.includes('idea')) document.getElementById('idea').scrollIntoView({behavior:'smooth'});
    else if(txt.includes('Report')) document.getElementById('report').scrollIntoView({behavior:'smooth'});
    else if(txt.includes('clean-up')){
      if(onceADay('sig_cleanup')) awardPoints(50, 'Clean-up activity logged', 'cleanup');
      else showToast("Already logged today — see you tomorrow!");
    } else if(txt.includes('tip')){
      if(onceADay('sig_tip')) awardPoints(10, 'Awareness tip shared', 'tip');
      else showToast("Already logged today — see you tomorrow!");
    }
  });
});

/* ============================================================
   LEADERBOARD
   ============================================================ */
const SAMPLE_LEADERS = [
  {name:'Aarav K.', pts:410},
  {name:'Meera S.', pts:365},
  {name:'Rohan P.', pts:290},
  {name:'Divya N.', pts:210},
  {name:'Kabir T.', pts:140},
];
function renderLeaderboard(){
  const list = SAMPLE_LEADERS.concat([{name:'You', pts:state.points, me:true}])
    .sort((a,b)=>b.pts-a.pts);
  document.getElementById('lbList').innerHTML = list.map((p,i)=>`
    <div class="lbrow ${p.me?'me':''}">
      <span class="lbrank">${i+1}</span>
      <span>${p.name} ${p.me?'<span class="levelchip">'+currentTier(state.points).label+'</span>':''}</span>
      <span class="lbpts">${p.pts} pts</span>
    </div>
  `).join('');
}
renderLeaderboard();

/* ============================================================
   TIPS TICKER
   ============================================================ */
const GREEN_TIPS = [
  '🌱 Skip the vehicle for short trips when you can.',
  '🚰 Never pour oil or chemicals into a drain.',
  '🔇 A horn is for safety, not impatience.',
  '🗑️ Burning garbage turns waste into air pollution.',
  '💧 A clean-looking river isn\'t always a safe river.',
  '🌳 Planting one tree won\'t fix a city, but a street full of them helps.',
  '🎧 Headphones over speakers after dark — your neighbours will thank you.',
];
let tipIndex = 0;
function renderTips(){
  const ticker = document.getElementById('tipsTicker');
  const dots = document.getElementById('tipDots');
  ticker.innerHTML = GREEN_TIPS.map((t,i)=>`<div class="tip-slide ${i===0?'active':''}"><p>${t}</p></div>`).join('');
  dots.innerHTML = GREEN_TIPS.map((_,i)=>`<i class="${i===0?'active':''}"></i>`).join('');
}
function showTip(i){
  document.querySelectorAll('.tip-slide').forEach((s,idx)=>s.classList.toggle('active', idx===i));
  document.querySelectorAll('#tipDots i').forEach((d,idx)=>d.classList.toggle('active', idx===i));
}
renderTips();
setInterval(()=>{ tipIndex = (tipIndex+1) % GREEN_TIPS.length; showTip(tipIndex); }, 4500);

/* ============================================================
   SCROLL REVEAL
   ============================================================ */
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
},{threshold:0.14});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

/* ============================================================
   PARTICLE CANVAS (hero) — drifting motes: smoke/bubble/soundwave mix
   ============================================================ */
(function(){
  const canvas = document.getElementById('heroParticles');
  const ctx = canvas.getContext('2d');
  let W,H,particles=[];
  const COLORS = ['#E4A93B','#2A7F8E','#D9583B'];

  function resize(){
    W = canvas.width = canvas.offsetWidth * devicePixelRatio;
    H = canvas.height = canvas.offsetHeight * devicePixelRatio;
  }
  function init(){
    resize();
    particles = Array.from({length: Math.round(W/34)}, ()=>({
      x: Math.random()*W, y: Math.random()*H,
      r: (Math.random()*2.4+1)*devicePixelRatio,
      vy: -(Math.random()*0.35+0.08)*devicePixelRatio,
      vx: (Math.random()-0.5)*0.18*devicePixelRatio,
      c: COLORS[Math.floor(Math.random()*3)],
      a: Math.random()*0.35+0.08
    }));
  }
  function tick(){
    ctx.clearRect(0,0,W,H);
    particles.forEach(p=>{
      p.x += p.vx; p.y += p.vy;
      if(p.y < -10) { p.y = H+10; p.x = Math.random()*W; }
      if(p.x < -10) p.x = W+10;
      if(p.x > W+10) p.x = -10;
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle = p.c;
      ctx.globalAlpha = p.a;
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(tick);
  }
  window.addEventListener('resize', ()=>{ resize(); });
  init(); tick();
})();

/* ============================================================
   INIT
   ============================================================ */
bumpStreak();
saveState();
renderDashboard();
