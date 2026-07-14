import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { UserIcon, UserPlusIcon, UsersIcon } from "lucide-react";
import { userQueries } from "@/modules/profile/queries";

export function MyFriendsCard() {
  const { data: friends } = useSuspenseQuery(userQueries.getMyFriends());

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold leading-8 text-[#0b1c30] [font-family:'Hanken_Grotesk',Inter,ui-sans-serif,sans-serif]">
          Friends
        </h2>
        <Link to="/profile" className="text-sm font-semibold text-[#004ac6]">
          Find Friends
        </Link>
      </div>

      {friends.length > 0 ? (
        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-[#e5eeff] md:rounded-lg md:border md:border-[#c3c6d7] md:ring-0">
          <div className="space-y-3">
            {friends.map((friend) => (
              <Link
                key={friend.userId}
                to="/users/$userId"
                params={{ userId: friend.userId }}
                className="flex items-center gap-3 rounded-lg border border-[#e5eeff] bg-[#f8f9ff] p-3 transition hover:bg-[#eff4ff]"
              >
                <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e5eeff] text-[#004ac6]">
                  {friend.profilePictureUrl ? (
                    <img src={friend.profilePictureUrl} alt={friend.name} className="size-full object-cover" />
                  ) : (
                    <UserIcon className="size-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-bold text-[#0b1c30]">{friend.name}</h3>
                  <p className="mt-0.5 text-xs text-[#434655]">
                    {friend.gamesTogether} {friend.gamesTogether === 1 ? "game" : "games"} together
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm ring-1 ring-[#e5eeff] md:rounded-lg md:border md:border-[#c3c6d7] md:ring-0">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#e5eeff] text-[#004ac6]">
            <UsersIcon className="size-8" />
          </div>
          <h3 className="mt-5 text-base font-bold text-[#0b1c30]">Build your squad</h3>
          <p className="mx-auto mt-2 max-w-xs text-xs leading-5 text-[#434655]">
            Connect with friends to easily invite them to games and see what they're playing.
          </p>
          <Link
            to="/profile"
            className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#004ac6] px-5 text-sm font-semibold text-white"
          >
            <UserPlusIcon className="size-4" />
            Invite Friends
          </Link>
        </div>
      )}
    </section>
  );
}
