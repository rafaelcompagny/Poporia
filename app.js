import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile as updateAuthProfile } from 'https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp, collection, getDocs } from 'https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js';
import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/12.17.1/firebase-functions.js';

const firebaseConfig={apiKey:'AIzaSyBazNUpVtQ7EYwRKatIhyT7n-r6toIL7A8',authDomain:'poporia-2db62.firebaseapp.com',projectId:'poporia-2db62',storageBucket:'poporia-2db62.firebasestorage.app',messagingSenderId:'383387696155',appId:'1:383387696155:web:352bd30ab0cb930edc8cbe',measurementId:'G-6DYXGNVSHT'};
const firebaseApp=initializeApp(firebaseConfig), auth=getAuth(firebaseApp), db=getFirestore(firebaseApp), functions=getFunctions(firebaseApp,'europe-west1');
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const SIZE=8, COLORS=['red','blue','green','yellow','purple','pink'], COST={shuffle:75,hammer:100,hint:25};
const POP_INFO={red:{name:'Ruby',symbol:'●'},blue:{name:'Nova',symbol:'★'},green:{name:'Leaf',symbol:'◆'},yellow:{name:'Spark',symbol:'✦'},purple:{name:'Hexa',symbol:'⬡'},pink:{name:'Heart',symbol:'♥'}};
const WORLDS=[
 {id:0,name:'Poporia City',short:'City',icon:'🏙️',subtitle:'Les premiers éclats',start:1,end:10},
 {id:1,name:'Poporia Forest',short:'Forest',icon:'🌲',subtitle:'Sous les feuilles magiques',start:11,end:20},
 {id:2,name:'Crystal Caves',short:'Caves',icon:'💎',subtitle:'Les profondeurs scintillantes',start:21,end:30},
 {id:3,name:'Poporia Beach',short:'Beach',icon:'🏖️',subtitle:'Les marées enchantées',start:31,end:40},
 {id:4,name:'Sky Kingdom',short:'Sky',icon:'☁️',subtitle:'Au-dessus des nuages',start:41,end:50},
 {id:5,name:'Volcano Pop',short:'Volcano',icon:'🌋',subtitle:'Au cœur de la lave',start:51,end:60},
 {id:6,name:'Neon Galaxy',short:'Galaxy',icon:'🌌',subtitle:'Aux frontières de Poporia',start:61,end:70},
 {id:7,name:'Royal Peaks',short:'Royal',icon:'🏰',subtitle:'Le royaume des Maîtres Pops',start:71,end:80}
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
 {moves:13,goal:{type:'score',target:50000},ice:16,iceLayers:2,crates:8,stars:[50000,60000,72000]},
 {moves:18,goal:{type:'crates',target:10},crates:10,chains:6,stars:[52000,62500,75000]},
 {moves:17,goal:{type:'collect',color:'pink',target:72},slime:7,stars:[54000,65000,78000]},
 {moves:16,goal:{type:'specials',target:4},chains:8,stars:[56000,67500,81000]},
 {moves:16,goal:{type:'ice',target:20},ice:20,iceLayers:2,slime:8,stars:[58000,70000,84000]},
 {moves:15,goal:{type:'crates',target:14},crates:14,chains:8,slime:6,stars:[60000,72500,87000]},
 {moves:15,goal:{type:'score',target:62000},chains:10,stars:[62000,75000,90000]},
 {moves:14,goal:{type:'specials',target:6},slime:10,stars:[64000,77500,93000]},
 {moves:14,goal:{type:'collect',color:'yellow',target:80},chains:10,slime:8,stars:[66000,80000,96000]},
 {moves:13,goal:{type:'crates',target:18},crates:18,ice:10,iceLayers:2,chains:10,stars:[69000,83500,100000]},
 {moves:12,goal:{type:'score',target:75000},crates:10,ice:12,iceLayers:2,chains:12,slime:10,stars:[75000,90000,108000]},
 {moves:18,goal:{type:'rocks',target:8},rocks:8,stars:[78000,94000,112000]},
 {moves:17,goal:{type:'collect',color:'red',target:86},fog:8,stars:[80000,96500,115000]},
 {moves:16,goal:{type:'score',target:82000},time:90,rocks:6,stars:[82000,99000,119000]},
 {moves:16,goal:{type:'fog',target:10},fog:10,chains:8,stars:[85000,102000,122000]},
 {moves:15,goal:{type:'specials',target:7},rocks:8,fog:6,stars:[88000,106000,127000]},
 {moves:15,goal:{type:'collect',color:'green',target:90},time:80,fog:10,stars:[90000,109000,131000]},
 {moves:14,goal:{type:'rocks',target:12},rocks:12,ice:8,iceLayers:2,stars:[93000,112000,135000]},
 {moves:14,goal:{type:'score',target:96000},fog:12,crates:8,stars:[96000,116000,139000]},
 {moves:13,goal:{type:'fog',target:14},fog:14,rocks:8,stars:[99000,120000,144000]},
 {moves:12,goal:{type:'score',target:105000},time:75,rocks:10,fog:10,stars:[105000,126000,151000]},
 {moves:17,goal:{type:'collect',color:'blue',target:96},lava:8,stars:[108000,130000,156000]},
 {moves:16,goal:{type:'rocks',target:14},rocks:14,lava:8,stars:[111000,134000,161000]},
 {moves:15,goal:{type:'score',target:115000},time:70,lava:10,stars:[115000,139000,167000]},
 {moves:15,goal:{type:'lava',target:12},lava:12,chains:10,stars:[118000,143000,172000]},
 {moves:14,goal:{type:'specials',target:8},rocks:10,lava:10,stars:[122000,148000,178000]},
 {moves:14,goal:{type:'collect',color:'purple',target:100},time:65,lava:12,fog:8,stars:[126000,153000,184000]},
 {moves:13,goal:{type:'rocks',target:16},rocks:16,lava:10,ice:8,iceLayers:2,stars:[130000,158000,190000]},
 {moves:13,goal:{type:'lava',target:16},lava:16,crates:10,stars:[135000,164000,197000]},
 {moves:12,goal:{type:'score',target:140000},fog:12,lava:12,rocks:10,stars:[140000,170000,204000]},
 {moves:11,goal:{type:'score',target:150000},time:60,rocks:12,fog:12,lava:12,stars:[150000,182000,218000]},
 {moves:16,goal:{type:'collect',color:'pink',target:105},fog:10,stars:[154000,187000,224000]},
 {moves:15,goal:{type:'specials',target:9},rocks:10,stars:[158000,192000,230000]},
 {moves:15,goal:{type:'score',target:162000},time:60,fog:12,stars:[162000,197000,236000]},
 {moves:14,goal:{type:'rocks',target:18},rocks:18,chains:10,stars:[166000,202000,242000]},
 {moves:14,goal:{type:'fog',target:18},fog:18,stars:[170000,207000,248000]},
 {moves:13,goal:{type:'score',target:176000},time:55,lava:10,stars:[176000,214000,257000]},
 {moves:13,goal:{type:'collect',color:'blue',target:112},rocks:12,fog:10,stars:[181000,220000,264000]},
 {moves:12,goal:{type:'lava',target:18},lava:18,crates:10,stars:[186000,226000,271000]},
 {moves:12,goal:{type:'specials',target:10},fog:10,lava:10,stars:[192000,233000,280000]},
 {moves:11,goal:{type:'score',target:200000},time:50,rocks:14,fog:14,stars:[200000,243000,292000]},
 {moves:15,goal:{type:'collect',color:'yellow',target:120},ice:12,iceLayers:2,stars:[205000,249000,299000]},
 {moves:14,goal:{type:'crates',target:20},crates:20,chains:12,stars:[210000,255000,306000]},
 {moves:14,goal:{type:'score',target:216000},time:50,rocks:12,stars:[216000,262000,314000]},
 {moves:13,goal:{type:'fog',target:20},fog:20,lava:10,stars:[222000,270000,324000]},
 {moves:13,goal:{type:'specials',target:12},rocks:12,crates:10,stars:[228000,277000,332000]},
 {moves:12,goal:{type:'lava',target:20},lava:20,fog:10,stars:[234000,284000,341000]},
 {moves:12,goal:{type:'collect',color:'purple',target:128},time:45,stars:[240000,292000,350000]},
 {moves:11,goal:{type:'rocks',target:22},rocks:22,ice:10,iceLayers:2,stars:[247000,300000,360000]},
 {moves:11,goal:{type:'score',target:255000},fog:16,lava:16,crates:12,stars:[255000,310000,372000]},
 {moves:10,goal:{type:'score',target:270000},time:45,rocks:16,fog:16,lava:16,stars:[270000,328000,394000]}
];
const BOSS_LEVELS=new Set([10,20,30,40,50,60,70,80]), SPECIAL_LEVELS=new Set([5,15,25,35,45,55,65,75]);

