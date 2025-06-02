'use client';
import dynamic from 'next/dynamic';

const PaperClient = dynamic(() => import('./PaperClient'), { ssr: false });

export default function Page() {
  return <PaperClient />;
}
