"use client";
import { useCallback,useEffect,useMemo,useState } from "react";
import { Database,FileCheck2,HardHat,Package,RefreshCcw,ShieldCheck,AlertTriangle } from "lucide-react";
import { listResource } from "@/lib/client/dataApi";

type Project={id:string;code:string;name:string};
type Material={id:string;code:string;name_ar:string;category:string;unit:string;status:string;pack_size:string;default_waste:string;quote_id:string|null;unit_price_egp:string|null;supplier_name:string|null;quoted_at:string|null;source_reference:string|null};
type Activity={id:string;code:string;title_ar:string;category:string;unit:string;measure_rule:string;recipe_count:number;labor_rate_egp:string|null;equipment_rate_egp:string|null};
type Estimate={id:string;project_id:string;code:string;title:string;governorate:string;status:string;project_name:string};
type Quote={id:string;status:string;material_id:string;supplier_name:string;unit_price_egp:string;source_reference:string;code:string;name_ar:string;quoted_at:string};
type ActivityQuote={id:string;status:string;activity_id:string;component:string;contractor_name:string;unit_rate_egp:string;source_reference:string;code:string;title_ar:string};
type Recipe={id:string;activity_code:string;material_code:string;material_name:string;coefficient:string;status:string;technical_basis:string};
type BoqLine={id:string;code:string;title_ar:string;unit:string;zone:string;quantity:string;status:"PRICED"|"UNPRICED";missing:string[];unitRateEgp:string|null;totalEgp:string|null};
type Boq={lines:BoqLine[];summary:{status:string;pricedLines:number;unpricedLines:number;pricedSubtotalEgp:string;totalEgp:string|null};estimate:{title:string;code:string;governorate:string;status:string}};
type Tab="overview"|"materials"|"rates"|"recipes"|"boq";
const tabs:{key:Tab;name:string;sub:string}[]=[
 {key:"overview",name:"Overview",sub:"Command center"},
 {key:"materials",name:"Materials",sub:"Verified pricing"},
 {key:"rates",name:"Labor & Equipment",sub:"Local contractor quotations"},
 {key:"recipes",name:"Engineering Recipes",sub:"Technical sign-off"},
 {key:"boq",name:"Quantity & BOQ",sub:"Project estimates"}
];
const fmt=(v:string|number|null|undefined)=>v==null?"—":new Intl.NumberFormat("en-EG",{maximumFractionDigits:2}).format(Number(v));
const input="w-full min-w-0 rounded-md border border-[#d5d9da] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#4F6B7A]";
const muted="text-xs text-[#667178]";
const pill=(ok:boolean)=>ok?"bg-[#e3ecea] text-[#315f50]":"bg-[#f2ece5] text-[#9a6b37]";
async function api<T>(path:string,method="GET",body?:unknown):Promise<T>{
 const response=await fetch("/api/cost-control/"+path,{method,cache:"no-store",credentials:"include",headers:{"Content-Type":"application/json"},body:body?JSON.stringify(body):undefined});
 const data=await response.json().catch(()=>({}));
 if(!response.ok)throw new Error(data.error||"Request failed");
 return data as T;
}
export default function QuantityCostPage(){
 const [tab,setTab]=useState<Tab>("overview"),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(""),[message,setMessage]=useState("");
 const [governorate,setGovernorate]=useState("Giza"),[projects,setProjects]=useState<Project[]>([]),[materials,setMaterials]=useState<Material[]>([]),[activities,setActivities]=useState<Activity[]>([]);
 const [estimates,setEstimates]=useState<Estimate[]>([]),[quotes,setQuotes]=useState<Quote[]>([]),[activityQuotes,setActivityQuotes]=useState<ActivityQuote[]>([]),[recipes,setRecipes]=useState<Recipe[]>([]);
 const [selectedEstimate,setSelectedEstimate]=useState(""),[boq,setBoq]=useState<Boq|null>(null);
 const [estimateForm,setEstimateForm]=useState({project_id:"",title:"",governorate:"Giza",overhead_percent:"0",contingency_percent:"0",profit_percent:"0",tax_percent:"0"});
 const [takeoffForm,setTakeoffForm]=useState({activity_id:"",zone:"",element_reference:"",drawing_revision:"",item_count:"1",length_m:"0",width_m:"0",height_m:"0",deduction:"0"});
 const [materialQuote,setMaterialQuote]=useState({material_id:"",supplier_name:"",governorate:"Giza",unit_price_egp:"",delivery_egp_per_unit:"0",quoted_at:new Date().toISOString().slice(0,10),valid_until:"",source_reference:""});
 const [rateQuote,setRateQuote]=useState({activity_id:"",component:"Labor",contractor_name:"",governorate:"Giza",unit_rate_egp:"",quoted_at:new Date().toISOString().slice(0,10),valid_until:"",source_reference:""});
 const load=useCallback(async()=>{
  setError("");setLoading(true);
  try{
   const [p,m,a,e,q,r,rec]=await Promise.all([
    listResource<Project>("projects",undefined,500),
    api<{data:Material[]}>(`materials?governorate=${encodeURIComponent(governorate)}`),
    api<{data:Activity[]}>(`activities?governorate=${encodeURIComponent(governorate)}`),
    api<{data:Estimate[]}>("estimates"),api<{data:Quote[]}>("quotes"),
    api<{data:ActivityQuote[]}>("activity-rates"),api<{data:Recipe[]}>("recipes")
   ]);
   setProjects(p.data);setMaterials(m.data);setActivities(a.data);setEstimates(e.data);setQuotes(q.data);setActivityQuotes(r.data);setRecipes(rec.data);
   setEstimateForm(s=>({...s,project_id:s.project_id||p.data[0]?.id||""}));
   setTakeoffForm(s=>({...s,activity_id:s.activity_id||a.data[0]?.id||""}));
   setMaterialQuote(s=>({...s,material_id:s.material_id||m.data[0]?.id||""}));
   setRateQuote(s=>({...s,activity_id:s.activity_id||a.data[0]?.id||""}));
   setSelectedEstimate(s=>s||e.data[0]?.id||"");
  }catch(e){setError(e instanceof Error?e.message:"Failed to load cost module");}
  finally{setLoading(false)}
 },[governorate]);
 useEffect(()=>{void load()},[load]);
 const getBoq=useCallback(async(id:string)=>{if(!id){setBoq(null);return;}try{const data=await api<Boq>(`boq?estimateId=${encodeURIComponent(id)}`);setBoq(data)}catch(e){setError(e instanceof Error?e.message:"Could not load BOQ")}},[]);
 useEffect(()=>{void getBoq(selectedEstimate)},[selectedEstimate,getBoq]);
 async function save<T>(work:()=>Promise<T>,success:string){setBusy(true);setError("");setMessage("");try{await work();setMessage(success);await load();if(selectedEstimate)await getBoq(selectedEstimate)}catch(e){setError(e instanceof Error?e.message:"Save failed")}finally{setBusy(false)}}
 const approvedCount=materials.filter(m=>m.quote_id).length,pending=quotes.filter(q=>q.status==="Pending").length+activityQuotes.filter(q=>q.status==="Pending").length;
 const unapprovedRecipes=recipes.filter(r=>r.status!=="Approved").length;
 const selectedActivity=activities.find(a=>a.id===takeoffForm.activity_id);
 const card="rounded-xl border border-[#dfe3e2] bg-white p-5";
 const field=(label:string,el:React.ReactNode)=> <label className="block min-w-0"><span className="mb-1.5 block text-xs font-medium text-[#53616a]">{label}</span>{el}</label>;
 return <main className="min-h-screen bg-[#f7f8f6] px-4 py-8 text-[#1b272d] sm:px-7 lg:px-10">
 <div className="mx-auto max-w-[1480px]">
  <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[#cdd5d7] pb-7">
   <div><p className="text-[10px] font-medium uppercase tracking-[.28em] text-[#4F6B7A]">Mason & Arc / Enterprise Studio OS</p>
   <h1 className="mt-2 text-3xl font-medium tracking-tight sm:text-4xl">Quantity & Cost Control</h1>
   <p className="mt-2 max-w-2xl text-sm text-[#627078]">Egyptian market source-controlled rates · measured quantities · audited BOQ. No unverified rate is priced as real market data.</p></div>
   <div className="flex items-end gap-2">{field("Price region",<select aria-label="Price region" className={input} value={governorate} onChange={e=>setGovernorate(e.target.value)}>{["Giza","Cairo","Alexandria","Qalyubia","New Valley","Other"].map(g=><option key={g}>{g}</option>)}</select>)}
   <button type="button" onClick={()=>void load()} className="rounded-md border border-[#cad2d6] bg-white p-3" aria-label="Refresh"><RefreshCcw size={16}/></button></div>
  </header>
  {error&&<p role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
  {message&&<p role="status" className="mt-5 rounded-lg border border-[#b9d0c7] bg-[#edf5f0] p-4 text-sm text-[#315f50]">{message}</p>}
  <section className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
   <Stat icon={Database} label="Materials in library" value={materials.length} detail="Imported reference master" />
   <Stat icon={ShieldCheck} label="Approved local prices" value={approvedCount} detail={`${materials.length-approvedCount} without approved current quotes`} />
   <Stat icon={HardHat} label="Engineering recipes" value={recipes.length} detail={`${unapprovedRecipes} require sign-off`}/>
   <Stat icon={FileCheck2} label="Pending price reviews" value={pending} detail="Approval required by Owner"/>
  </section>
  <nav className="mt-7 flex gap-2 overflow-x-auto border-b border-[#d3dbdc] pb-3" aria-label="Cost control sections">
   {tabs.map(t=><button key={t.key} type="button" onClick={()=>setTab(t.key)} className={`shrink-0 rounded-md px-4 py-2.5 text-xs font-medium transition ${tab===t.key?"bg-[#4F6B7A] text-white":"bg-white text-[#4e5d65] hover:bg-[#e9eef0]"}`}>{t.name}</button>)}
  </nav>
  {loading?<p className="py-16 text-center text-sm text-[#74808a]">Loading data from the shared database…</p>:
  <div className="mt-6">
   {tab==="overview"&&<section className="grid gap-5 lg:grid-cols-2">
    <div className={card}><SectionTitle title="Estimate readiness" caption="Unverified and missing inputs are intentionally excluded."/>
     <div className="mt-6 space-y-4"><Readiness name="Source-approved material quotes" current={approvedCount} total={materials.length}/>
     <Readiness name="Reviewed consumption recipes" current={recipes.length-unapprovedRecipes} total={recipes.length}/>
     <Readiness name="Projects with cost estimates" current={new Set(estimates.map(e=>e.project_id)).size} total={projects.length}/></div>
     <div className="mt-6 flex items-start gap-2 rounded-md bg-[#f4f0e9] p-4 text-sm text-[#7a613e]"><AlertTriangle className="mt-0.5 shrink-0" size={17}/>Imported workbook recipes are draft assumptions. Structural concrete mixes and reinforcement quantities need design-approved evidence.</div>
    </div>
    <div className={card}><SectionTitle title="Workspace flow" caption="A controlled professional QS workflow."/>
    <div className="mt-6 grid gap-3 sm:grid-cols-2">{[["01","Create estimate","Select a project and region"],["02","Measure quantities","Add dimensions and drawing revisions"],["03","Approve source rates","Material, labor and equipment"],["04","Review BOQ","Unpriced lines flagged explicitly"]].map(x=><div key={x[0]} className="rounded-lg bg-[#f7f8f6] p-4"><span className="text-xs text-[#4F6B7A]">{x[0]}</span><p className="mt-2 font-medium">{x[1]}</p><p className={muted}>{x[2]}</p></div>)}</div></div>
   </section>}
   {tab==="materials"&&<div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
    <section className={card}><SectionTitle title="Material master" caption={`${materials.length} materials · rates shown only when approved and in date for ${governorate}`}/>
    <div className="mt-5 max-h-[680px] overflow-auto"><table className="w-full min-w-[680px] text-left text-xs"><thead className="sticky top-0 bg-[#f1f4f3] text-[#5a6b73]"><tr><Th>Code</Th><Th>Material</Th><Th>Unit</Th><Th>Source</Th><Th align="right">EGP / unit</Th></tr></thead><tbody>{materials.map(m=><tr key={m.id} className="border-b border-[#e9ebec]"><Td>{m.code}</Td><Td><span dir="rtl" className="block text-right">{m.name_ar}</span><small className="text-[#8a9397]">{m.category}</small></Td><Td>{m.unit}</Td><Td>{m.quote_id?<><span className="text-[#326a56]">{m.supplier_name}</span><p className={muted}>{m.quoted_at?.slice(0,10)}</p></>:<span className="text-[#a16c35]">Not verified</span>}</Td><Td align="right">{fmt(m.unit_price_egp)}</Td></tr>)}</tbody></table></div></section>
    <aside className="space-y-5"><form className={card} onSubmit={e=>{e.preventDefault();void save(()=>api("quotes","POST",{...materialQuote,valid_until:materialQuote.valid_until||null}),"Supplier quotation submitted for Owner review.");}}>
    <SectionTitle title="Submit supplier quotation" caption="A quotation is not an approved market rate."/>
    <div className="mt-4 space-y-3">{field("Material",<select className={input} value={materialQuote.material_id} onChange={e=>setMaterialQuote({...materialQuote,material_id:e.target.value})}>{materials.map(m=><option key={m.id} value={m.id}>{m.code} · {m.name_ar}</option>)}</select>)}
    {field("Supplier / company",<input required className={input} value={materialQuote.supplier_name} onChange={e=>setMaterialQuote({...materialQuote,supplier_name:e.target.value})}/>)}
    {field("Governorate",<input required className={input} value={materialQuote.governorate} onChange={e=>setMaterialQuote({...materialQuote,governorate:e.target.value})}/>)}
    <div className="grid grid-cols-2 gap-3">{field("EGP / unit",<input required min="0.01" step="any" type="number" className={input} value={materialQuote.unit_price_egp} onChange={e=>setMaterialQuote({...materialQuote,unit_price_egp:e.target.value})}/>)}{field("Delivery / unit",<input min="0" step="any" type="number" className={input} value={materialQuote.delivery_egp_per_unit} onChange={e=>setMaterialQuote({...materialQuote,delivery_egp_per_unit:e.target.value})}/>)}</div>
    <div className="grid grid-cols-2 gap-3">{field("Quote date",<input type="date" required className={input} value={materialQuote.quoted_at} onChange={e=>setMaterialQuote({...materialQuote,quoted_at:e.target.value})}/>)}{field("Valid to",<input type="date" className={input} value={materialQuote.valid_until} onChange={e=>setMaterialQuote({...materialQuote,valid_until:e.target.value})}/>)}</div>
    {field("Quote reference / source",<input required className={input} placeholder="Supplier quote no. / document ref" value={materialQuote.source_reference} onChange={e=>setMaterialQuote({...materialQuote,source_reference:e.target.value})}/>)}
    <Action busy={busy} label="Submit for approval"/></div></form>
    <div className={card}><SectionTitle title="Pending quotations" caption="Only the Owner can approve or reject."/><div className="mt-4 max-h-[370px] space-y-3 overflow-auto">{quotes.filter(q=>q.status==="Pending").map(q=><div key={q.id} className="border-b border-[#e9edec] pb-3 text-xs"><div className="font-medium">{q.code} · {fmt(q.unit_price_egp)} EGP</div><p className={muted}>{q.supplier_name} · {q.source_reference}</p><div className="mt-2 flex gap-2"><button disabled={busy} onClick={()=>void save(()=>api("quotes","PATCH",{id:q.id,status:"Approved"}),"Quote approved.")} className="rounded bg-[#4F6B7A] px-3 py-1.5 text-white">Approve</button><button disabled={busy} onClick={()=>void save(()=>api("quotes","PATCH",{id:q.id,status:"Rejected"}),"Quote rejected.")} className="rounded border px-3 py-1.5">Reject</button></div></div>)}{!quotes.some(q=>q.status==="Pending")&&<p className={muted}>Nothing pending.</p>}</div></div></aside>
   </div>}
   {tab==="rates"&&<div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
    <section className={card}><SectionTitle title="Labor & equipment market rates" caption={`Per BOQ unit · local to ${governorate} · never substitute missing wages with zero`}/>
     <div className="mt-4 overflow-auto"><table className="w-full min-w-[600px] text-left text-xs"><thead className="bg-[#f1f4f3]"><tr><Th>Activity</Th><Th>Unit</Th><Th align="right">Labor EGP</Th><Th align="right">Equipment EGP</Th></tr></thead><tbody>{activities.map(a=><tr key={a.id} className="border-b border-[#e8eceb]"><Td>{a.code} · <span dir="rtl">{a.title_ar}</span></Td><Td>{a.unit}</Td><Td align="right">{fmt(a.labor_rate_egp)}</Td><Td align="right">{fmt(a.equipment_rate_egp)}</Td></tr>)}</tbody></table></div></section>
    <aside className="space-y-5"><form className={card} onSubmit={e=>{e.preventDefault();void save(()=>api("activity-rates","POST",{...rateQuote,valid_until:rateQuote.valid_until||null}),"Activity quotation submitted for review.")}}>
    <SectionTitle title="Contractor quotation" caption="Independent labor / equipment quote per activity."/><div className="mt-4 space-y-3">
     {field("Activity",<select className={input} value={rateQuote.activity_id} onChange={e=>setRateQuote({...rateQuote,activity_id:e.target.value})}>{activities.map(a=><option key={a.id} value={a.id}>{a.code} · {a.title_ar}</option>)}</select>)}
     {field("Cost component",<select className={input} value={rateQuote.component} onChange={e=>setRateQuote({...rateQuote,component:e.target.value})}><option>Labor</option><option>Equipment</option></select>)}
     {field("Contractor / supplier",<input required className={input} value={rateQuote.contractor_name} onChange={e=>setRateQuote({...rateQuote,contractor_name:e.target.value})}/>)}
     {field("Governorate",<input required className={input} value={rateQuote.governorate} onChange={e=>setRateQuote({...rateQuote,governorate:e.target.value})}/>)}
     {field("EGP / activity unit",<input type="number" required min="0" step="any" className={input} value={rateQuote.unit_rate_egp} onChange={e=>setRateQuote({...rateQuote,unit_rate_egp:e.target.value})}/>)}
     <div className="grid grid-cols-2 gap-2">{field("Quoted at",<input type="date" required className={input} value={rateQuote.quoted_at} onChange={e=>setRateQuote({...rateQuote,quoted_at:e.target.value})}/>)}{field("Valid until",<input type="date" className={input} value={rateQuote.valid_until} onChange={e=>setRateQuote({...rateQuote,valid_until:e.target.value})}/>)}</div>
     {field("Source reference",<input required className={input} value={rateQuote.source_reference} onChange={e=>setRateQuote({...rateQuote,source_reference:e.target.value})}/>)}
     <Action busy={busy} label="Submit quotation"/></div></form>
     <div className={card}><SectionTitle title="Pending contractor rates" caption="Owner review required."/><div className="mt-4 max-h-[350px] space-y-3 overflow-auto">{activityQuotes.filter(q=>q.status==="Pending").map(q=><div key={q.id} className="border-b pb-3 text-xs"><p className="font-medium">{q.code} · {q.component} · {fmt(q.unit_rate_egp)} EGP</p><p className={muted}>{q.contractor_name} · {q.source_reference}</p><div className="mt-2 flex gap-2"><button disabled={busy} className="rounded bg-[#4F6B7A] px-3 py-1.5 text-white" onClick={()=>void save(()=>api("activity-rates","PATCH",{id:q.id,status:"Approved"}),"Rate approved.")}>Approve</button><button disabled={busy} className="rounded border px-3 py-1.5" onClick={()=>void save(()=>api("activity-rates","PATCH",{id:q.id,status:"Rejected"}),"Rate rejected.")}>Reject</button></div></div>)}{!activityQuotes.some(q=>q.status==="Pending")&&<p className={muted}>Nothing pending.</p>}</div></div>
    </aside>
   </div>}
   {tab==="recipes"&&<section className={card}><SectionTitle title="Consumption recipes" caption="100 baseline assumptions from the workbook; approval must follow engineering review and approved specifications."/>
    <div className="mt-5 max-h-[750px] overflow-auto"><table className="w-full min-w-[760px] text-left text-xs"><thead className="sticky top-0 bg-[#f1f4f3]"><tr><Th>Activity</Th><Th>Material</Th><Th align="right">Coefficient</Th><Th>Technical basis</Th><Th>Sign-off</Th></tr></thead><tbody>{recipes.map(r=><tr key={r.id} className="border-b border-[#ebeeee]"><Td>{r.activity_code}</Td><Td>{r.material_code} · <span dir="rtl">{r.material_name}</span></Td><Td align="right">{fmt(r.coefficient)}</Td><Td>{r.technical_basis}</Td><Td><span className={`inline-block rounded px-2 py-1 ${pill(r.status==="Approved")}`}>{r.status}</span>{r.status==="Draft"&&<button type="button" disabled={busy} onClick={()=>void save(()=>api("recipes","PATCH",{id:r.id,status:"Approved"}),"Technical assumption approved. Verify engineering basis before operational use.")} className="ml-2 rounded border border-[#d3d9dc] px-2 py-1">Approve</button>}</Td></tr>)}</tbody></table></div></section>}
   {tab==="boq"&&<div className="space-y-5">
    <form className={card} onSubmit={e=>{e.preventDefault();void save(()=>api("estimates","POST",estimateForm),"Estimate created.")}}>
     <SectionTitle title="New project estimate" caption="Use a new controlled estimate per project, region and revision."/>
     <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">{field("Project",<select required className={input} value={estimateForm.project_id} onChange={e=>setEstimateForm({...estimateForm,project_id:e.target.value})}>{projects.map(p=><option key={p.id} value={p.id}>{p.code} · {p.name}</option>)}</select>)}
     {field("Title",<input className={input} required placeholder="Villa A — Tender Estimate" value={estimateForm.title} onChange={e=>setEstimateForm({...estimateForm,title:e.target.value})}/>)}
     {field("Governorate",<input className={input} required value={estimateForm.governorate} onChange={e=>setEstimateForm({...estimateForm,governorate:e.target.value})}/>)}
     <div className="flex items-end"><Action busy={busy||!projects.length} label="Create estimate"/></div>
     </div>
     <div className="mt-3 grid gap-3 md:grid-cols-4">{(["overhead_percent","contingency_percent","profit_percent","tax_percent"] as const).map(k=>field(k.replace("_percent"," %").replace("_"," "),<input key={k} type="number" min="0" max="100" step="any" className={input} value={estimateForm[k]} onChange={e=>setEstimateForm({...estimateForm,[k]:e.target.value})}/>))}</div>
    </form>
    <section className={card}><div className="flex flex-wrap items-end justify-between gap-3"><SectionTitle title="Measured BOQ" caption="Rates are computed only from reviewed recipes and in-date local quotes."/>
     {field("Estimate",<select className={input} value={selectedEstimate} onChange={e=>setSelectedEstimate(e.target.value)}><option value="">Choose estimate</option>{estimates.map(e=><option key={e.id} value={e.id}>{e.code} · {e.project_name} · {e.title}</option>)}</select>)}</div>
     {boq&&<><div className="mt-5 grid gap-3 sm:grid-cols-3"><Mini label="Priced lines" value={boq.summary.pricedLines}/><Mini label="Unpriced lines" value={boq.summary.unpricedLines}/><Mini label="Total estimate / EGP" value={boq.summary.totalEgp==null?"NOT READY":fmt(boq.summary.totalEgp)}/></div>
     <div className="mt-4 overflow-auto"><table className="w-full min-w-[760px] text-left text-xs"><thead className="bg-[#f1f4f3]"><tr><Th>Activity</Th><Th>Zone</Th><Th align="right">Qty</Th><Th>Unit</Th><Th align="right">Rate (EGP)</Th><Th align="right">Amount (EGP)</Th><Th>Pricing status</Th></tr></thead><tbody>{boq.lines.map(x=><tr key={x.id} className="border-b border-[#e7eaeb]"><Td>{x.code}<p dir="rtl" className="max-w-[240px] text-right text-[#76828a]">{x.title_ar}</p></Td><Td>{x.zone||"—"}</Td><Td align="right">{fmt(x.quantity)}</Td><Td>{x.unit}</Td><Td align="right">{fmt(x.unitRateEgp)}</Td><Td align="right">{fmt(x.totalEgp)}</Td><Td><span className={`rounded px-2 py-1 ${pill(x.status==="PRICED")}`}>{x.status}</span>{x.missing.length>0&&<p className="mt-1 max-w-[260px] text-[10px] text-[#a27642]">{x.missing.join(" · ")}</p>}</Td></tr>)}</tbody></table>{!boq.lines.length&&<p className="p-10 text-center text-sm text-[#7b858b]">No takeoff lines yet.</p>}</div></>}
    </section>
    <form className={card} onSubmit={e=>{e.preventDefault();void save(()=>api("takeoff","POST",{...takeoffForm,estimate_id:selectedEstimate}),"Measured element added to estimate.")}}>
    <SectionTitle title="Add measured element" caption={selectedActivity?`Measurement rule: ${selectedActivity.measure_rule} · Unit: ${selectedActivity.unit}`:"Select an activity"}/>
    <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">{field("Activity",<select className={input} value={takeoffForm.activity_id} onChange={e=>setTakeoffForm({...takeoffForm,activity_id:e.target.value})}>{activities.map(a=><option key={a.id} value={a.id}>{a.code} · {a.title_ar}</option>)}</select>)}
    {field("Zone / level",<input className={input} placeholder="Ground Floor" value={takeoffForm.zone} onChange={e=>setTakeoffForm({...takeoffForm,zone:e.target.value})}/>)}
    {field("Drawing element",<input className={input} placeholder="S-101 / Beam B04" value={takeoffForm.element_reference} onChange={e=>setTakeoffForm({...takeoffForm,element_reference:e.target.value})}/>)}
    {field("Drawing revision",<input className={input} placeholder="R02" value={takeoffForm.drawing_revision} onChange={e=>setTakeoffForm({...takeoffForm,drawing_revision:e.target.value})}/>)}
    {(["item_count","length_m","width_m","height_m","deduction"] as const).map(k=>field(k.replaceAll("_"," "),<input key={k} type="number" min="0" step="any" className={input} value={takeoffForm[k]} onChange={e=>setTakeoffForm({...takeoffForm,[k]:e.target.value})}/>))}
    <div className="flex items-end"><Action busy={busy||!selectedEstimate||!activities.length} label="Add to takeoff"/></div></div></form>
   </div>}
  </div>}
  <footer className="mt-10 flex flex-wrap justify-between gap-2 border-t border-[#dbe1e2] py-5 text-[10px] uppercase tracking-widest text-[#8b969a]"><span>MASON & ARC · QUANTITY & COST CONTROL</span><span>Draft data ≠ certified market price · Engineer approval required</span></footer>
 </div></main>
}
function Stat({icon:Icon,label,value,detail}:{icon:typeof Package;label:string;value:number;detail:string}){return <div className="rounded-xl border border-[#dfe3e2] bg-white p-5"><Icon size={18} className="text-[#4F6B7A]"/><p className="mt-4 text-3xl font-medium">{value}</p><p className="mt-1 text-sm font-medium">{label}</p><p className="mt-1 text-xs text-[#8a9295]">{detail}</p></div>}
function SectionTitle({title,caption}:{title:string;caption:string}){return <div><h2 className="text-lg font-medium">{title}</h2><p className="mt-1 text-xs text-[#7a858a]">{caption}</p></div>}
function Readiness({name,current,total}:{name:string;current:number;total:number}){const percent=total?Math.round(current/total*100):0;return <div><div className="mb-2 flex justify-between gap-2 text-xs"><span>{name}</span><span className="text-[#71818a]">{current} / {total}</span></div><div className="h-1.5 rounded-full bg-[#e2e9e8]"><div className="h-full rounded-full bg-[#4F6B7A]" style={{width:`${percent}%`}}/></div></div>}
function Mini({label,value}:{label:string;value:string|number}){return <div className="rounded-lg bg-[#f5f7f6] p-4"><p className="text-xs text-[#71818a]">{label}</p><p className="mt-2 text-xl font-medium">{value}</p></div>}
function Th({children,align="left"}:{children:React.ReactNode;align?:"left"|"right"}){return <th className={`p-3 font-medium ${align==="right"?"text-right":"text-left"}`}>{children}</th>}
function Td({children,align="left"}:{children:React.ReactNode;align?:"left"|"right"}){return <td className={`p-3 align-top ${align==="right"?"text-right":"text-left"}`}>{children}</td>}
function Action({busy,label}:{busy:boolean;label:string}){return <button type="submit" disabled={busy} className="w-full rounded-md bg-[#4F6B7A] px-4 py-3 text-xs font-medium text-white disabled:opacity-40">{busy?"Saving…":label}</button>}
