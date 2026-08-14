import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile as updateAuthProfile } from 'https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp, collection, getDocs } from 'https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js';

const firebaseConfig={apiKey:'AIzaSyBazNUpVtQ7EYwRKatIhyT7n-r6toIL7A8',authDomain:'poporia-2db62.firebaseapp.com',projectId:'poporia-2db62',storageBucket:'poporia-2db62.firebasestorage.app',messagingSenderId:'383387696155',appId:'1:383387696155:web:352bd30ab0cb930edc8cbe',measurementId:'G-6DYXGNVSHT'};
const firebaseApp=initializeApp(firebaseConfig), auth=getAuth(firebaseApp), db=getFirestore(firebaseApp);
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const SIZE=8, COLORS=['red','blue','green','yellow','purple','pink'], COST={shuffle:75,hammer:100,hint:25};
const POP_INFO={red:{name:'Ruby',symbol:'●'},blue:{name:'Nova',symbol:'★'},green:{name:'Leaf',symbol:'◆'},yellow:{name:'Spark',symbol:'✦'},purple:{name:'Hexa',symbol:'⬡'},pink:{name:'Heart',symbol:'♥'}};
const WORLDS=[
 {id:0,name:'Poporia City',short:'City',icon:'🏙️',subtitle:'Les premiers éclats',start:1,end:10},
 {id:1,name:'Poporia Forest',short:'Forest',icon:'🌲',subtitle:'Sous les feuilles magiques',start:11,end:20},
 {id:2,name:'Crystal Caves',short:'Caves',icon:'💎',subtitle:'Les profondeurs scintillantes',start:21,end:30}
];
const levels=[
 {moves:23,goal:{type:'score',target:3200},stars:[3200,5000,6800]},
 {moves:22,goal:{type:'collect',color:'red',target:18},stars:[3500,5400,7200]},
 {moves:21,goal:{type:'collect',color:'blue',target:22},stars:[4100,6100,8100]},
 {moves:20,goal:{type:'score',target:6000},stars:[6000,8200,10400]},
 {moves:21,goal:{type:'collect',color:'green',target:28},stars:[6500,8800,11200]},
 {moves:19,goal:{type:'score',target:8500},stars:[8500,11000,13800]},
 {moves:20,goal:{type:'collect',color:'purple',target:30},stars:[9000,11800,14600]},
 {moves:18,goal:{type:'ice',target:8},ice:8,stars:[9500,12400,15400]},
 {moves:18,goal:{type:'collect',color:'yellow',target:34},stars:[10800,13800,17200]},
 {moves:17,goal:{type:'ice',target:12},ice:12,stars:[12500,15800,19800]},
 {moves:21,goal:{type:'collect',color:'pink',target:36},stars:[13000,16500,20500]},
 {moves:20,goal:{type:'ice',target:14},ice:14,stars:[14000,17600,21800]},
 {moves:18,goal:{type:'score',target:15000},stars:[15000,19000,23500]},
 {moves:19,goal:{type:'collect',color:'blue',target:42},stars:[15800,20000,24800]},
 {moves:18,goal:{type:'ice',target:18},ice:18,stars:[17000,21500,26400]},
 {moves:17,goal:{type:'collect',color:'green',target:46},stars:[18200,23000,28200]},
 {moves:16,goal:{type:'score',target:21000},stars:[21000,26000,31800]},
 {moves:17,goal:{type:'ice',target:22},ice:22,stars:[22000,27500,33500]},
 {moves:15,goal:{type:'collect',color:'purple',target:52},stars:[23000,28800,35000]},
 {moves:14,goal:{type:'score',target:27000},stars:[27000,33000,40000]},
 {moves:18,goal:{type:'ice',target:14},ice:14,iceLayers:2,stars:[28500,35000,42500]},
 {moves:17,goal:{type:'collect',color:'red',target:56},stars:[30000,36500,44500]},
 {moves:17,goal:{type:'score',target:32000},crates:6,stars:[32000,39000,47500]},
 {moves:16,goal:{type:'ice',target:16},ice:16,iceLayers:2,crates:4,stars:[34000,41500,50000]},
 {moves:16,goal:{type:'collect',color:'pink',target:60},crates:7,stars:[36000,44000,53000]},
 {moves:15,goal:{type:'score',target:39000},ice:10,iceLayers:2,stars:[39000,47000,56500]},
 {moves:15,goal:{type:'collect',color:'yellow',target:64},ice:12,iceLayers:2,crates:5,stars:[41000,49500,59500]},
 {moves:14,goal:{type:'ice',target:18},ice:18,iceLayers:2,crates:6,stars:[43000,52000,62500]},
 {moves:14,goal:{type:'collect',color:'blue',target:68},crates:8,stars:[45500,55000,66000]},
 {moves:13,goal:{type:'score',target:50000},ice:16,iceLayers:2,crates:8,stars:[50000,60000,72000]}
];
const BOSS_LEVELS=new Set([10,20,30]), SPECIAL_LEVELS=new Set([5,15,25]);

let user=null, guest=false, save=null, isAdmin=false, currentWorld=0,currentLevel=0,board=[],ice=new Set(),iceLayers=new Map(),crates=new Set(),selected=null,score=0,moves=0,collected={},busy=false,hammerMode=false,gameEnded=false,authMode='login',pointerStart=null,lastSwap=null,syncTimer=null,adminPlayers=[];
const defaultSave=()=>({coins:500,stars:{},bestScores:{},unlocked:1,lastGift:null,role:'player',lives:5,maxLives:5,lastLifeAt:Date.now(),inventory:{hammer:1,shuffle:1,hint:2},chests:0,wins:0,worldRewards:{},createdAt:Date.now()});
const localKey=()=>guest?'poporiaGuestSave':`poporiaCache:${user?.uid||'none'}`;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function toast(t){const el=$('#toast');el.textContent=t;el.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(()=>el.classList.remove('show'),1900)}
function showScreen(id){$$('.screen').forEach(s=>s.classList.remove('active'));$('#'+id).classList.add('active');if(id==='mapScreen')renderMap();if(id==='homeScreen')updateProfile()}
function localLoad(){try{return{...defaultSave(),...(JSON.parse(localStorage.getItem(localKey()))||{})}}catch{return defaultSave()}}
async function loadCloudSave(){if(guest){save=localLoad();isAdmin=false;return}const ref=doc(db,'users',user.uid),snap=await getDoc(ref);if(snap.exists())save={...defaultSave(),...snap.data()};else{save=defaultSave();await setDoc(ref,{...save,uid:user.uid,email:user.email,pseudo:user.displayName||'Joueur',updatedAt:serverTimestamp()})}normalizeSave();isAdmin=save.role==='admin'||save.isAdmin===true;localStorage.setItem(localKey(),JSON.stringify(save))}
function persist(){if(!save)return;localStorage.setItem(localKey(),JSON.stringify(save));updateCurrencies();if(!guest&&user){clearTimeout(syncTimer);syncTimer=setTimeout(async()=>{try{await setDoc(doc(db,'users',user.uid),{...save,uid:user.uid,email:user.email,pseudo:user.displayName||'Joueur',updatedAt:serverTimestamp()},{merge:true});await syncLeaderboard();$('#syncState').textContent='Cloud'}catch(e){$('#syncState').textContent='Local';console.warn('Sync Firebase:',e)}},250)}}
function displayName(){return guest?'Invité':user?.displayName||user?.email?.split('@')[0]||'Joueur'}
function totalStars(){return Object.values(save?.stars||{}).reduce((a,b)=>a+Number(b||0),0)}
function totalBestScore(){return Object.values(save?.bestScores||{}).reduce((a,b)=>a+Number(b||0),0)}
const LIFE_MS=30*60*1000;
function normalizeSave(){
  save={...defaultSave(),...(save||{})};
  save.inventory={...defaultSave().inventory,...(save.inventory||{})};
  regenLives();
}
function regenLives(){
  if(!save)return;
  const max=save.maxLives||5;
  if(save.lives>=max){save.lives=max;save.lastLifeAt=Date.now();return}
  const now=Date.now(), elapsed=Math.max(0,now-(save.lastLifeAt||now)), gained=Math.floor(elapsed/LIFE_MS);
  if(gained>0){save.lives=Math.min(max,save.lives+gained);save.lastLifeAt=(save.lastLifeAt||now)+gained*LIFE_MS}
}
function lifeCountdown(){
  regenLives();
  if(!save||save.lives>=save.maxLives)return 'MAX';
  const left=LIFE_MS-(Date.now()-(save.lastLifeAt||Date.now()));
  const m=Math.max(0,Math.floor(left/60000)),s=Math.max(0,Math.floor((left%60000)/1000));
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}
function updateLivesUI(){
  if(!save)return;regenLives();
  ['homeLives','mapLives','gameLives'].forEach(id=>$('#'+id)&&($('#'+id).textContent=`${save.lives}/${save.maxLives}`));
  if($('#lifeTimer'))$('#lifeTimer').textContent=lifeCountdown();
}
function consumeLife(){
  regenLives();
  if(save.lives<=0)return false;
  if(save.lives===save.maxLives)save.lastLifeAt=Date.now();
  save.lives--;persist();updateLivesUI();return true
}
function inventoryCount(k){return Number(save?.inventory?.[k]||0)}
function consumeBooster(k,cost,label){
  if(inventoryCount(k)>0){save.inventory[k]--;persist();toast(`${label} utilisé · ${save.inventory[k]} restant(s)`);return true}
  return spend(cost,label)
}

