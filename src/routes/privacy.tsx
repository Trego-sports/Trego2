import { createFileRoute, ErrorComponent, Link } from "@tanstack/react-router";
import tregoLogo from "@/static/trego1.avif";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPolicyPage,
  errorComponent: ErrorComponent,
});

const LAST_UPDATED = "June 10, 2026";
const CONTACT_EMAIL = "harryliu446@gmail.com";

function PrivacyPolicyPage() {
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
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-foreground">
          <section className="space-y-3">
            <p>
              Trego ("we", "us", or "the app") helps people organize and join recreational sports games. This Privacy
              Policy explains what information we collect, how we use it, and the choices you have. It also describes
              how we access, use, store, and share Google user data when you choose to connect Google Calendar.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Information we collect</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Account information.</strong> When you sign in with Google, we receive your name, email address,
                and profile picture to create and identify your Trego account.
              </li>
              <li>
                <strong>Profile and game data.</strong> Information you provide in the app, such as your sports, skill
                levels, location preferences, and the games you create, host, or join.
              </li>
              <li>
                <strong>Google Calendar data (optional).</strong> If you connect Google Calendar, we store an encrypted
                Google refresh token and the identifiers of calendar events that Trego creates for your games.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">How we use Google Calendar access</h2>
            <p>
              The Google Calendar integration is strictly opt-in. When you connect it, Trego requests the
              <code className="mx-1 rounded bg-muted px-1 py-0.5">https://www.googleapis.com/auth/calendar.events</code>
              scope, which we use only to:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Create a calendar event on your calendar when you host or join a game.</li>
              <li>Update that event when the game's time or details change.</li>
              <li>Delete that event when you leave a game or the game is cancelled.</li>
              <li>Add a reminder (one hour before each game) so you do not miss it.</li>
            </ul>
            <p>
              We do not read, display, or use any of your other calendar events. We only manage the specific events that
              Trego creates for games you participate in.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">How we store and protect data</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>Your Google refresh token is encrypted before it is stored.</li>
              <li>We store only the minimum data needed to provide the calendar reminder feature.</li>
              <li>Access to your data is limited to providing and improving Trego's user-facing features.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">How we share data</h2>
            <p>
              We do not sell your personal information or Google user data, and we do not use it for advertising. We do
              not transfer Google user data to third parties except as necessary to provide the service, comply with the
              law, or as part of the infrastructure (such as our hosting and database providers) that operates Trego.
            </p>
            <p>
              Trego's use and transfer of information received from Google APIs adheres to the{" "}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Your choices and control</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                You can disconnect Google Calendar at any time from your Trego profile. Disconnecting stops future sync
                and removes the Trego-created events we are tracking for you.
              </li>
              <li>You can disable automatic reminders without disconnecting from your profile settings.</li>
              <li>
                You can revoke Trego's access from your{" "}
                <a
                  href="https://myaccount.google.com/permissions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  Google Account permissions
                </a>{" "}
                page.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Data retention</h2>
            <p>
              We retain your account and game data while your account is active. Calendar integration data is retained
              until you disconnect Google Calendar or delete your account, after which it is removed.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Changes to this policy</h2>
            <p>
              We may update this Privacy Policy from time to time. If we change how we use Google user data, we will
              update this page and the "Last updated" date above.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Contact us</h2>
            <p>
              If you have questions about this Privacy Policy or your data, contact us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline">
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-12 border-t pt-6 text-sm text-muted-foreground">
          <Link to="/terms" className="text-primary underline">
            Terms of Service
          </Link>
        </div>
      </main>
    </div>
  );
}
