"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { signOut } from "next-auth/react";
import {
  Menu,
  LayoutDashboard,
  Upload,
  BarChart3,
  Users,
  TrendingDown,
  LogOut,
} from "lucide-react";

const teacherRoutes = [
  {
    href: "/teacher",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/teacher/upload-marks",
    label: "Upload Marks",
    icon: Upload,
  },
  {
    href: "/teacher/performance",
    label: "Performance Analytics",
    icon: BarChart3,
  },
  {
    href: "/teacher/low-performers",
    label: "Low Performers",
    icon: TrendingDown,
  },
  {
    href: "/teacher/students",
    label: "My Students",
    icon: Users,
  },
];

interface TeacherMobileNavProps {
  user: {
    name?: string | null;
    role?: string;
  };
}

export function TeacherMobileNav({ user }: TeacherMobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64">
        <SheetHeader>
          <SheetTitle className="text-left">Teacher Panel</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-1">
          {teacherRoutes.map((route) => {
            const isActive = pathname === route.href;
            const Icon = route.icon;
            return (
              <Link
                key={route.href}
                href={route.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {route.label}
              </Link>
            );
          })}
        </div>

        {/* User Info & Logout */}
        <div className="absolute bottom-4 left-4 right-4 space-y-3">
          <div className="space-y-2 border rounded-lg bg-muted/50 p-3">
            <div className="font-medium truncate text-sm">
              {user.name || "Teacher"}
            </div>
            <div className="text-muted-foreground text-xs">{user.role}</div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => signOut({ callbackUrl: "/auth" })}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
