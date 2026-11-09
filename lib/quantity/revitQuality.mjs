/**
 * Mason & Arc / BIM model QA — deterministic review heuristics, NOT a structural or BOQ approval.
 * Supports existing mason-arc-revit-v1 JSON exports and additive v2 fields.
 * A warning may require model-level checking; it never authorizes changing construction quantities.
 */
const round=(n,places=4)=>Number(n.toFixed(places));
const nullable=(v)=>typeof v==="number"&&Number.isFinite(v)?v:null;
const isFloor=(e)=>e.categoryCode==="OST_Floors"||e.category==="Floors";
const isWall=(e)=>e.categoryCode==="OST_Walls"||e.category==="Walls";
const isStair=(e)=>["OST_Stairs","OST_StairsRuns","OST_StairsLandings"].includes(e.categoryCode)||["Stairs","Stairs Runs","Stairs Landings"].includes(e.category);
const isCurtainPart=(e)=>["OST_CurtainWallPanels","OST_CurtainWallMullions"].includes(e.categoryCode)||/curtain (?:wall )?(?:panels?|mullions?)/i.test(e.category);
const glazingHost=(e)=>isWall(e)&&/exterior glazing|storefront|curtain/i.test(e.name);
const reviewHints="Names and ratios are indicators only. Confirm Revit type assembly, geometry, material layers and specified construction before using a quantity.";
export function summarizeRevitModel(model,{maxIssues=150}={}){
 const categories=new Map(),materials=new Map(),issues=[];
 const counts={review:0,info:0};
 const details={missingMaterialElements:0,missingVolumeElements:0,unmeasuredStairs:0,glazingHostsWithoutMaterials:0,curtainPanels:0,curtainMullions:0,thicknessReview:0,oversizedFloors:0};
 const push=(code,severity,e,detail,action)=>{
   counts[severity]++;
   if(issues.length<maxIssues)issues.push({code,severity,uniqueId:e?.uniqueId??null,elementId:e?.elementId??null,
    category:e?.category??"Project",level:e?.level??"",name:e?.name??model.title,detail,action});
 };
 for(const e of model.elements){
   let c=categories.get(e.category);
   if(!c){c={category:e.category,count:0,volumeM3:0,areaM2:0,lengthM:0,missingVolume:0,missingArea:0};categories.set(e.category,c);}
   c.count++;c.volumeM3+=nullable(e.volumeM3)??0;c.areaM2+=nullable(e.areaM2)??0;c.lengthM+=nullable(e.lengthM)??0;
   if(nullable(e.volumeM3)===null){c.missingVolume++;details.missingVolumeElements++;}
   if(nullable(e.areaM2)===null)c.missingArea++;
   if(!e.materials.length)details.missingMaterialElements++;
   for(const m of e.materials){
     let t=materials.get(m.name);
     if(!t){t={name:m.name,count:0,volumeM3:0,areaM2:0};materials.set(m.name,t);}
     t.count++;t.volumeM3+=nullable(m.volumeM3)??0;t.areaM2+=nullable(m.areaM2)??0;
   }
   if(e.categoryCode==="OST_CurtainWallPanels"||/curtain (?:wall )?panels?/i.test(e.category))details.curtainPanels++;
   if(e.categoryCode==="OST_CurtainWallMullions"||/curtain (?:wall )?mullions?/i.test(e.category))details.curtainMullions++;
   if(isFloor(e)&&nullable(e.areaM2)!==null&&e.areaM2>=1500){
     details.oversizedFloors++;
     push("LARGE_FLOOR_FOOTPRINT","review",e,`Floor area ${round(e.areaM2,2)} m². Verify this is a billable slab, not site/terrain/placeholder geometry.`,"Inspect floor type, material assignment, model scope and phase. Exclude non-billable elements only after review.");
   }
   if(isFloor(e)&&e.materials.some(m=>/gypsum wall board/i.test(m.name))){
     push("FLOOR_MATERIAL_REVIEW","review",e,"A floor is assigned Gypsum Wall Board. This may be a placeholder or a valid assembly layer.","Open Edit Type > Structure and verify each layer and material before pricing.");
   }
   if(glazingHost(e)&&e.materials.length===0){
     details.glazingHostsWithoutMaterials++;
     push("CURTAIN_HOST_NO_MATERIALS","info",e,"Curtain/glazed host wall has no material takeoff; this is normal for some curtain systems.","Measure curtain panels and mullions individually; do not treat parent wall area as glass procurement area.");
   }else if(!isCurtainPart(e)&&e.materials.length===0&&!isStair(e)){
     push("UNASSIGNED_MATERIAL","info",e,"Element contains no exported material quantities.","Check assigned Revit materials and whether the category supports material takeoff.");
   }
   if(isStair(e)&&nullable(e.volumeM3)===null&&nullable(e.areaM2)===null&&e.materials.every(m=>nullable(m.volumeM3)===null&&nullable(m.areaM2)===null)){
     details.unmeasuredStairs++;
     push("STAIR_GEOMETRY_MISSING","review",e,"Stair and its material inventory provide no reliable quantity.","Review stair runs/landings and structural material assignments. Do not infer concrete volume.");
   }
   const labelThickness=/(?:^|[^\d])(\d{2,4})\s*mm\b/i.exec(e.name);
   const v=nullable(e.volumeM3),a=nullable(e.areaM2);
   if((isFloor(e)||isWall(e))&&labelThickness&&v!==null&&a!==null&&a>0){
     const namedMm=Number(labelThickness[1]),measuredMm=v/a*1000;
     if(namedMm>=50&&namedMm<=1500&&Math.abs(measuredMm-namedMm)>Math.max(20,namedMm*0.1)){
       details.thicknessReview++;
       push("TYPE_THICKNESS_MISMATCH","review",e,`Type label ${namedMm} mm; volume ÷ area indicates ~${round(measuredMm,1)} mm. The label can be stale, or geometry/area may differ.`,"Verify compound structure, actual layer thickness, net area, joins, reveals and any non-uniform geometry.");
     }
   }
   if(isFloor(e)&&e.materials.some(m=>/^pasco$/i.test(m.name.trim()))){
     push("MATERIAL_SPECIFICATION_UNKNOWN","review",e,"Material named 'pasco' is not a sufficient construction specification.","Confirm material purpose, engineering spec and whether it belongs in slab/concrete procurement.");
   }
 }
 if(details.glazingHostsWithoutMaterials>0&&details.curtainPanels===0){
   push("CURTAIN_COMPONENTS_NOT_CAPTURED","review",null,`${details.glazingHostsWithoutMaterials} glazed host walls reported no material quantities, and no curtain panels were exported.`,"Use Revit Connector 0.2+ to export curtain panel and mullion components; review panel materials and glass area.");
 }
 const categoryTotals=[...categories.values()].map(x=>({...x,volumeM3:round(x.volumeM3),areaM2:round(x.areaM2),lengthM:round(x.lengthM)})).sort((a,b)=>b.count-a.count);
 const materialTotals=[...materials.values()].map(x=>({...x,volumeM3:round(x.volumeM3),areaM2:round(x.areaM2)})).sort((a,b)=>b.volumeM3-a.volumeM3);
 const warningCount=Array.isArray(model.warnings)?model.warnings.length:0;
 return {elementCount:model.elements.length,categoryTotals,materialTotals,warningCount,
  quality:{status:counts.review?"REQUIRES_REVIEW":counts.info?"INFORMATIONAL_GAPS":"PRELIMINARY",reviewCount:counts.review,infoCount:counts.info,issues,
   omittedIssueCount:Math.max(0,counts.review+counts.info-issues.length),details,reviewHints},
  notice:"This is a modeled-geometry inventory, not a material order, structural rebar takeoff or certified BOQ. Parent curtain areas and child panel materials are different metrics and must not be added together. No approved cost baseline or BOQ line is changed."};
}
