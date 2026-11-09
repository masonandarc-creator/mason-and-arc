/* Browser-safe, dependency-free Excel .xlsx export (Office Open XML, ZIP store method).
   Plain strings use inlineStr cells (never formulas from model data).
   Only workbook-generated BOQ expressions become formulas. */
const enc=new TextEncoder();
const xml=(s)=>String(s??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&apos;");
const asText=(v)=>String(v??"").slice(0,3000).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,"");
function colName(index){let s="",v=index+1;while(v){v--;s=String.fromCharCode(65+v%26)+s;v=Math.floor(v/26);}return s;}
const sheet=(name,rows,options={})=>({name,rows,headerRow:options.headerRow??3});
function csvRows(model,report,quality){
 const header=[["MASON & ARC / BIM INTELLIGENCE"],["UNVERIFIED QUANTITY TAKEOFF / WORKING DOCUMENT"],["Not for procurement or tendering without engineering review"]];
 const gap=[[]];
 const current=new Date().toISOString().slice(0,10);
 const executive=sheet("Executive Summary",[
  ["MASON & ARC / MATERIAL TAKEOFF & BOQ"],["Project: "+model.title+" | Exported: "+(model.exportedAtUtc||"unknown")],
  ["CHECK BEFORE ISSUE: All derived estimates depend on manually selected construction systems and finish faces"],
  ["Metric","Value","Status / note"],
  ["Model elements",report.elementCount,"Revit objects, not construction quantities"],
  ["Mapped wall area m²",report.totals.mappedWallAreaM2,"User-classified wall groups"],
  ["Unmapped wall area m²",report.totals.unmappedWallAreaM2,"Not priced; review every type"],
  ["Estimated blocks pcs",report.totals.blocks,"Only manually mapped masonry; scenario"],
  ["Plaster surface m²",report.totals.plasterAreaM2,"Finish faces chosen by user"],
  ["Paint surface m²",report.totals.paintAreaM2,"Finish faces chosen by user"],
  ["Curtain host wall envelope m²",report.totals.glazingHostAreaM2,"NOT glass procurement area"],
  ["Priced partial value EGP",report.partialCostEGP,"Not project total; missing inputs omitted"],
  ["Estimate complete?",report.completeCostEstimate?"Scenario mapped/rated":"NO — missing mapping or rates","Not a certified BOQ"],
  ["Generated",current,"Mason & Arc / internal review"]
 ],{headerRow:4});
 const boq=sheet("BOQ",[
  ["MASON & ARC / QUANTITY + RATE SCENARIO"],["Rates are EGP per unit, editable. Zero rate means NOT QUOTED."],["Amounts recalculate in Excel if unit rates are filled."],
  ["Item","Quantity","Unit","Rate EGP","Amount EGP","Status"],
  ...report.boq.map((x,i)=>[x.description,x.quantity,x.unit,x.unitPriceEGP??0,
   {formula:`IF(OR(B${i+5}<=0,D${i+5}<=0),"",B${i+5}*D${i+5})`,value:x.amountEGP??null},x.state]),
  ["Total of priced lines","", "", "", {formula:`SUM(E5:E${report.boq.length+4})`,value:report.partialCostEGP},"PARTIAL ONLY — never full CAPEX"],
  ["Unmapped groups",report.status.unmappedGroups,"", "", "", "Unknown quantities excluded"]
 ],{headerRow:4});
 const types=sheet("Walls by Type",[
  ["MASON & ARC / WALL TYPES & APPROVED ASSUMPTIONS"],
  ["Revit material names may be placeholders. Classification is user supplied in the report UI."],
  ["Nominal areas may not equal final net billable face areas."],
  ["Type","Revit material(s)","Elements","Wall area m²","Wall volume m³","Selected system","Blocks pcs","Plaster m²","Paint m²","Drywall face m²","Missing areas","Review state"],
  ...report.groups.map(g=>[g.name,g.materials.join(", ")||"NO MATERIAL",g.count,g.areaM2,g.volumeM3,g.system,g.blocks??"",g.plasterAreaM2,g.paintAreaM2,g.drywallFaceAreaM2,g.missingArea,g.system==="unmapped"?"NEEDS MAPPING":"ASSUMPTION — REVIEW"])
 ],{headerRow:4});
 const levels=sheet("Walls by Level",[
  ["MASON & ARC / WALL FINISH AREAS BY MODEL LEVEL"],
  ["Metric areas as exported / classified; verify location and phase."],
  ["Do not add wall envelope to curtain child panels."],
  ["Revit Level","Masonry m²","Plaster faces m²","Paint faces m²","Curtain host envelope m²","Unmapped wall m²"],
  ...report.levels.map(g=>[g.level,g.masonryAreaM2,g.plasterAreaM2,g.paintAreaM2,g.glazingHostAreaM2,g.unmappedAreaM2])
 ],{headerRow:4});
 const floors=model.elements.filter(e=>e.category==="Floors"||e.categoryCode==="OST_Floors");
 const floorsSheet=sheet("Floor Elements",[
  ["MASON & ARC / FLOOR ELEMENT MEASUREMENTS"],
  ["Floor category includes site, finish, cladding and slab elements; not automatically structural concrete."],
  ["Check 400mm types and gypsum board assignments before ordering materials."],
  ["Element ID","Revit type","Level","Area m²","Volume m³","Material","Review"],
  ...floors.map(e=>[e.elementId??e.uniqueId,e.name,e.level,e.areaM2??"",e.volumeM3??"",e.materials.map(m=>m.name).join(", ")||"NO MATERIAL",e.areaM2>1500?"LARGE FOOTPRINT — REVIEW":e.materials.some(m=>/gypsum wall board/i.test(m.name))?"FLOOR MATERIAL REVIEW":"VERIFY"])
 ],{headerRow:4});
 const glazingSheet=sheet("Glazing Inventory",[
  ["MASON & ARC / CURTAIN HOST + COMPONENT INVENTORY"],
  ["A glazed wall HOST envelope is not automatically installed glass area. Components must be checked."],
  ["Never sum child panel faces with parent wall envelope faces."],
  ["Element ID","Category","Type","Level","Area m²","Material(s)","Status"],
  ...model.elements.filter(e=>/glaz|storefront|curtain/i.test(e.name+" "+e.category)).map(e=>[e.elementId??e.uniqueId,e.category,e.name,e.level,e.areaM2??"",e.materials.map(m=>m.name).join(", ")||"NOT EXPORTED","REVIEW PANEL / MULLION DATA"])
 ],{headerRow:4});
 const matTotals=new Map();
 for(const e of model.elements)for(const m of e.materials??[]){
  const a=matTotals.get(m.name)??{name:m.name,count:0,volumeM3:0,areaM2:0};
  a.count++;a.volumeM3+=m.volumeM3??0;a.areaM2+=m.areaM2??0;matTotals.set(m.name,a);
 }
 const mat=sheet("Revit Materials",[
  ["MASON & ARC / RAW REVIT MATERIAL INVENTORY"],
  ["Model material tags are not verified procurement specifications."],
  ["Material areas may represent faces, not paid installation areas."],
  ["Material","Element occurrences","Material volume m³","Material area m²","Review"],
  ...[...matTotals.values()].sort((a,b)=>b.volumeM3-a.volumeM3).map(m=>[m.name,m.count,Number(m.volumeM3.toFixed(3)),Number(m.areaM2.toFixed(3)),"CHECK ASSEMBLY / SPECIFICATION"])
 ],{headerRow:4});
 const issues=quality?.issues??[];
 const qa=sheet("Model QA",[
  ["MASON & ARC / MODEL VALIDATION & OPEN ISSUES"],
  ["All issues require confirmation inside original Revit model."],
  ["Existing snapshots may have missing component geometry."],
  ["Priority","Code","Level","Category","Element","Revit ID","Finding","Required check"],
  ...issues.map(i=>[i.severity,i.code,i.level,i.category,i.name,i.elementId??i.uniqueId??"",i.detail,i.action]),
  ["NOTICE","QA list may be limited to 150 items — consult Revit Connector dashboard","","","","","",""]
 ],{headerRow:4});
 const raw=sheet("Raw Elements",[
  ["MASON & ARC / SOURCE ELEMENTS"],
  ["Revit API values; no geometry guessed where a parameter was missing."],
  ["Internal review only; model element names may be confidential."],
  ["Element ID","Unique ID","Category","Name","Level","Area m²","Volume m³","Length m","Material(s)"],
  ...model.elements.map(e=>[e.elementId??"",e.uniqueId,e.category,e.name,e.level,e.areaM2??"",e.volumeM3??"",e.lengthM??"",e.materials.map(m=>m.name).join(", ")])
 ],{headerRow:4});
 const controls=sheet("Scenario Inputs",[
  ["MASON & ARC / SCENARIO COEFFICIENTS"],
  ["Values are assumptions, not engineering-approved formulas."],
  ["Enter actual project specs and rates in the app before generating output."],
  ["Parameter","Value","Unit / purpose"],
  ...Object.entries(report.settings??{}).map(([key,val])=>[key,val,"User-controlled scenario input"]),
  ["Missing rates",report.missingRates.join(", "),"No supplier quotation"],
  ["Unmapped wall groups",report.status.unmappedGroups,"Manual classification needed"]
 ],{headerRow:4});
 return [executive,boq,types,levels,floorsSheet,glazingSheet,mat,qa,raw,controls];
}
function worksheetXml(s){
 let cells=[];
 const refLast=colName(Math.max(...s.rows.map(r=>r.length),1)-1)+(s.rows.length||1);
 for(let ri=0;ri<s.rows.length;ri++){
  const row=s.rows[ri];let chunks=[];
  for(let ci=0;ci<row.length;ci++){
   const ref=colName(ci)+(ri+1),v=row[ci];
   if(v===null||v===undefined||v==="")continue;
   const style=ri===0?2:ri===s.headerRow-1?1:ri===2?3:0;
   if(typeof v==="number"&&Number.isFinite(v))chunks.push(`<c r="${ref}" s="${style}"><v>${v}</v></c>`);
   else if(typeof v==="object"&&v&&typeof v.formula==="string"){
    const cached=typeof v.value==="number"&&Number.isFinite(v.value)?`<v>${v.value}</v>`:"";
    chunks.push(`<c r="${ref}" s="${style}"><f>${xml(v.formula)}</f>${cached}</c>`);
   }else chunks.push(`<c r="${ref}" s="${style}" t="inlineStr"><is><t xml:space="preserve">${xml(asText(v))}</t></is></c>`);
  }
  cells.push(`<row r="${ri+1}">${chunks.join("")}</row>`);
 }
 return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
 <dimension ref="A1:${refLast}"/><sheetViews><sheetView workbookViewId="0"><pane ySplit="${s.headerRow}" topLeftCell="A${s.headerRow+1}" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
 <sheetFormatPr defaultRowHeight="18"/><cols>${Array.from({length:Math.min(18,Math.max(...s.rows.map(x=>x.length),1))},(_,i)=>`<col min="${i+1}" max="${i+1}" width="${i===0?27:i===1?34:i>=6?38:20}" customWidth="1"/>`).join("")}</cols>
 <sheetData>${cells.join("")}</sheetData><autoFilter ref="A${s.headerRow}:${colName(Math.max(...s.rows.map(r=>r.length))-1)}${s.rows.length}"/></worksheet>`;
}
const styles=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="2"><font><sz val="11"/><color rgb="FF27363A"/><name val="Aptos"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Aptos"/></font></fonts>
<fills count="4"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF4F6B7A"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFF1EAE0"/><bgColor indexed="64"/></patternFill></fill></fills>
<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="4"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFill="1" applyFont="1"/><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="0" fillId="3" borderId="0" xfId="0" applyFill="1"/></cellXfs></styleSheet>`;
function manifest(sheets){
 const overrides=sheets.map((_,i)=>`<Override PartName="/xl/worksheets/sheet${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("");
 return `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${overrides}</Types>`;
}
const packageRels=`<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`;
function workbookXml(sheets){return `<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><bookViews><workbookView/></bookViews><sheets>${sheets.map((s,i)=>`<sheet name="${xml(s.name)}" sheetId="${i+1}" r:id="rId${i+1}"/>`).join("")}</sheets><calcPr calcId="191029" fullCalcOnLoad="1"/></workbook>`;}
function workbookRels(sheets){return `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((s,i)=>`<Relationship Id="rId${i+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i+1}.xml"/>`).join("")}<Relationship Id="rId${sheets.length+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`;}
const crcTable=Array.from({length:256},(_,n)=>{let v=n;for(let j=0;j<8;j++)v=(v&1)?0xEDB88320^(v>>>1):v>>>1;return v>>>0;});
function crc32(bytes){let c=0xFFFFFFFF;for(const b of bytes)c=crcTable[(c^b)&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0;}
function packZip(entries){
 const bytes=[],records=[];let offset=0;
 const short=(arr,v)=>{arr.push(v&255,(v>>>8)&255);};const integer=(arr,v)=>{arr.push(v&255,(v>>>8)&255,(v>>>16)&255,(v>>>24)&255);};
 for(const [name,data] of entries){
  const filename=enc.encode(name),value=enc.encode(data),crc=crc32(value),local=[];
  integer(local,0x04034b50);short(local,20);short(local,0);short(local,0);short(local,0);short(local,0);
  integer(local,crc);integer(local,value.length);integer(local,value.length);short(local,filename.length);short(local,0);
  bytes.push(Uint8Array.from(local),filename,value);
  records.push({filename,size:value.length,crc,offset});
  offset+=local.length+filename.length+value.length;
 }
 const centerStart=offset;
 for(const r of records){
  const row=[];integer(row,0x02014b50);short(row,20);short(row,20);short(row,0);short(row,0);short(row,0);short(row,0);
  integer(row,r.crc);integer(row,r.size);integer(row,r.size);short(row,r.filename.length);short(row,0);short(row,0);short(row,0);short(row,0);integer(row,0);integer(row,r.offset);
  bytes.push(Uint8Array.from(row),r.filename);offset+=row.length+r.filename.length;
 }
 const footer=[];integer(footer,0x06054b50);short(footer,0);short(footer,0);short(footer,records.length);short(footer,records.length);
 integer(footer,offset-centerStart);integer(footer,centerStart);short(footer,0);bytes.push(Uint8Array.from(footer));offset+=footer.length;
 const result=new Uint8Array(offset);let cursor=0;for(const block of bytes){result.set(block,cursor);cursor+=block.length;}
 return result;
}
export function buildRevitWorkbook(model,report,quality){
 const sheets=csvRows(model,report,quality),entries=[
  ["[Content_Types].xml",manifest(sheets)],
  ["_rels/.rels",packageRels],
  ["xl/workbook.xml",workbookXml(sheets)],
  ["xl/_rels/workbook.xml.rels",workbookRels(sheets)],
  ["xl/styles.xml",styles]
 ];
 for(let i=0;i<sheets.length;i++)entries.push([`xl/worksheets/sheet${i+1}.xml`,worksheetXml(sheets[i])]);
 return packZip(entries);
}
