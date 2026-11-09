const test=require("node:test");
const assert=require("node:assert/strict");
const path=require("node:path");
const {pathToFileURL}=require("node:url");
const moduleUrl=x=>pathToFileURL(path.join(__dirname,"../lib/quantity/"+x)).href;
const source={
 title:"proposal",exportedAtUtc:"2026-11-09T21:03:19Z",
 elements:[
  {uniqueId:"wall1",category:"Walls",name:"Generic - 200mm",level:"GR LEVEL",areaM2:80,volumeM3:16,materials:[{name:"Gypsum Wall Board",areaM2:80,volumeM3:16}]},
  {uniqueId:"glass",category:"Walls",name:"Exterior Glazing",level:"GR LEVEL",areaM2:25,materials:[]},
  {uniqueId:"floor1",category:"Floors",name:"Generic Floor - 400mm",level:"GR LEVEL",areaM2:120,volumeM3:48,materials:[{name:"Concrete",volumeM3:48}]}
 ]};
test("Unknown wall materials do not generate blocks, painting or a priced BOQ",async()=>{
 const m=await import(moduleUrl("revitEstimate.mjs"));
 const report=m.calculateRevitEstimate(source);
 assert.equal(report.totals.unmappedWallAreaM2,105);
 assert.equal(report.totals.blocks,0);
 assert.equal(report.totals.paintAreaM2,0);
 assert.equal(report.completeCostEstimate,false);
});
test("Approved scenario maps only selected wall with optional finishes",async()=>{
 const m=await import(moduleUrl("revitEstimate.mjs"));
 const key=m.wallGroups(source).find(g=>g.name==="Generic - 200mm").key;
 const report=m.calculateRevitEstimate(source,{[key]:{system:"masonry",plasterFaces:2,paintFaces:2}},{
  blockLengthM:0.4,blockHeightM:0.2,jointM:0.01,blockWastePct:5,
  blockPriceEGP:10,plasterPriceEGPM2:100,paintPriceEGPM2:75
 });
 assert.equal(report.totals.blocks,Math.ceil(80/(0.41*0.21)*1.05));
 assert.equal(report.totals.paintAreaM2,160);
 assert.equal(report.totals.plasterAreaM2,160);
 assert.equal(report.status.unmappedGroups,1);
 assert.equal(report.completeCostEstimate,false);
 assert.equal(report.boq.find(x=>x.key==="paint").amountEGP,12000);
 assert.equal(report.totals.glazingHostAreaM2,0);
});
test("Drywall is never priced as blockwork",async()=>{
 const m=await import(moduleUrl("revitEstimate.mjs"));
 const key=m.wallGroups(source)[0].key;
 const report=m.calculateRevitEstimate(source,{[key]:{system:"drywall",plasterFaces:0,paintFaces:1}});
 assert.equal(report.totals.blocks,0);
 assert.equal(report.totals.paintAreaM2,80);
 assert.equal(report.totals.drywallFaceAreaM2,160);
});
test("Excel export starts as a ZIP with real XLSX worksheet entries",async()=>{
 const m=await import(moduleUrl("revitEstimate.mjs"));
 const exportModule=await import(moduleUrl("revitWorkbook.mjs"));
 const report=m.calculateRevitEstimate(source);
 const out=exportModule.buildRevitWorkbook(source,report,{issues:[]});
 assert.equal(out[0],80);assert.equal(out[1],75);assert.equal(out[2],3);assert.equal(out[3],4);
 const data=Buffer.from(out).toString("utf8");
 assert.match(data,/xl\/worksheets\/sheet10\.xml/);
 assert.match(data,/<sheet name="BOQ"/);
 assert.match(data,/UNVERIFIED QUANTITY TAKEOFF/);
});
