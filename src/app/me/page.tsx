import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";

export default async function MePage() {
  const username = await requireUser();
  redirect(`/${username}`);
}

