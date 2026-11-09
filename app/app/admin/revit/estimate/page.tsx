"use client";
import { useCallback,useEffect,useMemo,useState,type ChangeEvent } from "react";
import Link from "next/link";
import { listResource } from "@/lib/client/dataApi";
import { AlertTriangle,ArrowLeft,BookOpenCheck,Download,FileSpreadsheet,FileText,Layers3,RefreshCw,Upload } from "lucide-react";
import { calculateRevitEstimate,wallGroups,DEFAULT_ESTIMATE_SETTINGS,type RevitModel,type RevitEstimate,type Mapping,type Settings,type SystemChoice } from "@/lib/quantity/revitEstimate.mjs";
import { buildRevitWorkbook } from "@/lib/quantity/revitWorkbook.mjs";
type Project={id:string;code:string;name:string};
type Snapshot={id:string;model_title:string;element_count:number;exported_at:string;summary?:{quality?:{issues?:{severity:string;code:string;level:string;category:string;name:string;elementId?:number|null;uniqueId?:string|null;detail:string;action:string}[]}}};
const money=(n:number)=>new Intl.NumberFormat("en-EG",{maximumFractionDigits:2}).format(n);
const quantity=(n:number)=>new Intl.NumberFormat("en-EG",{maximumFractionDigits:2}).format(n);
const controls:({key:keyof Settings;label:string;unit:string;help?:string})[]=[
 {key:"blockLengthM",label:"Block face length",unit:"m",help:"Manufacturer block size"},
 {key:"blockHeightM",label:"Block face height",unit:"m"},
 {key:"jointM",label:"Nominal mortar joint",unit:"m"},
 {key:"blockWastePct",label:"Block allowance",unit:"%"},
 {key:"paintCoats",label:"Coats of paint",unit:"coats"},
 {key:"paintCoverageM2PerL",label:"Coverage per coat",unit:"m²/L",help:"0 = don't calculate liters"},
 {key:"paintWastePct",label:"Paint loss",unit:"%"},
 {key:"mortarM3PerM2",label:"Mortar consumption",unit:"m³/m²",help:"0 = unknown, not estimated"},
 {key:"cementBagsPerMortarM3",label:"Cement per mortar",unit:"bags/m³",help:"0 = unknown"},
 {key:"sandM3PerMortarM3",label:"Sand per mortar",unit:"m³/m³",help:"0 = unknown"},
 {key:"blockPriceEGP",label:"Block unit price",unit:"EGP/pc"},
 {key:"plasterPriceEGPM2",label:"Plaster unit rate",unit:"EGP/m²"},
 {key:"paintPriceEGPM2",label:"Paint unit rate",unit:"EGP/m²"},
 {key:"drywallPriceEGPM2",label:"Drywall face rate",unit:"EGP/m²"}
];
const classNames="rounded-lg border border-[#d7dfdf] bg-white px-3 py-2.5 text-sm text-[#26373c]";
async function getApi<T>(path:string):Promise<T>{const r=await fetch("/api/cost-control/revit/"+path,{credentials:"include",cache:"no-store"});const d=await r.json();if(!r.ok)throw Error(d.error||"Could not load model");return d as T;}
function downloadBlob(blob:Blob,name:string){const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),500);}
export default function RevitMaterialEstimatePage(){
 const [projects,setProjects]=useState<Project[]>([]),[projectId,setProjectId]=useState(""),[snapshotId,setSnapshotId]=useState(""),[snapshots,setSnapshots]=useState<Snapshot[]>([]);
 const [model,setModel]=useState<RevitModel|null>(null),[quality,setQuality]=useState<Snapshot["summary"]>(undefined);
 const [mappings,setMappings]=useState<Record<string,Mapping>>({}),[settings,setSettings]=useState<Settings>({...DEFAULT_ESTIMATE_SETTINGS});
 const [busy,setBusy]=useState(false),[error,setError]=useState("");
 useEffect(()=>{const params=new URLSearchParams(window.location.search);setProjectId(params.get("projectId")||"");setSnapshotId(params.get("snapshotId")||"");void listResource<Project>("projects",undefined,200).then(r=>{setProjects(r.data);setProjectId(p=>p||r.data[0]?.id||"");}).catch(e=>setError(e instanceof Error?e.message:"Could not load projects"));},[]);
 useEffect(()=>{if(!projectId){setSnapshots([]);return;}let active=true;void getApi<{data:Snapshot[]}>("snapshots?projectId="+encodeURIComponent(projectId)).then(r=>{if(active){setSnapshots(r.data);setSnapshotId(old=>r.data.some(s=>s.id===old)?old:r.data[0]?.id||"");}}).catch(e=>{if(active)setError(e instanceof Error?e.message:"Could not load snapshots")});return()=>{active=false;}},[projectId]);
 useEffect(()=>{if(!projectId||!snapshotId){setModel(null);return;}let active=true;setBusy(true);setError("");
  void getApi<{data:{payload:RevitModel;summary:Snapshot["summary"]}}>("estimate/source?projectId="+encodeURIComponent(projectId)+"&snapshotId="+encodeURIComponent(snapshotId))
   .then(r=>{if(active){setModel(r.data.payload);setQuality(r.data.summary);setMappings({});}})
   .catch(e=>{if(active){setModel(null);setError(e instanceof Error?e.message:"Could not load model snapshot")}})
   .finally(()=>{if(active)setBusy(false)});
  return()=>{active=false;}
 },[projectId,snapshotId]);
 const groups=useMemo(()=>model?wallGroups(model):[],[model]);
 const report=useMemo(()=>model?calculateRevitEstimate(model,mappings,settings):null,[model,mappings,settings]);
 const updateMapping=useCallback((key:string,field:keyof Mapping,value:string|number)=>{
  setMappings(previous=>{const current=previous[key]??{system:"unmapped" as SystemChoice,plasterFaces:0,paintFaces:0,drywallFaces:2};return {...previous,[key]:{...current,[field]:value}};});
 },[]);
 function editSetting(key:keyof Settings,next:string){const n=Number(next);setSettings(old=>({...old,[key]:next.trim()===""?0:Math.max(0,Number.isFinite(n)?n:0)}));}
 function exportXlsx(){if(!model||!report)return;try{
  const bytes=buildRevitWorkbook(model,report,quality?.quality);
  const blob=new Blob([new Uint8Array(bytes)],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
  downloadBlob(blob,"MasonArc-"+model.title.replace(/[^a-zA-Z0-9_-]/g,"_")+"-BOQ.xlsx");
 }catch(e){setError(e instanceof Error?e.message:"Excel export failed");}}
 function saveRecipe(){if(!model)return;const cfg={schema:"masonarc-estimate-recipe-v1",modelKey:projectId+":"+snapshotId,projectId,snapshotId,mappings,settings};
  downloadBlob(new Blob([JSON.stringify(cfg,null,2)],{type:"application/json"}),"MasonArc-"+model.title.replace(/[^a-zA-Z0-9_-]/g,"_")+"-Recipe.json");
 }
 async function loadRecipe(event:ChangeEvent<HTMLInputElement>){const file=event.target.files?.[0];event.target.value="";if(!file)return;setError("");
  try{
   if(file.size>200_000)throw Error("Recipe exceeds 200 KB");
   const o=JSON.parse(await file.text()) as {schema?:string;modelKey?:string;mappings?:Record<string,Mapping>;settings?:Settings};
   if(o.schema!=="masonarc-estimate-recipe-v1"||o.modelKey!==projectId+":"+snapshotId)throw Error("This recipe belongs to a different project or snapshot");
   const keys=new Set(groups.map(g=>g.key));const next:Record<string,Mapping>={};
   for(const [key,v] of Object.entries(o.mappings??{})){
    if(!keys.has(key)||!v||!["unmapped","masonry","drywall","glazing","exclude"].includes(v.system))continue;
    next[key]={system:v.system,plasterFaces:[0,1,2].includes(Number(v.plasterFaces))?Number(v.plasterFaces):0,
      paintFaces:[0,1,2].includes(Number(v.paintFaces))?Number(v.paintFaces):0,drywallFaces:2};
   }
   const saved=o.settings??{} as Settings;const nextSettings={...DEFAULT_ESTIMATE_SETTINGS};
   for(const key of Object.keys(nextSettings) as (keyof Settings)[]){const val=saved[key];if(typeof val==="number"&&Number.isFinite(val)&&val>=0&&val<=100000000)nextSettings[key]=val;}
   setMappings(next);setSettings(nextSettings);
  }catch(e){setError(e instanceof Error?e.message:"Invalid recipe file");}
 }
 function reset(){setMappings({});setSettings({...DEFAULT_ESTIMATE_SETTINGS});}
 const misclassified=groups.filter(g=>g.materials.some(m=>/gypsum wall board/i.test(m))&&mappings[g.key]?.system==="masonry").length;
 return <main className="revit-estimate min-h-screen bg-[#f7f8f6] px-4 py-8 text-[#23353c] sm:px-8 lg:px-10">
 <style>{`@page{size:A4 landscape;margin:11mm}@media print{
  body{background:white!important} .revit-estimate{padding:0!important;background:white!important;color:#24363b!important}
  .estimate-no-print{display:none!important} .estimate-print-header{display:flex!important}
  .estimate-print-section{break-inside:avoid;page-break-inside:avoid} .estimate-page-break{break-before:page}
  .revit-estimate table{font-size:9px!important} .revit-estimate .estimate-main{max-width:none!important}
  .revit-estimate h1{font-size:24px!important} .revit-estimate section{box-shadow:none!important}
 }`}</style>
 <div className="estimate-main mx-auto max-w-[1430px]">
  <div className="estimate-no-print mb-6"><Link href="/app/admin/revit" className="inline-flex items-center gap-2 text-xs text-[#4F6B7A]"><ArrowLeft size={15}/> Revit Connector</Link></div>
  <header className="mb-7 border-b border-[#d3dddd] pb-6">
   <div className="flex flex-wrap items-end justify-between gap-5">
    <div><p className="text-[10px] uppercase tracking-[.24em] text-[#4F6B7A]">MASON & ARC / BIM INTELLIGENCE</p><h1 className="mt-2 text-3xl font-medium tracking-tight sm:text-4xl">Material Takeoff <span className="text-[#4F6B7A]">& BOQ</span></h1><p className="mt-2 max-w-2xl text-sm text-[#738289]">Model-derived areas → approved type mapping → editable construction assumptions → Excel and landscape PDF.</p></div>
    <span className="rounded-md border border-[#d4c9a6] bg-[#fff9eb] px-3 py-2 text-[11px] font-medium tracking-wider text-[#876a3c]">UNVERIFIED / NOT FOR PROCUREMENT</span>
   </div>
  </header>
  <div className="estimate-no-print grid gap-4 md:grid-cols-2">
   <label className="text-xs text-[#607078]">Studio project<select className={"mt-2 w-full "+classNames} value={projectId} onChange={e=>{setProjectId(e.target.value);setSnapshotId("");setModel(null);}}><option value="">Select a project</option>{projects.map(p=><option key={p.id} value={p.id}>{p.code} · {p.name}</option>)}</select></label>
   <label className="text-xs text-[#607078]">Revit quantity snapshot<select className={"mt-2 w-full "+classNames} value={snapshotId} onChange={e=>setSnapshotId(e.target.value)}><option value="">Select a model snapshot</option>{snapshots.map(s=><option key={s.id} value={s.id}>{s.model_title} · {new Date(s.exported_at).toLocaleDateString()} · {s.element_count} elements</option>)}</select></label>
  </div>
  {error&&<div role="alert" className="estimate-no-print mt-4 rounded-lg border border-[#dabbb8] bg-[#fff5f2] p-4 text-sm text-[#9b4e47]">{error}</div>}
  {busy&&<p className="estimate-no-print mt-5 text-sm text-[#647983]"><RefreshCw size={15} className="mr-2 inline animate-spin"/>Loading model...</p>}
  {!model&&!busy&&<div className="estimate-no-print mt-8 rounded-xl border border-dashed border-[#c5d2d1] bg-white p-10 text-center text-sm text-[#697b7e]">Select a model snapshot above. If none exists, return to Revit Connector and import the Export Takeoff JSON first.</div>}
  {model&&report&&<div className="space-y-6">
   <section className="estimate-print-section mt-6 rounded-xl border border-[#dfe5e4] bg-white p-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[10px] uppercase tracking-wider text-[#4F6B7A]">01 / MODEL SUMMARY</p><h2 className="mt-1 text-xl font-medium">{model.title} — Measured quantities</h2><p className="mt-1 text-xs text-[#829094]">Snapshot {new Date(model.exportedAtUtc).toLocaleString()} · Revit 2027</p></div><BookOpenCheck className="text-[#4F6B7A]" size={22}/></div>
    <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
     {([{label:"Unmapped wall area",value:quantity(report.totals.unmappedWallAreaM2),unit:"m² · awaiting type approval"},{label:"Masonry blocks",value:money(report.totals.blocks),unit:"pcs · scenario only"},{label:"Plaster surface",value:quantity(report.totals.plasterAreaM2),unit:"m² · assigned finishes"},{label:"Paint surface",value:quantity(report.totals.paintAreaM2),unit:"m² · assigned finishes"}]).map(c=><div key={c.label} className="rounded-lg bg-[#f2f5f4] px-4 py-4"><p className="text-xs text-[#738187]">{c.label}</p><p className="mt-2 text-2xl font-medium tabular-nums">{c.value}</p><p className="mt-1 text-[11px] text-[#829297]">{c.unit}</p></div>)}
    </div>
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#e1e7e5] pt-4"><p className="text-xs text-[#6e7e83]">{report.status.unmappedGroups} wall type groups unmapped · {report.status.missingAreaGroups} missing area groups · {quality?.quality?.issues?.length??0} QA items</p><div className="text-right"><span className="text-xs text-[#738187]">Priced partial EGP </span><span className="ml-2 text-lg font-medium tabular-nums">{money(report.partialCostEGP)}</span><p className="text-[10px] text-[#926640]">{report.completeCostEstimate?"All displayed lines have scenario rates · not certified":"Incomplete estimate — never treat partial cost as total"}</p></div></div>
   </section>
   <section className="estimate-no-print rounded-xl border border-[#dfe5e4] bg-white p-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[10px] uppercase tracking-wider text-[#4F6B7A]">02 / ENGINEERING DECISIONS</p><h2 className="mt-1 text-xl font-medium">Classify each wall type</h2></div><span className="text-xs text-[#738187]">Nothing is assigned automatically</span></div>
    <p className="mt-3 text-xs leading-6 text-[#6a777e]">For each Revit type, select the real construction system and how many wall faces need plaster and paint. A material named &quot;Gypsum Wall Board&quot; is not proof the wall is drywall. Zero faces means no derived finishing quantity.</p>
    <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[930px] text-left text-xs"><thead className="bg-[#eff3f2]"><tr>{["Revit type / material","Elements","Wall m²","Construction system","Plaster faces","Paint faces","Block count","Review"].map(h=><th key={h} className="whitespace-nowrap px-3 py-3 font-medium">{h}</th>)}</tr></thead>
    <tbody>{groups.map(g=>{const map=mappings[g.key]??{system:"unmapped",plasterFaces:0,paintFaces:0};const item=report.groups.find(x=>x.key===g.key);return <tr key={g.key} className="border-b border-[#edf0ef] align-top"><td className="px-3 py-3"><p className="font-medium">{g.name}</p><p className="mt-1 text-[11px] text-[#859296]">{g.materials.join(", ")||"No Revit material"}</p></td><td className="px-3 py-3 tabular-nums">{g.count}</td><td className="px-3 py-3 tabular-nums">{quantity(g.areaM2)}</td><td className="px-3 py-2"><select aria-label={"System for "+g.name} className={classNames+" min-w-[138px]"} value={map.system} onChange={e=>updateMapping(g.key,"system",e.target.value)}><option value="unmapped">Needs review</option><option value="masonry">Masonry blocks</option><option value="drywall">Drywall board</option><option value="glazing">Glazed host</option><option value="exclude">Exclude from derived work</option></select></td>
     <td className="px-3 py-2"><select aria-label={"Plaster sides for "+g.name} disabled={map.system!=="masonry"} className={classNames+" w-[73px] disabled:opacity-40"} value={map.plasterFaces??0} onChange={e=>updateMapping(g.key,"plasterFaces",Number(e.target.value))}>{[0,1,2].map(x=><option key={x} value={x}>{x}</option>)}</select></td>
     <td className="px-3 py-2"><select aria-label={"Paint sides for "+g.name} disabled={!["masonry","drywall"].includes(map.system)} className={classNames+" w-[73px] disabled:opacity-40"} value={map.paintFaces??0} onChange={e=>updateMapping(g.key,"paintFaces",Number(e.target.value))}>{[0,1,2].map(x=><option key={x} value={x}>{x}</option>)}</select></td>
     <td className="px-3 py-3 tabular-nums">{item?.blocks==null?"—":money(item.blocks)}</td><td className="px-3 py-3 text-[#926640]">{g.missingArea?"Missing areas":"Verify specification"}</td></tr>})}</tbody></table></div>
    {misclassified>0&&<p className="mt-4 rounded-md bg-[#fff8e7] p-3 text-xs text-[#906837]"><AlertTriangle className="mr-2 inline" size={14}/>{misclassified} types assigned masonry while Revit names Gypsum Wall Board. Verify build-up and site specification.</p>}
   </section>
   <section className="estimate-no-print rounded-xl border border-[#dfe5e4] bg-white p-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[10px] uppercase tracking-wider text-[#4F6B7A]">03 / PROJECT COEFFICIENTS</p><h2 className="mt-1 text-xl font-medium">Dimensions, waste, coverage and rates</h2></div><Layers3 className="text-[#4F6B7A]"/></div>
    <p className="mt-2 text-xs text-[#728186]">Starter values for block dimensions, joint and waste are examples. Prices, mix rates and paint coverage start at zero / unknown until provided by the engineer or supplier.</p>
    <div className="mt-5 grid gap-x-5 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">{controls.map(c=><label key={c.key} className="block"><span className="text-xs text-[#697c81]">{c.label}</span><div className="mt-2 flex overflow-hidden rounded-lg border border-[#dce4e2]"><input aria-label={c.label} type="number" min="0" step="any" className="w-full min-w-0 bg-white px-3 py-2.5 text-sm tabular-nums outline-none" value={settings[c.key]} onChange={e=>editSetting(c.key,e.target.value)}/><span className="bg-[#f0f3f2] px-3 py-3 text-[10px] text-[#718186]">{c.unit}</span></div>{c.help&&<p className="mt-1 text-[10px] text-[#9aa6a9]">{c.help}</p>}</label>)}</div>
   </section>
   <section className="estimate-print-section rounded-xl border border-[#dfe5e4] bg-white p-5">
    <p className="text-[10px] uppercase tracking-wider text-[#4F6B7A]">04 / PRICED LINES</p><h2 className="mt-1 text-xl font-medium">Quantity Takeoff → BOQ</h2>
    <div className="mt-4 overflow-auto"><table className="w-full min-w-[630px] text-left text-xs"><thead className="bg-[#f0f4f2]"><tr>{["Item","Quantity","Unit","Rate EGP","Amount EGP","Status"].map(h=><th key={h} className="px-3 py-3 font-medium">{h}</th>)}</tr></thead><tbody>{report.boq.map(line=><tr key={line.key} className="border-b border-[#eaf0ee]"><td className="px-3 py-3 font-medium">{line.description}</td><td className="px-3 py-3 tabular-nums">{quantity(line.quantity)}</td><td className="px-3 py-3">{line.unit}</td><td className="px-3 py-3 tabular-nums">{line.unitPriceEGP==null?"—":money(line.unitPriceEGP)}</td><td className="px-3 py-3 tabular-nums">{line.amountEGP==null?"—":money(line.amountEGP)}</td><td className="px-3 py-3 text-[#886c43]">{line.state.replaceAll("_"," ")}</td></tr>)}</tbody></table></div>
    <p className="mt-3 text-xs text-[#987041]"><AlertTriangle className="mr-2 inline" size={15}/>Model-derived estimates only. Material names, net openings, geometry, mortar mixes, paint coverage and pricing require review. The displayed cost can be partial.</p>
   </section>
   <section className="estimate-print-section rounded-xl border border-[#dfe5e4] bg-white p-5">
    <p className="text-[10px] uppercase tracking-wider text-[#4F6B7A]">05 / LEVEL BREAKDOWN</p><h2 className="mt-1 text-xl font-medium">Wall quantities by Revit level</h2>
    <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[650px] text-left text-xs"><thead className="bg-[#f0f4f2]"><tr>{["Level","Masonry m²","Plaster m²","Paint m²","Curtain host m²","Unmapped m²"].map(h=><th className="px-3 py-3" key={h}>{h}</th>)}</tr></thead><tbody>{report.levels.map(l=><tr key={l.level} className="border-b border-[#eaf0ee]"><td className="px-3 py-3 font-medium">{l.level||"Unspecified"}</td>{([l.masonryAreaM2,l.plasterAreaM2,l.paintAreaM2,l.glazingHostAreaM2,l.unmappedAreaM2]).map((n,i)=><td key={i} className="px-3 py-3 tabular-nums">{quantity(n)}</td>)}</tr>)}</tbody></table></div>
   </section>
   <section className="estimate-print-section rounded-xl border border-[#dfe5e4] bg-white p-5">
    <p className="text-[10px] uppercase tracking-wider text-[#4F6B7A]">06 / REVIEW BEFORE ISSUE</p><h2 className="mt-1 text-xl font-medium">Quality and engineering notes</h2>
    <div className="mt-3 space-y-2">{report.disclaimers.map((n,i)=><p key={i} className="text-xs leading-5 text-[#68787c]">{String(i+1).padStart(2,"0")} / {n}</p>)}</div>
    {quality?.quality?.issues?.length?<p className="mt-4 text-xs text-[#966b3d]">The QA workbook sheet includes {quality.quality.issues.length} available snapshot review flags, with element identifiers.</p>:null}
   </section>
   <footer className="estimate-no-print flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#dfe5e4] bg-white p-5">
    <div className="flex flex-wrap gap-2">
     <button type="button" onClick={exportXlsx} className="inline-flex items-center gap-2 rounded-lg bg-[#4F6B7A] px-4 py-3 text-xs font-medium text-white"><FileSpreadsheet size={16}/> Download Excel sheets</button>
     <button type="button" onClick={()=>window.print()} className="inline-flex items-center gap-2 rounded-lg border border-[#a8bbc2] px-4 py-3 text-xs text-[#315366]"><FileText size={16}/> Print / Save PDF</button>
     <button type="button" onClick={saveRecipe} className="inline-flex items-center gap-2 rounded-lg border border-[#d4dfdf] px-4 py-3 text-xs"><Download size={15}/> Save recipe JSON</button>
     <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#d4dfdf] px-4 py-3 text-xs"><Upload size={15}/> Load recipe JSON <input type="file" accept=".json" className="sr-only" onChange={e=>void loadRecipe(e)}/></label>
    </div>
    <button type="button" onClick={reset} className="text-xs text-[#8d6e5a]">Reset assumptions</button>
   </footer>
  </div>}
 </div>
 </main>;
}
