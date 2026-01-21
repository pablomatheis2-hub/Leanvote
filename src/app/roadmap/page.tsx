import { redirect } from "next/navigation";

// Redirect to dashboard roadmap
export default function RoadmapPage() {
  redirect("/dashboard/roadmap");
}
