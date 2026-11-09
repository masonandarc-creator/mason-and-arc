import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { requireServerUser,audit } from "@/lib/server/auth";
import { ensureQsReady } from "@/lib/server/qsBootstrap";
import { ensureRevitTables,tokenHash } from "@/lib/server/revitConnector";
import { query } from "@/lib/server/db";
import { handleQsError,requiredText } from "@/lib/server/qsValidation";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(){
 try{await requireServerUser(["Owner","Manager","Engineer"]);await ensureQsReady();await ensureRevitTables();
  const {rows}=await query(`SELECT t.id,t.project_id,p.name AS project_name,t.label,t.expires_at,t.revoked_at,t.last_used_at,t.created_at
  FROM qs_revit_tokens t JOIN projects p ON p.id=t.project_id ORDER BY t.created_at DESC LIMIT 100`);
  return NextResponse.json({data:rows},{headers:{"Cache-Control":"no-store"}});
 }catch(e){return handleQsError(e);}
}
export async function POST(request:Request){
 try{const user=await requireServerUser(["Owner","Manager"]);await ensureQsReady();await ensureRevitTables();
  const b=await request.json() as Record<string,unknown>;
  const projectId=requiredText(b.project_id,"Project",100),label=requiredText(b.label,"Device label",80);
  const token="ma_rvt_"+randomBytes(32).toString("base64url");
  const {rows}=await query(`INSERT INTO qs_revit_tokens(project_id,label,token_hash,created_by,expires_at)
    VALUES($1,$2,$3,$4,NOW()+INTERVAL '90 days') RETURNING id,project_id,expires_at`,[projectId,label,tokenHash(token),user.id]);
  await audit("qs.revit.token.created","QsRevitToken",rows[0].id,{projectId,actor:user.id});
  return NextResponse.json({data:{...rows[0],token}},{status:201,headers:{"Cache-Control":"no-store"}});
 }catch(e){return handleQsError(e);}
}
export async function DELETE(request:Request){
 try{const user=await requireServerUser(["Owner","Manager"]);await ensureQsReady();await ensureRevitTables();
  const id=requiredText(new URL(request.url).searchParams.get("id"),"Token",80);
  const {rows}=await query("UPDATE qs_revit_tokens SET revoked_at=NOW() WHERE id=$1 AND revoked_at IS NULL RETURNING id,project_id",[id]);
  if(!rows.length)return NextResponse.json({error:"Token not found"},{status:404});
  await audit("qs.revit.token.revoked","QsRevitToken",id,{actor:user.id,projectId:rows[0].project_id});
  return NextResponse.json({ok:true});
 }catch(e){return handleQsError(e);}
}
