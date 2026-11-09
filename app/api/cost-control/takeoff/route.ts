import { NextResponse } from "next/server";
import { ensureQsReady } from "@/lib/server/qsBootstrap";
import { requireServerUser,audit } from "@/lib/server/auth";
import { query } from "@/lib/server/db";
import { handleQsError,requiredText,boundedText,nonnegative } from "@/lib/server/qsValidation";
import { measureQuantity } from "@/lib/quantity/costEngine.mjs";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(request:Request){
 try{await requireServerUser(["Owner","Manager","Engineer"]); await ensureQsReady();
 const estimateId=requiredText(new URL(request.url).searchParams.get("estimateId"),"Estimate",80);
 const {rows}=await query(`SELECT t.*,a.code AS activity_code,a.title_ar,a.title_en,a.unit,a.measure_rule
   FROM qs_takeoff_lines t JOIN qs_activities a ON a.id=t.activity_id
   WHERE t.estimate_id=$1 ORDER BY t.created_at,t.id`,[estimateId]);
 return NextResponse.json({data:rows.map(r=>({...r,quantity:measureQuantity({rule:r.measure_rule,count:r.item_count,length:r.length_m,width:r.width_m,height:r.height_m,deduction:r.deduction}).net}))},{headers:{"Cache-Control":"no-store"}});
 }catch(e){return handleQsError(e);}
}
export async function POST(request:Request){
 try{const user=await requireServerUser(["Owner","Manager","Engineer"]); await ensureQsReady();
 const b=await request.json() as Record<string,unknown>;
 const estimateId=requiredText(b.estimate_id,"Estimate",80);
 const activityId=requiredText(b.activity_id,"Activity",80);
 const {rows:er}=await query("SELECT status FROM qs_estimates WHERE id=$1",[estimateId]);
 if(!er.length||er[0].status!=="Draft")throw new Error("VALIDATION:Estimate not found or not editable");
 const {rows:ar}=await query("SELECT measure_rule FROM qs_activities WHERE id=$1",[activityId]);
 if(!ar.length)throw new Error("VALIDATION:Activity not found");
 const values=[b.item_count??1,b.length_m??0,b.width_m??0,b.height_m??0,b.deduction??0].map((v,i)=>nonnegative(v,["Count","Length","Width","Height","Deduction"][i]));
 const measured=measureQuantity({rule:ar[0].measure_rule,count:values[0],length:values[1],width:values[2],height:values[3],deduction:values[4]});
 const {rows}=await query(`INSERT INTO qs_takeoff_lines(estimate_id,activity_id,zone,element_reference,drawing_revision,item_count,length_m,width_m,height_m,deduction,notes,created_by)
 VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,[estimateId,activityId,boundedText(b.zone,120),boundedText(b.element_reference,160),boundedText(b.drawing_revision,60),...values,boundedText(b.notes,2000),user.id]);
 await audit("qs.takeoff.created","QsTakeoff",rows[0].id,{estimateId,activityId,quantity:measured.net,actor:user.id});
 return NextResponse.json({data:{...rows[0],quantity:measured.net}},{status:201});
 }catch(e){return handleQsError(e);}
}
