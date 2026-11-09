import { NextResponse } from "next/server";
import { requireServerUser,audit } from "@/lib/server/auth";
import { withTransaction,query } from "@/lib/server/db";
import { ensureQsReady } from "@/lib/server/qsBootstrap";
import { handleQsError,requiredText } from "@/lib/server/qsValidation";
import { GET as getBoq } from "../boq/route";
export const runtime="nodejs";export const dynamic="force-dynamic";

export async function GET(request:Request){
 try{
  await requireServerUser(["Owner","Manager","Engineer"]);await ensureQsReady();
  const estimateId=requiredText(new URL(request.url).searchParams.get("estimateId"),"Estimate",80);
  const {rows}=await query(`SELECT id,estimate_id,revision,total_egp,approved_by,approved_at
    FROM qs_estimate_baselines WHERE estimate_id=$1 ORDER BY revision DESC`,[estimateId]);
  return NextResponse.json({data:rows},{headers:{"Cache-Control":"no-store"}});
 }catch(e){return handleQsError(e);}
}
export async function POST(request:Request){
 try{
  const user=await requireServerUser(["Owner"]);await ensureQsReady();
  const body=await request.json() as Record<string,unknown>;
  const id=requiredText(body.estimate_id,"Estimate",80);
  const response=await getBoq(new Request("https://internal.masonandarc.com/api/cost-control/boq?estimateId="+encodeURIComponent(id)));
  if(!response.ok){const error=await response.json();return NextResponse.json({error:error.error||"Could not compute estimate"},{status:response.status});}
  const snapshot=await response.json() as {summary:{status:string;totalEgp:string|null;unpricedLines:number};lines:unknown[];estimate:{code:string;status:string}};
  if(!snapshot.lines.length||snapshot.summary.status!=="COMPLETE"||snapshot.summary.unpricedLines!==0||snapshot.summary.totalEgp==null)
   return NextResponse.json({error:"Estimate is incomplete. Approve all recipes and local material, labor, and equipment quotations before locking."},{status:422});
  const result=await withTransaction(async(client)=>{
   const {rows}=await client.query("SELECT id,status,revision FROM qs_estimates WHERE id=$1 FOR UPDATE",[id]);
   if(!rows.length||rows[0].status!=="Draft")throw new Error("VALIDATION:Estimate is not a draft");
   const revision=Number(rows[0].revision);
   const saved=await client.query(`INSERT INTO qs_estimate_baselines(estimate_id,revision,snapshot,total_egp,approved_by)
     VALUES($1,$2,$3::jsonb,$4,$5) RETURNING id,revision,total_egp,approved_at`,[id,revision,JSON.stringify(snapshot),snapshot.summary.totalEgp,user.id]);
   await client.query(`UPDATE qs_estimates SET status='Approved',approved_by=$2,approved_at=NOW(),updated_at=NOW()
      WHERE id=$1`,[id,user.id]);
   return saved.rows[0];
  });
  await audit("qs.estimate.approved","QsEstimate",id,{actor:user.id,baselineId:result.id,revision:result.revision,totalEgp:result.total_egp});
  return NextResponse.json({data:result},{status:201});
 }catch(e){return handleQsError(e);}
}
