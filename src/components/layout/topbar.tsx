import { useMatchRoute, useRouter } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearSession } from "@/lib/session";
import tregoLogo from "@/static/trego1.png";

export function TopBar() {
  const router = useRouter();
  const matchRoute = useMatchRoute();
  const isDashboard = matchRoute({ to: "/dashboard" });

  const handleLogout = async () => {
    await clearSession();
    router.navigate({ to: "/login" });
  };

  const handleDashboardClick = () => {
    window.location.href = "/dashboard";
  };

  return (
    <div className="sticky top-0 z-40 h-16 border-b bg-background px-8">
      <div className="flex h-full items-center justify-between max-w-7xl mx-auto">
        {isDashboard ? (
          <button onClick={handleDashboardClick} className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            <img src={tregoLogo} alt="Trego Logo" className="h-8" />
            <h1 className="text-xl font-bold">Trego</h1>
          </button>
        ) : (
          <button onClick={handleDashboardClick} className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
            <div className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-accent">
              <ArrowLeftIcon className="h-4 w-4" />
            </div>
            <img src={tregoLogo} alt="Trego Logo" className="h-8" />
            <h1 className="text-xl font-bold">Trego</h1>
          </button>
        )}
        <Button variant="ghost" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </div>
  );
}
