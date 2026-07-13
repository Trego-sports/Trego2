import { createFileRoute, Outlet, redirect, useMatchRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/layout/topbar";
import { $getUserId } from "@/lib/session";

export const Route = createFileRoute("/_authed")({
  beforeLoad: async () => {
    const userId = await $getUserId();
    if (!userId) {
      throw redirect({ to: "/login" });
    }

    return { userId };
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  const matchRoute = useMatchRoute();
  const isDashboard = matchRoute({ to: "/dashboard" });

  if (isDashboard) {
    return <Outlet />;
  }

  return (
    <div>
      <TopBar />
      <main className="py-10">
        <div className="px-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
