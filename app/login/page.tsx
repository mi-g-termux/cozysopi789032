import { getSettings } from "@/lib/settings";
import { LoginClient } from "./LoginClient";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const s = await getSettings();
  return <LoginClient googleEnabled={s.googleAuthEnabled} />;
}
