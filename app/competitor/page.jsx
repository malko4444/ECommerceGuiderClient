'use client';
import React, { Suspense } from 'react';
import Competitor from '../component/Competitor';

export default function Page() {
  return (
    <Suspense fallback={<div className="max-w-6xl mx-auto py-12 px-4 text-slate-400 text-sm">Loading competitor analysis...</div>}>
      <Competitor />
    </Suspense>
  );
}
