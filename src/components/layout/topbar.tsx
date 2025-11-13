import { Link, useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { clearSession } from "@/lib/session";

export function TopBar() {
  const router = useRouter();

  const handleLogout = async () => {
    await clearSession();
    router.navigate({ to: "/login" });
  };

  return (
    <div className="sticky top-0 z-40 h-16 border-b bg-background px-8">
      <div className="flex h-full items-center justify-between max-w-7xl mx-auto">
        <Link to="/dashboard" className="flex items-center">
          <h1 className="text-xl font-bold">Trego</h1>
        </Link>
        <Button variant="ghost" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </div>
  );
}
