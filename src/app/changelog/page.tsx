import { redirect } from "next/navigation";

// Redirect to dashboard - changelog is now per-board
export default function ChangelogPage() {
  redirect("/dashboard");
}
