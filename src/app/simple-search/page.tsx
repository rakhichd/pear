import { Suspense } from "react";
import SimpleSearchClient from "./SimpleSearchClient";

export default function SimpleSearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-600">
          Loading…
        </div>
      }
    >
      <SimpleSearchClient />
    </Suspense>
  );
}
