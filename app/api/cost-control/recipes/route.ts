import { NextResponse } from "next/server";
import { ensureQsReady } from "@/lib/server/qsBootstrap";
import { requireServerUser,audit } from "@/lib/server/auth";
import { query } from "@/lib/server/db";
import { handleQsError,requiredText,boundedText } from "@/lib/server/qsValidation";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(request:Request){
 try{await requireServerUser(["Owner","Manager","Engineer"]); await ensureQsReady();
 const code=boundedText(new URL(request.url).searchParams.get("activityCode"),48);
 const {rows}=await query(`SELECT r.*,a.code AS activity_code,a.title_ar AS activity_name,m.code AS material_code,m.name_ar AS material_name,m.unit
 FROM qs_consumption_recipes r JOIN qs_activities a ON a.id=r.activity_id JOIN qs_materials m ON m.id=r.material_id
 WHERE ($1='' OR a.code=$1) ORDER BY a.code,m.code`,[code]);
 return NextResponse.json({data:rows},{headers:{"Cache-Control":"no-store"}});
 }catch(e){return handleQsError(e);}
}
export async function PATCH(request:Request){
 try{
 const user=await requireServerUser(["Owner"]); await ensureQsReady();const b=await request.json() as Record<string,unknown>;
 const id=requiredText(b.id,"Recipe ID",80),decision=requiredText(b.status,"Decision",20);
 const reference=decision==="Approved"?requiredText(b.approval_reference,"Approved specification / drawing reference",500):"";
 if(!["Approved","Draft","Archived"].includes(decision))throw new Error("VALIDATION:Invalid recipe status");
 const {rows}=await query(`UPDATE qs_consumption_recipes SET status=$2,approved_by=CASE WHEN $2='Approved' THEN $3 ELSE NULL END,
 approved_at=CASE WHEN $2='Approved' THEN NOW() ELSE NULL END,approval_reference=$4,updated_at=NOW() WHERE id=$1 RETURNING *`,[id,decision,user.id,reference]);
 if(!rows.length)return NextResponse.json({error:"Recipe not found"},{status:404});
 await audit("qs.recipe.reviewed","QsConsumptionRecipe",id,{actor:user.id,status:decision,approval_reference:reference});
 return NextResponse.json({data:rows[0]});
 }catch(e){return handleQsError(e);}
}
