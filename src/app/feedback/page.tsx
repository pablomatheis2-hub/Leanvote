import { redirect } from "next/navigation";

// Redirect to dashboard - users now have their own boards
export default function FeedbackPage() {
  redirect("/dashboard");
}
