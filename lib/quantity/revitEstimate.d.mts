export type RevitMaterial={name:string;volumeM3?:number|null;areaM2?:number|null};
export type RevitElement={uniqueId:string;elementId?:number|null;category:string;categoryCode?:string;name:string;level:string;areaM2?:number|null;volumeM3?:number|null;lengthM?:number|null;materials:RevitMaterial[]};
export type RevitModel={title:string;exportedAtUtc:string;elements:RevitElement[];warnings?:string[]};
export type SystemChoice="unmapped"|"masonry"|"drywall"|"glazing"|"exclude";
export type Mapping={system:SystemChoice;plasterFaces:number;paintFaces:number;drywallFaces?:number};
export type Settings={blockLengthM:number;blockHeightM:number;jointM:number;blockWastePct:number;paintCoats:number;paintCoverageM2PerL:number;paintWastePct:number;blockPriceEGP:number;plasterPriceEGPM2:number;paintPriceEGPM2:number;drywallPriceEGPM2:number;mortarM3PerM2:number;cementBagsPerMortarM3:number;sandM3PerMortarM3:number};
export const DEFAULT_ESTIMATE_SETTINGS:Readonly<Settings>;
export function groupKey(category:string,name:string,materials:string[]):string;
export type WallGroup={key:string;category:string;name:string;materials:string[];count:number;areaM2:number;volumeM3:number;missingArea:number;levels:{level:string;areaM2:number}[]};
export type EstimatedWallGroup=WallGroup&{system:SystemChoice;plasterFaces:number;paintFaces:number;blocks:number|null;plasterAreaM2:number;paintAreaM2:number;drywallFaceAreaM2:number;mortarM3:number|null;cementBags:number|null;sandM3:number|null;paintLiters:number|null};
export type RevitEstimate={
 title:string;exportedAtUtc:string;elementCount:number;groups:EstimatedWallGroup[];
 levels:{level:string;masonryAreaM2:number;plasterAreaM2:number;paintAreaM2:number;glazingHostAreaM2:number;unmappedAreaM2:number}[];
 totals:{mappedWallAreaM2:number;unmappedWallAreaM2:number;glazingHostAreaM2:number;masonryAreaM2:number;drywallFaceAreaM2:number;blocks:number;plasterAreaM2:number;paintAreaM2:number;mortarM3:number;cementBags:number;sandM3:number;paintLiters:number};
 boq:{key:string;description:string;unit:string;quantity:number;unitPriceEGP:number|null;amountEGP:number|null;state:string}[];
 partialCostEGP:number;completeCostEstimate:boolean;missingRates:string[];status:{unmappedGroups:number;mappedGroups:number;missingAreaGroups:number;missingMaterialRates:string[]};disclaimers:string[];
};
export function wallGroups(model:RevitModel):WallGroup[];
export function calculateRevitEstimate(model:RevitModel,mappings?:Record<string,Mapping>,settings?:Partial<Settings>):RevitEstimate;
