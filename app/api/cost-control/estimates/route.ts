import { NextResponse } from "next/server";
import { ensureQsReady } from "@/lib/server/qsBootstrap";
import { requireServerUser,audit } from "@/lib/server/auth";
import { query } from "@/lib/server/db";
import { handleQsError,requiredText,boundedText,nonnegative } from "@/lib/server/qsValidation";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(request:Request){
 try{await requireServerUser(["Owner","Manager","Engineer"]); await ensureQsReady();
 const projectId=boundedText(new URL(request.url).searchParams.get("projectId"),100);
 const {rows}=await query(`SELECT e.*,p.name AS project_name,p.code AS project_code
   FROM qs_estimates e JOIN projects p ON p.id=e.project_id
   WHERE ($1='' OR e.project_id=$1) ORDER BY e.created_at DESC LIMIT 200`,[projectId]);
 return NextResponse.json({data:rows},{headers:{"Cache-Control":"no-store"}});
 }catch(e){return handleQsError(e);}
}
export async function POST(request:Request){
 try{const user=await requireServerUser(["Owner","Manager"]); await ensureQsReady();
 const b=await request.json() as Record<string,unknown>;
 const projectId=requiredText(b.project_id,"Project",100),title=requiredText(b.title,"Estimate title",180),
 governorate=requiredText(b.governorate,"Governorate",80);
 const {rows}=await query(`INSERT INTO qs_estimates(project_id,code,title,governorate,overhead_percent,contingency_percent,profit_percent,tax_percent,created_by)
 VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,[projectId,
 "MA-QS-"+crypto.randomUUID().slice(0,8).toUpperCase(),title,governorate,
 nonnegative(b.overhead_percent??0,"Overhead",100),nonnegative(b.contingency_percent??0,"Contingency",100),
 nonnegative(b.profit_percent??0,"Profit",100),nonnegative(b.tax_percent??0,"Tax",100),user.id]);
 await audit("qs.estimate.created","QsEstimate",rows[0].id,{projectId,actor:user.id});
 return NextResponse.json({data:rows[0]},{status:201});
 }catch(e){return handleQsError(e);}
}
