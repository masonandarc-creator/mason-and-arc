import "server-only";
import { createHash } from "node:crypto";
import { withTransaction } from "@/lib/server/db";
import { summarizeRevitModel } from "@/lib/quantity/revitQuality.mjs";
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
  await client.query("ALTER TABLE qs_revit_snapshots ALTER COLUMN token_id DROP NOT NULL");
  await client.query("ALTER TABLE qs_revit_snapshots ADD COLUMN IF NOT EXISTS imported_by TEXT REFERENCES users(id)");
  await client.query("ALTER TABLE qs_revit_snapshots ADD COLUMN IF NOT EXISTS source_type TEXT NOT NULL DEFAULT 'sync'");
  await client.query("CREATE INDEX IF NOT EXISTS qs_revit_snapshots_project_idx ON qs_revit_snapshots(project_id,created_at DESC)");
 });
}
export function tokenHash(token:string){return createHash("sha256").update(token,"utf8").digest("hex");}
export type RevitElement={uniqueId:string;elementId?:number|null;category:string;categoryCode?:string;name:string;level:string;volumeM3?:number|null;areaM2?:number|null;lengthM?:number|null;materials:{name:string;volumeM3?:number|null;areaM2?:number|null}[]};
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
  return {uniqueId,elementId:e.elementId==null?null:(typeof e.elementId==="number"&&Number.isSafeInteger(e.elementId)&&e.elementId>0?e.elementId:(()=>{throw Error("VALIDATION:Invalid Revit element ID")})()),category:str(e.category,120,true),categoryCode:e.categoryCode==null?"":str(e.categoryCode,120),name:str(e.name,180),level:str(e.level,120),
    volumeM3:val(e.volumeM3),areaM2:val(e.areaM2),lengthM:val(e.lengthM),
    materials:e.materials.map(rawMat=>{const m=object(rawMat);return{name:str(m.name,180,true),volumeM3:val(m.volumeM3),areaM2:val(m.areaM2)}})
  };
 });
 return{schemaVersion:"mason-arc-revit-v1",source:"revit-2027",documentKey,title,exportedAtUtc:new Date(ts).toISOString(),warnings,elements};
}
export function summarizeModel(model:RevitModel){return summarizeRevitModel(model)}
