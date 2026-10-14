import { useEffect, useState } from "react";
import "./App.css";

const KEY = "wcc_tournament_v1";
const defaultTeams = [
  { id: "india", name: "India", flag: "🇮🇳", players: [["Rohit Sharma",48],["Virat Kohli",65],["Shubman Gill",42],["Jasprit Bumrah",18],["Hardik Pandya",31]] },
  { id: "australia", name: "Australia", flag: "🇦🇺", players: [["Travis Head",57],["Steve Smith",44],["Glenn Maxwell",39],["Pat Cummins",21],["Mitchell Starc",16]] },
  { id: "south-africa", name: "South Africa", flag: "🇿🇦", players: [["Quinton de Kock",51],["Aiden Markram",38],["David Miller",45],["Kagiso Rabada",19],["Marco Jansen",27]] },
  { id: "new-zealand", name: "New Zealand", flag: "🇳🇿", players: [["Kane Williamson",54],["Devon Conway",41],["Daryl Mitchell",36],["Trent Boult",20],["Mitchell Santner",25]] },
  { id: "west-indies", name: "West Indies", flag: "🏝️", players: [["Shai Hope",46],["Nicholas Pooran",59],["Andre Russell",35],["Alzarri Joseph",17],["Jason Holder",23]] },
  { id: "england", name: "England", flag: "🏴", players: [["Jos Buttler",62],["Joe Root",50],["Harry Brook",47],["Jofra Archer",15],["Liam Livingstone",33]] },
];
function initialTeams() { return defaultTeams.map(t => ({...t, players:t.players.map((p,i)=>({id:`${t.id}-${i}`,name:p[0],score:p[1],photo:""}))})); }
function load() { try { const s=JSON.parse(localStorage.getItem(KEY)); if(s && Array.isArray(s.teams)) return {...s,teams:s.teams.map(t=>({...t,players:(t.players||[]).map((p,i)=>({id:p.id||`${t.id}-${i}`,name:p.name,score:Number(p.score ?? p.runs ?? 0),photo:p.photo||""}))})),matches:Array.isArray(s.matches)?s.matches.map((m,i)=>({id:m.id||`m${i+1}`,a:m.a??m.teamA,b:m.b??m.teamB,sa:Number(m.sa??m.scoreA??0),sb:Number(m.sb??m.scoreB??0),status:m.status||"LIVE"})).filter(m=>m.a&&m.b):[]}; } catch {} return {teams:initialTeams(),matches:[]}; }
const total = t => t.players.reduce((sum,p)=>sum+Number(p.score||0),0);

