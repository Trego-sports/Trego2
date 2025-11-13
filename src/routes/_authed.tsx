import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
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
