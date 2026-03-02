"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";

export function FooterAuthLink() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch("/auth-status", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { authenticated: false }))
      .then((data: { authenticated?: boolean }) => {
        if (!cancelled) {
          setIsLoggedIn(Boolean(data.authenticated));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIsLoggedIn(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoggedIn) {
    return (
      <Button variant="ghost" size="sm" className="h-auto p-0 text-xs" asChild>
        <Link href="/admin">Admin</Link>
      </Button>
    );
  }

  return (
    <Button variant="ghost" size="sm" className="h-auto p-0 text-xs" asChild>
      <Link href="/login">Login</Link>
    </Button>
  );
}
