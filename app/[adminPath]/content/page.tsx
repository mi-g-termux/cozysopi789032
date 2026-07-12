import { getSettings } from "@/lib/settings";
import { normalizeContent } from "@/lib/site-content";
import { ContentAdmin } from "./ContentAdmin";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const s = await getSettings();
  const content = normalizeContent(s);
  return <ContentAdmin initial={content} />;
}
