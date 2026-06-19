import ResearchResultsScreen from "@/components/ResearchResultsScreen";
import { Suspense } from "react";

export default function ResearchResultsPage() {
    return (
        <main>
            <Suspense fallback={
                <div className="min-h-screen bg-black text-white flex items-center justify-center font-outfit">
                    Loading...
                </div>
            }>
                <ResearchResultsScreen />
            </Suspense>
        </main>
    );
}
