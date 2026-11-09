import type {RevitModel,RevitEstimate} from "./revitEstimate.mjs";
export function buildRevitWorkbook(model:RevitModel,report:RevitEstimate,quality?:{issues?:{severity:string;code:string;level:string;category:string;name:string;elementId?:number|null;uniqueId?:string|null;detail:string;action:string}[]}):Uint8Array;
