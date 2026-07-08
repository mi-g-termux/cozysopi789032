import { getSettings } from "@/lib/settings";
import { RegisterClient } from "./RegisterClient";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const s = await getSettings();
  return <RegisterClient googleEnabled={s.googleAuthEnabled} />;
}
