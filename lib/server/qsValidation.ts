import { NextResponse } from "next/server";
export function handleQsError(error:unknown){
 const message=error instanceof Error?error.message:"";
 if(message==="UNAUTHENTICATED")return NextResponse.json({error:"Authentication required."},{status:401});
 if(message==="FORBIDDEN")return NextResponse.json({error:"Insufficient permissions."},{status:403});
 if(message.startsWith("VALIDATION:"))return NextResponse.json({error:message.slice(11)},{status:400});
 const code=(error as {code?:string})?.code;
 if(code==="23505")return NextResponse.json({error:"This code already exists."},{status:409});
 if(code==="23503")return NextResponse.json({error:"Referenced record does not exist."},{status:400});
 console.error("Cost Control request failed",error);
 return NextResponse.json({error:"Cost Control request failed. Check that the database migration has been applied."},{status:500});
}
export function boundedText(v:unknown,max=160){return typeof v==="string"?v.trim().slice(0,max):"";}
export function requiredText(v:unknown,label:string,max=160){const s=boundedText(v,max);if(!s)throw new Error("VALIDATION:"+label+" is required");return s;}
export function nonnegative(v:unknown,label:string,max=1e12){
 const n=Number(v);if(!Number.isFinite(n)||n<0||n>max)throw new Error("VALIDATION:Invalid "+label);return n;
}
export function positive(v:unknown,label:string,max=1e12){const n=nonnegative(v,label,max);if(n<=0)throw new Error("VALIDATION:"+label+" must be positive");return n;}
export function validDate(v:unknown,label:string){
 const s=requiredText(v,label,10);if(!/^\d{4}-\d{2}-\d{2}$/.test(s)||!Number.isFinite(Date.parse(s)))throw new Error("VALIDATION:Invalid "+label);return s;
}
