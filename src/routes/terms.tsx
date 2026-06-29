import { createFileRoute, ErrorComponent, Link } from "@tanstack/react-router";
import { MarketingFooter } from "@/components/layout/site-footer";
import tregoLogo from "@/static/trego1.avif";

export const Route = createFileRoute("/terms")({
  component: TermsOfServicePage,
  errorComponent: ErrorComponent,
});

const LAST_UPDATED = "June 10, 2026";
const CONTACT_EMAIL = "harryliu446@gmail.com";

function TermsOfServicePage() {
  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <img src={tregoLogo} alt="Trego Logo" className="h-8" />
            <span className="text-xl font-bold">Trego</span>
          </Link>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-foreground">
          <section className="space-y-3">
            <p>
              These Terms of Service ("Terms") govern your use of Trego ("the app"). By creating an account or using the
              app, you agree to these Terms. Trego is provided as a project to help people organize and join
              recreational sports games.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Using Trego</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>You must sign in with a valid Google account to use the app.</li>
              <li>You are responsible for the activity that occurs under your account.</li>
              <li>
                You agree to provide accurate information about the games you create and to use the app for its intended
                purpose of organizing sports activities.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Acceptable use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Harass, abuse, or harm other users.</li>
              <li>Post false, misleading, or inappropriate content.</li>
              <li>Attempt to disrupt, reverse engineer, or gain unauthorized access to the app or its systems.</li>
              <li>Use the app for any unlawful purpose.</li>
            </ul>
            <p>
              We may suspend or remove accounts that violate these Terms or that negatively affect other users or the
              service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Games and scheduling</h2>
            <p>
              Trego helps coordinate games but does not guarantee that any game will take place, that participants will
              attend, or that venues will be available. You participate in games at your own discretion and risk.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Third-party services</h2>
            <p>
              Trego integrates with third-party services such as Google Sign-In and Google Calendar. Your use of those
              services is also subject to their respective terms and policies. See our{" "}
              <Link to="/privacy" className="text-primary underline">
                Privacy Policy
              </Link>{" "}
              for details on how we handle data from these services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Disclaimer and limitation of liability</h2>
            <p>
              The app is provided "as is" and "as available" without warranties of any kind. To the maximum extent
              permitted by law, we are not liable for any damages arising from your use of, or inability to use, the
              app.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Changes to the service and these Terms</h2>
            <p>
              We may modify, suspend, or discontinue the app at any time. We may also update these Terms from time to
              time, and will update the "Last updated" date above when we do.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Contact us</h2>
            <p>
              If you have questions about these Terms, contact us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline">
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-12 border-t pt-6 text-sm text-muted-foreground">
          <Link to="/privacy" className="text-primary underline">
            Privacy Policy
          </Link>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
