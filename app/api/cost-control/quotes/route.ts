import { NextResponse } from "next/server";
import { requireServerUser,audit } from "@/lib/server/auth";
import { query,withTransaction } from "@/lib/server/db";
import { handleQsError,requiredText,boundedText,positive,nonnegative,validDate } from "@/lib/server/qsValidation";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(request:Request){
 try{
  await requireServerUser(["Owner","Manager","Engineer"]);
  const id=boundedText(new URL(request.url).searchParams.get("materialId"),80);
  const {rows}=await query(`SELECT q.*,m.code,m.name_ar,m.unit FROM qs_supplier_quotes q JOIN qs_materials m ON m.id=q.material_id
   WHERE ($1='' OR q.material_id::text=$1) ORDER BY q.created_at DESC LIMIT 500`,[id]);
  return NextResponse.json({data:rows},{headers:{"Cache-Control":"no-store"}});
 }catch(e){return handleQsError(e);}
}
export async function POST(request:Request){
 try{
  const user=await requireServerUser(["Owner","Manager"]);
  const body=await request.json() as Record<string,unknown>;
  const materialId=requiredText(body.material_id,"Material",80);
  const supplier=requiredText(body.supplier_name,"Supplier",180);
  const governorate=requiredText(body.governorate,"Governorate",80);
  const price=positive(body.unit_price_egp,"Unit price EGP");
  const delivery=nonnegative(body.delivery_egp_per_unit??0,"Delivery EGP per unit");
  const quotedAt=validDate(body.quoted_at,"Quotation date");
  const validUntil=body.valid_until?validDate(body.valid_until,"Valid until"):null;
  if(validUntil&&validUntil<quotedAt)throw new Error("VALIDATION:Validity date precedes quotation");
  const source=requiredText(body.source_reference,"Supplier quotation reference",500);
  const {rows}=await query(`INSERT INTO qs_supplier_quotes(material_id,supplier_name,governorate,unit_price_egp,delivery_egp_per_unit,quoted_at,valid_until,source_reference,notes)
   VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,[materialId,supplier,governorate,price,delivery,quotedAt,validUntil,source,boundedText(body.notes,2000)]);
  await audit("qs.quote.submitted","QsSupplierQuote",rows[0].id,{actor:user.id,materialId});
  return NextResponse.json({data:rows[0]},{status:201});
 }catch(e){return handleQsError(e);}
}
export async function PATCH(request:Request){
 try{
  const user=await requireServerUser(["Owner"]);
  const body=await request.json() as Record<string,unknown>;
  const id=requiredText(body.id,"Quotation ID",80);
  const status=requiredText(body.status,"Status",15);
  if(!["Approved","Rejected"].includes(status))throw new Error("VALIDATION:Only approval or rejection allowed");
  const row=await withTransaction(async client=>{
    const before=await client.query("SELECT * FROM qs_supplier_quotes WHERE id=$1 FOR UPDATE",[id]);
    if(!before.rows.length)throw new Error("VALIDATION:Quotation not found");
    if(before.rows[0].status!=="Pending")throw new Error("VALIDATION:Only pending quotations can be reviewed");
    const result=await client.query(`UPDATE qs_supplier_quotes SET status=$2,approved_by=CASE WHEN $2='Approved' THEN $3 ELSE NULL END,
      approved_at=CASE WHEN $2='Approved' THEN NOW() ELSE NULL END WHERE id=$1 RETURNING *`,[id,status,user.id]);
    return result.rows[0];
  });
  await audit("qs.quote.reviewed","QsSupplierQuote",id,{actor:user.id,status});
  return NextResponse.json({data:row});
 }catch(e){return handleQsError(e);}
}
