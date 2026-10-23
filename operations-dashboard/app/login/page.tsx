import {redirect} from "next/navigation";
import {authEnabled,isOperator} from "@/lib/auth";
import {loginAction} from "@/app/actions";

export default async function LoginPage({searchParams}:{searchParams:Promise<{error?:string}>}){
  if(!authEnabled()) redirect("/");
  if(await isOperator()) redirect("/");
  const p=await searchParams;
  return <main className="login-screen">
    <section className="login-card">
      <div className="brand-mark">T</div>
      <span className="eyebrow">TACTIC / BESKOT</span>
      <h1>دخول مركز العمليات</h1>
      <p>الوصول محمي بكلمة مرور المشغل.</p>
      <form action={loginAction}>
        <input type="password" name="password" placeholder="كلمة المرور" autoComplete="current-password" required/>
        {p.error?<small className="login-error">كلمة المرور غير صحيحة.</small>:null}
        <button className="primary-button" type="submit">دخول</button>
      </form>
    </section>
  </main>;
}