let user=null, guest=false, save=null, isAdmin=false, currentWorld=0,currentLevel=0,board=[],ice=new Set(),iceLayers=new Map(),crates=new Set(),selected=null,score=0,moves=0,collected={},busy=false,hammerMode=false,gameEnded=false,authMode='login',pointerStart=null,lastSwap=null,syncTimer=null,adminPlayers=[],failurePending=false,tutorialMode=false,tutorialStep=0,specialsCreated=0,chains=new Set(),slime=new Set(),rocks=new Set(),fog=new Set(),lava=new Set(),levelTimeLeft=null,levelTimerId=null,infiniteMode=false,infiniteBest=0,infiniteStartTime=0;
const defaultSave=()=>({coins:500,stars:{},bestScores:{},unlocked:1,lastGift:null,role:'player',lives:5,maxLives:5,lastLifeAt:Date.now(),inventory:{hammer:1,shuffle:1,hint:2,bomb:0,rocket:0,rainbow:0},usedPromoCodes:[],chests:0,wins:0,worldRewards:{},profile:{bio:'',avatar:'',joinedAt:Date.now(),clanId:null,clanRole:null},tutorialDone:false,seenFeatureTutorials:{},dailyMissions:{date:null,items:[]},eventProgress:{},seasonPass:{season:'S1',xp:0,claimed:[],premium:false},social:{friendCode:'',friends:[]},achievements:{},notifications:[],chestInventory:{common:0,rare:0,epic:0},skins:{owned:['classic'],active:'classic'},infiniteBest:0,createdAt:Date.now()});
const localKey=()=>guest?'poporiaGuestSave':`poporiaCache:${user?.uid||'none'}`;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function toast(t){const el=$('#toast');el.textContent=t;el.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(()=>el.classList.remove('show'),1900)}
function showScreen(id){$$('.screen').forEach(s=>s.classList.remove('active'));$('#'+id).classList.add('active');if(id==='mapScreen')renderMap();if(id==='homeScreen')updateProfile()}
function localLoad(){try{return{...defaultSave(),...(JSON.parse(localStorage.getItem(localKey()))||{})}}catch{return defaultSave()}}
async function loadCloudSave(){if(guest){save=localLoad();isAdmin=false;return}const ref=doc(db,'users',user.uid),snap=await getDoc(ref);if(snap.exists())save={...defaultSave(),...snap.data()};else{save=defaultSave();await setDoc(ref,{...save,uid:user.uid,email:user.email,pseudo:user.displayName||'Joueur',updatedAt:serverTimestamp()})}normalizeSave();isAdmin=save.role==='admin'||save.isAdmin===true;localStorage.setItem(localKey(),JSON.stringify(save))}
function persist(){if(!save)return;localStorage.setItem(localKey(),JSON.stringify(save));updateCurrencies();if(!guest&&user){clearTimeout(syncTimer);syncTimer=setTimeout(async()=>{try{await setDoc(doc(db,'users',user.uid),{...save,uid:user.uid,email:user.email,pseudo:user.displayName||'Joueur',updatedAt:serverTimestamp()},{merge:true});await syncLeaderboard();$('#syncState').textContent='Cloud'}catch(e){$('#syncState').textContent='Local';console.warn('Sync Firebase:',e)}},250)}}
function displayName(){return guest?(save?.profile?.localPseudo||'Invité'):user?.displayName||user?.email?.split('@')[0]||'Joueur'}
function profileData(){save.profile=save.profile||{bio:'',avatar:'',joinedAt:Date.now(),clanId:null};return save.profile}
function applyAvatar(el,avatar,fallback){
  if(!el)return;el.style.backgroundImage='';el.classList.remove('has-photo');
  if(avatar){el.textContent='';el.style.backgroundImage=`url("${avatar}")`;el.classList.add('has-photo')}else el.textContent=fallback
}
async function savePlayerProfile(){
  const p=profileData(),pseudo=$('#profilePseudoInput').value.trim().slice(0,16)||displayName(),bio=$('#profileBioInput').value.trim().slice(0,80);
  p.bio=bio;
  if(!guest&&user&&pseudo!==user.displayName){try{await updateAuthProfile(user,{displayName:pseudo})}catch(e){console.warn(e)}}
  if(guest)p.localPseudo=pseudo;
  persist();updateProfile();syncSocialProfile();toast('Profil enregistré ✓')
}
function resizeProfileImage(file){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();reader.onerror=reject;reader.onload=()=>{
      const img=new Image();img.onerror=reject;img.onload=()=>{
        const canvas=document.createElement('canvas'),size=160;canvas.width=size;canvas.height=size;
        const ctx=canvas.getContext('2d'),s=Math.min(img.width,img.height),sx=(img.width-s)/2,sy=(img.height-s)/2;
        ctx.drawImage(img,sx,sy,s,s,0,0,size,size);resolve(canvas.toDataURL('image/jpeg',.76))
      };img.src=reader.result
    };reader.readAsDataURL(file)
  })
}
async function handleProfilePhoto(file){
  if(!file)return;if(!file.type.startsWith('image/')){toast('Choisis une image');return}
  try{profileData().avatar=await resizeProfileImage(file);persist();updateProfile();toast('Photo de profil mise à jour 📷')}catch(e){toast('Impossible de lire cette image')}
}
const TUTORIAL_STEPS=[
  ['Premier Match-3','Glisse le Pop jaune vers la droite pour aligner 3 Pops jaunes.','swap'],
  ['Créer une Fusée 🚀','Glisse le Pop bleu vers la droite : 4 Pops bleus alignés créent une fusée.','swap'],
  ['Activer la Fusée','Déplace la fusée sur une case voisine. Une fusée déplacée s’active immédiatement.','special'],
  ['Créer une Bombe 💣','Forme un carré 2×2 avec les Pops rouges indiqués.','swap'],
  ['Créer un Prisme 🌈','Aligne 5 Pops violets pour créer un prisme multicolore.','swap'],
  ['Bravo !','Tu connais les bases. Les nouveaux obstacles seront expliqués automatiquement quand ils apparaîtront.','finish']
];
function tutorialBoard(step){
  board=Array.from({length:SIZE},(_,r)=>Array.from({length:SIZE},(_,c)=>makeGem(COLORS[(r*2+c*3)%COLORS.length])));
  // Remove accidental starting matches by regenerating until clean.
  let guard=0;while(findMatches().size&&guard++<30)for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++)board[r][c]=makeGem(randomColor());
  if(step===0){board[3][2]=makeGem('yellow');board[3][4]=makeGem('yellow');board[3][5]=makeGem('yellow');board[2][3]=makeGem('yellow');}
  if(step===1){board[4][1]=makeGem('blue');board[4][3]=makeGem('blue');board[4][4]=makeGem('blue');board[4][5]=makeGem('blue');board[3][2]=makeGem('blue');}
  if(step===2){board[3][3]=makeGem('blue','rocket-h')}
  if(step===3){board[3][3]=makeGem('red');board[3][4]=makeGem('red');board[4][3]=makeGem('red');board[5][4]=makeGem('red');board[4][4]=makeGem('green')}
  if(step===4){board[3][1]=makeGem('purple');board[3][2]=makeGem('purple');board[3][4]=makeGem('purple');board[3][5]=makeGem('purple');board[3][6]=makeGem('purple');board[2][3]=makeGem('purple')}
}
function showTutorialCoach(){
  const s=TUTORIAL_STEPS[Math.min(tutorialStep,TUTORIAL_STEPS.length-1)];
  $('#tutorialCoach').classList.remove('hidden');$('#coachTitle').textContent=s[0];$('#coachText').textContent=s[1];
  $('#coachNextBtn').classList.toggle('hidden',s[2]!=='finish');$('#coachNextBtn').textContent='Terminer le tutoriel';
  $$('.cell').forEach(x=>x.classList.remove('tutorial-target'));
  const targets=tutorialStep===0?[[2,3],[3,3]]:tutorialStep===1?[[3,2],[4,2]]:tutorialStep===2?[[3,3],[3,4]]:tutorialStep===3?[[5,4],[4,4]]:tutorialStep===4?[[2,3],[3,3]]:[];
  targets.forEach(([r,c])=>$(`.cell[data-r="${r}"][data-c="${c}"]`)?.classList.add('tutorial-target'))
}
function startTutorialLevel(){
  stopLevelTimer();tutorialMode=true;$('#gameScreen').classList.add('tutorial-active');tutorialStep=0;failurePending=false;score=0;moves=99;selected=null;collected={};specialsCreated=0;busy=false;hammerMode=false;gameEnded=false;lastSwap=null;currentLevel=0;currentWorld=0;
  ice=new Set();iceLayers=new Map();crates=new Set();chains=new Set();slime=new Set();tutorialBoard(0);
  showScreen('gameScreen');renderGameUI();renderBoard();showTutorialCoach()
}
function advanceTutorial(){
  if(!tutorialMode)return;tutorialStep++;
  if(tutorialStep>=TUTORIAL_STEPS.length-1){tutorialBoard(0);renderBoard();showTutorialCoach();return}
  tutorialBoard(tutorialStep);renderBoard();renderGameUI();showTutorialCoach()
}
function finishTutorial(){
  if(!tutorialMode)return;save.tutorialDone=true;persist();tutorialMode=false;stopLevelTimer();$('#gameScreen').classList.remove('tutorial-active');$('#tutorialCoach').classList.add('hidden');showScreen('homeScreen');toast('Tutoriel terminé 🎓')
}
function tutorialActionCompleted(){if(!tutorialMode)return;setTimeout(()=>advanceTutorial(),260)}

const FEATURE_TUTORIALS={
  ice:{icon:'❄️',title:'Nouveau : le glaçon',text:'Un Pop gelé ne peut pas être déplacé. Fais une combinaison qui touche sa case pour casser la glace et le libérer.'},
  crates:{icon:'📦',title:'Nouveau : les caisses',text:'Les caisses bloquent la zone. Fais des combinaisons juste à côté pour les détruire.'},
  chains:{icon:'⛓️',title:'Nouveau : les chaînes',text:'Les chaînes retiennent une case. Fais disparaître le Pop concerné pour casser la chaîne.'},
  slime:{icon:'🫧',title:'Nouveau : la gelée',text:'La gelée recouvre les Pops. Fais une combinaison sur la case pour la nettoyer.'},rock:{icon:'🪨',title:'Nouveau : le rocher',text:'Les rochers sont solides : touche-les avec une combinaison ou une explosion pour les casser.'},fog:{icon:'🌫️',title:'Nouveau : le brouillard',text:'Le brouillard masque les Pops. Fais une combinaison sur la case pour le dissiper.'},lava:{icon:'🌋',title:'Nouveau : la lave',text:'La lave rend la case dangereuse. Nettoie-la avec une combinaison ou une explosion avant la fin du niveau.'},timer:{icon:'⏱️',title:'Nouveau : niveau chronométré',text:'Le temps remplace la tranquillité habituelle : termine l’objectif avant que le chrono atteigne zéro.'}
};
let pendingFeatureTutorials=[];
function levelFeatureTutorials(l){
  const out=[];if(l.ice)out.push('ice');if(l.crates)out.push('crates');if(l.chains)out.push('chains');if(l.slime)out.push('slime');if(l.rocks)out.push('rock');if(l.fog)out.push('fog');if(l.lava)out.push('lava');if(l.time)out.push('timer');return out.filter(k=>!save.seenFeatureTutorials?.[k])
}
function showNextFeatureTutorial(){
  if(!pendingFeatureTutorials.length){$('#featureTutorial').classList.add('hidden');if(!tutorialMode&&levels[currentLevel]?.time&&levelTimeLeft==null&&!gameEnded)startLevelTimer(levels[currentLevel].time);return}
  const k=pendingFeatureTutorials[0],t=FEATURE_TUTORIALS[k];$('#featureTutorialIcon').textContent=t.icon;$('#featureTutorialTitle').textContent=t.title;$('#featureTutorialText').textContent=t.text;$('#featureTutorial').classList.remove('hidden')
}
function acceptFeatureTutorial(){
  const k=pendingFeatureTutorials.shift();if(k){save.seenFeatureTutorials[k]=true;persist()}showNextFeatureTutorial()
}
function totalStars(){return Object.values(save?.stars||{}).reduce((a,b)=>a+Number(b||0),0)}
function totalBestScore(){return Object.values(save?.bestScores||{}).reduce((a,b)=>a+Number(b||0),0)}
const LIFE_MS=10*60*1000;
function normalizeSave(){
  save={...defaultSave(),...(save||{})};
  save.inventory={...defaultSave().inventory,...(save.inventory||{})};
  save.profile={...defaultSave().profile,...(save.profile||{})};save.seenFeatureTutorials={...(save.seenFeatureTutorials||{})};save.seasonPass={...defaultSave().seasonPass,...(save.seasonPass||{})};save.seasonPass.claimed=[...(save.seasonPass.claimed||[])];save.social={...defaultSave().social,...(save.social||{})};save.social.friends=[...(save.social.friends||[])];save.achievements={...(save.achievements||{})};save.notifications=[...(save.notifications||[])];save.chestInventory={...defaultSave().chestInventory,...(save.chestInventory||{})};if(Number(save.chests||0)>0){save.chestInventory.common+=Number(save.chests||0);save.chests=0}save.skins={...defaultSave().skins,...(save.skins||{})};save.skins.owned=[...(save.skins.owned||['classic'])];if(!save.social.friendCode)save.social.friendCode=Math.random().toString(36).slice(2,8).toUpperCase();
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

function updateCurrencies(){if(!save)return;regenLives();['homeCoins','mapCoins','gameCoins'].forEach(id=>$('#'+id)&&($('#'+id).textContent=save.coins));$('#homeStars').textContent=totalStars();$('#homeLevel').textContent=save.unlocked;$('#syncState').textContent=guest?'Local':'Cloud';updateLivesUI();['hammer','shuffle','hint','bomb','rocket','rainbow'].forEach(k=>$('#inv-'+k)&&($('#inv-'+k).textContent=inventoryCount(k)))}
function updateProfile(){if(!save)return;const name=displayName(),initial=name[0]?.toUpperCase()||'P',stars=totalStars(),p=profileData(),scoreTotal=totalBestScore();$('#homePlayer').textContent=name;applyAvatar($('#homeAvatar'),p.avatar,initial);applyAvatar($('#profileAvatar'),p.avatar,initial);$('#profileName').textContent=name;$('#profileType').textContent=guest?'Progression invitée locale':isAdmin?`${user?.email||'Compte Firebase'} · ADMIN`:user?.email||'Compte Firebase';$('#profileClan').textContent=p.clanId?`🛡️ Clan · ${p.clanRole||'membre'}`:'🛡️ Sans clan';$('#profilePseudoInput').value=name;$('#profileBioInput').value=p.bio||'';$('#profileCoins').textContent=save.coins;$('#profileStars').textContent=stars;$('#profileBest').textContent=save.unlocked;$('#profileTotalScore').textContent=scoreTotal.toLocaleString('fr-FR');$('#profileWins').textContent=save.wins||0;if($('#profileFriendCode'))$('#profileFriendCode').textContent=save.social.friendCode;if($('#profileFriends'))$('#profileFriends').textContent=save.social.friends.length;if($('#profileInfinite'))$('#profileInfinite').textContent=Number(save.infiniteBest||0).toLocaleString('fr-FR');if($('#profileSkin'))$('#profileSkin').textContent=(SKINS.find(s=>s.id===save.skins.active)||SKINS[0]).name;$('#homeRank').textContent=isAdmin?'ADMIN':stars>=40?'Maître Pop':stars>=20?'Expert Pop':'Explorateur';if($('#tutorialLevelBtn'))$('#tutorialLevelBtn').textContent=save.tutorialDone?'🎓 Rejouer le tutoriel':'🎓 Tutoriel obligatoire';if($('#adminBtn'))$('#adminBtn').classList.toggle('hidden',!isAdmin);updateCurrencies()}
function authError(e){
  const map={
    'auth/email-already-in-use':'Cet email possède déjà un compte.',
    'auth/invalid-credential':'Email ou mot de passe incorrect.',
    'auth/wrong-password':'Mot de passe incorrect.',
    'auth/user-not-found':'Aucun compte trouvé avec cet email.',
    'auth/user-disabled':'Ce compte a été désactivé.',
    'auth/weak-password':'Le mot de passe doit contenir au moins 6 caractères.',
    'auth/invalid-email':'Adresse email invalide.',
    'auth/operation-not-allowed':'Active Email/Mot de passe dans Firebase Authentication.',
    'auth/too-many-requests':'Trop de tentatives. Réessaie plus tard.'
  };
  return map[e.code]||`Firebase : ${e.code||e.message}`;
}
function setupAuth(){const switchMode=m=>{authMode=m;$('#loginTab').classList.toggle('active',m==='login');$('#registerTab').classList.toggle('active',m==='register');$('#usernameLabel').classList.toggle('hidden',m!=='register');$('#usernameInput').required=m==='register';$('#authSubmit').textContent=m==='login'?'Entrer dans Poporia':'Créer mon compte';$('#passwordInput').autocomplete=m==='login'?'current-password':'new-password';$('#authMessage').textContent=''};$('#loginTab').onclick=()=>switchMode('login');$('#registerTab').onclick=()=>switchMode('register');$('#authForm').onsubmit=async e=>{e.preventDefault();const email=$('#emailInput').value.trim(),pass=$('#passwordInput').value,pseudo=$('#usernameInput').value.trim();$('#authSubmit').disabled=true;$('#authMessage').textContent='Connexion...';try{if(authMode==='register'){const cred=await createUserWithEmailAndPassword(auth,email,pass);await updateAuthProfile(cred.user,{displayName:pseudo||email.split('@')[0]});user=cred.user}else await signInWithEmailAndPassword(auth,email,pass)}catch(err){$('#authMessage').textContent=authError(err)}finally{$('#authSubmit').disabled=false}};$('#guestBtn').onclick=async()=>{if(auth.currentUser)await signOut(auth);guest=true;user=null;isAdmin=false;save=localLoad();normalizeSave();applySkin();ensureDailyMissions();updateProfile();updateNotificationBadge();loadEvents();showScreen('homeScreen')}}

function worldForLevel(n){return n<=10?0:n<=20?1:n<=30?2:n<=40?3:n<=50?4:n<=60?5:n<=70?6:7}
function renderWorldSwitcher(){const e=$('#worldSwitcher');e.innerHTML='';WORLDS.forEach(w=>{const unlocked=save.unlocked>=w.start,btn=document.createElement('button');btn.className='world-chip'+(currentWorld===w.id?' active':'')+(!unlocked?' locked':'');btn.innerHTML=`<span>${w.icon}</span><b>${w.short}</b><small>${unlocked?'⏳ '+countdownShort():`🔒 Niveau ${w.start-1}`}</small>`;if(unlocked)btn.onclick=()=>{currentWorld=w.id;renderMap()};e.appendChild(btn)});const soon=[['🏔️','Peak']];soon.forEach(([icon,name])=>{const b=document.createElement('button');b.className='world-chip locked';b.innerHTML=`<span>${icon}</span><b>${name}</b><small>Bientôt</small>`;e.appendChild(b)})}
function renderMap(){currentWorld=Math.min(currentWorld,worldForLevel(save.unlocked));const w=WORLDS[currentWorld];const ms=$('#mapScreen');ms.classList.remove('world-city','world-forest','world-caves','world-beach','world-sky','world-volcano','world-galaxy','world-royal');ms.classList.add(currentWorld===0?'world-city':currentWorld===1?'world-forest':currentWorld===2?'world-caves':currentWorld===3?'world-beach':currentWorld===4?'world-sky':currentWorld===5?'world-volcano':currentWorld===6?'world-galaxy':'world-royal');$('#worldNumber').textContent=`MONDE ${w.id+1}`;$('#worldName').textContent=w.name;$('#worldSubtitle').textContent=w.subtitle;renderWorldSwitcher();const map=$('#levelMap');map.innerHTML='';for(let n=w.start;n<=w.end;n++){const i=n-1,locked=n>save.unlocked,stars=save.stars[n]||0,btn=document.createElement('button');btn.className='level-node'+(locked?' locked':'')+(n===save.unlocked?' current':'');const boss=BOSS_LEVELS.has(n),special=SPECIAL_LEVELS.has(n);btn.classList.toggle('boss-node',boss);btn.classList.toggle('special-node',special);btn.innerHTML=`<div class="node-stars">${stars?'⭐'.repeat(stars)+'☆'.repeat(3-stars):'☆☆☆'}</div><span>${n}</span>${boss?'<i class="node-badge boss-badge">👑</i>':special?'<i class="node-badge special-badge">✦</i>':levels[i].time?'<i class="node-badge timer-badge">⏱️</i>':levels[i].goal.type==='ice'?'<i class="node-badge">❄</i>':''}${locked?'<div class="node-lock">🔒</div>':''}`;if(!locked)btn.onclick=()=>startLevel(i);map.appendChild(btn)}}
function countdownShort(){const now=new Date(),end=new Date(now);end.setHours(24,0,0,0);let s=Math.max(0,Math.floor((end-now)/1000));return `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor((s%3600)/60)).padStart(2,'0')}`}
function randomColor(){return COLORS[Math.floor(Math.random()*COLORS.length)]}
function makeGem(color=randomColor(),special=null){return{color,special}}
function createsInitialMatch(r,c,color){return(c>=2&&board[r][c-1]?.color===color&&board[r][c-2]?.color===color)||(r>=2&&board[r-1][c]?.color===color&&board[r-2][c]?.color===color)}
function generateBoard(){board=Array.from({length:SIZE},()=>Array(SIZE).fill(null));for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++){let color;do color=randomColor();while(createsInitialMatch(r,c,color));board[r][c]=makeGem(color)}if(!hasPossibleMove())generateBoard()}
function generateIce(count,layers=1){ice=new Set();iceLayers=new Map();const cells=[];for(let r=1;r<SIZE-1;r++)for(let c=1;c<SIZE-1;c++)cells.push(`${r},${c}`);cells.sort(()=>Math.random()-.5);cells.slice(0,count).forEach(k=>{ice.add(k);iceLayers.set(k,layers)})}
function generateCrates(count=0){crates=new Set();const cells=[];for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++)if(!ice.has(key(r,c)))cells.push(key(r,c));cells.sort(()=>Math.random()-.5);cells.slice(0,count).forEach(k=>crates.add(k))}
function generateChains(count=0){chains=new Set();const cells=[];for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++)cells.push(key(r,c));cells.sort(()=>Math.random()-.5);cells.slice(0,count).forEach(k=>chains.add(k))}
function generateSlime(count=0){slime=new Set();const cells=[];for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++)if(!chains.has(key(r,c)))cells.push(key(r,c));cells.sort(()=>Math.random()-.5);cells.slice(0,count).forEach(k=>slime.add(k))}
function generateRocks(count=0){rocks=new Set();const cells=[];for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++)if(!ice.has(key(r,c))&&!crates.has(key(r,c))&&!chains.has(key(r,c))&&!slime.has(key(r,c)))cells.push(key(r,c));cells.sort(()=>Math.random()-.5);cells.slice(0,count).forEach(k=>rocks.add(k))}
function generateFog(count=0){fog=new Set();const cells=[];for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++)if(!rocks.has(key(r,c)))cells.push(key(r,c));cells.sort(()=>Math.random()-.5);cells.slice(0,count).forEach(k=>fog.add(k))}
function generateLava(count=0){lava=new Set();const cells=[];for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++)if(!rocks.has(key(r,c))&&!fog.has(key(r,c)))cells.push(key(r,c));cells.sort(()=>Math.random()-.5);cells.slice(0,count).forEach(k=>lava.add(k))}



