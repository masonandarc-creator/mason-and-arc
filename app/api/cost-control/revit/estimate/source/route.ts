import { NextResponse } from "next/server";
import { requireServerUser } from "@/lib/server/auth";
import { ensureQsReady } from "@/lib/server/qsBootstrap";
import { ensureRevitTables } from "@/lib/server/revitConnector";
import { query } from "@/lib/server/db";
import { handleQsError,requiredText } from "@/lib/server/qsValidation";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(request:Request){
 try{
  await requireServerUser(["Owner","Manager","Engineer"]);
  await ensureQsReady();await ensureRevitTables();
  const search=new URL(request.url).searchParams;
  const projectId=requiredText(search.get("projectId"),"Project",100);
  const snapshotId=requiredText(search.get("snapshotId"),"Snapshot",100);
  if(!/^[0-9a-fA-F-]{36}$/.test(snapshotId))throw Error("VALIDATION:Invalid snapshot ID");
  const {rows}=await query(`SELECT id,project_id,model_title,payload,summary,created_at,exported_at
    FROM qs_revit_snapshots WHERE project_id=$1 AND id=$2 LIMIT 1`,[projectId,snapshotId]);
  if(!rows.length)return NextResponse.json({error:"Snapshot not found for selected project"},{status:404});
  return NextResponse.json({data:rows[0]},{headers:{"Cache-Control":"private, no-store"}});
 }catch(e){return handleQsError(e);}
}
