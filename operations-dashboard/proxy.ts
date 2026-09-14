import {NextRequest,NextResponse} from "next/server";
import {OPS_COOKIE,tokenForPassword} from "./lib/auth-core";

export async function proxy(request:NextRequest){
  const password=process.env.TACTIC_DASHBOARD_PASSWORD;
  if(!password) return NextResponse.next();

  const path=request.nextUrl.pathname;
  if(
    path==="/login" ||
    path==="/manifest.webmanifest" ||
    path==="/sw.js" ||
    path.startsWith("/icons/") ||
    path.startsWith("/_next/")
  ) return NextResponse.next();

  const token=request.cookies.get(OPS_COOKIE)?.value;
  if(token===await tokenForPassword(password)) return NextResponse.next();

  const login=request.nextUrl.clone();
  login.pathname="/login";
  login.search="";
  return NextResponse.redirect(login);
}

export const config={
  matcher:["/((?!_next/static|_next/image|favicon.ico).*)"]
};
