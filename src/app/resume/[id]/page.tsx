import { Suspense } from "react";
import ResumeDetailClient from "./ResumeDetailClient";

export default function ResumePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-600">
          Loading…
        </div>
      }
    >
      <ResumeDetailClient />
    </Suspense>
  );
}
