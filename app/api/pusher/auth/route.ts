import { auth } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";

// Authorizes private channel subscriptions (admin only for private-admin).
export async function POST(req: Request) {
  if (!pusherServer) return new Response("Pusher not configured", { status: 400 });
  const session = await auth();
  const form = await req.formData();
  const socketId = String(form.get("socket_id") ?? "");
  const channel = String(form.get("channel_name") ?? "");

  if (channel.startsWith("private-admin")) {
    if (!session?.user || session.user.role !== "admin") {
      return new Response("Forbidden", { status: 403 });
    }
  }
  const authResponse = pusherServer.authorizeChannel(socketId, channel);
  return Response.json(authResponse);
}
