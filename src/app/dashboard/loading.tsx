export default function DashboardLoading() {
    return (
        <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-32 bg-muted rounded animate-pulse" />
                    <div className="hidden sm:flex items-center gap-1.5">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-6 w-24 bg-muted rounded-full animate-pulse" />
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-8 w-48 bg-muted rounded animate-pulse hidden sm:block" />
                    <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                    <div className="h-8 w-20 bg-muted rounded animate-pulse" />
                </div>
            </div>

            {/* Post List Skeleton */}
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 border rounded-lg bg-card space-y-3">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2 flex-1">
                                <div className="h-6 w-3/4 bg-muted rounded animate-pulse" />
                                <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
                            </div>
                            <div className="h-8 w-20 bg-muted rounded animate-pulse" />
                        </div>
                        <div className="flex items-center gap-4 pt-2">
                            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
