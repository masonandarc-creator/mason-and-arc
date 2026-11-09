import "server-only";
import { createHash } from "node:crypto";
import { withTransaction } from "@/lib/server/db";
export const REVIT_SCHEMA_VERSION="masonarc-revit-connector-2027-v1";
export async function ensureRevitTables(){
 await withTransaction(async client=>{
  await client.query("SELECT pg_advisory_xact_lock(20271109::bigint)");
  await client.query(`CREATE TABLE IF NOT EXISTS qs_revit_tokens (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
   token_hash TEXT NOT NULL UNIQUE,
   label TEXT NOT NULL,
   created_by TEXT NOT NULL REFERENCES users(id),
   expires_at TIMESTAMPTZ NOT NULL,
   revoked_at TIMESTAMPTZ,
   last_used_at TIMESTAMPTZ,
   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  await client.query(`CREATE TABLE IF NOT EXISTS qs_revit_snapshots(
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
   token_id UUID NOT NULL REFERENCES qs_revit_tokens(id) ON DELETE RESTRICT,
   model_key TEXT NOT NULL,
   model_title TEXT NOT NULL,
   element_count INTEGER NOT NULL CHECK(element_count BETWEEN 0 AND 10000),
   summary JSONB NOT NULL,
   payload JSONB NOT NULL,
   exported_at TIMESTAMPTZ NOT NULL,
   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  await client.query("CREATE INDEX IF NOT EXISTS qs_revit_snapshots_project_idx ON qs_revit_snapshots(project_id,created_at DESC)");
 });
}
export function tokenHash(token:string){return createHash("sha256").update(token,"utf8").digest("hex");}
export type RevitElement={uniqueId:string;category:string;name:string;level:string;volumeM3?:number|null;areaM2?:number|null;lengthM?:number|null;materials:{name:string;volumeM3?:number|null;areaM2?:number|null}[]};
export type RevitModel={schemaVersion:"mason-arc-revit-v1";source:"revit-2027";documentKey:string;title:string;exportedAtUtc:string;warnings:string[];elements:RevitElement[]};
function object(x:unknown):Record<string,unknown>{if(!x||typeof x!=="object"||Array.isArray(x))throw Error("VALIDATION:Expected object");return x as Record<string,unknown>}
function str(x:unknown,max:number,required=false):string{if(typeof x!=="string"||(required&&!x.trim())||x.length>max)throw Error("VALIDATION:Invalid model text");return x;}
function val(x:unknown):number|null{if(x===null||x===undefined)return null;if(typeof x!=="number"||!Number.isFinite(x)||x<0||x>1e12)throw Error("VALIDATION:Invalid model quantity");return Math.round(x*1e6)/1e6}
export function validateModel(x:unknown):RevitModel{
 const model=object(x);
 if(model.schemaVersion!=="mason-arc-revit-v1"||model.source!=="revit-2027")throw Error("VALIDATION:Unsupported Revit export");
 const documentKey=str(model.documentKey,240,true),title=str(model.title,240,true);
 const time=str(model.exportedAtUtc,60,true),ts=Date.parse(time);
 if(!Number.isFinite(ts)||ts>Date.now()+86400000)throw Error("VALIDATION:Invalid export timestamp");
 if(!Array.isArray(model.elements)||model.elements.length<1||model.elements.length>10000)throw Error("VALIDATION:Unexpected element count");
 if(!Array.isArray(model.warnings)||model.warnings.length>200)throw Error("VALIDATION:Too many warnings");
 const warnings=model.warnings.map(w=>str(w,250));
 const ids=new Set<string>();
 const elements=model.elements.map(raw=>{
  const e=object(raw),uniqueId=str(e.uniqueId,160,true);
  if(ids.has(uniqueId))throw Error("VALIDATION:Duplicate model element");
  ids.add(uniqueId);
  if(!Array.isArray(e.materials)||e.materials.length>40)throw Error("VALIDATION:Too many element materials");
  return {uniqueId,category:str(e.category,120,true),name:str(e.name,180),level:str(e.level,120),
    volumeM3:val(e.volumeM3),areaM2:val(e.areaM2),lengthM:val(e.lengthM),
    materials:e.materials.map(rawMat=>{const m=object(rawMat);return{name:str(m.name,180,true),volumeM3:val(m.volumeM3),areaM2:val(m.areaM2)}})
  };
 });
 return{schemaVersion:"mason-arc-revit-v1",source:"revit-2027",documentKey,title,exportedAtUtc:new Date(ts).toISOString(),warnings,elements};
}
export function summarizeModel(model:RevitModel){
 const categories=new Map<string,{category:string;count:number;volumeM3:number;areaM2:number;lengthM:number;missingVolume:number;missingArea:number}>();
 const materials=new Map<string,{name:string;count:number;volumeM3:number;areaM2:number}>();
 for(const element of model.elements){
  let c=categories.get(element.category);
  if(!c){c={category:element.category,count:0,volumeM3:0,areaM2:0,lengthM:0,missingVolume:0,missingArea:0};categories.set(element.category,c)}
  c.count++;c.volumeM3+=element.volumeM3??0;c.areaM2+=element.areaM2??0;c.lengthM+=element.lengthM??0;
  if(element.volumeM3==null)c.missingVolume++;if(element.areaM2==null)c.missingArea++;
  for(const item of element.materials){
   let m=materials.get(item.name);
   if(!m){m={name:item.name,count:0,volumeM3:0,areaM2:0};materials.set(item.name,m)}
   m.count++;m.volumeM3+=item.volumeM3??0;m.areaM2+=item.areaM2??0;
  }
 }
 const round=(n:number)=>Math.round(n*1e4)/1e4;
 return {elementCount:model.elements.length,categoryTotals:[...categories.values()].map(c=>({...c,volumeM3:round(c.volumeM3),areaM2:round(c.areaM2),lengthM:round(c.lengthM)})).sort((a,b)=>b.count-a.count),
 materialTotals:[...materials.values()].map(m=>({...m,volumeM3:round(m.volumeM3),areaM2:round(m.areaM2)})).sort((a,b)=>b.volumeM3-a.volumeM3),
 warningCount:model.warnings.length,notice:"Measured quantities are informational only. Missing geometry, overlapping material faces, construction recipes and reinforcement require engineering review. No BOQ line, quotation or approved baseline is changed."};
}
