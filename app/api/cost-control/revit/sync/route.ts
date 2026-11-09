import { NextResponse } from "next/server";
import { query } from "@/lib/server/db";
import { tokenHash,validateModel,summarizeModel } from "@/lib/server/revitConnector";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function POST(request:Request){
 try{
  const value=request.headers.get("authorization")??"";
  if(!/^Bearer ma_rvt_[A-Za-z0-9_-]{43}$/.test(value))return NextResponse.json({error:"Invalid connector credential"},{status:401});
  const token=value.slice(7);
  const {rows}=await query(`SELECT t.id,t.project_id,t.created_by FROM qs_revit_tokens t
    JOIN users u ON u.id=t.created_by AND u.active=true
    WHERE t.token_hash=$1 AND t.revoked_at IS NULL AND t.expires_at>NOW() LIMIT 1`,[tokenHash(token)]);
  if(!rows.length)return NextResponse.json({error:"Token expired or revoked"},{status:401});
  const max=3_000_000;const length=Number(request.headers.get("content-length")??0);
  if(length>max)return NextResponse.json({error:"Model export larger than 3 MB"},{status:413});
  const body=await request.text();if(Buffer.byteLength(body,"utf8")>max)return NextResponse.json({error:"Model export larger than 3 MB"},{status:413});
  const model=validateModel(JSON.parse(body) as unknown),summary=summarizeModel(model);
  const {rows:created}=await query(`INSERT INTO qs_revit_snapshots(project_id,token_id,model_key,model_title,element_count,summary,payload,exported_at)
    VALUES($1,$2,$3,$4,$5,$6::jsonb,$7::jsonb,$8) RETURNING id,created_at`,[
    rows[0].project_id,rows[0].id,model.documentKey,model.title,model.elements.length,JSON.stringify(summary),JSON.stringify(model),model.exportedAtUtc]);
  await query("UPDATE qs_revit_tokens SET last_used_at=NOW() WHERE id=$1",[rows[0].id]);
  return NextResponse.json({data:{...created[0],projectId:rows[0].project_id,elementCount:model.elements.length,summary}},{status:201,headers:{"Cache-Control":"no-store"}});
 }catch(e){
   if(e instanceof SyntaxError||e instanceof Error&&e.message.startsWith("VALIDATION:"))
    return NextResponse.json({error:e instanceof SyntaxError?"Invalid JSON":e.message.slice(11)},{status:400});
   console.error("Revit sync failure",e instanceof Error?e.message:"unknown");
   return NextResponse.json({error:"Could not save model sync"},{status:500});
 }
}
