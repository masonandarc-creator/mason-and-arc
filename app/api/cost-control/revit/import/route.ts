import { NextResponse } from "next/server";
import { requireServerUser,audit } from "@/lib/server/auth";
import { query } from "@/lib/server/db";
import { ensureQsReady } from "@/lib/server/qsBootstrap";
import { ensureRevitTables,validateModel,summarizeModel } from "@/lib/server/revitConnector";
import { requiredText,handleQsError } from "@/lib/server/qsValidation";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function POST(request:Request){
 try{
  const user=await requireServerUser(["Owner","Manager","Engineer"]);
  await ensureQsReady();await ensureRevitTables();
  const size=Number(request.headers.get("content-length")??0);
  if(size>3_000_000)return NextResponse.json({error:"Export exceeds 3 MB"},{status:413});
  const raw=await request.text();
  if(Buffer.byteLength(raw,"utf8")>3_000_000)return NextResponse.json({error:"Export exceeds 3 MB"},{status:413});
  const b=JSON.parse(raw) as Record<string,unknown>;
  const projectId=requiredText(b.project_id,"Project",100);
  const check=await query("SELECT id FROM projects WHERE id=$1",[projectId]);
  if(!check.rows.length)return NextResponse.json({error:"Project not found"},{status:404});
  const model=validateModel(b.model),summary=summarizeModel(model);
  const {rows}=await query(`INSERT INTO qs_revit_snapshots(project_id,token_id,imported_by,source_type,model_key,model_title,element_count,summary,payload,exported_at)
   VALUES($1,NULL,$2,'manual',$3,$4,$5,$6::jsonb,$7::jsonb,$8) RETURNING id,created_at`,
   [projectId,user.id,model.documentKey,model.title,model.elements.length,JSON.stringify(summary),JSON.stringify(model),model.exportedAtUtc]);
  await audit("qs.revit.imported","QsRevitSnapshot",rows[0].id,{projectId,modelTitle:model.title,elementCount:model.elements.length,actor:user.id});
  return NextResponse.json({data:{...rows[0],elementCount:model.elements.length,quality:summary.quality}},{status:201,headers:{"Cache-Control":"no-store"}});
 }catch(e){
  if(e instanceof SyntaxError||(e instanceof Error&&e.message.startsWith("VALIDATION:"))){
   return NextResponse.json({error:e instanceof SyntaxError?"Invalid JSON file":e.message.slice(11)},{status:400});
  }
  return handleQsError(e);
 }
}
