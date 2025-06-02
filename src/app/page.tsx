'use client';
import dynamic from "next/dynamic";
const PaperPage = dynamic(() => import('./paper/page'), { ssr: false });

export default function Home() {

  return <PaperPage />;
}
