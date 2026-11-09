import { NextResponse } from "next/server";
import { requireServerUser } from "@/lib/server/auth";
import { ensureQsReady } from "@/lib/server/qsBootstrap";
import { ensureRevitTables } from "@/lib/server/revitConnector";
import { query } from "@/lib/server/db";
import { handleQsError,requiredText } from "@/lib/server/qsValidation";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(request:Request){
 try{
  await requireServerUser(["Owner","Manager","Engineer"]);await ensureQsReady();await ensureRevitTables();
  const projectId=requiredText(new URL(request.url).searchParams.get("projectId"),"Project",100);
  const {rows}=await query(`SELECT id,project_id,model_title,element_count,source_type,summary,exported_at,created_at
    FROM qs_revit_snapshots WHERE project_id=$1 ORDER BY created_at DESC LIMIT 30`,[projectId]);
  return NextResponse.json({data:rows},{headers:{"Cache-Control":"no-store"}});
 }catch(e){return handleQsError(e);}
}
