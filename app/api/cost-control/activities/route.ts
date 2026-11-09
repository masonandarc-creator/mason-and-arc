import { NextResponse } from "next/server";
import { ensureQsReady } from "@/lib/server/qsBootstrap";
import { requireServerUser,audit } from "@/lib/server/auth";
import { query } from "@/lib/server/db";
import { handleQsError,requiredText,boundedText,positive,nonnegative,validDate } from "@/lib/server/qsValidation";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(request:Request){
 try{await requireServerUser(["Owner","Manager","Engineer"]); await ensureQsReady();
 const governorate=boundedText(new URL(request.url).searchParams.get("governorate"),80);
 const {rows}=await query(`SELECT a.*, (SELECT count(*)::int FROM qs_consumption_recipes r WHERE r.activity_id=a.id) AS recipe_count,
 l.id AS labor_quote_id,l.unit_rate_egp AS labor_rate_egp,
 e.id AS equipment_quote_id,e.unit_rate_egp AS equipment_rate_egp
 FROM qs_activities a
 LEFT JOIN LATERAL (SELECT id,unit_rate_egp FROM qs_activity_rate_quotes WHERE activity_id=a.id AND component='Labor'
 AND governorate=$1 AND status='Approved' AND quoted_at<=CURRENT_DATE AND (valid_until IS NULL OR valid_until>=CURRENT_DATE)
 ORDER BY quoted_at DESC,approved_at DESC LIMIT 1)l ON TRUE
 LEFT JOIN LATERAL (SELECT id,unit_rate_egp FROM qs_activity_rate_quotes WHERE activity_id=a.id AND component='Equipment'
 AND governorate=$1 AND status='Approved' AND quoted_at<=CURRENT_DATE AND (valid_until IS NULL OR valid_until>=CURRENT_DATE)
 ORDER BY quoted_at DESC,approved_at DESC LIMIT 1)e ON TRUE
 WHERE a.status<>'Archived' ORDER BY a.category,a.code`,[governorate]);
 return NextResponse.json({data:rows,governorate},{headers:{"Cache-Control":"no-store"}});
 }catch(e){return handleQsError(e);}
}