function startLevel(i){openPreLevel(i)}
function openPreLevel(i){
  if(!save.tutorialDone){startTutorialLevel();toast('Termine d’abord le tutoriel 🎓');return}
  currentLevel=i;currentWorld=worldForLevel(i+1);regenLives();
  const l=levels[i];$('#preLevelNumber').textContent=`Niveau ${i+1}`;$('#preObjective').textContent=objectiveText(l);
  $('#preMoves').textContent=l.moves;$('#preLives').textContent=`${save.lives}/${save.maxLives}`;if($('#preTime'))$('#preTime').textContent=l.time?`${l.time}s`:'—';
  $('#preInventory').textContent=`🔨 ${inventoryCount('hammer')} · 🔀 ${inventoryCount('shuffle')} · 💡 ${inventoryCount('hint')} · 💣 ${inventoryCount('bomb')} · 🚀 ${inventoryCount('rocket')} · 🌈 ${inventoryCount('rainbow')}`;
  $('#preLevelModal').classList.remove('hidden')
}
function actualStartLevel(i){
  regenLives();if(save.lives<=0){toast(`Plus de vies ❤️ · prochaine dans ${lifeCountdown()}`);return}
  currentLevel=i;currentWorld=worldForLevel(i+1);failurePending=false;tutorialMode=false;score=0;moves=levels[i].moves;selected=null;collected={};specialsCreated=0;busy=false;hammerMode=false;gameEnded=false;lastSwap=null;
  generateBoard();generateIce(levels[i].ice||0,levels[i].iceLayers||1);generateCrates(levels[i].crates||0);generateChains(levels[i].chains||0);generateSlime(levels[i].slime||0);generateRocks(levels[i].rocks||0);generateFog(levels[i].fog||0);generateLava(levels[i].lava||0);stopLevelTimer();
  $('#preLevelModal').classList.add('hidden');showScreen('gameScreen');renderGameUI();renderBoard();pendingFeatureTutorials=levelFeatureTutorials(levels[i]);showNextFeatureTutorial();if(!pendingFeatureTutorials.length&&levels[i].time)startLevelTimer(levels[i].time)
}
function objectiveText(l=levels[currentLevel]){if(l.goal.type==='score')return`Atteins ${l.goal.target.toLocaleString('fr-FR')} points`;if(l.goal.type==='ice')return`Brise ${l.goal.target} cases gelées`;if(l.goal.type==='crates')return`Détruis ${l.goal.target} caisses`;if(l.goal.type==='specials')return`Crée ${l.goal.target} Pops spéciaux`;if(l.goal.type==='rocks')return`Détruis ${l.goal.target} rochers`;if(l.goal.type==='fog')return`Dissipe ${l.goal.target} cases de brouillard`;if(l.goal.type==='lava')return`Nettoie ${l.goal.target} cases de lave`;return`Collecte ${l.goal.target} Pops ${POP_INFO[l.goal.color].name}`}
function renderGameUI(){const l=levels[currentLevel],n=currentLevel+1;if(infiniteMode){$('#gameLevelLabel').textContent='♾️ Mode Infini';$('#objectiveLabel').textContent='Fais le meilleur score possible';$('#movesLeft').textContent=moves;$('#scoreValue').textContent=score.toLocaleString('fr-FR');$('#objectiveProgress').innerHTML=`<div class="obj-chip"><span>♾️ Record</span><span>${Number(save.infiniteBest||0).toLocaleString('fr-FR')}</span></div>`;$('#scoreProgress').style.width=Math.min(100,(score%25000)/25000*100)+'%';$('#bossMeter').classList.add('hidden');updateBoosterStates();return}if(tutorialMode){$('#gameLevelLabel').textContent='🎓 Niveau 0 · Tutoriel';$('#objectiveLabel').textContent='Apprends les règles de Poporia';$('#movesLeft').textContent='∞';$('#scoreValue').textContent=score.toLocaleString('fr-FR');$('#objectiveProgress').innerHTML='<div class="obj-chip"><span>🎓 Démonstration</span><span>Apprends en jouant</span></div>';$('#bossMeter').classList.add('hidden');updateBoosterStates();return}$('#gameLevelLabel').textContent=BOSS_LEVELS.has(n)?`👑 Boss · Niveau ${n}`:SPECIAL_LEVELS.has(n)?`✨ Spécial · Niveau ${n}`:`Niveau ${n}`;$('#objectiveLabel').textContent=objectiveText(l);$('#movesLeft').textContent=moves;$('#scoreValue').textContent=score.toLocaleString('fr-FR');renderObjective();renderStars();$('#scoreProgress').style.width=Math.min(100,score/l.stars[2]*100)+'%';const bm=$('#bossMeter');if(BOSS_LEVELS.has(n)){bm.classList.remove('hidden');let target=l.goal.target,hp;if(l.goal.type==='score')hp=Math.max(0,target-score);else if(l.goal.type==='ice')hp=Math.max(0,ice.size);else hp=Math.max(0,target-(collected[l.goal.color]||0));$('#bossHp').textContent=hp.toLocaleString('fr-FR');$('#bossFill').style.width=Math.max(0,Math.min(100,hp/target*100))+'%'}else bm.classList.add('hidden');updateBoosterStates()}
function renderObjective(){const g=levels[currentLevel].goal,e=$('#objectiveProgress');if(g.type==='score')e.innerHTML=`<div class="obj-chip"><span>🏆 Score</span><span>${score.toLocaleString('fr-FR')} / ${g.target.toLocaleString('fr-FR')}</span></div>`;else if(g.type==='ice')e.innerHTML=`<div class="obj-chip"><span>❄️ Glace</span><span>${g.target-ice.size} / ${g.target}</span></div>`;else if(g.type==='crates')e.innerHTML=`<div class="obj-chip"><span>📦 Caisses</span><span>${Math.max(0,g.target-crates.size)} / ${g.target}</span></div>`;else if(g.type==='specials')e.innerHTML=`<div class="obj-chip"><span>✨ Pops spéciaux</span><span>${Math.min(specialsCreated,g.target)} / ${g.target}</span></div>`;else if(g.type==='rocks')e.innerHTML=`<div class="obj-chip"><span>🪨 Rochers</span><span>${Math.max(0,g.target-rocks.size)} / ${g.target}</span></div>`;else if(g.type==='fog')e.innerHTML=`<div class="obj-chip"><span>🌫️ Brouillard</span><span>${Math.max(0,g.target-fog.size)} / ${g.target}</span></div>`;else if(g.type==='lava')e.innerHTML=`<div class="obj-chip"><span>🌋 Lave</span><span>${Math.max(0,g.target-lava.size)} / ${g.target}</span></div>`;else{const v=collected[g.color]||0;e.innerHTML=`<div class="obj-chip"><i class="pop-dot ${g.color}">${POP_INFO[g.color].symbol}</i><span>${Math.min(v,g.target)} / ${g.target}</span></div>`}if(g.type!=='crates'&&crates.size)e.innerHTML+=`<div class="obj-chip"><span>📦 Caisses</span><span>${crates.size}</span></div>`;if(chains.size)e.innerHTML+=`<div class="obj-chip obstacle-chip"><span>⛓️ Chaînes</span><span>${chains.size}</span></div>`;if(slime.size)e.innerHTML+=`<div class="obj-chip obstacle-chip"><span>🫧 Gelée</span><span>${slime.size}</span></div>`;if(g.type!=='rocks'&&rocks.size)e.innerHTML+=`<div class="obj-chip obstacle-chip"><span>🪨 Rochers</span><span>${rocks.size}</span></div>`;if(g.type!=='fog'&&fog.size)e.innerHTML+=`<div class="obj-chip obstacle-chip"><span>🌫️ Brouillard</span><span>${fog.size}</span></div>`;if(g.type!=='lava'&&lava.size)e.innerHTML+=`<div class="obj-chip obstacle-chip"><span>🌋 Lave</span><span>${lava.size}</span></div>`}
function currentStars(){const t=levels[currentLevel].stars;return score>=t[2]?3:score>=t[1]?2:score>=t[0]?1:0}
function renderStars(){const s=currentStars();[1,2,3].forEach(i=>$('#star'+i).textContent=i<=s?'★':'☆')}
function renderBoard(){const el=$('#board');el.innerHTML='';for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++){const cell=document.createElement('div');const ck=`${r},${c}`;cell.className='cell'+(ice.has(ck)?` iced ice-${iceLayers.get(ck)||1}`:'')+(crates.has(ck)?' crated':'')+(chains.has(ck)?' chained':'')+(slime.has(ck)?' slimed':'')+(rocks.has(ck)?' rocked':'')+(fog.has(ck)?' fogged':'')+(lava.has(ck)?' lava-cell':'');cell.dataset.r=r;cell.dataset.c=c;const item=board[r][c];if(item){const gem=document.createElement('div');gem.className=`gem ${item.color} ${item.special||''}`;gem.dataset.symbol=POP_INFO[item.color]?.symbol||'✦';if(selected?.r===r&&selected?.c===c)gem.classList.add('selected');if(item.drop){gem.classList.add('falling');gem.style.setProperty('--drop',item.drop)}if(item.fresh)gem.classList.add('fresh-pop');gem.innerHTML='<span class="pop-symbol"></span>';cell.appendChild(gem)}el.appendChild(cell)}}
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
  crateHits.forEach(k=>crates.delete(k));for(const k of matches){chains.delete(k);slime.delete(k);fog.delete(k);lava.delete(k);rocks.delete(k)}
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
  if(!tutorialMode&&(ice.has(key(a.r,a.c))||ice.has(key(b.r,b.c)))){toast('❄️ Ce Pop est gelé : casse d’abord le glaçon !');return}if(!tutorialMode&&(rocks.has(key(a.r,a.c))||rocks.has(key(b.r,b.c)))){toast('🪨 Le rocher bloque ce Pop : détruis-le d’abord !');return}
  busy=true;selected=null;lastSwap={a,b};
  const A=board[a.r][a.c],B=board[b.r][b.c];
  await animateSwap(a,b);swap(a,b);renderBoard();await sleep(35);

  // Deux boosts fusionnés : toujours un coup valide.
  if(A?.special&&B?.special){
    moves--;
    if(await activateSpecialCombo(b,a,A,B)){busy=false;renderGameUI();if(tutorialMode)tutorialActionCompleted();checkEnd();return}
  }

  // Prisme + Pop normal : supprime la couleur puis fait réellement retomber/remplir toute la grille.
  if(A?.special==='rainbow'||B?.special==='rainbow'){
    moves--;
    const rp=A?.special==='rainbow'?b:a,target=A?.special==='rainbow'?B?.color:A?.color,set=new Set([key(rp.r,rp.c)]);
    for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++)if(board[r][c]?.color===target)set.add(key(r,c));
    fx('rainbow',rp.r,rp.c);showCombo('PRISME !');
    await clearSet(addSpecialEffects(set),1,null);
    await settleAfterSpecial();
    busy=false;renderGameUI();if(tutorialMode)tutorialActionCompleted();checkEnd();return
  }

  // Une fusée ou une bombe déplacée se déclenche même sans Match-3.
  if(A?.special||B?.special){
    const moved=A?.special?{pos:b,g:A}:{pos:a,g:B};
    if(moved.g.special==='bomb'||isRocket(moved.g)){
      moves--;await activateSingleSpecial(moved.pos,moved.g);
      busy=false;renderGameUI();if(tutorialMode)tutorialActionCompleted();checkEnd();return
    }
  }

  if(!findMatches().size){
    await animateSwap(a,b);swap(a,b);renderBoard();busy=false;return
  }
  moves--;await resolveBoard();busy=false;renderGameUI();if(tutorialMode)tutorialActionCompleted();checkEnd()
}
async function resolveBoard(){let chain=0;while(true){const lines=linesOfMatches(),squares=squaresOfMatches();if(!lines.length&&!squares.length)break;chain++;let matches=new Set();lines.forEach(l=>l.cells.forEach(p=>matches.add(key(p.r,p.c))));squares.forEach(s=>s.cells.forEach(p=>matches.add(key(p.r,p.c))));const create=creationForPatterns(lines,squares);if(create)matches.delete(key(create.r,create.c));matches=addSpecialEffects(matches);await clearSet(matches,chain,create);await animateGravity();renderGameUI();await sleep(90)}if(!hasPossibleMove())await shuffleBoard(true,false)}
async function clearSet(matches,chain,create){breakIce(matches);for(const k of matches){const[r,c]=parseKey(k),g=board[r]?.[c];if(g?.color)collected[g.color]=(collected[g.color]||0)+1}score+=matches.size*120*chain+(chain>1?chain*260:0);if(chain>2)showCombo(`POP COMBO x${chain}!`);else if(chain>1)showCombo(`COMBO x${chain}!`);else if(matches.size>=7)showCombo('POP-TASTIQUE !');else if(matches.size>=4)showCombo('SUPER !');animatePop(matches);await sleep(185);matches.forEach(k=>{const[r,c]=parseKey(k);board[r][c]=null});if(create){specialsCreated++;const base=board[create.r]?.[create.c]||makeGem(randomColor());board[create.r][create.c]=makeGem(create.type==='rainbow'?'purple':base.color,create.type);fx('create',create.r,create.c)}renderBoard()}
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
function goalReached(){const g=levels[currentLevel].goal;if(g.type==='score')return score>=g.target;if(g.type==='ice')return ice.size===0;if(g.type==='crates')return crates.size===0;if(g.type==='specials')return specialsCreated>=g.target;if(g.type==='rocks')return rocks.size===0;if(g.type==='fog')return fog.size===0;if(g.type==='lava')return lava.size===0;return(collected[g.color]||0)>=g.target}

