import type {Metadata} from "next";import "./globals.css";import {Shell} from "@/components/shell";
export const metadata:Metadata={title:"TACTIC Operations Dashboard",description:"TACTIC SPORT production operations center"};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="ar" dir="rtl"><body><Shell>{children}</Shell></body></html>;}
