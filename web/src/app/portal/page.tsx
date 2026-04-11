import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/supabase/auth";

export default async function PortalIndexPage() {
  const user = await getSessionUser();
  if (user) {
    redirect("/portal/dashboard");
  }
  redirect("/portal/login");
}