function updateCurrencies(){if(!save)return;regenLives();['homeCoins','mapCoins','gameCoins'].forEach(id=>$('#'+id)&&($('#'+id).textContent=save.coins));$('#homeStars').textContent=totalStars();$('#homeLevel').textContent=save.unlocked;$('#syncState').textContent=guest?'Local':'Cloud';updateLivesUI();['hammer','shuffle','hint'].forEach(k=>$('#inv-'+k)&&($('#inv-'+k).textContent=inventoryCount(k)))}
function updateProfile(){if(!save)return;const name=displayName(),initial=name[0]?.toUpperCase()||'P',stars=totalStars();$('#homePlayer').textContent=name;$('#homeAvatar').textContent=initial;$('#profileAvatar').textContent=initial;$('#profileName').textContent=name;$('#profileType').textContent=guest?'Progression invitée locale':isAdmin?`${user?.email||'Compte Firebase'} · ADMIN`:user?.email||'Compte Firebase';$('#profileCoins').textContent=save.coins;$('#profileStars').textContent=stars;$('#profileBest').textContent=save.unlocked;$('#homeRank').textContent=isAdmin?'ADMIN':stars>=40?'Maître Pop':stars>=20?'Expert Pop':'Explorateur';if($('#adminBtn'))$('#adminBtn').classList.toggle('hidden',!isAdmin);updateCurrencies()}
function authError(e){const map={'auth/email-already-in-use':'Cet email possède déjà un compte.','auth/invalid-credential':'Email ou mot de passe incorrect.','auth/weak-password':'Le mot de passe doit contenir au moins 6 caractères.','auth/invalid-email':'Adresse email invalide.','auth/operation-not-allowed':'Active Email/Mot de passe dans Firebase Authentication.'};return map[e.code]||`Firebase : ${e.message}`}
function setupAuth(){const switchMode=m=>{authMode=m;$('#loginTab').classList.toggle('active',m==='login');$('#registerTab').classList.toggle('active',m==='register');$('#usernameLabel').classList.toggle('hidden',m!=='register');$('#usernameInput').required=m==='register';$('#authSubmit').textContent=m==='login'?'Entrer dans Poporia':'Créer mon compte';$('#passwordInput').autocomplete=m==='login'?'current-password':'new-password';$('#authMessage').textContent=''};$('#loginTab').onclick=()=>switchMode('login');$('#registerTab').onclick=()=>switchMode('register');$('#authForm').onsubmit=async e=>{e.preventDefault();const email=$('#emailInput').value.trim(),pass=$('#passwordInput').value,pseudo=$('#usernameInput').value.trim();$('#authSubmit').disabled=true;$('#authMessage').textContent='Connexion...';try{if(authMode==='register'){const cred=await createUserWithEmailAndPassword(auth,email,pass);await updateAuthProfile(cred.user,{displayName:pseudo||email.split('@')[0]});user=cred.user}else await signInWithEmailAndPassword(auth,email,pass)}catch(err){$('#authMessage').textContent=authError(err)}finally{$('#authSubmit').disabled=false}};$('#guestBtn').onclick=async()=>{if(auth.currentUser)await signOut(auth);guest=true;user=null;isAdmin=false;save=localLoad();normalizeSave();updateProfile();showScreen('homeScreen')}}

