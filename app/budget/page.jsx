'use client';
import React, { Suspense } from 'react';
import Budget from '../component/Budget';

export default function Page() {
  return (
    <Suspense fallback={<div className="max-w-5xl mx-auto py-12 px-4 text-slate-400 text-sm">Loading budget planner...</div>}>
      <Budget />
    </Suspense>
  );
}
