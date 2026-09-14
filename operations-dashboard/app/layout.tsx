import type {Metadata,Viewport} from "next";
import "./globals.css";
import {Shell} from "@/components/shell";
import {PwaRegister} from "@/components/pwa-register";

export const metadata:Metadata={
  title:"TACTIC Operations Dashboard",
  description:"TACTIC SPORT production operations center",
  manifest:"/manifest.webmanifest",
  applicationName:"TACTIC Ops",
  appleWebApp:{
    capable:true,
    title:"TACTIC Ops",
    statusBarStyle:"black-translucent"
  },
  icons:{
    icon:"/icons/tactic.svg",
    apple:"/icons/tactic.svg"
  }
};

export const viewport:Viewport={
  themeColor:"#08090b",
  colorScheme:"dark",
  viewportFit:"cover"
};

export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){
  return <html lang="ar" dir="rtl">
    <body>
      <PwaRegister/>
      <Shell>{children}</Shell>
    </body>
  </html>;
}
