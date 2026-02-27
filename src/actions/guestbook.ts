"use server";

import { sendGuestbookNotification } from "@/lib/email";
import { verifyTurnstile } from "@/lib/turnstile";
import config from "@payload-config";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getPayload } from "payload";

export async function postComment(formData: FormData) {
  const token = formData.get("cf-turnstile-response") as string;
  const name = (formData.get("name") as string)?.trim();
  const message = (formData.get("comment") as string)?.trim();

  if (!name || name.length > 100) throw new Error("Invalid name");
  if (!message || message.length > 1000) throw new Error("Invalid message");

  const valid = await verifyTurnstile(token);
  if (!valid) throw new Error("Turnstile verification failed");

  const payload = await getPayload({ config });
  await payload.create({
    collection: "guestbook-entry",
    data: { name, message },
    overrideAccess: true,
  });

  sendGuestbookNotification(name, message).catch(() => {});

  revalidatePath("/");
  redirect("/");
}

export async function deleteComment(formData: FormData) {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) throw new Error("Unauthorized");

  const commentId = formData.get("comment_id") as string;
  if (!commentId) throw new Error("Missing comment ID");

  await payload.delete({
    collection: "guestbook-entry",
    id: commentId,
  });

  revalidatePath("/");
  redirect("/");
}
