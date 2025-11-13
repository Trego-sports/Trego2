import { useMutation } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { $loginWithGoogle } from "@/lib/auth/google";
import { $getUserId } from "@/lib/session";
import googleLogo from "@/static/google-logo.svg";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  beforeLoad: async () => {
    const userId = await $getUserId();
    if (userId) {
      throw redirect({ to: "/dashboard" });
    }
  },
});

function LoginPage() {
  const loginWithGoogle = useServerFn($loginWithGoogle);
  const googleLoginMutation = useMutation({
    mutationFn: loginWithGoogle,
    onSuccess: (data) => {
      window.location.href = data.redirectUrl;
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome to Trego</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" size="lg" variant="outline" onClick={() => googleLoginMutation.mutate({})}>
            <img src={googleLogo} alt="Google logo" className="mr-2 size-5" />
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