export default function App() {
  const [state,setState]=useState(load);
  const [page,setPage]=useState("dashboard");
  const [modal,setModal]=useState(false);
  const [editingId,setEditingId]=useState("");
  const [teamName,setTeamName]=useState("");
  const [teamFlag,setTeamFlag]=useState("🇮🇳");
  const {teams,matches}=state;
  const team=id=>teams.find(t=>t.id===id);
  const save=next=>setState(next);
  useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(state));}catch{}},[state]);
  useEffect(()=>{if(teams.length>=2 && matches.length===0) setState(s=>s.matches.length||s.teams.length<2?s:{...s,matches:[{id:"m1",a:s.teams[0].id,b:s.teams[1].id,sa:0,sb:0,status:"LIVE"}]});},[teams.length,matches.length]);
  function changePlayer(tid,pid,delta){save({...state,teams:teams.map(t=>t.id!==tid?t:{...t,players:t.players.map(p=>p.id!==pid?p:{...p,score:Math.max(0,Number(p.score||0)+delta)})})});}
  function changeMatch(mid,side,delta=1){save({...state,matches:matches.map(m=>m.id!==mid?m:{...m,[side]:Math.max(0,Number(m[side]||0)+delta)})});}
  function resetMatch(id){save({...state,matches:matches.map(m=>m.id!==id?m:{...m,sa:0,sb:0})});}
  function addPlayer(id){const name=prompt("Player name:");if(!name?.trim())return;const score=Number(prompt("Starting score:","0"))||0;const photo=prompt("Photo URL (optional):","")||"";save({...state,teams:teams.map(t=>t.id!==id?t:{...t,players:[...t.players,{id:`${id}-${Date.now()}`,name:name.trim(),score:Math.max(0,score),photo}]})});}
  function deleteTeam(id){if(!confirm("Delete this team?"))return;save({...state,teams:teams.filter(t=>t.id!==id),matches:[]});}
  function openTeam(t=null){setEditingId(t?.id||"");setTeamName(t?.name||"");setTeamFlag(t?.flag||"🏏");setModal(true);}
  function submitTeam(e){e.preventDefault();const name=teamName.trim(),flag=teamFlag.trim()||"🏏";if(!name)return;if(editingId)save({...state,teams:teams.map(t=>t.id===editingId?{...t,name,flag}:t)});else save({...state,teams:[...teams,{id:`team-${Date.now()}`,name,flag,players:[]}]});setModal(false);}
  const tabs=[["dashboard","Dashboard"],["teams","Teams & Players"],["matches","Matches"],["bracket","Bracket"],["streamer","Streamer"]];
  const m=matches[0],a=m?team(m.a):null,b=m?team(m.b):null;
  return <>
    <header className="hero"><div><div className="eyebrow">TOURNAMENT CONTROL CENTER</div><h1>World Cricket Championship</h1><p>Live Bracket &amp; Scoreboard</p></div><div className="live"><span/> LIVE</div></header>
    <nav className="tabs">{tabs.map(([id,label])=><button key={id} className={`tab ${page===id?"active":""}`} onClick={()=>setPage(id)}>{label}</button>)}</nav>
    <main>
      {page==="dashboard"&&<section className="page active"><h2>Live Match</h2><div className="live-card">{m&&a&&b?<div className="versus"><div>{a.flag} {a.name}<br/><strong>{m.sa}</strong></div><div>VS</div><div>{b.flag} {b.name}<br/><strong>{m.sb}</strong></div></div>:<p>Add at least two teams.</p>}</div><h2>Teams</h2><div className="team-grid">{teams.map(t=><div className="team-card" key={t.id}><div className="flag">{t.flag}</div><h3>{t.name}</h3><div className="total">{total(t)}</div><div className="muted">{t.players.length} players • Total points</div></div>)}</div></section>}
      {page==="teams"&&<section className="page active"><div className="section-head"><div><h2>Teams &amp; Players</h2><p>Add teams, players, photos and individual scores.</p></div><button className="primary" onClick={()=>openTeam()}>+ Add Team</button></div><div className="team-manager">{teams.map(t=><div className="team-card" key={t.id}><div className="flag">{t.flag}</div><h3>{t.name}</h3><div className="total">{total(t)}</div><div className="muted">Team total from player scores</div><div className="players">{t.players.map(p=><div className="player" key={p.id}>{p.photo?<img className="avatar" src={p.photo} alt={p.name}/>:<div className="avatar">👤</div>}<div className="player-name">{p.name}</div><div className="score">{p.score}<button onClick={()=>changePlayer(t.id,p.id,1)}>+</button><button onClick={()=>changePlayer(t.id,p.id,-1)}>−</button></div></div>)}</div><div className="team-actions"><button className="secondary" onClick={()=>addPlayer(t.id)}>+ Player</button><button className="secondary" onClick={()=>openTeam(t)}>Edit Team</button><button className="danger" onClick={()=>deleteTeam(t.id)}>Delete</button></div></div>)}</div></section>}
      {page==="matches"&&<section className="page active"><div className="section-head"><div><h2>Matches</h2><p>Update the live match score.</p></div></div>{teams.length<2&&<p>Add at least two teams.</p>}{matches.map(match=>{const x=team(match.a),y=team(match.b);if(!x||!y)return null;return <div className="match-card" key={match.id}><div className="match-row"><div className="match-team">{x.flag}<br/>{x.name}</div><div className="match-score">{match.sa} - {match.sb}</div><div className="match-team">{y.flag}<br/>{y.name}</div></div><div className="match-controls"><button className="primary" onClick={()=>changeMatch(match.id,"sa")}>+ {x.name}</button><button className="primary" onClick={()=>changeMatch(match.id,"sb")}>+ {y.name}</button><button className="secondary" onClick={()=>resetMatch(match.id)}>Reset</button></div></div>})}</section>}
      {page==="bracket"&&<section className="page active"><h2>Tournament Bracket</h2><div className="bracket"><div className="round"><h3>QUARTER / ROUND 1</h3>{Array.from({length:Math.ceil(teams.length/2)},(_,i)=><div className="bracket-match" key={i}><div>{teams[i*2]?`${teams[i*2].flag} ${teams[i*2].name}`:"TBD"}</div><div>{teams[i*2+1]?`${teams[i*2+1].flag} ${teams[i*2+1].name}`:"TBD"}</div></div>)}{!teams.length&&<p>No teams</p>}</div><div className="round"><h3>SEMIFINAL</h3><div className="bracket-match"><div>TBD</div><div>TBD</div></div><div className="bracket-match"><div>TBD</div><div>TBD</div></div></div><div className="round"><h3>FINAL</h3><div className="bracket-match"><div>TBD</div><div>TBD</div></div></div></div></section>}
      {page==="streamer"&&<section className="page active"><h2>Streamer View</h2><div className="streamer-card">{m&&a&&b?<><div className="muted">WORLD CRICKET CHAMPIONSHIP • LIVE</div><div className="big-score">{a.flag} {a.name} {m.sa} &nbsp;—&nbsp; {m.sb} {b.name} {b.flag}</div><div>LIVE SCOREBOARD</div></>:<h2>Waiting for live match...</h2>}</div></section>}
    </main>
    {modal&&<div className="modal" onClick={e=>{if(e.target===e.currentTarget)setModal(false)}}><div className="modal-box"><button className="close" onClick={()=>setModal(false)}>&times;</button><h2>{editingId?"Edit Team":"Add Team"}</h2><form onSubmit={submitTeam}><label>Team name<input value={teamName} onChange={e=>setTeamName(e.target.value)} required placeholder="Example: India"/></label><label>Flag / Emoji<input value={teamFlag} onChange={e=>setTeamFlag(e.target.value)} placeholder="🇮🇳"/></label><button className="primary" type="submit">Save Team</button></form></div></div>}
  </>;
}