function stopLevelTimer(){if(levelTimerId){clearInterval(levelTimerId);levelTimerId=null}levelTimeLeft=null;if($('#levelTimerBox'))$('#levelTimerBox').classList.add('hidden')}
function startLevelTimer(seconds){
  stopLevelTimer();if(!seconds)return;levelTimeLeft=Number(seconds);
  const box=$('#levelTimerBox');if(box)box.classList.remove('hidden');updateLevelTimerUI();
  levelTimerId=setInterval(()=>{if(gameEnded||tutorialMode)return;levelTimeLeft--;updateLevelTimerUI();if(levelTimeLeft<=0){stopLevelTimer();if(!gameEnded)finishLevel(false)}},1000)
}
function updateLevelTimerUI(){if($('#levelTimerValue')&&levelTimeLeft!=null){const m=Math.floor(levelTimeLeft/60),s=levelTimeLeft%60;$('#levelTimerValue').textContent=`${m}:${String(s).padStart(2,'0')}`;$('#levelTimerBox').classList.toggle('danger',levelTimeLeft<=15)}}
function checkEnd(){if(tutorialMode)return;if(infiniteMode){if(moves<=0)finishInfinite();return}if(goalReached())finishLevel(true);else if(moves<=0)finishLevel(false)}

function worldRewardForLevel(n){
  const w=WORLDS.find(x=>x.end===n);if(!w||save.worldRewards?.[w.id])return null;
  save.worldRewards=save.worldRewards||{};save.worldRewards[w.id]=true;
  const rewards=[
    {coins:1200,chests:1,boost:1},{coins:2200,chests:2,boost:2},{coins:3500,chests:3,boost:3},
    {coins:4800,chests:3,boost:3},{coins:6200,chests:4,boost:4},{coins:8000,chests:5,boost:5},{coins:10000,chests:5,boost:5},{coins:12500,chests:6,boost:6}
  ][w.id]||{coins:1000,chests:1,boost:1};
  save.coins+=rewards.coins;grantChest(w.id>=5?'rare':'common',rewards.chests);
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

function continueFiveMoves(){
  if(!failurePending||!gameEnded)return;
  if(save.coins<500){toast('Il faut 500 pièces pour continuer');return}
  save.coins-=500;gameEnded=false;failurePending=false;
  if(levels[currentLevel]?.time){moves=Math.max(moves,5);startLevelTimer(15);toast('+15 secondes ! Bonne chance ⏱️')}
  else{moves=5;toast('+5 coups ! Bonne chance ✨')}
  persist();$('#modal').classList.add('hidden');renderGameUI()
}
function confirmFailedLife(){if(failurePending){consumeLife();failurePending=false}}
function finishLevel(win){
  stopLevelTimer();gameEnded=true;const m=$('#modal'),n=currentLevel+1;$('#modalContinueBtn').classList.add('hidden');$('#modalRetryBtn').classList.add('hidden');
  if(win){
    failurePending=false;const stars=Math.max(1,currentStars()),old=save.stars[n]||0;let reward=140+stars*90+(currentWorld*40);const boss=BOSS_LEVELS.has(n),special=SPECIAL_LEVELS.has(n);if(boss)reward+=900;if(special)reward+=350;
    if(stars>old)save.stars[n]=stars;save.bestScores[n]=Math.max(save.bestScores[n]||0,score);if(n===save.unlocked&&save.unlocked<levels.length)save.unlocked++;save.coins+=reward;save.wins=(save.wins||0)+1;addSeasonXp(60+stars*30+(boss?120:0));missionProgress('wins',1);missionProgress('specials',specialsCreated);missionProgress('score',score);rewardActiveEvents();if(save.wins%5===0){grantChest('common',1);toast('🎁 Coffre commun gagné !')}if(boss)grantChest(n>=60?'epic':'rare',1);
    const wr=worldRewardForLevel(n);persist();checkAchievements();syncLeaderboard();syncSeasonalLeaderboard();syncSocialProfile();syncClanScore();$('#modalIcon').textContent=boss?'👑':special?'✨':currentWorld===1?'🌲':currentWorld===2?'💎':currentWorld===3?'🏖️':currentWorld===4?'☁️':currentWorld===5?'🌋':currentWorld===6?'🌌':currentWorld===7?'🏰':'🎉';$('#modalTitle').textContent=boss?'Boss vaincu !':special?'Niveau spécial réussi !':'Niveau réussi !';let msg=`${score.toLocaleString('fr-FR')} points · +${reward} pièces`;if(boss)msg+=' · +1 coffre boss';if(wr)msg+=` · MONDE TERMINÉ : +${wr.coins} 🪙, +${wr.chests} coffre(s), +${wr.boost} de chaque booster`;$('#modalText').textContent=msg;$('#modalStars').textContent='⭐'.repeat(stars)+'☆'.repeat(3-stars);$('#modalMainBtn').classList.remove('hidden');$('#modalMainBtn').textContent=n<levels.length?'Niveau suivant':'Rejouer';$('#modalMainBtn').onclick=()=>{m.classList.add('hidden');startLevel(n<levels.length?currentLevel+1:currentLevel)}
  }else{
    failurePending=true;syncLeaderboard();$('#modalIcon').textContent='💥';$('#modalTitle').textContent='Plus de coups';const timed=!!levels[currentLevel]?.time;$('#modalText').textContent=timed?`Temps écoulé · Score : ${score.toLocaleString('fr-FR')} · Continue avec 15 secondes supplémentaires pour 500 pièces.`:`Score : ${score.toLocaleString('fr-FR')} · Continue la même partie avec 5 coups supplémentaires pour 500 pièces.`;$('#modalContinueBtn').textContent=timed?'+15 sec · 500 🪙':'+5 coups · 500 🪙';$('#modalStars').textContent='☆☆☆';$('#modalMainBtn').classList.add('hidden');$('#modalContinueBtn').classList.remove('hidden');$('#modalRetryBtn').classList.remove('hidden')
  }
  m.classList.remove('hidden')
}
function spend(cost,label){if(save.coins<cost){toast(`Pas assez de pièces pour ${label} · ${cost} 🪙`);return false}save.coins-=cost;persist();toast(`-${cost} 🪙 · ${label}`);return true}
async function useHammer(r,c){if(!consumeBooster('hammer',COST.hammer,'Marteau')){hammerMode=false;$('#hammerBtn').classList.remove('active');return}busy=true;const k=key(r,c),g=board[r][c];if(g){collected[g.color]=(collected[g.color]||0)+1;score+=220;board[r][c]=null;ice.delete(k);fx('bomb',r,c);await animateGravity()}hammerMode=false;$('#hammerBtn').classList.remove('active');renderBoard();renderGameUI();busy=false;checkEnd()}
function deployPurchasedSpecial(type){
  if(busy||gameEnded)return;
  if(inventoryCount(type)<1){toast('Aucun boost disponible dans ton inventaire');return}
  const normal=[];for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++)if(board[r][c]&&!board[r][c].special)normal.push({r,c});
  if(!normal.length){toast('Aucune case disponible');return}
  const p=normal[Math.floor(Math.random()*normal.length)];
  save.inventory[type]--;let special=type;
  if(type==='rocket')special=Math.random()<.5?'rocket-h':'rocket-v';
  board[p.r][p.c].special=special;persist();renderBoard();renderGameUI();fx('create',p.r,p.c);
  toast(type==='bomb'?'💣 Bombe placée !':type==='rocket'?'🚀 Fusée placée !':'🌈 Prisme placé !')
}
function updateBoosterStates(){if(!save)return;$('#shuffleBtn').classList.toggle('cant-afford',inventoryCount('shuffle')<1&&save.coins<COST.shuffle);$('#hammerBtn').classList.toggle('cant-afford',inventoryCount('hammer')<1&&save.coins<COST.hammer);$('#hintBtn').classList.toggle('cant-afford',inventoryCount('hint')<1&&save.coins<COST.hint);['hammer','shuffle','hint','bomb','rocket','rainbow'].forEach(k=>$('#inv-'+k)&&($('#inv-'+k).textContent=inventoryCount(k)))}
function getCellFromEventTarget(t){const c=t.closest?.('.cell');return c?{r:+c.dataset.r,c:+c.dataset.c}:null}
function setupBoardControls(){const b=$('#board');b.addEventListener('pointerdown',e=>{if(busy||gameEnded)return;const p=getCellFromEventTarget(e.target);if(!p)return;pointerStart={...p,x:e.clientX,y:e.clientY,id:e.pointerId};try{b.setPointerCapture(e.pointerId)}catch{}});b.addEventListener('pointerup',e=>{if(!pointerStart||busy||gameEnded)return;const start=pointerStart;pointerStart=null;const dx=e.clientX-start.x,dy=e.clientY-start.y,dist=Math.hypot(dx,dy);if(hammerMode){useHammer(start.r,start.c);return}if(dist>22){const target={r:start.r,c:start.c};if(Math.abs(dx)>Math.abs(dy))target.c+=dx>0?1:-1;else target.r+=dy>0?1:-1;if(target.r>=0&&target.r<SIZE&&target.c>=0&&target.c<SIZE)attemptSwap({r:start.r,c:start.c},target);return}const p=getCellFromEventTarget(e.target)||{r:start.r,c:start.c};if(!selected){selected=p;renderBoard()}else if(selected.r===p.r&&selected.c===p.c){selected=null;renderBoard()}else if(adjacent(selected,p)){const a=selected;selected=null;attemptSwap(a,p)}else{selected=p;renderBoard()}});b.addEventListener('pointercancel',()=>pointerStart=null)}
function findHint(){for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++)for(const[dr,dc]of[[0,1],[1,0]]){const b={r:r+dr,c:c+dc};if(b.r>=SIZE||b.c>=SIZE)continue;swap({r,c},b);const ok=findMatches().size>0||!!board[r][c]?.special||!!board[b.r][b.c]?.special;swap({r,c},b);if(ok)return[{r,c},b]}return null}
function showHint(){if(!consumeBooster('hint',COST.hint,'Indice'))return;const h=findHint();if(!h)return;h.forEach(p=>$(`.cell[data-r="${p.r}"][data-c="${p.c}"] .gem`)?.classList.add('hint-gem'))}
function worldCountdown(){const tick=()=>{const now=new Date(),end=new Date(now);end.setHours(24,0,0,0);let s=Math.max(0,Math.floor((end-now)/1000)),h=String(Math.floor(s/3600)).padStart(2,'0');s%=3600;const m=String(Math.floor(s/60)).padStart(2,'0'),sec=String(s%60).padStart(2,'0');if($('#worldTimer'))$('#worldTimer').textContent=`${h}:${m}:${sec}`;if($('#mapScreen').classList.contains('active'))renderWorldSwitcher()};tick();setInterval(()=>{tick();updateLivesUI()},1000)}
function todayLocal(){const d=new Date();return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function dailyGift(){const today=todayLocal();if(save.lastGift===today){toast('Cadeau déjà récupéré aujourd’hui 🎁');return}save.lastGift=today;save.coins+=200;persist();toast('+200 pièces ! 🎁')}





const DAILY_MISSION_POOL=[
  {id:'wins',label:'Gagne 3 niveaux',icon:'🏆',target:3,reward:350,type:'wins'},
  {id:'specials',label:'Crée 6 Pops spéciaux',icon:'✨',target:6,reward:300,type:'specials'},
  {id:'score',label:'Cumule 30 000 points',icon:'🎯',target:30000,reward:400,type:'score'}
];
function ensureDailyMissions(){
  const today=todayLocal();
  save.dailyMissions=save.dailyMissions||{date:null,items:[]};
  if(save.dailyMissions.date!==today){
    save.dailyMissions={date:today,items:DAILY_MISSION_POOL.map(m=>({...m,progress:0,claimed:false}))};
    persist()
  }
}
function missionProgress(type,amount=1){
  if(!save)return;ensureDailyMissions();
  for(const m of save.dailyMissions.items)if(m.type===type&&!m.claimed)m.progress=Math.min(m.target,(m.progress||0)+amount);
  persist();if($('#missionsPanel')&&!$('#missionsPanel').classList.contains('hidden'))renderMissions()
}
function renderMissions(){
  ensureDailyMissions();const el=$('#missionsList');if(!el)return;el.innerHTML='';
  save.dailyMissions.items.forEach((m,i)=>{
    const done=(m.progress||0)>=m.target,row=document.createElement('article');row.className='mission-row'+(done?' done':'');
    row.innerHTML=`<span class="mission-icon">${m.icon}</span><div><b>${m.label}</b><div class="mission-bar"><i style="width:${Math.min(100,(m.progress||0)/m.target*100)}%"></i></div><small>${Number(m.progress||0).toLocaleString('fr-FR')} / ${m.target.toLocaleString('fr-FR')}</small></div><button class="btn ${done&&!m.claimed?'primary':'ghost'} mission-claim" ${done&&!m.claimed?'':'disabled'}>${m.claimed?'✓ Récupéré':`+${m.reward} 🪙`}</button>`;
    if(done&&!m.claimed)row.querySelector('.mission-claim').onclick=()=>claimMission(i);el.appendChild(row)
  })
}
function claimMission(i){
  const m=save.dailyMissions.items[i];if(!m||m.claimed||(m.progress||0)<m.target)return;
  m.claimed=true;save.coins+=m.reward;persist();renderMissions();toast(`Mission accomplie · +${m.reward} 🪙`)
}
function openMissions(){ensureDailyMissions();renderMissions();$('#missionsPanel').classList.remove('hidden')}

let activeEvents=[];
async function loadEvents(){
  const fallback={id:'summer',name:'Festival Poporia',icon:'🎉',description:'Gagne des niveaux pendant l’événement pour obtenir des récompenses bonus.',active:true,rewardCoins:100,startsAt:'',endsAt:''};
  activeEvents=[];
  if(!guest&&user){try{const snap=await getDocs(collection(db,'events'));activeEvents=snap.docs.map(d=>({id:d.id,...d.data()})).filter(e=>{if(e.active===false)return false;const now=Date.now(),start=e.startsAt?new Date(e.startsAt).getTime():0,end=e.endsAt?new Date(e.endsAt).getTime():Infinity;return now>=start&&now<=end})}catch(e){console.warn('Events:',e)}}
  if(!activeEvents.length)activeEvents=[fallback];
  renderEventHome();if($('#eventsPanel')&&!$('#eventsPanel').classList.contains('hidden'))renderEventsPanel()
}
function renderEventHome(){
  const e=activeEvents[0];if(!e)return;
  if($('#eventHomeTitle'))$('#eventHomeTitle').textContent=`${e.icon||'🎉'} ${e.name}`;
  if($('#eventHomeDesc'))$('#eventHomeDesc').textContent=e.description||'Événement temporaire en cours.'
}
function renderEventsPanel(){
  const el=$('#eventsList');if(!el)return;el.innerHTML='';
  activeEvents.forEach(e=>{const p=Number(save.eventProgress?.[e.id]||0),card=document.createElement('article');card.className='event-card';card.innerHTML=`<div class="event-icon">${e.icon||'🎉'}</div><div><span class="eyebrow">ÉVÉNEMENT TEMPORAIRE</span><h3>${e.name}</h3><p>${e.description||''}</p><small>Progression : ${p} niveau(x) gagné(s) · Bonus : +${Number(e.rewardCoins||100)} 🪙 par victoire</small></div>`;el.appendChild(card)})
}
function openEvents(){loadEvents();$('#eventsPanel').classList.remove('hidden')}
function rewardActiveEvents(){
  if(!activeEvents.length)return;
  save.eventProgress=save.eventProgress||{};
  for(const e of activeEvents){save.eventProgress[e.id]=(save.eventProgress[e.id]||0)+1;save.coins+=Number(e.rewardCoins||100)}
}

let currentClan=null;
function clanCode(){return Math.random().toString(36).slice(2,8).toUpperCase()}
async function openClan(){
  if(guest){toast('Connecte-toi pour utiliser les clans');return}
  $('#clanPanel').classList.remove('hidden');await loadClan()
}
async function loadClan(){
  const p=profileData(),noClan=$('#noClanBox'),inClan=$('#inClanBox');
  if(!noClan||!inClan){console.warn('Interface clan incomplète');toast('Interface clan indisponible');return}
  if(!p.clanId){
    currentClan=null;
    noClan.classList.remove('hidden');
    inClan.classList.add('hidden');
    return;
  }
  try{
    const snap=await getDoc(doc(db,'clans',p.clanId));
    if(!snap.exists()){
      p.clanId=null;p.clanRole=null;persist();
      noClan.classList.remove('hidden');
      inClan.classList.add('hidden');
      return;
    }
    currentClan={id:snap.id,...snap.data()};
    renderClan();
  }catch(e){
    console.error(e);
    toast('Impossible de charger le clan');
  }
}
function renderClan(){
  $('#noClanBox').classList.add('hidden');$('#inClanBox').classList.remove('hidden');
  $('#clanName').textContent=currentClan.name||'Clan';$('#clanCode').textContent=currentClan.code||currentClan.id;
  $('#clanDescription').textContent=currentClan.description||'Aucune description.';
  const members=Object.entries(currentClan.members||{}),list=$('#clanMembers');list.innerHTML='';
  members.sort((a,b)=>(b[1].score||0)-(a[1].score||0)).forEach(([uid,m])=>{
    const row=document.createElement('div');row.className='clan-member';const canManage=profileData().clanRole==='chief'&&uid!==user.uid;
    row.innerHTML=`<div><b>${m.pseudo||'Joueur'}</b><small>${m.role==='chief'?'👑 Chef':m.role==='officer'?'⭐ Officier':'Membre'}</small></div><span>🏆 ${Number(m.score||0).toLocaleString('fr-FR')}</span>${canManage?`<button class="icon-btn clan-promote" title="Promouvoir">⭐</button><button class="icon-btn clan-kick" title="Exclure">×</button>`:''}`;
    if(canManage){row.querySelector('.clan-promote').onclick=()=>setClanMemberRole(uid,m.role==='officer'?'member':'officer');row.querySelector('.clan-kick').onclick=()=>kickClanMember(uid)}
    list.appendChild(row)
  });
  $('#clanRole').textContent=profileData().clanRole==='chief'?'Chef':profileData().clanRole==='officer'?'Officier':'Membre';
  $('#clanScore').textContent=members.reduce((a,[,m])=>a+Number(m.score||0),0).toLocaleString('fr-FR')
}
async function createClan(){
  const name=$('#clanCreateName').value.trim().slice(0,24),description=$('#clanCreateDesc').value.trim().slice(0,100);if(name.length<3){toast('Nom de clan trop court');return}
  const code=clanCode(),id=code.toLowerCase(),members={};members[user.uid]={pseudo:displayName(),role:'chief',score:totalBestScore()};
  const clan={name,description,code,chiefId:user.uid,members,createdAt:Date.now()};
  try{await setDoc(doc(db,'clans',id),clan);profileData().clanId=id;profileData().clanRole='chief';persist();await loadClan();updateProfile();toast('Clan créé 🛡️')}catch(e){console.error(e);toast('Création du clan refusée par Firebase')}
}
async function joinClan(){
  const id=$('#clanJoinCode').value.trim().toLowerCase();if(!id)return;
  try{const ref=doc(db,'clans',id),snap=await getDoc(ref);if(!snap.exists()){toast('Clan introuvable');return}const clan=snap.data(),members={...(clan.members||{})};members[user.uid]={pseudo:displayName(),role:'member',score:totalBestScore()};await setDoc(ref,{members},{merge:true});profileData().clanId=id;profileData().clanRole='member';persist();await loadClan();updateProfile();toast('Clan rejoint 🛡️')}catch(e){console.error(e);toast('Impossible de rejoindre le clan')}
}
async function leaveClan(){
  if(!currentClan)return;const p=profileData();if(p.clanRole==='chief'&&Object.keys(currentClan.members||{}).length>1){toast('Le chef doit exclure les autres membres avant de quitter');return}
  const members={...(currentClan.members||{})};delete members[user.uid];
  try{await setDoc(doc(db,'clans',currentClan.id),{members},{merge:true});p.clanId=null;p.clanRole=null;persist();currentClan=null;loadClan();updateProfile();toast('Tu as quitté le clan')}catch(e){console.error(e)}
}
async function setClanMemberRole(uid,role){if(!currentClan||profileData().clanRole!=='chief')return;const members={...currentClan.members};members[uid]={...members[uid],role};await setDoc(doc(db,'clans',currentClan.id),{members},{merge:true});await loadClan()}
async function kickClanMember(uid){if(!currentClan||profileData().clanRole!=='chief')return;const members={...currentClan.members};delete members[uid];await setDoc(doc(db,'clans',currentClan.id),{members},{merge:true});await loadClan()}
async function syncClanScore(){
  const p=profileData();if(guest||!user||!p.clanId)return;
  try{const ref=doc(db,'clans',p.clanId),snap=await getDoc(ref);if(!snap.exists())return;const members={...(snap.data().members||{})};if(!members[user.uid])return;members[user.uid]={...members[user.uid],pseudo:displayName(),role:p.clanRole||members[user.uid].role||'member',score:totalBestScore()};await setDoc(ref,{members},{merge:true})}catch(e){console.warn('Clan score:',e)}
}

async function loadDynamicPromo(code){
  if(guest||!user)return null;
  try{const snap=await getDoc(doc(db,'promoCodes',code));if(!snap.exists())return null;const p=snap.data();return p.active===false?null:p}catch(e){return null}
}

const SEASON_TIERS=Array.from({length:20},(_,i)=>({
  tier:i+1,xp:(i+1)*150,
  free:i%5===4?{chest:1}:{coins:100+(i+1)*20},
  premium:i%4===3?{rainbow:1}:{coins:180+(i+1)*30}
}));
function seasonLevel(){const xp=Number(save.seasonPass?.xp||0);let level=0;for(const t of SEASON_TIERS)if(xp>=t.xp)level=t.tier;return level}
function addSeasonXp(amount){save.seasonPass=save.seasonPass||{season:'S1',xp:0,claimed:[],premium:false};save.seasonPass.xp=(save.seasonPass.xp||0)+Math.max(0,amount);persist();syncSeasonalLeaderboard();if($('#seasonPanel')&&!$('#seasonPanel').classList.contains('hidden'))renderSeasonPass()}
function claimSeasonReward(tier,premium=false){
  save.seasonPass.claimed=save.seasonPass.claimed||[];const key=`${premium?'p':'f'}${tier}`;if(save.seasonPass.claimed.includes(key))return;
  const t=SEASON_TIERS.find(x=>x.tier===tier);if(!t||save.seasonPass.xp<t.xp)return;if(premium&&!save.seasonPass.premium){toast('Active d’abord le Pass Premium');return}
  const r=premium?t.premium:t.free;if(r.coins)save.coins+=r.coins;if(r.chest)grantChest('common',r.chest);if(r.rainbow)save.inventory.rainbow=(save.inventory.rainbow||0)+r.rainbow;
  save.seasonPass.claimed.push(key);persist();renderSeasonPass();toast('Récompense du Pass récupérée 🎟️')
}
function renderSeasonPass(){
  const xp=Number(save.seasonPass?.xp||0),level=seasonLevel();$('#seasonXp').textContent=xp.toLocaleString('fr-FR');$('#seasonLevel').textContent=level;$('#seasonPremiumState').textContent=save.seasonPass.premium?'Premium actif':'Gratuit';
  const list=$('#seasonTiers');list.innerHTML='';
  SEASON_TIERS.forEach(t=>{const unlocked=xp>=t.xp,fk=`f${t.tier}`,pk=`p${t.tier}`,fClaim=save.seasonPass.claimed?.includes(fk),pClaim=save.seasonPass.claimed?.includes(pk),row=document.createElement('article');row.className='season-tier'+(unlocked?' unlocked':'');const freeText=t.free.coins?`${t.free.coins} 🪙`:'🎁 Coffre',premText=t.premium.coins?`${t.premium.coins} 🪙`:'🌈 Prisme';row.innerHTML=`<div class="tier-num">${t.tier}</div><div class="tier-xp">${t.xp} XP</div><button class="season-reward free ${fClaim?'claimed':''}" ${unlocked&&!fClaim?'':'disabled'}><small>GRATUIT</small><b>${fClaim?'✓':freeText}</b></button><button class="season-reward premium ${pClaim?'claimed':''}" ${unlocked&&save.seasonPass.premium&&!pClaim?'':'disabled'}><small>PREMIUM</small><b>${pClaim?'✓':premText}</b></button>`;const btns=row.querySelectorAll('.season-reward');if(unlocked&&!fClaim)btns[0].onclick=()=>claimSeasonReward(t.tier,false);if(unlocked&&save.seasonPass.premium&&!pClaim)btns[1].onclick=()=>claimSeasonReward(t.tier,true);list.appendChild(row)})
}
function openSeasonPass(){renderSeasonPass();$('#seasonPanel').classList.remove('hidden')}
function activatePremiumPass(){if(save.seasonPass.premium){toast('Pass Premium déjà actif');return}startStripeCheckout('season_premium')}


const STRIPE_PRODUCTS={
  coins_1000:{label:'1 000 pièces',price:'0,99 €',icon:'🪙'},
  coins_5500:{label:'5 500 pièces',price:'4,99 €',icon:'🪙'},
  coins_12000:{label:'12 000 pièces',price:'9,99 €',icon:'🪙'},
  season_premium:{label:'Pass Premium Saison 1',price:'4,99 €',icon:'🎟️'},
  skin_cyber:{label:'Skin Cyber Nexora',price:'1,99 €',icon:'🟧'},
  skin_crystal:{label:'Skin Crystal',price:'2,99 €',icon:'💎'},
  skin_founder:{label:'Skin Founder',price:'4,99 €',icon:'👑'}
};
async function startStripeCheckout(productId){
  if(guest||!user){toast('Connecte-toi pour effectuer un achat');return}
  const p=STRIPE_PRODUCTS[productId];if(!p){toast('Produit Stripe inconnu');return}
  const btn=document.querySelector(`[data-stripe-product="${productId}"]`);
  if(btn){btn.disabled=true;btn.dataset.oldText=btn.textContent;btn.textContent='Connexion à Stripe…'}
  try{
    const call=httpsCallable(functions,'createStripeCheckout');
    const result=await call({productId});
    if(!result.data?.url)throw new Error('URL Checkout absente');
    window.location.assign(result.data.url);
  }catch(e){
    console.error('Stripe Checkout:',e);
    toast(e?.message?.includes('unauthenticated')?'Connexion requise':'Impossible d’ouvrir Stripe Checkout');
    if(btn){btn.disabled=false;btn.textContent=btn.dataset.oldText||'Acheter'}
  }
}
async function stripeReturnMessage(){
  const q=new URLSearchParams(location.search),status=q.get('stripe'),sessionId=q.get('session_id');
  if(status==='success'){
    toast('Paiement terminé · validation Stripe en cours…');
    if(sessionId){
      const check=httpsCallable(functions,'getStripePurchaseStatus');
      let fulfilled=false;
      for(let i=0;i<10&&!fulfilled;i++){
        try{
          const result=await check({sessionId});
          fulfilled=!!result.data?.fulfilled;
          if(fulfilled){
            await loadCloudSave();applySkin();updateProfile();updateNotificationBadge();
            if($('#shopPanel')&&!$('#shopPanel').classList.contains('hidden'))updateShop();
            toast('Achat validé et ajouté au compte ✓');
            break
          }
        }catch(e){console.warn('Stripe status:',e)}
        if(!fulfilled)await sleep(1200)
      }
      if(!fulfilled)toast('Paiement reçu · la récompense sera ajoutée dès confirmation du webhook');
    }
    q.delete('stripe');q.delete('session_id');history.replaceState({},'',location.pathname+(q.toString()?'?'+q.toString():'')+location.hash)
  }
  if(status==='cancel'){
    toast('Paiement annulé');q.delete('stripe');q.delete('session_id');history.replaceState({},'',location.pathname+(q.toString()?'?'+q.toString():'')+location.hash)
  }
}
const ACHIEVEMENTS=[
 {id:'first_win',icon:'🏆',name:'Premier Pop !',desc:'Gagner un niveau',reward:250,test:()=>save.wins>=1},
 {id:'ten_wins',icon:'🎯',name:'Habitué',desc:'Gagner 10 niveaux',reward:500,test:()=>save.wins>=10},
 {id:'fifty_stars',icon:'⭐',name:'Collectionneur',desc:'Obtenir 50 étoiles',reward:750,test:()=>totalStars()>=50},
 {id:'rich',icon:'🪙',name:'Petit trésor',desc:'Posséder 10 000 pièces',reward:1000,test:()=>save.coins>=10000},
 {id:'level50',icon:'🚀',name:'Explorateur',desc:'Atteindre le niveau 50',reward:1200,test:()=>save.unlocked>=50},
 {id:'level80',icon:'👑',name:'Maître de Poporia',desc:'Atteindre le niveau 80',reward:2500,test:()=>save.unlocked>=80},
 {id:'infinite25k',icon:'♾️',name:'Sans limite',desc:'Faire 25 000 points en Mode Infini',reward:1000,test:()=>save.infiniteBest>=25000},
 {id:'friends3',icon:'🤝',name:'Populaire',desc:'Avoir 3 amis',reward:600,test:()=>save.social.friends.length>=3}
];
function addNotification(title,text,icon='🔔'){
  save.notifications=save.notifications||[];
  save.notifications.unshift({id:Date.now()+Math.random(),title,text,icon,date:Date.now(),read:false});
  save.notifications=save.notifications.slice(0,40);persist();
  updateNotificationBadge()
}
function updateNotificationBadge(){
  const n=(save?.notifications||[]).filter(x=>!x.read).length;
  if($('#notifBadge')){$('#notifBadge').textContent=n;$('#notifBadge').classList.toggle('hidden',!n)}
}
function checkAchievements(){
  let gained=false;
  for(const a of ACHIEVEMENTS)if(!save.achievements[a.id]&&a.test()){
    save.achievements[a.id]={date:Date.now(),claimed:false};addNotification('Succès débloqué',`${a.icon} ${a.name}`,'🏅');gained=true
  }
  if(gained)persist()
}
function openAchievements(){renderAchievements();$('#achievementsPanel').classList.remove('hidden')}
function renderAchievements(){
  const el=$('#achievementsList');el.innerHTML='';
  ACHIEVEMENTS.forEach(a=>{const state=save.achievements[a.id],row=document.createElement('article');row.className='achievement-card'+(state?' unlocked':'');row.innerHTML=`<div class="achievement-icon">${a.icon}</div><div><h3>${a.name}</h3><p>${a.desc}</p><small>${state?'Débloqué':'Verrouillé'} · ${a.reward} 🪙</small></div><button class="btn ${state&&!state.claimed?'primary':'ghost'}" ${state&&!state.claimed?'':'disabled'}>${state?.claimed?'✓':state?'Récupérer':'🔒'}</button>`;if(state&&!state.claimed)row.querySelector('button').onclick=()=>claimAchievement(a.id);el.appendChild(row)})
}
function claimAchievement(id){const a=ACHIEVEMENTS.find(x=>x.id===id),s=save.achievements[id];if(!a||!s||s.claimed)return;s.claimed=true;save.coins+=a.reward;persist();renderAchievements();toast(`Succès · +${a.reward} 🪙`)}

function openNotifications(){
  save.notifications=(save.notifications||[]).map(n=>({...n,read:true}));persist();renderNotifications();updateNotificationBadge();$('#notificationsPanel').classList.remove('hidden')
}
function renderNotifications(){
  const el=$('#notificationsList');el.innerHTML='';const rows=save.notifications||[];
  if(!rows.length){el.innerHTML='<div class="empty-state">Aucune notification pour le moment.</div>';return}
  rows.forEach(n=>{const d=new Date(n.date),row=document.createElement('article');row.className='notification-row';row.innerHTML=`<span>${n.icon||'🔔'}</span><div><b>${n.title}</b><p>${n.text}</p><small>${d.toLocaleDateString('fr-FR')} · ${d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}</small></div>`;el.appendChild(row)})
}

async function syncSocialProfile(){
  if(guest||!user||!save)return;
  try{await setDoc(doc(db,'socialProfiles',user.uid),{uid:user.uid,pseudo:displayName(),friendCode:save.social.friendCode,bio:profileData().bio||'',avatar:profileData().avatar||'',unlocked:save.unlocked,totalScore:totalBestScore(),stars:totalStars(),clanId:profileData().clanId||null,updatedAt:serverTimestamp()},{merge:true})}catch(e){console.warn('Social profile:',e)}
}
async function openFriends(){if(guest){toast('Connecte-toi pour utiliser les amis');return}await syncSocialProfile();await renderFriends();$('#friendsPanel').classList.remove('hidden')}
async function renderFriends(){
  $('#myFriendCode').textContent=save.social.friendCode;const list=$('#friendsList');list.innerHTML='<div class="admin-loading">Chargement...</div>';
  try{const snap=await getDocs(collection(db,'socialProfiles')),all=snap.docs.map(d=>d.data()),friends=all.filter(p=>save.social.friends.includes(p.uid));list.innerHTML='';friends.forEach(p=>{const row=document.createElement('article');row.className='friend-row';row.innerHTML=`<div class="friend-avatar">${(p.pseudo||'P')[0].toUpperCase()}</div><div><b>${p.pseudo||'Joueur'}</b><small>Niveau ${p.unlocked||1} · ⭐ ${p.stars||0} · 🏆 ${Number(p.totalScore||0).toLocaleString('fr-FR')}</small></div><button class="icon-btn remove-friend">×</button>`;row.querySelector('button').onclick=()=>removeFriend(p.uid);list.appendChild(row)});if(!friends.length)list.innerHTML='<div class="empty-state">Ajoute un ami avec son code Poporia.</div>'}catch(e){list.innerHTML='<div class="admin-error">Impossible de charger les profils sociaux.</div>'}
}
async function addFriend(){
  const code=$('#friendCodeInput').value.trim().toUpperCase();if(!code)return;
  try{const snap=await getDocs(collection(db,'socialProfiles')),p=snap.docs.map(d=>d.data()).find(x=>x.friendCode===code);if(!p){toast('Code ami introuvable');return}if(p.uid===user.uid){toast('C’est ton propre code 😄');return}if(!save.social.friends.includes(p.uid))save.social.friends.push(p.uid);persist();checkAchievements();await renderFriends();toast(`${p.pseudo||'Joueur'} ajouté 🤝`)}catch(e){console.error(e);toast('Ajout impossible')}
}
async function removeFriend(uid){save.social.friends=save.social.friends.filter(x=>x!==uid);persist();renderFriends()}

const SKINS=[
 {id:'classic',name:'Classique',icon:'🍬',price:0,className:'skin-classic'},
 {id:'neon',name:'Néon',icon:'🌈',price:3000,className:'skin-neon'},
 {id:'space',name:'Galaxie',icon:'🌌',price:5000,className:'skin-space'},
 {id:'royal',name:'Royal',icon:'👑',price:7500,className:'skin-royal'},
 {id:'gold',name:'Or',icon:'✨',price:10000,className:'skin-gold'},
 {id:'cyber',name:'Cyber Nexora',icon:'🟧',price:null,className:'skin-cyber',stripeProduct:'skin_cyber'},
 {id:'crystal',name:'Crystal',icon:'💎',price:null,className:'skin-crystal',stripeProduct:'skin_crystal'},
 {id:'founder',name:'Founder',icon:'👑',price:null,className:'skin-founder',stripeProduct:'skin_founder'}
];
function applySkin(){document.body.classList.remove(...SKINS.map(s=>s.className));const s=SKINS.find(x=>x.id===save.skins.active)||SKINS[0];document.body.classList.add(s.className)}
function openSkins(){renderSkins();$('#skinsPanel').classList.remove('hidden')}
function renderSkins(){
  const el=$('#skinsList');el.innerHTML='';SKINS.forEach(s=>{const owned=save.skins.owned.includes(s.id),active=save.skins.active===s.id,card=document.createElement('article');card.className='skin-card'+(active?' active':'');const price=s.stripeProduct?STRIPE_PRODUCTS[s.stripeProduct].price:(s.price===0?'Gratuit':s.price.toLocaleString('fr-FR')+' 🪙');card.innerHTML=`<div class="skin-preview ${s.className}"><span>●</span><span>★</span><span>◆</span></div><h3>${s.icon} ${s.name}</h3><p>${owned?'Possédé':price}</p><button class="btn ${active?'ghost':'primary'}">${active?'✓ Équipé':owned?'Équiper':'Acheter'}</button>`;card.querySelector('button').onclick=()=>owned?equipSkin(s.id):s.stripeProduct?startStripeCheckout(s.stripeProduct):buySkin(s.id);el.appendChild(card)})
}
function buySkin(id){const s=SKINS.find(x=>x.id===id);if(!s||save.skins.owned.includes(id))return;if(save.coins<s.price){toast('Pas assez de pièces');return}save.coins-=s.price;save.skins.owned.push(id);save.skins.active=id;persist();applySkin();renderSkins();addNotification('Nouveau skin',`${s.icon} ${s.name} est maintenant disponible.`,'🎨')}
function equipSkin(id){if(!save.skins.owned.includes(id))return;save.skins.active=id;persist();applySkin();renderSkins()}

const ROTATING_ITEMS=[
 {id:'hammer5',name:'5 Marteaux',icon:'🔨',price:350,reward:{hammer:5}},
 {id:'bomb3',name:'3 Bombes',icon:'💣',price:600,reward:{bomb:3}},
 {id:'rocket3',name:'3 Fusées',icon:'🚀',price:550,reward:{rocket:3}},
 {id:'rainbow2',name:'2 Prismes',icon:'🌈',price:1100,reward:{rainbow:2}},
 {id:'coinsboost',name:'Coffre Rare',icon:'🎁',price:900,reward:{rareChest:1}},
 {id:'life',name:'5 Vies',icon:'❤️',price:450,reward:{lives:5}}
];
function dailyRotation(){
  const seed=Number(todayLocal().replaceAll('-',''));const arr=[...ROTATING_ITEMS];for(let i=arr.length-1;i>0;i--){const j=(seed+i*17)%(i+1);[arr[i],arr[j]]=[arr[j],arr[i]]}return arr.slice(0,4)
}
function renderRotatingShop(){
  const el=$('#rotatingShop');if(!el)return;el.innerHTML='';dailyRotation().forEach(it=>{const card=document.createElement('article');card.className='rotating-item';card.innerHTML=`<span>${it.icon}</span><div><b>${it.name}</b><small>Offre du jour</small></div><button class="btn primary">${it.price} 🪙</button>`;card.querySelector('button').onclick=()=>buyRotatingItem(it);el.appendChild(card)})
}
function buyRotatingItem(it){if(save.coins<it.price){toast('Pas assez de pièces');return}save.coins-=it.price;const r=it.reward;if(r.hammer)save.inventory.hammer+=r.hammer;if(r.bomb)save.inventory.bomb+=r.bomb;if(r.rocket)save.inventory.rocket+=r.rocket;if(r.rainbow)save.inventory.rainbow+=r.rainbow;if(r.rareChest)save.chestInventory.rare+=r.rareChest;if(r.lives)save.lives=Math.min(save.maxLives,r.lives);persist();updateShop();renderRotatingShop();toast(`${it.name} acheté`)}

function grantChest(type='common',qty=1){save.chestInventory[type]=(save.chestInventory[type]||0)+qty}
function openTypedChest(type){
  if((save.chestInventory[type]||0)<1){toast('Aucun coffre de ce type');return}
  save.chestInventory[type]--;const table=type==='epic'?{min:1200,max:2400,boost:3}:type==='rare'?{min:650,max:1300,boost:2}:{min:250,max:700,boost:1};
  const coins=table.min+Math.floor(Math.random()*(table.max-table.min+1)),kind=['hammer','shuffle','hint','bomb','rocket','rainbow'][Math.floor(Math.random()*6)];
  save.coins+=coins;save.inventory[kind]=(save.inventory[kind]||0)+table.boost;persist();renderChestRoom();toast(`🎁 +${coins} 🪙 · +${table.boost} ${kind}`)
}
function openChestRoom(){renderChestRoom();$('#chestRoomPanel').classList.remove('hidden')}
function renderChestRoom(){['common','rare','epic'].forEach(k=>$('#chest-'+k)&&($('#chest-'+k).textContent=save.chestInventory[k]||0))}

async function syncSeasonalLeaderboard(){
  if(guest||!user)return;
  try{await setDoc(doc(db,'seasonLeaderboard',user.uid),{uid:user.uid,pseudo:displayName(),season:save.seasonPass.season,xp:save.seasonPass.xp||0,infiniteBest:save.infiniteBest||0,role:save.role||'player',updatedAt:serverTimestamp()},{merge:true})}catch(e){console.warn(e)}
}
async function loadSeasonLeaderboard(){
  const el=$('#seasonRankList');el.innerHTML='<div class="admin-loading">Chargement...</div>';
  try{const snap=await getDocs(collection(db,'seasonLeaderboard')),rows=snap.docs.map(d=>d.data()).filter(x=>x.role!=='admin'&&x.season===save.seasonPass.season).sort((a,b)=>(b.xp||0)-(a.xp||0)).slice(0,20);el.innerHTML='';rows.forEach((p,i)=>{const row=document.createElement('article');row.className='season-rank-row';row.innerHTML=`<span>${i+1}</span><b>${p.pseudo||'Joueur'}</b><strong>${Number(p.xp||0).toLocaleString('fr-FR')} XP</strong>`;el.appendChild(row)});if(!rows.length)el.innerHTML='<div class="empty-state">Aucun joueur classé.</div>'}catch(e){el.innerHTML='<div class="admin-error">Classement saisonnier inaccessible.</div>'}
}
function openSeasonRank(){loadSeasonLeaderboard();$('#seasonRankPanel').classList.remove('hidden')}

function startInfiniteMode(){
  if(!save.tutorialDone){startTutorialLevel();return}
  infiniteMode=true;stopLevelTimer();currentLevel=0;currentWorld=0;score=0;moves=30;selected=null;collected={};specialsCreated=0;busy=false;hammerMode=false;gameEnded=false;failurePending=false;infiniteStartTime=Date.now();
  generateBoard();ice=new Set();iceLayers=new Map();crates=new Set();chains=new Set();slime=new Set();rocks=new Set();fog=new Set();lava=new Set();
  showScreen('gameScreen');renderGameUI();renderBoard();toast('♾️ Mode Infini · fais le meilleur score !')
}
function finishInfinite(){
  if(gameEnded)return;gameEnded=true;infiniteMode=false;save.infiniteBest=Math.max(save.infiniteBest||0,score);addSeasonXp(Math.floor(score/1000)*10);grantChest(score>=50000?'rare':'common',1);persist();syncSeasonalLeaderboard();syncSocialProfile();checkAchievements();
  $('#modalIcon').textContent='♾️';$('#modalTitle').textContent='Mode Infini terminé';$('#modalText').textContent=`Score : ${score.toLocaleString('fr-FR')} · Record : ${save.infiniteBest.toLocaleString('fr-FR')}`;$('#modalStars').textContent='';$('#modalContinueBtn').classList.add('hidden');$('#modalRetryBtn').classList.add('hidden');$('#modalMainBtn').classList.remove('hidden');$('#modalMainBtn').textContent='Rejouer';$('#modalMainBtn').onclick=()=>{$('#modal').classList.add('hidden');startInfiniteMode()};$('#modal').classList.remove('hidden')
}

async function loadAdminGlobalStats(){
  if(!isAdmin)return;const el=$('#adminGlobalStats');el.innerHTML='<div class="admin-loading">Calcul...</div>';
  try{const [u,l,c,e,pay]=await Promise.all([getDocs(collection(db,'users')),getDocs(collection(db,'leaderboard')),getDocs(collection(db,'clans')),getDocs(collection(db,'events')),getDocs(collection(db,'stripePurchases'))]);const users=u.docs.map(d=>d.data()),players=users.filter(x=>x.role!=='admin'),coins=players.reduce((a,p)=>a+Number(p.coins||0),0),wins=players.reduce((a,p)=>a+Number(p.wins||0),0),maxLvl=Math.max(1,...players.map(p=>Number(p.unlocked||1))),payments=pay.docs.map(d=>d.data()).filter(x=>x.status==='fulfilled'),revenue=payments.reduce((a,p)=>a+Number(p.amountTotal||0),0);el.innerHTML=`<div><b>${players.length}</b><small>Joueurs</small></div><div><b>${users.length-players.length}</b><small>Admins</small></div><div><b>${coins.toLocaleString('fr-FR')}</b><small>Pièces totales</small></div><div><b>${wins.toLocaleString('fr-FR')}</b><small>Victoires</small></div><div><b>${c.size}</b><small>Clans</small></div><div><b>${e.size}</b><small>Événements</small></div><div><b>${maxLvl}</b><small>Niveau max</small></div><div><b>${l.size}</b><small>Classés</small></div><div><b>${payments.length}</b><small>Achats Stripe</small></div><div><b>${(revenue/100).toLocaleString('fr-FR',{minimumFractionDigits:2})} €</b><small>CA Stripe brut</small></div>`}catch(e){console.error(e);el.innerHTML='<div class="admin-error">Impossible de calculer les statistiques.</div>'}
}
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
const SHOP={
  hammer:{price:250,qty:3,label:'3 Marteaux 🔨'},shuffle:{price:180,qty:3,label:'3 Mélanges 🔀'},hint:{price:120,qty:5,label:'5 Indices 💡'},
  bomb:{price:450,qty:2,label:'2 Bombes 💣'},rocket:{price:400,qty:2,label:'2 Fusées 🚀'},rainbow:{price:700,qty:1,label:'1 Prisme 🌈'}
};
const PROMO_CODES={
  V1:{once:true,reward:{hammer:3},message:'3 marteaux offerts 🔨'},
  POPORIA:{once:true,reward:{coins:500},message:'500 pièces offertes 🪙'},
  ROCKET:{once:true,reward:{rocket:2},message:'2 fusées offertes 🚀'}
};
function openShop(){updateShop();renderRotatingShop();$('#shopPanel').classList.remove('hidden')}
function updateShop(){if(!save)return;$('#shopCoins').textContent=save.coins;['hammer','shuffle','hint','bomb','rocket','rainbow'].forEach(k=>$('#shop-'+k)&&($('#shop-'+k).textContent=inventoryCount(k)));$('#chestCount').textContent=Object.values(save.chestInventory||{}).reduce((a,b)=>a+Number(b||0),0)}
function buyPack(k){const p=SHOP[k];if(!p)return;if(save.coins<p.price){toast('Pas assez de pièces');return}save.coins-=p.price;save.inventory[k]=(save.inventory[k]||0)+p.qty;persist();updateShop();toast(`${p.label} ajoutés !`)}
async function redeemPromo(){
  const input=$('#promoInput'),code=(input.value||'').trim().toUpperCase();if(!code){toast('Entre un code promo');return}
  const promo=(await loadDynamicPromo(code))||PROMO_CODES[code];if(!promo){$('#promoMessage').textContent='Code invalide';return}
  save.usedPromoCodes=save.usedPromoCodes||[];if(promo.once&&save.usedPromoCodes.includes(code)){ $('#promoMessage').textContent='Code déjà utilisé';return }
  const r=promo.reward||{};if(r.coins)save.coins+=r.coins;for(const k of ['hammer','shuffle','hint','bomb','rocket','rainbow'])if(r[k])save.inventory[k]=(save.inventory[k]||0)+r[k];
  if(promo.once)save.usedPromoCodes.push(code);persist();updateShop();input.value='';$('#promoMessage').textContent='✅ '+promo.message;toast(promo.message)
}
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

async function adminCreatePromo(){
  if(!isAdmin)return;const code=$('#adminPromoCode').value.trim().toUpperCase();if(!code){toast('Entre un code');return}
  const reward={coins:Math.max(0,Number($('#adminPromoCoins').value)||0),hammer:Math.max(0,Number($('#adminPromoHammer').value)||0),rocket:Math.max(0,Number($('#adminPromoRocket').value)||0)};
  try{await setDoc(doc(db,'promoCodes',code),{once:true,active:true,reward,message:`Code ${code} appliqué !`,createdBy:user.uid,updatedAt:serverTimestamp()},{merge:true});toast(`Code ${code} publié 🎟️`)}catch(e){console.error(e);toast('Impossible de publier le code')}
}
async function adminCreateEvent(){
  if(!isAdmin)return;const id=$('#adminEventId').value.trim().toLowerCase(),name=$('#adminEventName').value.trim();if(!id||!name){toast('ID et nom obligatoires');return}
  const data={name,icon:$('#adminEventIcon').value.trim()||'🎉',description:$('#adminEventDesc').value.trim(),rewardCoins:Math.max(0,Number($('#adminEventReward').value)||100),startsAt:$('#adminEventStart').value||'',endsAt:$('#adminEventEnd').value||'',active:true,updatedAt:serverTimestamp(),createdBy:user.uid};
  try{await setDoc(doc(db,'events',id),data,{merge:true});toast('Événement publié 🎉');await loadAdminEvents();await loadEvents()}catch(e){console.error(e);toast('Publication refusée par Firebase')}
}
async function loadAdminEvents(){
  if(!isAdmin||!$('#adminEventsList'))return;
  const el=$('#adminEventsList');el.innerHTML='<small>Chargement...</small>';
  try{const snap=await getDocs(collection(db,'events'));el.innerHTML='';snap.docs.forEach(d=>{const e=d.data(),row=document.createElement('div');row.className='admin-event-row';row.innerHTML=`<span>${e.icon||'🎉'}</span><div><b>${e.name||d.id}</b><small>${d.id} · ${e.active===false?'Inactif':'Actif'} · +${e.rewardCoins||100} 🪙</small></div><button class="btn ghost">${e.active===false?'Activer':'Désactiver'}</button>`;row.querySelector('button').onclick=async()=>{await setDoc(doc(db,'events',d.id),{active:e.active===false,updatedAt:serverTimestamp()},{merge:true});loadAdminEvents();loadEvents()};el.appendChild(row)});if(!snap.size)el.innerHTML='<small>Aucun événement Firebase.</small>'}catch(e){el.innerHTML='<small>Accès refusé.</small>'}
}
async function adminGrantBoosters(){
  if(!isAdmin)return;const id=$('#adminSelectedId').value;if(!id){toast('Sélectionne un joueur');return}
  const p=adminPlayers.find(x=>x.id===id)||{},inv={hammer:0,shuffle:0,hint:0,bomb:0,rocket:0,rainbow:0,...(p.inventory||{})};
  inv.hammer+=Math.max(0,Number($('#adminGrantHammer').value)||0);inv.bomb+=Math.max(0,Number($('#adminGrantBomb').value)||0);inv.rocket+=Math.max(0,Number($('#adminGrantRocket').value)||0);inv.rainbow+=Math.max(0,Number($('#adminGrantRainbow').value)||0);
  try{await setDoc(doc(db,'users',id),{inventory:inv,updatedAt:serverTimestamp()},{merge:true});toast('Boosters envoyés 🎁');await loadAdminPlayers()}catch(e){console.error(e);toast('Envoi refusé')}
}
async function adminSaveNow(){
  if(!isAdmin||guest||!user)return;
  await setDoc(doc(db,'users',user.uid),{...save,role:'admin',uid:user.uid,email:user.email,pseudo:user.displayName||'Admin',updatedAt:serverTimestamp()},{merge:true});
  localStorage.setItem(localKey(),JSON.stringify(save));updateProfile();renderMap()
}
function openAdmin(){
  if(!isAdmin){toast('Accès administrateur refusé');return}
  $('#profilePanel').classList.add('hidden');$('#adminPanel').classList.remove('hidden');
  $('#adminCoinsValue').value=save.coins;$('#adminLevelValue').value=save.unlocked;loadAdminPlayers();loadAdminEvents();loadAdminGlobalStats()
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
$('#promoRedeemBtn').onclick=redeemPromo;$('#bombBtn').onclick=()=>deployPurchasedSpecial('bomb');$('#rocketBtn').onclick=()=>deployPurchasedSpecial('rocket');$('#rainbowBtn').onclick=()=>deployPurchasedSpecial('rainbow');$('#modalContinueBtn').onclick=continueFiveMoves;$('#modalRetryBtn').onclick=()=>{confirmFailedLife();$('#modal').classList.add('hidden');openPreLevel(currentLevel)};
$('#featureTutorialNext').onclick=acceptFeatureTutorial;$('#tutorialLevelBtn').onclick=startTutorialLevel;$('#coachNextBtn').onclick=finishTutorial;$('#tutorialBtn').onclick=()=>$('#tutorialPanel').classList.remove('hidden');
$('#closeTutorial').onclick=()=>$('#tutorialPanel').classList.add('hidden');
$('#creditsBtn').onclick=()=>$('#creditsPanel').classList.remove('hidden');
$('#closeCredits').onclick=()=>$('#creditsPanel').classList.add('hidden');
$('#tutorialPanel').onclick=e=>{if(e.target.id==='tutorialPanel')e.currentTarget.classList.add('hidden')};
$('#creditsPanel').onclick=e=>{if(e.target.id==='creditsPanel')e.currentTarget.classList.add('hidden')};
$$('.tutorial-tab').forEach(btn=>btn.onclick=()=>{
  $$('.tutorial-tab').forEach(x=>x.classList.toggle('active',x===btn));
  $$('.tutorial-page').forEach(p=>p.classList.toggle('active',p.dataset.page===btn.dataset.tutorial));
});
$$('[data-stripe-product]').forEach(b=>b.onclick=()=>startStripeCheckout(b.dataset.stripeProduct));$('#infiniteBtn').onclick=startInfiniteMode;$('#friendsBtn').onclick=openFriends;$('#closeFriends').onclick=()=>$('#friendsPanel').classList.add('hidden');$('#addFriendBtn').onclick=addFriend;$('#achievementsBtn').onclick=openAchievements;$('#closeAchievements').onclick=()=>$('#achievementsPanel').classList.add('hidden');$('#notificationsBtn').onclick=openNotifications;$('#closeNotifications').onclick=()=>$('#notificationsPanel').classList.add('hidden');$('#skinsBtn').onclick=openSkins;$('#closeSkins').onclick=()=>$('#skinsPanel').classList.add('hidden');$('#chestsBtn').onclick=openChestRoom;$('#closeChestRoom').onclick=()=>$('#chestRoomPanel').classList.add('hidden');$$('[data-open-chest]').forEach(b=>b.onclick=()=>openTypedChest(b.dataset.openChest));$('#seasonRankBtn').onclick=openSeasonRank;$('#closeSeasonRank').onclick=()=>$('#seasonRankPanel').classList.add('hidden');$('#seasonBtn').onclick=openSeasonPass;$('#closeSeason').onclick=()=>$('#seasonPanel').classList.add('hidden');$('#activatePremiumBtn').onclick=activatePremiumPass;$('#missionsBtn').onclick=openMissions;$('#closeMissions').onclick=()=>$('#missionsPanel').classList.add('hidden');$('#eventsBtn').onclick=openEvents;$('#eventHomeBtn').onclick=openEvents;$('#closeEvents').onclick=()=>$('#eventsPanel').classList.add('hidden');$('#clanBtn').onclick=openClan;$('#closeClan').onclick=()=>$('#clanPanel').classList.add('hidden');$('#createClanBtn').onclick=createClan;$('#joinClanBtn').onclick=joinClan;$('#leaveClanBtn').onclick=leaveClan;$('#adminCreatePromoBtn').onclick=adminCreatePromo;$('#adminCreateEventBtn').onclick=adminCreateEvent;$('#adminGrantBoostersBtn').onclick=adminGrantBoosters;$('#leaderboardBtn').onclick=openLeaderboard;$('#closeLeaderboard').onclick=()=>$('#leaderboardPanel').classList.add('hidden');$('#shopBtn').onclick=openShop;$('#closeShop').onclick=()=>$('#shopPanel').classList.add('hidden');$('#shopPanel').onclick=e=>{if(e.target.id==='shopPanel')e.currentTarget.classList.add('hidden')};$$('[data-buy]').forEach(b=>b.onclick=()=>buyPack(b.dataset.buy));$('#openChestBtn').onclick=openChestRoom;$('#preCancelBtn').onclick=()=>$('#preLevelModal').classList.add('hidden');$('#prePlayBtn').onclick=()=>actualStartLevel(currentLevel);$('#adminRefreshPlayers').onclick=loadAdminPlayers;$('#adminSavePlayer').onclick=saveAdminPlayer;$('#playBtn').onclick=()=>{if(!save.tutorialDone){startTutorialLevel();toast('Le tutoriel est obligatoire avant la campagne 🎓');return}currentWorld=worldForLevel(save.unlocked);showScreen('mapScreen')};$$('[data-go]').forEach(b=>b.onclick=()=>showScreen(b.dataset.go));$('#backToMap').onclick=()=>{if(confirm('Quitter la partie en cours ?')){stopLevelTimer();infiniteMode=false;showScreen('mapScreen')}};$('#modalMapBtn').onclick=()=>{confirmFailedLife();$('#modal').classList.add('hidden');infiniteMode=false;showScreen('mapScreen')};$('#shuffleBtn').onclick=async()=>{if(busy||gameEnded)return;busy=true;await shuffleBoard(true,true);busy=false};$('#hammerBtn').onclick=()=>{if(busy||gameEnded)return;if(inventoryCount('hammer')<1&&save.coins<COST.hammer){toast(`Marteau : ${COST.hammer} 🪙`);return}hammerMode=!hammerMode;$('#hammerBtn').classList.toggle('active',hammerMode);if(hammerMode)toast('Choisis un Pop à casser 🔨')};$('#hintBtn').onclick=()=>{if(!busy&&!gameEnded)showHint()};$('#accountBtn').onclick=()=>{$('#profilePanel').classList.remove('hidden');updateProfile()};$('#saveProfileBtn').onclick=savePlayerProfile;$('#profilePhotoInput').onchange=e=>handleProfilePhoto(e.target.files?.[0]);$('#closeProfile').onclick=()=>$('#profilePanel').classList.add('hidden');$('#adminBtn').onclick=openAdmin;$('#closeAdmin').onclick=()=>$('#adminPanel').classList.add('hidden');$('#adminApplyBtn').onclick=adminApply;$('#adminBonusBtn').onclick=adminBonus;$('#adminUnlockBtn').onclick=adminUnlockAll;$('#profilePanel').onclick=e=>{if(e.target.id==='profilePanel')e.currentTarget.classList.add('hidden')};$('#logoutBtn').onclick=async()=>{guest=false;save=null;$('#profilePanel').classList.add('hidden');if(auth.currentUser)await signOut(auth);else showScreen('authScreen')};$('#resetBtn').onclick=async()=>{if(!confirm('Réinitialiser la progression de ce compte ?'))return;save=defaultSave();normalizeSave();persist();if(!guest&&user)await setDoc(doc(db,'users',user.uid),{...save,uid:user.uid,email:user.email,pseudo:user.displayName||'Joueur',updatedAt:serverTimestamp()},{merge:true});applySkin();updateProfile();toast('Progression réinitialisée')};$('#dailyRewardBtn').onclick=dailyGift;

onAuthStateChanged(auth,async fbUser=>{if(guest)return;if(!fbUser){user=null;save=null;isAdmin=false;showScreen('authScreen');return}try{user=fbUser;guest=false;await loadCloudSave();applySkin();updateProfile();updateNotificationBadge();ensureDailyMissions();syncLeaderboard();syncSeasonalLeaderboard();syncSocialProfile();loadEvents();syncClanScore();checkAchievements();stripeReturnMessage();showScreen('homeScreen')}catch(e){console.error(e);$('#authMessage').textContent='Compte connecté, mais Firestore est inaccessible. Vérifie les règles Firestore.';save=localLoad();updateProfile();showScreen('homeScreen')}});