function worldForLevel(n){return n<=10?0:n<=20?1:2}
function renderWorldSwitcher(){const e=$('#worldSwitcher');e.innerHTML='';WORLDS.forEach(w=>{const unlocked=save.unlocked>=w.start,btn=document.createElement('button');btn.className='world-chip'+(currentWorld===w.id?' active':'')+(!unlocked?' locked':'');btn.innerHTML=`<span>${w.icon}</span><b>${w.short}</b><small>${unlocked?'⏳ '+countdownShort():`🔒 Niveau ${w.start-1}`}</small>`;if(unlocked)btn.onclick=()=>{currentWorld=w.id;renderMap()};e.appendChild(btn)});const soon=[['🏖️','Beach'],['🏔️','Peak']];soon.forEach(([icon,name])=>{const b=document.createElement('button');b.className='world-chip locked';b.innerHTML=`<span>${icon}</span><b>${name}</b><small>Bientôt</small>`;e.appendChild(b)})}
function renderMap(){currentWorld=Math.min(currentWorld,worldForLevel(save.unlocked));const w=WORLDS[currentWorld];const ms=$('#mapScreen');ms.classList.remove('world-city','world-forest','world-caves');ms.classList.add(currentWorld===0?'world-city':currentWorld===1?'world-forest':'world-caves');$('#worldNumber').textContent=`MONDE ${w.id+1}`;$('#worldName').textContent=w.name;$('#worldSubtitle').textContent=w.subtitle;renderWorldSwitcher();const map=$('#levelMap');map.innerHTML='';for(let n=w.start;n<=w.end;n++){const i=n-1,locked=n>save.unlocked,stars=save.stars[n]||0,btn=document.createElement('button');btn.className='level-node'+(locked?' locked':'')+(n===save.unlocked?' current':'');const boss=BOSS_LEVELS.has(n),special=SPECIAL_LEVELS.has(n);btn.classList.toggle('boss-node',boss);btn.classList.toggle('special-node',special);btn.innerHTML=`<div class="node-stars">${stars?'⭐'.repeat(stars)+'☆'.repeat(3-stars):'☆☆☆'}</div><span>${n}</span>${boss?'<i class="node-badge boss-badge">👑</i>':special?'<i class="node-badge special-badge">✦</i>':levels[i].goal.type==='ice'?'<i class="node-badge">❄</i>':''}${locked?'<div class="node-lock">🔒</div>':''}`;if(!locked)btn.onclick=()=>startLevel(i);map.appendChild(btn)}}
function countdownShort(){const now=new Date(),end=new Date(now);end.setHours(24,0,0,0);let s=Math.max(0,Math.floor((end-now)/1000));return `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor((s%3600)/60)).padStart(2,'0')}`}
function randomColor(){return COLORS[Math.floor(Math.random()*COLORS.length)]}
function makeGem(color=randomColor(),special=null){return{color,special}}
function createsInitialMatch(r,c,color){return(c>=2&&board[r][c-1]?.color===color&&board[r][c-2]?.color===color)||(r>=2&&board[r-1][c]?.color===color&&board[r-2][c]?.color===color)}
function generateBoard(){board=Array.from({length:SIZE},()=>Array(SIZE).fill(null));for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++){let color;do color=randomColor();while(createsInitialMatch(r,c,color));board[r][c]=makeGem(color)}if(!hasPossibleMove())generateBoard()}
function generateIce(count,layers=1){ice=new Set();iceLayers=new Map();const cells=[];for(let r=1;r<SIZE-1;r++)for(let c=1;c<SIZE-1;c++)cells.push(`${r},${c}`);cells.sort(()=>Math.random()-.5);cells.slice(0,count).forEach(k=>{ice.add(k);iceLayers.set(k,layers)})}
function generateCrates(count=0){crates=new Set();const cells=[];for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++)if(!ice.has(key(r,c)))cells.push(key(r,c));cells.sort(()=>Math.random()-.5);cells.slice(0,count).forEach(k=>crates.add(k))}

function startLevel(i){openPreLevel(i)}
function openPreLevel(i){
  currentLevel=i;currentWorld=worldForLevel(i+1);regenLives();
  const l=levels[i];$('#preLevelNumber').textContent=`Niveau ${i+1}`;$('#preObjective').textContent=objectiveText(l);
  $('#preMoves').textContent=l.moves;$('#preLives').textContent=`${save.lives}/${save.maxLives}`;
  $('#preInventory').textContent=`🔨 ${inventoryCount('hammer')} · 🔀 ${inventoryCount('shuffle')} · 💡 ${inventoryCount('hint')}`;
  $('#preLevelModal').classList.remove('hidden')
}
function actualStartLevel(i){
  regenLives();if(save.lives<=0){toast(`Plus de vies ❤️ · prochaine dans ${lifeCountdown()}`);return}
  currentLevel=i;currentWorld=worldForLevel(i+1);score=0;moves=levels[i].moves;selected=null;collected={};busy=false;hammerMode=false;gameEnded=false;lastSwap=null;
  generateBoard();generateIce(levels[i].ice||0,levels[i].iceLayers||1);generateCrates(levels[i].crates||0);
  $('#preLevelModal').classList.add('hidden');showScreen('gameScreen');renderGameUI();renderBoard()
}
function objectiveText(l=levels[currentLevel]){if(l.goal.type==='score')return`Atteins ${l.goal.target.toLocaleString('fr-FR')} points`;if(l.goal.type==='ice')return`Brise ${l.goal.target} cases gelées`;return`Collecte ${l.goal.target} Pops ${POP_INFO[l.goal.color].name}`}
function renderGameUI(){const l=levels[currentLevel],n=currentLevel+1;$('#gameLevelLabel').textContent=BOSS_LEVELS.has(n)?`👑 Boss · Niveau ${n}`:SPECIAL_LEVELS.has(n)?`✨ Spécial · Niveau ${n}`:`Niveau ${n}`;$('#objectiveLabel').textContent=objectiveText(l);$('#movesLeft').textContent=moves;$('#scoreValue').textContent=score.toLocaleString('fr-FR');renderObjective();renderStars();$('#scoreProgress').style.width=Math.min(100,score/l.stars[2]*100)+'%';const bm=$('#bossMeter');if(BOSS_LEVELS.has(n)){bm.classList.remove('hidden');let target=l.goal.target,hp;if(l.goal.type==='score')hp=Math.max(0,target-score);else if(l.goal.type==='ice')hp=Math.max(0,ice.size);else hp=Math.max(0,target-(collected[l.goal.color]||0));$('#bossHp').textContent=hp.toLocaleString('fr-FR');$('#bossFill').style.width=Math.max(0,Math.min(100,hp/target*100))+'%'}else bm.classList.add('hidden');updateBoosterStates()}
function renderObjective(){const g=levels[currentLevel].goal,e=$('#objectiveProgress');if(g.type==='score')e.innerHTML=`<div class="obj-chip"><span>🏆 Score</span><span>${score.toLocaleString('fr-FR')} / ${g.target.toLocaleString('fr-FR')}</span></div>`;else if(g.type==='ice')e.innerHTML=`<div class="obj-chip"><span>❄️ Glace</span><span>${g.target-ice.size} / ${g.target}</span></div>`;else{const v=collected[g.color]||0;e.innerHTML=`<div class="obj-chip"><i class="pop-dot ${g.color}">${POP_INFO[g.color].symbol}</i><span>${Math.min(v,g.target)} / ${g.target}</span></div>`}if(crates.size)e.innerHTML+=`<div class="obj-chip"><span>📦 Caisses</span><span>${crates.size} restantes</span></div>`}
function currentStars(){const t=levels[currentLevel].stars;return score>=t[2]?3:score>=t[1]?2:score>=t[0]?1:0}
function renderStars(){const s=currentStars();[1,2,3].forEach(i=>$('#star'+i).textContent=i<=s?'★':'☆')}
function renderBoard(){const el=$('#board');el.innerHTML='';for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++){const cell=document.createElement('div');const ck=`${r},${c}`;cell.className='cell'+(ice.has(ck)?` iced ice-${iceLayers.get(ck)||1}`:'')+(crates.has(ck)?' crated':'');cell.dataset.r=r;cell.dataset.c=c;const item=board[r][c];if(item){const gem=document.createElement('div');gem.className=`gem ${item.color} ${item.special||''}`;gem.dataset.symbol=POP_INFO[item.color]?.symbol||'✦';if(selected?.r===r&&selected?.c===c)gem.classList.add('selected');if(item.drop){gem.classList.add('falling');gem.style.setProperty('--drop',item.drop)}if(item.fresh)gem.classList.add('fresh-pop');gem.innerHTML='<span class="pop-symbol"></span>';cell.appendChild(gem)}el.appendChild(cell)}}
function adjacent(a,b){return Math.abs(a.r-b.r)+Math.abs(a.c-b.c)===1}
function swap(a,b){[board[a.r][a.c],board[b.r][b.c]]=[board[b.r][b.c],board[a.r][a.c]]}
const key=(r,c)=>`${r},${c}`, parseKey=k=>k.split(',').map(Number);
function linesOfMatches(){const lines=[];for(let r=0;r<SIZE;r++){let s=0;for(let c=1;c<=SIZE;c++){if(c<SIZE&&board[r][c]?.color&&board[r][c].color===board[r][s]?.color)continue;if(board[r][s]&&c-s>=3)lines.push({dir:'h',cells:Array.from({length:c-s},(_,i)=>({r,c:s+i}))});s=c}}for(let c=0;c<SIZE;c++){let s=0;for(let r=1;r<=SIZE;r++){if(r<SIZE&&board[r][c]?.color&&board[r][c].color===board[s]?.[c]?.color)continue;if(board[s]?.[c]&&r-s>=3)lines.push({dir:'v',cells:Array.from({length:r-s},(_,i)=>({r:s+i,c}))});s=r}}return lines}
function squaresOfMatches(){const out=[];for(let r=0;r<SIZE-1;r++)for(let c=0;c<SIZE-1;c++){const color=board[r][c]?.color;if(color&&board[r][c+1]?.color===color&&board[r+1][c]?.color===color&&board[r+1][c+1]?.color===color)out.push({color,cells:[{r,c},{r,c:c+1},{r:r+1,c},{r:r+1,c:c+1}]})}return out}
function findMatches(){const set=new Set();linesOfMatches().forEach(l=>l.cells.forEach(p=>set.add(key(p.r,p.c))));squaresOfMatches().forEach(s=>s.cells.forEach(p=>set.add(key(p.r,p.c))));return set}
function creationForPatterns(lines,squares){if(squares.length){let sq=squares.find(s=>lastSwap&&s.cells.some(p=>p.r===lastSwap.b.r&&p.c===lastSwap.b.c))||squares[0],preferred=lastSwap&&sq.cells.some(p=>p.r===lastSwap.b.r&&p.c===lastSwap.b.c)?lastSwap.b:sq.cells[3];return{...preferred,type:'bomb',cells:sq.cells}}const longest=[...lines].sort((a,b)=>b.cells.length-a.cells.length)[0];if(!longest)return null;if(longest.cells.length>=5){const preferred=lastSwap&&longest.cells.some(p=>p.r===lastSwap.b.r&&p.c===lastSwap.b.c)?lastSwap.b:longest.cells[Math.floor(longest.cells.length/2)];return{...preferred,type:'rainbow'}}if(longest.cells.length===4){const preferred=lastSwap&&longest.cells.some(p=>p.r===lastSwap.b.r&&p.c===lastSwap.b.c)?lastSwap.b:longest.cells[1];return{...preferred,type:longest.dir==='h'?'rocket-h':'rocket-v'}}return null}

