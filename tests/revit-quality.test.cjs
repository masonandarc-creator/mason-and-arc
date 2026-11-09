const test=require("node:test");
const assert=require("node:assert/strict");
const {pathToFileURL}=require("node:url");
const path=require("node:path");
const moduleUrl=pathToFileURL(path.join(__dirname,"../lib/quantity/revitQuality.mjs")).href;
const summary=async (elements,options)=> (await import(moduleUrl)).summarizeRevitModel({title:"synthetic-revit-test",warnings:[],elements},options);
const sample=(overrides={})=>({uniqueId:Math.random().toString(16),category:"Walls",name:"Generic - 200mm",level:"GR LEVEL",volumeM3:2,areaM2:10,lengthM:4,materials:[{name:"Concrete",volumeM3:2,areaM2:10}],...overrides});
test("Legacy Revit 2027 JSON with no categoryCode still produces useful warnings",async()=>{
 const report=await summary([
  sample({uniqueId:"f",category:"Floors",name:"Generic Floor - 400mm",areaM2:2000,volumeM3:300,materials:[{name:"Gypsum Wall Board",volumeM3:300,areaM2:2000}]}),
  sample({uniqueId:"w",category:"Walls",name:"Exterior Glazing",areaM2:40,volumeM3:null,materials:[]}),
  sample({uniqueId:"st",category:"Stairs",name:"Stair 1",volumeM3:null,areaM2:null,materials:[]}),
 ]);
 const codes=new Set(report.quality.issues.map(x=>x.code));
 for(const key of ["LARGE_FLOOR_FOOTPRINT","FLOOR_MATERIAL_REVIEW","TYPE_THICKNESS_MISMATCH","CURTAIN_HOST_NO_MATERIALS","CURTAIN_COMPONENTS_NOT_CAPTURED","STAIR_GEOMETRY_MISSING"])assert.ok(codes.has(key),key);
 assert.equal(report.elementCount,3);assert.equal(report.quality.details.thicknessReview,1);assert.equal(report.quality.details.unmeasuredStairs,1);
 assert.equal(report.quality.status,"REQUIRES_REVIEW");
 assert.equal(report.categoryTotals.find(x=>x.category==="Floors").volumeM3,300);
});
test("Curtain panel/mullion child elements are included separately and no false missing-child warning",async()=>{
 const report=await summary([
  sample({uniqueId:"host",category:"Walls",categoryCode:"OST_Walls",name:"Exterior Glazing",volumeM3:null,areaM2:40,materials:[]}),
  sample({uniqueId:"panel",category:"Curtain Panels",categoryCode:"OST_CurtainWallPanels",name:"Glazed panel",volumeM3:0.2,areaM2:36,materials:[{name:"Glass",volumeM3:0.2,areaM2:36}]}),
  sample({uniqueId:"mullion",category:"Curtain Wall Mullions",categoryCode:"OST_CurtainWallMullions",name:"Mullion",volumeM3:0.1,areaM2:3,materials:[{name:"Aluminum",volumeM3:0.1,areaM2:3}]}),
 ]);
 assert.equal(report.quality.details.curtainPanels,1);
 assert.equal(report.quality.details.curtainMullions,1);
 assert.ok(!report.quality.issues.some(x=>x.code==="CURTAIN_COMPONENTS_NOT_CAPTURED"));
 assert.equal(report.materialTotals.find(x=>x.name==="Glass").areaM2,36);
});
test("Model quality report caps displayed issues without losing counts",async()=>{
 const elements=Array.from({length:10},(_,i)=>sample({uniqueId:String(i),category:"Floors",name:"Generic Floor - 400mm",volumeM3:300,areaM2:2000,materials:[{name:"Gypsum Wall Board",volumeM3:300,areaM2:2000}]}));
 const report=await summary(elements,{maxIssues:4});
 assert.equal(report.quality.issues.length,4);
 assert.ok(report.quality.omittedIssueCount>0);
 assert.equal(report.quality.reviewCount,30);
});
test("Normal modeled masonry wall yields no false engineering approval",async()=>{
 const report=await summary([sample({uniqueId:"m",category:"Walls",categoryCode:"OST_Walls"})]);
 assert.equal(report.quality.reviewCount,0);
 assert.equal(report.quality.status,"PRELIMINARY");
 assert.match(report.notice,/not a material order/i);
});
