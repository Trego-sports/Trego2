import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppFooter } from "@/components/layout/site-footer";
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
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <main className="flex-1 py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
