/**
 * Mason & Arc OS — deterministic, side-effect-free quantity and cost engine.
 * All decimal arithmetic uses BigInt fixed point (9 decimals); NEVER treat a missing quote as zero.
 * This module neither infers structural reinforcement nor selects concrete mix designs.
 */
const SCALE=1_000_000_000n;
function asFixed(value,label="value"){
  if(typeof value!=="string" && typeof value!=="number" && typeof value!=="bigint")throw new Error(label+": invalid decimal");
  const v=String(value).trim();
  if(!/^-?\d+(?:\.\d+)?$/.test(v))throw new Error(label+": invalid decimal");
  const negative=v.startsWith("-");
  const [whole,fraction=""]= (negative?v.slice(1):v).split(".");
  if(fraction.length>9 && /[^0]/.test(fraction.slice(9)))throw new Error(label+": precision above 9 decimal places");
  const n=BigInt(whole)*SCALE+BigInt((fraction.slice(0,9)+"000000000").slice(0,9));
  return negative?-n:n;
}
function mul(a,b){const p=a*b;return (p>=0n?p+SCALE/2n:p-SCALE/2n)/SCALE;}
function div(a,b){if(b===0n)throw new Error("division by zero");return (a*SCALE+b/2n)/b;}
function decimal(v,places=6){
  const factor=10n**BigInt(9-places),round=v>=0n?v+factor/2n:v-factor/2n;
  const n=round/factor;const abs=n<0n?-n:n;const whole=abs/(10n**BigInt(places));
  const frac=String(abs%(10n**BigInt(places))).padStart(places,"0");
  return (n<0n?"-":"")+String(whole)+(places?"."+frac:"");
}
function positive(v,label){const n=asFixed(v,label);if(n<0n)throw new Error(label+": must be nonnegative");return n;}
function percent(v,label){const n=positive(v,label);if(n>100n*SCALE)throw new Error(label+": over 100%");return div(n,100n*SCALE);}
export function measureQuantity({rule,count=1,length=0,width=0,height=0,deduction=0}){
  const c=positive(count,"count"),l=positive(length,"length"),w=positive(width,"width"),h=positive(height,"height"),d=positive(deduction,"deduction");
  if(!["VOLUME","AREA","LENGTH","COUNT","DIRECT"].includes(rule))throw new Error("Unsupported measurement rule");
  if((rule==="VOLUME"&&(l===0n||w===0n||h===0n))||(rule==="AREA"&&(l===0n||w===0n))||(rule==="LENGTH"&&l===0n))throw new Error("Missing measured dimensions");
  const gross=rule==="VOLUME"?mul(mul(mul(c,l),w),h):rule==="AREA"?mul(mul(c,l),w):rule==="LENGTH"?mul(c,l):c;
  if(d>gross)throw new Error("Deduction cannot exceed gross quantity");
  return {gross:decimal(gross),deduction:decimal(d),net:decimal(gross-d)};
}
export function priceBoqLine({quantity,materials=[],labor=null,equipment=null,markups={}}){
  const missing=[];let materialRate=0n;
  for(const item of materials){
    if(item.recipeApproved!==true){missing.push("recipe:"+item.code);continue;}
    if(!item.quoteId||item.unitPriceEgp==null){missing.push("material:"+item.code);continue;}
    const coefficient=positive(item.coefficient,"coefficient"),waste=percent(item.wastePercent??0,"waste percent");
    const unit=positive(item.unitPriceEgp,"unit price"),delivery=positive(item.deliveryEgpPerUnit??0,"delivery");
    materialRate+=mul(mul(coefficient,SCALE+waste),unit+delivery);
  }
  if(!labor?.quoteId||labor.rateEgp==null)missing.push("labor");
  if(!equipment?.quoteId||equipment.rateEgp==null)missing.push("equipment");
  const q=positive(quantity,"quantity");
  if(missing.length)return {status:"UNPRICED",missing,quantity:decimal(q),totalEgp:null,unitRateEgp:null};
  const directRate=materialRate+positive(labor.rateEgp,"labor rate")+positive(equipment.rateEgp,"equipment rate");
  const direct=mul(q,directRate);
  const overhead=mul(direct,percent(markups.overhead??0,"overhead"));
  const contingency=mul(direct+overhead,percent(markups.contingency??0,"contingency"));
  const profit=mul(direct+overhead+contingency,percent(markups.profit??0,"profit"));
  const tax=mul(direct+overhead+contingency+profit,percent(markups.tax??0,"tax"));
  const total=direct+overhead+contingency+profit+tax;
  return {status:"PRICED",missing:[],quantity:decimal(q),materialRateEgp:decimal(materialRate,4),directEgp:decimal(direct,2),overheadEgp:decimal(overhead,2),contingencyEgp:decimal(contingency,2),profitEgp:decimal(profit,2),taxEgp:decimal(tax,2),unitRateEgp:q===0n?"0.00":decimal(div(total,q),2),totalEgp:decimal(total,2)};
}
export function aggregateEstimate(lines){
  let sum=0n,priced=0,missing=0;
  for(const line of lines){if(line.status==="PRICED"){sum+=asFixed(line.totalEgp,"total");priced++;}else missing++;}
  return {status:missing===0?"COMPLETE":"INCOMPLETE",pricedLines:priced,unpricedLines:missing,pricedSubtotalEgp:decimal(sum,2),totalEgp:missing===0?decimal(sum,2):null};
}
