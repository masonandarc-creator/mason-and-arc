export type DecimalInput = string | number | bigint;
export type MeasureRule = "VOLUME"|"AREA"|"LENGTH"|"COUNT"|"DIRECT";
export function measureQuantity(input:{rule:MeasureRule;count?:DecimalInput;length?:DecimalInput;width?:DecimalInput;height?:DecimalInput;deduction?:DecimalInput}):{gross:string;deduction:string;net:string};
export type BoqMaterial = {code:string;coefficient:DecimalInput;wastePercent?:DecimalInput;recipeApproved:boolean;quoteId?:string|null;unitPriceEgp?:DecimalInput|null;deliveryEgpPerUnit?:DecimalInput|null};
export type Rate = {quoteId:string|null;rateEgp:DecimalInput|null};
export type PricedLine = {status:"PRICED";missing:string[];quantity:string;materialRateEgp:string;directEgp:string;overheadEgp:string;contingencyEgp:string;profitEgp:string;taxEgp:string;unitRateEgp:string;totalEgp:string};
export type UnpricedLine = {status:"UNPRICED";missing:string[];quantity:string;unitRateEgp:null;totalEgp:null};
export function priceBoqLine(input:{quantity:DecimalInput;materials?:BoqMaterial[];labor?:Rate|null;equipment?:Rate|null;markups?:{overhead?:DecimalInput;contingency?:DecimalInput;profit?:DecimalInput;tax?:DecimalInput}}):PricedLine|UnpricedLine;
export function aggregateEstimate(lines:Array<PricedLine|UnpricedLine>):{status:"COMPLETE"|"INCOMPLETE";pricedLines:number;unpricedLines:number;pricedSubtotalEgp:string;totalEgp:string|null};
