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
    <div className="min-h-screen bg-[#eff4ff] text-[#0b1c30] [font-family:Inter,ui-sans-serif,system-ui,sans-serif]">
      <TopBar />
      <main className="py-8 md:py-10">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
