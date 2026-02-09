import { redirect } from "next/navigation";

export default function RootPage() {
  // Redirect directly to budget tracker
  redirect("/budget");
}
