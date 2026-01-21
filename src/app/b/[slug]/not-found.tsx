import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-[#f97352] flex items-center justify-center mb-6">
        <MessageSquare className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-2xl font-semibold text-zinc-900 mb-2">Board not found</h1>
      <p className="text-zinc-500 mb-8 text-center max-w-md">
        The feedback board you're looking for doesn't exist or may have been removed.
      </p>
      <Link href="/">
        <Button className="bg-[#f97352] hover:bg-[#e8634a] text-white">
          Go to Homepage
        </Button>
      </Link>
    </div>
  );
}