function dominantBoardColor(excluded=new Set()){
  const counts=Object.fromEntries(COLORS.map(c=>[c,0]));
  for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++){
    const g=board[r][c],k=key(r,c);
    if(g?.color&&g.special!=='rainbow'&&!excluded.has(k))counts[g.color]=(counts[g.color]||0)+1;
  }
  return [...COLORS].sort((a,b)=>(counts[b]||0)-(counts[a]||0))[0]||randomColor()
}
function addSpecialEffects(matches){
  const expanded=new Set(matches),triggered=new Set();
  let changed=true,guard=0;
  while(changed&&guard++<100){
    changed=false;
    for(const k of [...expanded]){
      const[r,c]=parseKey(k),g=board[r]?.[c];
      if(!g?.special||triggered.has(k))continue;
      triggered.add(k);changed=true;
      if(g.special==='rocket-h'){
        fx('rocket-h',r,c);for(let x=0;x<SIZE;x++)expanded.add(key(r,x))
      }else if(g.special==='rocket-v'){
        fx('rocket-v',r,c);for(let y=0;y<SIZE;y++)expanded.add(key(y,c))
      }else if(g.special==='bomb'){
        fx('bomb',r,c);
        for(let y=Math.max(0,r-2);y<=Math.min(SIZE-1,r+2);y++)
          for(let x=Math.max(0,c-2);x<=Math.min(SIZE-1,c+2);x++)
            if(Math.abs(y-r)+Math.abs(x-c)<=3)expanded.add(key(y,x))
      }else if(g.special==='rainbow'){
        const target=dominantBoardColor(expanded);
        fx('rainbow',r,c);showCombo(`${POP_INFO[target].name.toUpperCase()} DOMINE !`);
        for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++)if(board[y][x]?.color===target)expanded.add(key(y,x))
      }
    }
  }
  return expanded
}
function breakIce(matches){
  const crateHits=new Set();
  for(const k of matches){
    if(ice.has(k)){const layer=iceLayers.get(k)||1;if(layer>1)iceLayers.set(k,layer-1);else{ice.delete(k);iceLayers.delete(k)}}
    const [r,c]=parseKey(k);for(const[dr,dc]of[[0,0],[1,0],[-1,0],[0,1],[0,-1]]){const q=key(r+dr,c+dc);if(crates.has(q))crateHits.add(q)}
  }
  crateHits.forEach(k=>crates.delete(k))
}
async function animateSwap(a,b){const ga=$(`.cell[data-r="${a.r}"][data-c="${a.c}"] .gem`),gb=$(`.cell[data-r="${b.r}"][data-c="${b.c}"] .gem`);if(!ga||!gb)return;const ra=ga.getBoundingClientRect(),rb=gb.getBoundingClientRect(),dx=rb.left-ra.left,dy=rb.top-ra.top;ga.style.transform=`translate(${dx}px,${dy}px) rotate(var(--pop-rot,0deg))`;gb.style.transform=`translate(${-dx}px,${-dy}px) rotate(var(--pop-rot,0deg))`;await sleep(155)}

