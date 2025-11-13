import { Link, useMatchRoute, useRouter } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearSession } from "@/lib/session";

export function TopBar() {
  const router = useRouter();
  const matchRoute = useMatchRoute();
  const isDashboard = matchRoute({ to: "/dashboard" });

  const handleLogout = async () => {
    await clearSession();
    router.navigate({ to: "/login" });
  };

  return (
    <div className="sticky top-0 z-40 h-16 border-b bg-background px-8">
      <div className="flex h-full items-center justify-between max-w-7xl mx-auto">
        {isDashboard ? (
          <Link to="/dashboard" className="flex items-center">
            <h1 className="text-xl font-bold">Trego</h1>
          </Link>
        ) : (
          <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-accent">
              <ArrowLeftIcon className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-bold">Trego</h1>
          </Link>
        )}
        <Button variant="ghost" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </div>
  );
}
