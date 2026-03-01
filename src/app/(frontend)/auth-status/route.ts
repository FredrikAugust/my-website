import config from "@payload-config";
import { getPayload } from "payload";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: request.headers });

  return Response.json(
    { authenticated: Boolean(user) },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
