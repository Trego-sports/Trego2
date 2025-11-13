import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, ErrorComponent } from "@tanstack/react-router";
import { ProfileForm as ProfileFormComponent } from "@/components/forms/profile-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { userQueries } from "@/modules/profile/queries";

export const Route = createFileRoute("/_authed/profile")({
  component: ProfilePage,
  errorComponent: ErrorComponent,
  loader: async ({ context }) => {
    context.queryClient.ensureQueryData(userQueries.getMyProfile());
  },
});

function ProfilePage() {
  const { data: myProfile } = useSuspenseQuery(userQueries.getMyProfile());

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Manage your profile information and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your basic account details (name can be edited below)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            <div className="flex-1 space-y-4">
              <div>
                <p className="text-sm font-medium">Name</p>
                <p className="text-muted-foreground">{myProfile.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-muted-foreground">{myProfile.email}</p>
              </div>
            </div>
            {myProfile.profilePictureUrl && (
              <div className="shrink-0">
                <img src={myProfile.profilePictureUrl} alt={myProfile.name} className="size-24 object-cover" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Linked Accounts</CardTitle>
          <CardDescription>Accounts connected to your profile</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {myProfile.oauthAccounts.map((account) => (
              <div key={account.providerId} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center border">
                    <span className="text-xs font-medium uppercase">{account.providerId.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium capitalize">{account.providerId}</p>
                    <p className="text-xs text-muted-foreground">Connected</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>Update your name, location and sports preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileFormComponent />
        </CardContent>
      </Card>
    </div>
  );
}