function specialKind(g){return g?.special||null}
function isRocket(g){return g?.special==='rocket-h'||g?.special==='rocket-v'}
function areaAdd(set,r,c,radius=2){for(let y=Math.max(0,r-radius);y<=Math.min(SIZE-1,r+radius);y++)for(let x=Math.max(0,c-radius);x<=Math.min(SIZE-1,c+radius);x++)set.add(key(y,x))}
function rocketAdd(set,r,c,wide=0){for(let d=-wide;d<=wide;d++){const rr=r+d,cc=c+d;if(rr>=0&&rr<SIZE)for(let x=0;x<SIZE;x++)set.add(key(rr,x));if(cc>=0&&cc<SIZE)for(let y=0;y<SIZE;y++)set.add(key(y,cc))}}
async function settleAfterSpecial(){await animateGravity();renderGameUI();await resolveBoard()}
async function activateSingleSpecial(pos,g){
  let set=new Set([key(pos.r,pos.c)]);
  if(isRocket(g)){if(g.special==='rocket-h'){fx('rocket-h',pos.r,pos.c);for(let x=0;x<SIZE;x++)set.add(key(pos.r,x))}else{fx('rocket-v',pos.r,pos.c);for(let y=0;y<SIZE;y++)set.add(key(y,pos.c))}}
  else if(g?.special==='bomb'){fx('bomb',pos.r,pos.c);areaAdd(set,pos.r,pos.c,2)}
  else return false;
  showCombo(g.special==='bomb'?'BOOM !':'FUSÉE !');
  await clearSet(addSpecialEffects(set),1,null);await settleAfterSpecial();return true
}
async function activateSpecialCombo(a,b,A,B){
  const sa=specialKind(A),sb=specialKind(B);
  if(!sa||!sb)return false;
  let set=new Set([key(a.r,a.c),key(b.r,b.c)]);
  // Prisme + prisme : toute la grille
  if(sa==='rainbow'&&sb==='rainbow'){
    for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++)set.add(key(r,c));
    fx('rainbow',b.r,b.c);showCombo('PRISME TOTAL !');
  }
  // Prisme + boost : transforme jusqu'à 15 Pops NORMAUX aléatoires, puis les active tous.
  else if(sa==='rainbow'||sb==='rainbow'){
    const rp=sa==='rainbow'?a:b, other=sa==='rainbow'?B:A, otherPos=sa==='rainbow'?b:a, special=other.special;
    fx('rainbow',rp.r,rp.c);showCombo(special==='bomb'?'15 BOMBES !':'15 FUSÉES !');
    const candidates=[];
    for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++){
      const g=board[r][c],k=key(r,c);
      if(g&&!g.special&&k!==key(rp.r,rp.c))candidates.push({r,c});
    }
    candidates.sort(()=>Math.random()-.5);
    const chosen=candidates.slice(0,15), effects=new Set([key(otherPos.r,otherPos.c)]);
    for(const p of chosen){
      board[p.r][p.c].special=special;
      effects.add(key(p.r,p.c));
    }
    set=addSpecialEffects(effects);
    set.add(key(rp.r,rp.c)); // le prisme est consommé sans appliquer sa réaction "couleur majoritaire"
  }
  // Bombe + fusée : 3 lignes + 3 colonnes.
  else if((sa==='bomb'&&isRocket(B))||(sb==='bomb'&&isRocket(A))){
    const center=sa==='bomb'?a:b;fx('bomb',center.r,center.c);fx('rocket-h',center.r,center.c);fx('rocket-v',center.r,center.c);
    rocketAdd(set,center.r,center.c,1);showCombo('BOMBE + FUSÉE !');
  }
  // Fusée + fusée : croix complète.
  else if(isRocket(A)&&isRocket(B)){
    const center=b;fx('rocket-h',center.r,center.c);fx('rocket-v',center.r,center.c);
    rocketAdd(set,center.r,center.c,0);showCombo('DOUBLE FUSÉE !');
  }
  // Bombe + bombe : énorme explosion.
  else if(sa==='bomb'&&sb==='bomb'){
    const center=b;fx('bomb',center.r,center.c);areaAdd(set,center.r,center.c,3);showCombo('MÉGA BOMBE !');
  } else return false;
  await clearSet(addSpecialEffects(set),1,null);await settleAfterSpecial();return true
}
async function attemptSwap(a,b){
  if(busy||gameEnded||!adjacent(a,b))return;
  busy=true;selected=null;lastSwap={a,b};
  const A=board[a.r][a.c],B=board[b.r][b.c];
  await animateSwap(a,b);swap(a,b);renderBoard();await sleep(35);

  // Deux boosts fusionnés : toujours un coup valide.
  if(A?.special&&B?.special){
    moves--;
    if(await activateSpecialCombo(b,a,A,B)){busy=false;renderGameUI();checkEnd();return}
  }

  // Prisme + Pop normal : supprime la couleur puis fait réellement retomber/remplir toute la grille.
  if(A?.special==='rainbow'||B?.special==='rainbow'){
    moves--;
    const rp=A?.special==='rainbow'?b:a,target=A?.special==='rainbow'?B?.color:A?.color,set=new Set([key(rp.r,rp.c)]);
    for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++)if(board[r][c]?.color===target)set.add(key(r,c));
    fx('rainbow',rp.r,rp.c);showCombo('PRISME !');
    await clearSet(addSpecialEffects(set),1,null);
    await settleAfterSpecial();
    busy=false;renderGameUI();checkEnd();return
  }

  // Une fusée ou une bombe déplacée se déclenche même sans Match-3.
  if(A?.special||B?.special){
    const moved=A?.special?{pos:b,g:A}:{pos:a,g:B};
    if(moved.g.special==='bomb'||isRocket(moved.g)){
      moves--;await activateSingleSpecial(moved.pos,moved.g);
      busy=false;renderGameUI();checkEnd();return
    }
  }

  if(!findMatches().size){
    await animateSwap(a,b);swap(a,b);renderBoard();busy=false;return
  }
  moves--;await resolveBoard();busy=false;renderGameUI();checkEnd()
}
async function resolveBoard(){let chain=0;while(true){const lines=linesOfMatches(),squares=squaresOfMatches();if(!lines.length&&!squares.length)break;chain++;let matches=new Set();lines.forEach(l=>l.cells.forEach(p=>matches.add(key(p.r,p.c))));squares.forEach(s=>s.cells.forEach(p=>matches.add(key(p.r,p.c))));const create=creationForPatterns(lines,squares);if(create)matches.delete(key(create.r,create.c));matches=addSpecialEffects(matches);await clearSet(matches,chain,create);await animateGravity();renderGameUI();await sleep(90)}if(!hasPossibleMove())await shuffleBoard(true,false)}
async function clearSet(matches,chain,create){breakIce(matches);for(const k of matches){const[r,c]=parseKey(k),g=board[r]?.[c];if(g?.color)collected[g.color]=(collected[g.color]||0)+1}score+=matches.size*120*chain+(chain>1?chain*260:0);if(chain>2)showCombo(`POP COMBO x${chain}!`);else if(chain>1)showCombo(`COMBO x${chain}!`);else if(matches.size>=7)showCombo('POP-TASTIQUE !');else if(matches.size>=4)showCombo('SUPER !');animatePop(matches);await sleep(185);matches.forEach(k=>{const[r,c]=parseKey(k);board[r][c]=null});if(create){const base=board[create.r]?.[create.c]||makeGem(randomColor());board[create.r][create.c]=makeGem(create.type==='rainbow'?'purple':base.color,create.type);fx('create',create.r,create.c)}renderBoard()}
function animatePop(set){for(const k of set){const[r,c]=parseKey(k),g=$(`.cell[data-r="${r}"][data-c="${c}"] .gem`);if(g)g.classList.add('pop')}}

