"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

function PlannerLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-600" />
    </div>
  );
}

const PlannerApp = dynamic(() => import("./planner-app"), {
  ssr: false,
  loading: PlannerLoading,
});

export default function Home() {
  return (
    <Suspense fallback={<PlannerLoading />}>
      <PlannerApp />
    </Suspense>
  );
}