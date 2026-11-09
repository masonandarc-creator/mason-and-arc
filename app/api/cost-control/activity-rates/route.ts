import { NextResponse } from "next/server";
import { ensureQsReady } from "@/lib/server/qsBootstrap";
import { requireServerUser,audit } from "@/lib/server/auth";
import { query,withTransaction } from "@/lib/server/db";
import { handleQsError,requiredText,boundedText,nonnegative,validDate } from "@/lib/server/qsValidation";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(){
 try{await requireServerUser(["Owner","Manager","Engineer"]); await ensureQsReady();
 const {rows}=await query(`SELECT q.*,a.code,a.title_ar,a.unit FROM qs_activity_rate_quotes q JOIN qs_activities a ON a.id=q.activity_id ORDER BY q.created_at DESC LIMIT 500`);
 return NextResponse.json({data:rows},{headers:{"Cache-Control":"no-store"}});
 }catch(e){return handleQsError(e);}
}
export async function POST(request:Request){
 try{const user=await requireServerUser(["Owner","Manager"]); await ensureQsReady();const b=await request.json() as Record<string,unknown>;
 const act=requiredText(b.activity_id,"Activity",80),component=requiredText(b.component,"Component",20);
 if(!["Labor","Equipment"].includes(component))throw new Error("VALIDATION:Invalid component");
 const quotedAt=validDate(b.quoted_at,"Quotation date"),until=validDate(b.valid_until,"Valid until");
 if(until&&until<quotedAt)throw new Error("VALIDATION:Validity date precedes quotation");
 const {rows}=await query(`INSERT INTO qs_activity_rate_quotes(activity_id,component,contractor_name,governorate,unit_rate_egp,quoted_at,valid_until,source_reference)
 VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,[act,component,requiredText(b.contractor_name,"Contractor",160),
 requiredText(b.governorate,"Governorate",80),nonnegative(b.unit_rate_egp,"Rate",1e12),quotedAt,until,requiredText(b.source_reference,"Quotation reference",500)]);
 await audit("qs.activity_rate.submitted","QsActivityRate",rows[0].id,{actor:user.id});
 return NextResponse.json({data:rows[0]},{status:201});
 }catch(e){return handleQsError(e);}
}
export async function PATCH(request:Request){
 try{const user=await requireServerUser(["Owner"]); await ensureQsReady();const b=await request.json() as Record<string,unknown>;
 const id=requiredText(b.id,"Quote ID",80),status=requiredText(b.status,"Status",20);
 if(!["Approved","Rejected"].includes(status))throw new Error("VALIDATION:Invalid status");
 const row=await withTransaction(async client=>{
 const previous=await client.query("SELECT * FROM qs_activity_rate_quotes WHERE id=$1 FOR UPDATE",[id]);
 if(!previous.rows.length||previous.rows[0].status!=="Pending")throw new Error("VALIDATION:Only pending quotations can be reviewed");
 const {rows}=await client.query(`UPDATE qs_activity_rate_quotes SET status=$2,approved_by=CASE WHEN $2='Approved' THEN $3 ELSE NULL END,
 approved_at=CASE WHEN $2='Approved' THEN NOW() ELSE NULL END WHERE id=$1 RETURNING *`,[id,status,user.id]);return rows[0];
 });
 await audit("qs.activity_rate.reviewed","QsActivityRate",id,{actor:user.id,status});return NextResponse.json({data:row});
 }catch(e){return handleQsError(e);}
}
