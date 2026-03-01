"use client";

import { deleteComment } from "@/actions/guestbook";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/time";
import type { GuestbookEntry } from "@/payload-types";
import { useEffect, useState } from "react";

type Props = {
  entries: Array<Pick<GuestbookEntry, "id" | "name" | "message" | "createdAt">>;
};

export function GuestbookEntries({ entries }: Props) {
  const [canDelete, setCanDelete] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch("/auth-status", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { authenticated: false }))
      .then((data: { authenticated?: boolean }) => {
        if (!cancelled) setCanDelete(Boolean(data.authenticated));
      })
      .catch(() => {
        if (!cancelled) setCanDelete(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col gap-1.5">
      {entries.map((entry) => (
        <div key={entry.id} className="text-sm">
          <div className="flex gap-1 items-center flex-wrap">
            <span className="font-bold">{entry.name}</span>
            <small
              className="text-sm leading-none font-medium text-muted-foreground"
              title={new Date(entry.createdAt).toISOString()}
            >
              {timeAgo(entry.createdAt)}
            </small>
            {canDelete && (
              <form action={deleteComment}>
                <input type="hidden" name="comment_id" value={entry.id} />
                <Button type="submit" variant="destructive" size="xs">
                  Delete
                </Button>
              </form>
            )}
          </div>
          <span className="whitespace-pre-wrap">{entry.message}</span>
        </div>
      ))}
    </div>
  );
}
