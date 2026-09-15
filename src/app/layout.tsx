import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Portal Resmi BPKP Perwakilan Provinsi Jawa Barat",
  description:
    "Badan Pengawasan Keuangan dan Pembangunan (BPKP) Perwakilan Provinsi Jawa Barat - Mengawal Akuntabilitas Keuangan dan Pembangunan Daerah.",
  keywords: [
    "BPKP",
    "BPKP Jabar",
    "BPKP Jawa Barat",
    "Pengawasan Keuangan",
    "SPIP",
    "APIP",
    "SIMDA",
    "FMIS",
    "WBS BPKP"
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 font-sans">
        <Navbar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
