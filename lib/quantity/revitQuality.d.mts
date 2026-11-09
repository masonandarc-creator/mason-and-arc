export type RevitMaterial={name:string;volumeM3?:number|null;areaM2?:number|null};
export type RevitQaElement={uniqueId:string;elementId?:number|null;category:string;categoryCode?:string;name:string;level:string;volumeM3?:number|null;areaM2?:number|null;lengthM?:number|null;materials:RevitMaterial[]};
export type RevitQaModel={title:string;warnings:string[];elements:RevitQaElement[]};
export type ReviewIssue={code:string;severity:"review"|"info";uniqueId:string|null;elementId:number|null;category:string;level:string;name:string;detail:string;action:string};
export type RevitQaSummary={
 elementCount:number;
 categoryTotals:{category:string;count:number;volumeM3:number;areaM2:number;lengthM:number;missingVolume:number;missingArea:number}[];
 materialTotals:{name:string;count:number;volumeM3:number;areaM2:number}[];
 warningCount:number;notice:string;
 quality:{status:"REQUIRES_REVIEW"|"INFORMATIONAL_GAPS"|"PRELIMINARY";reviewCount:number;infoCount:number;issues:ReviewIssue[];omittedIssueCount:number;
  details:{missingMaterialElements:number;missingVolumeElements:number;unmeasuredStairs:number;glazingHostsWithoutMaterials:number;curtainPanels:number;curtainMullions:number;thicknessReview:number;oversizedFloors:number};
  reviewHints:string};
};
export function summarizeRevitModel(model:RevitQaModel,options?:{maxIssues?:number}):RevitQaSummary;
