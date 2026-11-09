import { NextResponse } from "next/server";
import { requireServerUser } from "@/lib/server/auth";
import { query } from "@/lib/server/db";
import { handleQsError,requiredText } from "@/lib/server/qsValidation";
import { measureQuantity,priceBoqLine,aggregateEstimate } from "@/lib/quantity/costEngine.mjs";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(request:Request){
 try{
  await requireServerUser(["Owner","Manager","Engineer"]);
  const estimateId=requiredText(new URL(request.url).searchParams.get("estimateId"),"Estimate",80);
  const {rows:estimates}=await query("SELECT * FROM qs_estimates WHERE id=$1",[estimateId]);
  const e=estimates[0];if(!e)return NextResponse.json({error:"Estimate not found"},{status:404});
  const {rows:takeoff}=await query(`SELECT t.*,a.code,a.title_ar,a.unit,a.measure_rule FROM qs_takeoff_lines t JOIN qs_activities a ON a.id=t.activity_id
   WHERE t.estimate_id=$1 ORDER BY a.code,t.created_at`,[estimateId]);
  const {rows:recipes}=await query(`SELECT r.activity_id,r.coefficient,r.waste_percent,r.status AS recipe_status,m.code,
  q.id AS quote_id,q.unit_price_egp,q.delivery_egp_per_unit
  FROM qs_consumption_recipes r JOIN qs_materials m ON m.id=r.material_id
  LEFT JOIN LATERAL(SELECT id,unit_price_egp,delivery_egp_per_unit FROM qs_supplier_quotes
   WHERE material_id=m.id AND governorate=$1 AND status='Approved'
     AND quoted_at<=CURRENT_DATE AND (valid_until IS NULL OR valid_until>=CURRENT_DATE)
   ORDER BY quoted_at DESC,approved_at DESC LIMIT 1) q ON TRUE
  WHERE r.activity_id=ANY($2::uuid[])`,[e.governorate,[...new Set(takeoff.map(x=>x.activity_id))]]);
  const {rows:rates}=await query(`SELECT DISTINCT ON(activity_id,component) activity_id,component,id,unit_rate_egp FROM qs_activity_rate_quotes
    WHERE governorate=$1 AND status='Approved' AND quoted_at<=CURRENT_DATE AND (valid_until IS NULL OR valid_until>=CURRENT_DATE)
      AND activity_id=ANY($2::uuid[]) ORDER BY activity_id,component,quoted_at DESC,approved_at DESC`,
      [e.governorate,[...new Set(takeoff.map(x=>x.activity_id))]]);
  const nonMaterialActivities=new Set(["EXC","DEMOLISH","CLEAN"]);
  const markups={overhead:e.overhead_percent,contingency:e.contingency_percent,profit:e.profit_percent,tax:e.tax_percent};
  const lines=takeoff.map(t=>{
   const qty=measureQuantity({rule:t.measure_rule,count:t.item_count,length:t.length_m,width:t.width_m,height:t.height_m,deduction:t.deduction}).net;
   const recipeRows=recipes.filter(r=>r.activity_id===t.activity_id);
   const materials=recipeRows.map(r=>({code:r.code,coefficient:r.coefficient,wastePercent:Number(r.waste_percent)*100,recipeApproved:r.recipe_status==="Approved",quoteId:r.quote_id,unitPriceEgp:r.unit_price_egp,deliveryEgpPerUnit:r.delivery_egp_per_unit}));
   const labor=rates.find(r=>r.activity_id===t.activity_id&&r.component==="Labor");
   const equipment=rates.find(r=>r.activity_id===t.activity_id&&r.component==="Equipment");
   const cost=priceBoqLine({quantity:qty,materials,labor:labor?{quoteId:labor.id,rateEgp:labor.unit_rate_egp}:null,
    equipment:equipment?{quoteId:equipment.id,rateEgp:equipment.unit_rate_egp}:null,markups});
   if(!recipeRows.length&&!nonMaterialActivities.has(t.code)){
     return {...t,quantity:qty,...cost,status:"UNPRICED",missing:[...cost.missing,"recipe:missing"],totalEgp:null,unitRateEgp:null};
   }
   return {...t,quantity:qty,...cost};
  });
  return NextResponse.json({estimate:{id:e.id,code:e.code,title:e.title,governorate:e.governorate,status:e.status},
    summary:aggregateEstimate(lines),lines},{headers:{"Cache-Control":"no-store"}});
 }catch(e){return handleQsError(e);}
}