function spawnParticles(r,c,count=18){
  const layer=$('#fxLayer'),boardEl=$('#board'),cell=$(`.cell[data-r="${r}"][data-c="${c}"]`);
  if(!cell)return;const br=boardEl.getBoundingClientRect(),cr=cell.getBoundingClientRect();
  for(let i=0;i<count;i++){
    const p=document.createElement('i');p.className='spark-particle';
    p.style.left=`${cr.left-br.left+cr.width/2}px`;p.style.top=`${cr.top-br.top+cr.height/2}px`;
    const a=Math.random()*Math.PI*2,d=35+Math.random()*95;
    p.style.setProperty('--px',`${Math.cos(a)*d}px`);p.style.setProperty('--py',`${Math.sin(a)*d}px`);
    p.style.setProperty('--rot',`${Math.floor(Math.random()*360)}deg`);
    layer.appendChild(p);setTimeout(()=>p.remove(),800)
  }
}
function fx(type,r,c){
  const layer=$('#fxLayer'),boardEl=$('#board'),cell=$(`.cell[data-r="${r}"][data-c="${c}"]`);
  if(!cell)return;const br=boardEl.getBoundingClientRect(),cr=cell.getBoundingClientRect(),el=document.createElement('div');
  el.className=`board-fx ${type}`;el.style.left=`${cr.left-br.left+cr.width/2}px`;el.style.top=`${cr.top-br.top+cr.height/2}px`;
  layer.appendChild(el);spawnParticles(r,c,type==='bomb'||type==='rainbow'?30:16);setTimeout(()=>el.remove(),650)
}
function collapse(){
  for(let c=0;c<SIZE;c++){
    let target=SIZE-1;
    for(let r=SIZE-1;r>=0;r--){
      const g=board[r][c];
      if(g){
        if(target!==r){board[target][c]=g;board[r][c]=null;g.drop=Math.max(1,target-r)}
        target--
      }
    }
    for(let r=target;r>=0;r--)board[r][c]=null
  }
}
function fill(){
  for(let c=0;c<SIZE;c++){
    let missing=0;
    for(let r=0;r<SIZE;r++)if(!board[r][c])missing++;
    let spawn=missing;
    for(let r=0;r<SIZE;r++)if(!board[r][c]){
      const g=makeGem();g.drop=r+spawn;g.fresh=true;board[r][c]=g;spawn--
    }
  }
}
async function animateGravity(){
  collapse();fill();renderBoard();await sleep(330);
  for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++)if(board[r][c]){delete board[r][c].drop;delete board[r][c].fresh}
  renderBoard();await sleep(35)
}
function hasPossibleMove(){for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++)for(const[dr,dc]of[[0,1],[1,0]]){const b={r:r+dr,c:c+dc};if(b.r>=SIZE||b.c>=SIZE)continue;swap({r,c},b);const ok=findMatches().size>0||!!board[r][c]?.special||!!board[b.r][b.c]?.special;swap({r,c},b);if(ok)return true}return false}
async function shuffleBoard(animated=true,paid=true){if(paid&&!consumeBooster('shuffle',COST.shuffle,'Mélange'))return;const flat=board.flat().filter(Boolean).map(g=>({...g}));for(let tries=0;tries<50;tries++){flat.sort(()=>Math.random()-.5);board=Array.from({length:SIZE},(_,r)=>flat.slice(r*SIZE,(r+1)*SIZE));if(!findMatches().size&&hasPossibleMove())break}renderBoard();if(animated){showCombo('MÉLANGE !');await sleep(240)}}
function showCombo(t){const e=$('#comboText');e.textContent=t;e.classList.remove('show');void e.offsetWidth;e.classList.add('show')}
function goalReached(){const g=levels[currentLevel].goal;if(g.type==='score')return score>=g.target;if(g.type==='ice')return ice.size===0;return(collected[g.color]||0)>=g.target}
function checkEnd(){if(goalReached())finishLevel(true);else if(moves<=0)finishLevel(false)}

function worldRewardForLevel(n){
  const w=WORLDS.find(x=>x.end===n);if(!w||save.worldRewards?.[w.id])return null;
  save.worldRewards=save.worldRewards||{};save.worldRewards[w.id]=true;
  const rewards=[
    {coins:1200,chests:1,boost:1},
    {coins:2200,chests:2,boost:2},
    {coins:3500,chests:3,boost:3}
  ][w.id]||{coins:1000,chests:1,boost:1};
  save.coins+=rewards.coins;save.chests=(save.chests||0)+rewards.chests;
  for(const k of ['hammer','shuffle','hint'])save.inventory[k]=(save.inventory[k]||0)+rewards.boost;
  return rewards
}
async function syncLeaderboard(){
  if(guest||!user||!save)return;
  try{
    await setDoc(doc(db,'leaderboard',user.uid),{
      uid:user.uid,pseudo:user.displayName||user.email?.split('@')[0]||'Joueur',
      totalScore:totalBestScore(),coins:Number(save.coins||0),unlocked:Number(save.unlocked||1),
      role:save.role||'player',updatedAt:serverTimestamp()
    },{merge:true})
  }catch(e){console.warn('Leaderboard sync:',e)}
}

