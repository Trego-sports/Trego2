import { Link } from "@tanstack/react-router";
import { UserCircleIcon, XIcon } from "lucide-react";

export function CompleteSetupAlert() {
  return (
    <section className="rounded-lg border border-[#c3c6d7] bg-[#d3e4fe] p-4 shadow-[0_2px_4px_rgba(15,23,42,0.05)] md:max-w-xl">
      <div className="flex items-start gap-3">
        <UserCircleIcon className="mt-0.5 size-5 shrink-0 text-[#004ac6]" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold tracking-[0.05em] text-[#0b1c30]">Complete your profile</h2>
              <p className="mt-1 text-xs leading-5 text-[#434655]">
                Add your preferred sports to get better game recommendations.
              </p>
            </div>
            <button
              type="button"
              aria-label="Dismiss profile setup reminder"
              className="rounded-md p-1 text-[#0b1c30] transition hover:bg-white/50"
            >
              <XIcon className="size-4" />
            </button>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#eaf1ff]">
            <div className="h-full w-2/5 rounded-full bg-[#004ac6]" />
          </div>
          <Link to="/profile" className="mt-3 inline-flex text-xs font-semibold text-[#004ac6] hover:underline">
            Edit Profile
          </Link>
        </div>
      </div>
    </section>
  );
}
