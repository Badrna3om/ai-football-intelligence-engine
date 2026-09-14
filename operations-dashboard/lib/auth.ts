import "server-only";
import {cookies} from "next/headers";
import {OPS_COOKIE,tokenForPassword} from "./auth-core";

export function authEnabled(){
  return Boolean(process.env.TACTIC_DASHBOARD_PASSWORD);
}

export async function isOperator(){
  const password=process.env.TACTIC_DASHBOARD_PASSWORD;
  if(!password) return false;
  const store=await cookies();
  const token=store.get(OPS_COOKIE)?.value;
  if(!token) return false;
  return token===await tokenForPassword(password);
}

export async function requireOperator(){
  if(!process.env.TACTIC_DASHBOARD_PASSWORD){
    throw new Error("Dashboard actions are locked. Add TACTIC_DASHBOARD_PASSWORD in Vercel.");
  }
  if(!(await isOperator())) throw new Error("Unauthorized operator action.");
}
