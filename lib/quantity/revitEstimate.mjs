/**
 * Mason & Arc / Model-derived building material calculator.
 * No construction-system or supplier assumptions are inferred from Revit material names.
 * An explicit, editable per-wall-type mapping is required for every derived line.
 * All results are preliminary; missing input/rates remain missing, never zero-priced procurement.
 */
const round=(v,p=3)=>Number(v.toFixed(p));
const positive=(v)=>typeof v==="number"&&Number.isFinite(v)&&v>0?v:null;
const nonneg=(v)=>typeof v==="number"&&Number.isFinite(v)&&v>=0?v:null;
export const DEFAULT_ESTIMATE_SETTINGS=Object.freeze({
 blockLengthM:0.4,blockHeightM:0.2,jointM:0.01,blockWastePct:5,
 paintCoats:2,paintCoverageM2PerL:0,paintWastePct:5,
 blockPriceEGP:0,plasterPriceEGPM2:0,paintPriceEGPM2:0,drywallPriceEGPM2:0,
 mortarM3PerM2:0,cementBagsPerMortarM3:0,sandM3PerMortarM3:0
});
export function groupKey(category,name,materials=[]){return JSON.stringify([category,name,[...materials].sort()]);}
export function wallGroups(model){
 const groups=new Map();
 for(const e of model.elements??[]){
  if(!(e.categoryCode==="OST_Walls"||e.category==="Walls"))continue;
  const matNames=(e.materials??[]).map(m=>m.name);
  const key=groupKey(e.category,e.name,matNames);
  let g=groups.get(key);
  if(!g){g={key,category:e.category,name:e.name,materials:[...matNames].sort(),count:0,areaM2:0,volumeM3:0,missingArea:0,levels:new Map()};groups.set(key,g);}
  g.count++;
  if(nonneg(e.areaM2)!==null){g.areaM2+=e.areaM2;g.levels.set(e.level??"", (g.levels.get(e.level??"")??0)+e.areaM2);}
  else g.missingArea++;
  if(nonneg(e.volumeM3)!==null)g.volumeM3+=e.volumeM3;
 }
 return [...groups.values()].map(g=>({...g,areaM2:round(g.areaM2,6),volumeM3:round(g.volumeM3,6),levels:[...g.levels.entries()].map(([level,areaM2])=>({level,areaM2:round(areaM2,6)}))})).sort((a,b)=>b.areaM2-a.areaM2);
}
const validChoice=(v,values,fallback)=>values.includes(v)?v:fallback;
export function calculateRevitEstimate(model,mappings={},settings={}){
 const config={...DEFAULT_ESTIMATE_SETTINGS,...settings};
 const groups=wallGroups(model);
 const blockFace=positive(config.blockLengthM+config.jointM)&&positive(config.blockHeightM+config.jointM)
  ?(config.blockLengthM+config.jointM)*(config.blockHeightM+config.jointM):null;
 const items=[],byLevel=new Map();
 const totals={mappedWallAreaM2:0,unmappedWallAreaM2:0,glazingHostAreaM2:0,masonryAreaM2:0,drywallFaceAreaM2:0,
   blocks:0,plasterAreaM2:0,paintAreaM2:0,mortarM3:0,cementBags:0,sandM3:0,paintLiters:0};
 const status={unmappedGroups:0,mappedGroups:0,missingAreaGroups:0,missingMaterialRates:[]};
 for(const g of groups){
  const raw=mappings[g.key]??{};
  const system=validChoice(raw.system,["unmapped","masonry","drywall","glazing","exclude"],"unmapped");
  const plasterFaces=validChoice(Number(raw.plasterFaces),[0,1,2],0);
  const paintFaces=validChoice(Number(raw.paintFaces),[0,1,2],0);
  const masonry=system==="masonry",drywall=system==="drywall";
  const blockCount=masonry&&blockFace ? Math.ceil(g.areaM2/blockFace*(1+Math.max(0,config.blockWastePct)/100)) : null;
  const plasterAreaM2=masonry?g.areaM2*plasterFaces:0;
  const paintAreaM2=(masonry||drywall)?g.areaM2*paintFaces:0;
  const drywallFaceAreaM2=drywall?g.areaM2*(Number(raw.drywallFaces)===1?1:2):0;
  const mortarM3=masonry&&positive(config.mortarM3PerM2)?g.areaM2*config.mortarM3PerM2:null;
  const cementBags=mortarM3!==null&&positive(config.cementBagsPerMortarM3)?mortarM3*config.cementBagsPerMortarM3:null;
  const sandM3=mortarM3!==null&&positive(config.sandM3PerMortarM3)?mortarM3*config.sandM3PerMortarM3:null;
  const paintLiters=paintAreaM2>0&&positive(config.paintCoverageM2PerL)?
     paintAreaM2*Math.max(1,config.paintCoats)/config.paintCoverageM2PerL*(1+Math.max(0,config.paintWastePct)/100):null;
  const item={...g,system,plasterFaces,paintFaces,
    blocks:blockCount,plasterAreaM2:round(plasterAreaM2),paintAreaM2:round(paintAreaM2),
    drywallFaceAreaM2:round(drywallFaceAreaM2),mortarM3:mortarM3===null?null:round(mortarM3),cementBags:cementBags===null?null:round(cementBags),
    sandM3:sandM3===null?null:round(sandM3),paintLiters:paintLiters===null?null:round(paintLiters)};
  items.push(item);
  if(system==="unmapped"){status.unmappedGroups++;totals.unmappedWallAreaM2+=g.areaM2;}
  else{status.mappedGroups++;totals.mappedWallAreaM2+=g.areaM2;}
  if(g.missingArea)status.missingAreaGroups++;
  if(system==="glazing")totals.glazingHostAreaM2+=g.areaM2;
  if(masonry)totals.masonryAreaM2+=g.areaM2;
  totals.blocks+=blockCount??0;
  totals.plasterAreaM2+=plasterAreaM2;totals.paintAreaM2+=paintAreaM2;totals.drywallFaceAreaM2+=drywallFaceAreaM2;
  totals.mortarM3+=mortarM3??0;totals.cementBags+=cementBags??0;totals.sandM3+=sandM3??0;totals.paintLiters+=paintLiters??0;
  for(const level of g.levels){
   let l=byLevel.get(level.level);if(!l){l={level:level.level,masonryAreaM2:0,plasterAreaM2:0,paintAreaM2:0,glazingHostAreaM2:0,unmappedAreaM2:0};byLevel.set(level.level,l);}
   if(masonry){l.masonryAreaM2+=level.areaM2;l.plasterAreaM2+=level.areaM2*plasterFaces;}
   if(masonry||drywall)l.paintAreaM2+=level.areaM2*paintFaces;
   if(system==="glazing")l.glazingHostAreaM2+=level.areaM2;
   if(system==="unmapped")l.unmappedAreaM2+=level.areaM2;
  }
 }
 const sources=[
  {key:"blocks",description:"Masonry blocks",unit:"pcs",quantity:status.mappedGroups?totals.blocks:0,unitPriceEGP:config.blockPriceEGP},
  {key:"plaster",description:"Plaster surface",unit:"m²",quantity:totals.plasterAreaM2,unitPriceEGP:config.plasterPriceEGPM2},
  {key:"paint",description:"Paint surface",unit:"m²",quantity:totals.paintAreaM2,unitPriceEGP:config.paintPriceEGPM2},
  {key:"drywall",description:"Drywall boards / faces",unit:"m²",quantity:totals.drywallFaceAreaM2,unitPriceEGP:config.drywallPriceEGPM2}
 ];
 const boq=sources.map(line=>({...line,quantity:line.key==="blocks"?Math.ceil(line.quantity):round(line.quantity),unitPriceEGP:positive(line.unitPriceEGP),
  amountEGP:positive(line.unitPriceEGP)&&line.quantity>0?round(line.quantity*line.unitPriceEGP,2):null,
  state:line.quantity<=0?"NOT_MAPPED_OR_ZERO":positive(line.unitPriceEGP)?"BUDGET_SCENARIO":"RATE_REQUIRED"}));
 const priced=boq.filter(x=>x.amountEGP!==null);
 const pending=boq.filter(x=>x.quantity>0&&x.amountEGP===null);
 return{
  title:model.title,exportedAtUtc:model.exportedAtUtc,elementCount:model.elements.length,
  groups:items,levels:[...byLevel.values()].map(l=>Object.fromEntries(Object.entries(l).map(([k,v])=>[k,typeof v==="number"?round(v):v]))).sort((a,b)=>a.level.localeCompare(b.level)),
  totals:Object.fromEntries(Object.entries(totals).map(([k,v])=>[k,k==="blocks"?Math.ceil(v):round(v)])),
  boq,partialCostEGP:round(priced.reduce((n,x)=>n+x.amountEGP,0),2),
  completeCostEstimate:status.unmappedGroups===0&&status.missingAreaGroups===0&&pending.length===0&&priced.length>0,
  missingRates:pending.map(x=>x.key),status,
  disclaimers:[
   "UNVERIFIED / NOT FOR PROCUREMENT. Revit material names do not establish real construction specifications.",
   "Masonry assignment and finish faces are manual decisions; Revit HOST_AREA_COMPUTED may not match the project's net billable area.",
   "Curtain host wall area is an envelope reference, not confirmed glass panel quantity. Never add host area to panel area.",
   "Block count is an assumed scenario based on nominal face dimensions, joint spacing and waste; wall geometry may require extra deductions.",
   "Mortar, sand, cement and paint liters are omitted until coverage and mix coefficients are explicitly supplied.",
   "Unit rates are project-specific inputs; absent prices do not mean zero costs. Partial cost is not a project total."
  ]
 };
}
