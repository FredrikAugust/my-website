"use client";

import { logoutAction } from "@/actions/login";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
];

export function Navbar({ isLoggedIn }: { isLoggedIn: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="flex items-center py-3 font-sans">
      <div className="flex items-center gap-1">
        {links.map(({ href, label }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Button key={href} variant={isActive ? "secondary" : "ghost"} size="sm" asChild>
              <Link href={href}>{label}</Link>
            </Button>
          );
        })}
      </div>
      {isLoggedIn ? (
        <form action={logoutAction} className="ml-auto">
          <Button variant="ghost" size="sm" type="submit">
            Sign out
          </Button>
        </form>
      ) : (
        <Button
          variant={pathname === "/login" ? "secondary" : "ghost"}
          size="sm"
          className="ml-auto"
          asChild
        >
          <Link href="/login">Login</Link>
        </Button>
      )}
    </nav>
  );
}
