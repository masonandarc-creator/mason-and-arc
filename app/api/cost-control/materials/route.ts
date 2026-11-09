import { NextResponse } from "next/server";
import { ensureQsReady } from "@/lib/server/qsBootstrap";
import { requireServerUser,audit } from "@/lib/server/auth";
import { query } from "@/lib/server/db";
import { handleQsError,requiredText,boundedText,positive,nonnegative } from "@/lib/server/qsValidation";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(request:Request){
 try{
  await requireServerUser(["Owner","Manager","Engineer"]); await ensureQsReady();
  const governorate=boundedText(new URL(request.url).searchParams.get("governorate"),80);
  const {rows}=await query(`SELECT m.id,m.code,m.name_ar,m.name_en,m.category,m.unit,m.pack_size,m.default_waste,m.specification,m.status,
    q.id AS quote_id,q.supplier_name,q.unit_price_egp,q.delivery_egp_per_unit,q.quoted_at,q.valid_until,q.source_reference
    FROM qs_materials m LEFT JOIN LATERAL(
      SELECT id,supplier_name,unit_price_egp,delivery_egp_per_unit,quoted_at,valid_until,source_reference
      FROM qs_supplier_quotes WHERE material_id=m.id AND governorate=$1
        AND status='Approved' AND quoted_at<=CURRENT_DATE AND (valid_until IS NULL OR valid_until>=CURRENT_DATE)
      ORDER BY quoted_at DESC,approved_at DESC LIMIT 1
    )q ON TRUE WHERE m.status<>'Archived' ORDER BY m.category,m.code`,[governorate]);
  return NextResponse.json({data:rows,governorate,unpriced:rows.filter((m)=>!m.quote_id).length},{headers:{"Cache-Control":"no-store"}});
 }catch(e){return handleQsError(e);}
}
export async function POST(request:Request){
 try{
  const user=await requireServerUser(["Owner","Manager"]); await ensureQsReady();
  const body=await request.json() as Record<string,unknown>;
  const code=requiredText(body.code,"Code",48).toUpperCase().replace(/[^A-Z0-9_]/g,"");
  if(!code)throw new Error("VALIDATION:Invalid code");
  const nameAr=requiredText(body.name_ar,"Arabic name",180);
  const unit=requiredText(body.unit,"Unit",8);
  if(!["kg","ton","m","m²","m³","L","pcs","set"].includes(unit))throw new Error("VALIDATION:Unsupported unit");
  const {rows}=await query(`INSERT INTO qs_materials(code,name_ar,name_en,category,unit,pack_size,default_waste,specification)
   VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,[
   code,nameAr,boundedText(body.name_en,180),boundedText(body.category,80)||"Other",unit,
   positive(body.pack_size??1,"pack size"),nonnegative(body.default_waste??0,"waste",1),
   boundedText(body.specification,2000)]);
  await audit("qs.material.created","QsMaterial",rows[0].id,{code,actor:user.id});
  return NextResponse.json({data:rows[0]},{status:201});
 }catch(e){return handleQsError(e);}
}