function finishLevel(win){
  gameEnded=true;const m=$('#modal'),n=currentLevel+1;
  if(win){
    const stars=Math.max(1,currentStars()),old=save.stars[n]||0;
    let reward=140+stars*90+(currentWorld*40);
    const boss=BOSS_LEVELS.has(n),special=SPECIAL_LEVELS.has(n);
    if(boss)reward+=900;if(special)reward+=350;
    if(stars>old)save.stars[n]=stars;
    save.bestScores[n]=Math.max(save.bestScores[n]||0,score);
    if(n===save.unlocked&&save.unlocked<levels.length)save.unlocked++;
    save.coins+=reward;save.wins=(save.wins||0)+1;
    if(save.wins%5===0){save.chests=(save.chests||0)+1;toast('🎁 Coffre gagné !')}
    if(boss){save.chests=(save.chests||0)+1}
    const wr=worldRewardForLevel(n);
    persist();syncLeaderboard();
    $('#modalIcon').textContent=boss?'👑':special?'✨':currentWorld===1?'🌲':currentWorld===2?'💎':'🎉';
    $('#modalTitle').textContent=boss?'Boss vaincu !':special?'Niveau spécial réussi !':'Niveau réussi !';
    let msg=`${score.toLocaleString('fr-FR')} points · +${reward} pièces`;
    if(boss)msg+=' · +1 coffre boss';
    if(wr)msg+=` · MONDE TERMINÉ : +${wr.coins} 🪙, +${wr.chests} coffre(s), +${wr.boost} de chaque booster`;
    $('#modalText').textContent=msg;$('#modalStars').textContent='⭐'.repeat(stars)+'☆'.repeat(3-stars);
    $('#modalMainBtn').textContent=n<levels.length?'Niveau suivant':'Rejouer';
    $('#modalMainBtn').onclick=()=>{m.classList.add('hidden');startLevel(n<levels.length?currentLevel+1:currentLevel)}
  }else{
    consumeLife();syncLeaderboard();$('#modalIcon').textContent='💥';$('#modalTitle').textContent='Plus de coups';
    $('#modalText').textContent=`Score : ${score.toLocaleString('fr-FR')} · Essaie un booster !`;$('#modalStars').textContent='☆☆☆';
    $('#modalMainBtn').textContent='Réessayer';$('#modalMainBtn').onclick=()=>{m.classList.add('hidden');openPreLevel(currentLevel)}
  }
  m.classList.remove('hidden')
}
function spend(cost,label){if(save.coins<cost){toast(`Pas assez de pièces pour ${label} · ${cost} 🪙`);return false}save.coins-=cost;persist();toast(`-${cost} 🪙 · ${label}`);return true}
async function useHammer(r,c){if(!consumeBooster('hammer',COST.hammer,'Marteau')){hammerMode=false;$('#hammerBtn').classList.remove('active');return}busy=true;const k=key(r,c),g=board[r][c];if(g){collected[g.color]=(collected[g.color]||0)+1;score+=220;board[r][c]=null;ice.delete(k);fx('bomb',r,c);await animateGravity()}hammerMode=false;$('#hammerBtn').classList.remove('active');renderBoard();renderGameUI();busy=false;checkEnd()}
function updateBoosterStates(){if(!save)return;$('#shuffleBtn').classList.toggle('cant-afford',inventoryCount('shuffle')<1&&save.coins<COST.shuffle);$('#hammerBtn').classList.toggle('cant-afford',inventoryCount('hammer')<1&&save.coins<COST.hammer);$('#hintBtn').classList.toggle('cant-afford',inventoryCount('hint')<1&&save.coins<COST.hint);['hammer','shuffle','hint'].forEach(k=>$('#inv-'+k)&&($('#inv-'+k).textContent=inventoryCount(k)))}
function getCellFromEventTarget(t){const c=t.closest?.('.cell');return c?{r:+c.dataset.r,c:+c.dataset.c}:null}
function setupBoardControls(){const b=$('#board');b.addEventListener('pointerdown',e=>{if(busy||gameEnded)return;const p=getCellFromEventTarget(e.target);if(!p)return;pointerStart={...p,x:e.clientX,y:e.clientY,id:e.pointerId};try{b.setPointerCapture(e.pointerId)}catch{}});b.addEventListener('pointerup',e=>{if(!pointerStart||busy||gameEnded)return;const start=pointerStart;pointerStart=null;const dx=e.clientX-start.x,dy=e.clientY-start.y,dist=Math.hypot(dx,dy);if(hammerMode){useHammer(start.r,start.c);return}if(dist>22){const target={r:start.r,c:start.c};if(Math.abs(dx)>Math.abs(dy))target.c+=dx>0?1:-1;else target.r+=dy>0?1:-1;if(target.r>=0&&target.r<SIZE&&target.c>=0&&target.c<SIZE)attemptSwap({r:start.r,c:start.c},target);return}const p=getCellFromEventTarget(e.target)||{r:start.r,c:start.c};if(!selected){selected=p;renderBoard()}else if(selected.r===p.r&&selected.c===p.c){selected=null;renderBoard()}else if(adjacent(selected,p)){const a=selected;selected=null;attemptSwap(a,p)}else{selected=p;renderBoard()}});b.addEventListener('pointercancel',()=>pointerStart=null)}
function findHint(){for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++)for(const[dr,dc]of[[0,1],[1,0]]){const b={r:r+dr,c:c+dc};if(b.r>=SIZE||b.c>=SIZE)continue;swap({r,c},b);const ok=findMatches().size>0||!!board[r][c]?.special||!!board[b.r][b.c]?.special;swap({r,c},b);if(ok)return[{r,c},b]}return null}
function showHint(){if(!consumeBooster('hint',COST.hint,'Indice'))return;const h=findHint();if(!h)return;h.forEach(p=>$(`.cell[data-r="${p.r}"][data-c="${p.c}"] .gem`)?.classList.add('hint-gem'))}
function worldCountdown(){const tick=()=>{const now=new Date(),end=new Date(now);end.setHours(24,0,0,0);let s=Math.max(0,Math.floor((end-now)/1000)),h=String(Math.floor(s/3600)).padStart(2,'0');s%=3600;const m=String(Math.floor(s/60)).padStart(2,'0'),sec=String(s%60).padStart(2,'0');if($('#worldTimer'))$('#worldTimer').textContent=`${h}:${m}:${sec}`;if($('#mapScreen').classList.contains('active'))renderWorldSwitcher()};tick();setInterval(()=>{tick();updateLivesUI()},1000)}
function todayLocal(){const d=new Date();return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function dailyGift(){const today=todayLocal();if(save.lastGift===today){toast('Cadeau déjà récupéré aujourd’hui 🎁');return}save.lastGift=today;save.coins+=200;persist();toast('+200 pièces ! 🎁')}




async function loadLeaderboard(){
  const wrap=$('#leaderboardLists');wrap.classList.add('loading');
  ['rankScore','rankCoins','rankLevel'].forEach(id=>$('#'+id).innerHTML='<div class="admin-loading">Chargement...</div>');
  try{
    const snap=await getDocs(collection(db,'leaderboard'));
    const rows=snap.docs.map(d=>d.data()).filter(p=>p.role!=='admin');
    const top=(field)=>[...rows].sort((a,b)=>Number(b[field]||0)-Number(a[field]||0)).slice(0,10);
    renderLeaderboardColumn('rankScore',top('totalScore'),'totalScore','🏆');
    renderLeaderboardColumn('rankCoins',top('coins'),'coins','🪙');
    renderLeaderboardColumn('rankLevel',top('unlocked'),'unlocked','🚀');
    wrap.classList.remove('loading')
  }catch(e){console.error(e);wrap.classList.remove('loading');['rankScore','rankCoins','rankLevel'].forEach(id=>$('#'+id).innerHTML='<div class="admin-error">Classement inaccessible. Publie les règles Firestore V2.1.</div>')}
}
function renderLeaderboardColumn(id,rows,field,icon){
  const el=$('#'+id);el.innerHTML='';
  rows.forEach((p,i)=>{const r=document.createElement('div');r.className='rank-row';r.innerHTML=`<span class="rank-pos">${i+1}</span><b>${p.pseudo||'Joueur'}</b><strong>${icon} ${Number(p[field]||0).toLocaleString('fr-FR')}</strong>`;el.appendChild(r)})
  if(!rows.length)el.innerHTML='<small>Aucun score pour le moment.</small>'
}
function openLeaderboard(){$('#leaderboardPanel').classList.remove('hidden');loadLeaderboard()}
const SHOP={hammer:{price:250,qty:3,label:'3 Marteaux 🔨'},shuffle:{price:180,qty:3,label:'3 Mélanges 🔀'},hint:{price:120,qty:5,label:'5 Indices 💡'}};
function openShop(){updateShop();$('#shopPanel').classList.remove('hidden')}
function updateShop(){if(!save)return;$('#shopCoins').textContent=save.coins;['hammer','shuffle','hint'].forEach(k=>$('#shop-'+k)&&($('#shop-'+k).textContent=inventoryCount(k)));$('#chestCount').textContent=save.chests||0}
function buyPack(k){const p=SHOP[k];if(!p)return;if(save.coins<p.price){toast('Pas assez de pièces');return}save.coins-=p.price;save.inventory[k]=(save.inventory[k]||0)+p.qty;persist();updateShop();toast(`${p.label} ajoutés !`)}
function openChest(){
  if((save.chests||0)<1){toast('Aucun coffre disponible');return}
  save.chests--;const coins=350+Math.floor(Math.random()*451),bonus=['hammer','shuffle','hint'][Math.floor(Math.random()*3)],qty=1+Math.floor(Math.random()*2);
  save.coins+=coins;save.inventory[bonus]=(save.inventory[bonus]||0)+qty;persist();updateShop();toast(`🎁 +${coins} 🪙 et +${qty} ${bonus}`)
}
async function loadAdminPlayers(){
  if(!isAdmin)return;
  const list=$('#adminPlayers');list.innerHTML='<div class="admin-loading">Chargement...</div>';
  try{
    const snap=await getDocs(collection(db,'users'));adminPlayers=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.unlocked||1)-(a.unlocked||1));
    renderAdminPlayers()
  }catch(e){console.error(e);list.innerHTML='<div class="admin-error">Firestore refuse la lecture de la collection users. Ajoute les règles admin fournies dans firestore.rules.</div>'}
}
function renderAdminPlayers(){
  const list=$('#adminPlayers');list.innerHTML='';
  if(!adminPlayers.length){list.innerHTML='<div class="admin-loading">Aucun joueur.</div>';return}
  adminPlayers.forEach(p=>{
    const row=document.createElement('div');row.className='admin-player';
    row.innerHTML=`<div class="admin-player-main"><b>${p.pseudo||p.email||'Joueur'}</b><small>${p.email||p.id}</small></div><div class="admin-player-stats"><span>🏆 ${p.unlocked||1}</span><span>🪙 ${Number(p.coins||0).toLocaleString('fr-FR')}</span><span>❤️ ${p.lives??5}</span>${p.role==='admin'?'<strong>ADMIN</strong>':''}</div><button class="btn secondary manage-player">Gérer</button>`;
    row.querySelector('.manage-player').onclick=()=>selectAdminPlayer(p.id);list.appendChild(row)
  })
}
function selectAdminPlayer(id){
  const p=adminPlayers.find(x=>x.id===id);if(!p)return;
  $('#adminSelectedId').value=id;$('#adminPlayerName').textContent=p.pseudo||p.email||'Joueur';
  $('#adminPlayerCoins').value=p.coins||0;$('#adminPlayerLevel').value=p.unlocked||1;$('#adminPlayerLives').value=p.lives??5;
  $('#adminPlayerRole').value=p.role||'player';$('#adminPlayerEditor').classList.remove('hidden')
}
async function saveAdminPlayer(){
  if(!isAdmin)return;const id=$('#adminSelectedId').value;if(!id)return;
  const patch={coins:Math.max(0,Math.floor(Number($('#adminPlayerCoins').value)||0)),unlocked:Math.max(1,Math.min(levels.length,Math.floor(Number($('#adminPlayerLevel').value)||1))),lives:Math.max(0,Math.min(5,Math.floor(Number($('#adminPlayerLives').value)||0))),role:$('#adminPlayerRole').value,updatedAt:serverTimestamp()};
  try{await setDoc(doc(db,'users',id),patch,{merge:true});const p=adminPlayers.find(x=>x.id===id)||{};await setDoc(doc(db,'leaderboard',id),{uid:id,pseudo:p.pseudo||p.email?.split('@')[0]||'Joueur',coins:patch.coins,unlocked:patch.unlocked,totalScore:Object.values(p.bestScores||{}).reduce((a,b)=>a+Number(b||0),0),role:patch.role,updatedAt:serverTimestamp()},{merge:true});toast('Joueur mis à jour ✓');await loadAdminPlayers()}catch(e){console.error(e);toast('Modification refusée par Firestore')}
}
async function adminSaveNow(){
  if(!isAdmin||guest||!user)return;
  await setDoc(doc(db,'users',user.uid),{...save,role:'admin',uid:user.uid,email:user.email,pseudo:user.displayName||'Admin',updatedAt:serverTimestamp()},{merge:true});
  localStorage.setItem(localKey(),JSON.stringify(save));updateProfile();renderMap()
}
function openAdmin(){
  if(!isAdmin){toast('Accès administrateur refusé');return}
  $('#profilePanel').classList.add('hidden');$('#adminPanel').classList.remove('hidden');
  $('#adminCoinsValue').value=save.coins;$('#adminLevelValue').value=save.unlocked;loadAdminPlayers()
}
async function adminApply(){
  if(!isAdmin)return;
  const coins=Math.max(0,Math.floor(Number($('#adminCoinsValue').value)||0));
  const unlocked=Math.max(1,Math.min(levels.length,Math.floor(Number($('#adminLevelValue').value)||1)));
  save.coins=coins;save.unlocked=unlocked;await adminSaveNow();toast('Données admin enregistrées ✓')
}
async function adminBonus(){
  if(!isAdmin)return;save.coins+=5000;await adminSaveNow();$('#adminCoinsValue').value=save.coins;toast('+5 000 pièces admin')
}
async function adminUnlockAll(){
  if(!isAdmin)return;save.unlocked=levels.length;await adminSaveNow();$('#adminLevelValue').value=save.unlocked;toast('Tous les niveaux débloqués')
}
setupAuth();setupBoardControls();worldCountdown();
$('#leaderboardBtn').onclick=openLeaderboard;$('#closeLeaderboard').onclick=()=>$('#leaderboardPanel').classList.add('hidden');$('#shopBtn').onclick=openShop;$('#closeShop').onclick=()=>$('#shopPanel').classList.add('hidden');$('#shopPanel').onclick=e=>{if(e.target.id==='shopPanel')e.currentTarget.classList.add('hidden')};$$('[data-buy]').forEach(b=>b.onclick=()=>buyPack(b.dataset.buy));$('#openChestBtn').onclick=openChest;$('#preCancelBtn').onclick=()=>$('#preLevelModal').classList.add('hidden');$('#prePlayBtn').onclick=()=>actualStartLevel(currentLevel);$('#adminRefreshPlayers').onclick=loadAdminPlayers;$('#adminSavePlayer').onclick=saveAdminPlayer;$('#playBtn').onclick=()=>{currentWorld=worldForLevel(save.unlocked);showScreen('mapScreen')};$$('[data-go]').forEach(b=>b.onclick=()=>showScreen(b.dataset.go));$('#backToMap').onclick=()=>{if(confirm('Quitter le niveau en cours ?'))showScreen('mapScreen')};$('#modalMapBtn').onclick=()=>{$('#modal').classList.add('hidden');showScreen('mapScreen')};$('#shuffleBtn').onclick=async()=>{if(busy||gameEnded)return;busy=true;await shuffleBoard(true,true);busy=false};$('#hammerBtn').onclick=()=>{if(busy||gameEnded)return;if(inventoryCount('hammer')<1&&save.coins<COST.hammer){toast(`Marteau : ${COST.hammer} 🪙`);return}hammerMode=!hammerMode;$('#hammerBtn').classList.toggle('active',hammerMode);if(hammerMode)toast('Choisis un Pop à casser 🔨')};$('#hintBtn').onclick=()=>{if(!busy&&!gameEnded)showHint()};$('#accountBtn').onclick=()=>{$('#profilePanel').classList.remove('hidden');updateProfile()};$('#closeProfile').onclick=()=>$('#profilePanel').classList.add('hidden');$('#adminBtn').onclick=openAdmin;$('#closeAdmin').onclick=()=>$('#adminPanel').classList.add('hidden');$('#adminApplyBtn').onclick=adminApply;$('#adminBonusBtn').onclick=adminBonus;$('#adminUnlockBtn').onclick=adminUnlockAll;$('#profilePanel').onclick=e=>{if(e.target.id==='profilePanel')e.currentTarget.classList.add('hidden')};$('#logoutBtn').onclick=async()=>{guest=false;save=null;$('#profilePanel').classList.add('hidden');if(auth.currentUser)await signOut(auth);else showScreen('authScreen')};$('#resetBtn').onclick=async()=>{if(!confirm('Réinitialiser la progression de ce compte ?'))return;save=defaultSave();normalizeSave();persist();if(!guest&&user)await setDoc(doc(db,'users',user.uid),{...save,uid:user.uid,email:user.email,pseudo:user.displayName||'Joueur',updatedAt:serverTimestamp()},{merge:true});updateProfile();toast('Progression réinitialisée')};$('#dailyRewardBtn').onclick=dailyGift;

onAuthStateChanged(auth,async fbUser=>{if(guest)return;if(!fbUser){user=null;save=null;isAdmin=false;showScreen('authScreen');return}try{user=fbUser;guest=false;await loadCloudSave();updateProfile();syncLeaderboard();showScreen('homeScreen')}catch(e){console.error(e);$('#authMessage').textContent='Compte connecté, mais Firestore est inaccessible. Vérifie les règles Firestore.';save=localLoad();updateProfile();showScreen('homeScreen')}});
