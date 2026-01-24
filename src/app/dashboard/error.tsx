"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-center">
            <div className="p-3 bg-destructive/10 rounded-full">
                <AlertCircle className="w-10 h-10 text-destructive" />
            </div>
            <div className="space-y-2">
                <h2 className="text-xl font-semibold tracking-tight">Something went wrong!</h2>
                <p className="text-muted-foreground max-w-[500px]">
                    We couldn&apos;t load your dashboard. This might be a temporary issue.
                    Please try again or contact support if the problem persists.
                </p>
            </div>
            <div className="flex items-center gap-2">
                <Button onClick={() => window.location.reload()} variant="outline">
                    Reload Page
                </Button>
                <Button onClick={() => reset()}>Try Again</Button>
            </div>
        </div>
    );
}
