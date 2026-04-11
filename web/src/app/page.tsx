import { redirect } from "next/navigation";

/** next-intl uses locale-prefixed routes; send bare `/` to the default locale. */
export default function RootPage() {
  redirect("/fr");
}
