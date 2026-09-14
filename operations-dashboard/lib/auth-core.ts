export const OPS_COOKIE="tactic_ops_session";

export async function tokenForPassword(password:string){
  const bytes=new TextEncoder().encode("TACTIC_OPS_V1:"+password);
  const digest=await crypto.subtle.digest("SHA-256",bytes);
  return Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,"0")).join("");
}
