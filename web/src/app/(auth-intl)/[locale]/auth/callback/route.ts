import { handleAuthCallbackGet } from "@/lib/auth/handleAuthCallback";

export async function GET(request: Request) {
  return handleAuthCallbackGet(request);
}
