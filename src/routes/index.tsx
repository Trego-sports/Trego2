import { createFileRoute, ErrorComponent, Link } from "@tanstack/react-router";
import {
  BellIcon,
  CalendarIcon,
  ChevronRightIcon,
  MapPinIcon,
  SparklesIcon,
  TrophyIcon,
  UsersIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import tregoLogo from "@/static/trego1.png";

export const Route = createFileRoute("/")({
  component: HomePage,
  errorComponent: ErrorComponent,
});

function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="border-b bg-gradient-to-b from-background to-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-32">
          <div className="text-center space-y-6">
            <div className="flex justify-center mb-6">
              <img src={tregoLogo} alt="Trego Logo" className="h-24 md:h-32" />
            </div>
            <div className="inline-block px-4 py-1.5 bg-primary/10 border border-primary/20 mb-4">
              <span className="text-sm font-medium text-primary">Connect. Play. Repeat.</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Organize sports games
              <br />
              <span className="text-primary">with your friends</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Trego makes it easy to create, join, and manage sports games with your community. Find players, set up
              games, and never miss a match.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link to="/login">
                <Button size="lg" className="text-base px-8">
                  Get Started
                  <ChevronRightIcon />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="text-base px-8">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">Everything you need to play</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple, powerful tools to organize your sports activities
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center border bg-primary/5">
                  <CalendarIcon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Easy Scheduling</CardTitle>
                <CardDescription>
                  Create games in seconds with smart date and time pickers. Sync with your calendar automatically.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center border bg-primary/5">
                  <UsersIcon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Player Management</CardTitle>
                <CardDescription>
                  Track who's joining, manage spots, and keep everyone informed about game updates.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center border bg-primary/5">
                  <MapPinIcon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Location Sharing</CardTitle>
                <CardDescription>
                  Add venues, share locations, and get directions to games with integrated maps support.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center border bg-primary/5">
                  <SparklesIcon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Smart Recommendations</CardTitle>
                <CardDescription>
                  Discover new games based on your sports preferences and connect with nearby players.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center border bg-primary/5">
                  <BellIcon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Stay Updated</CardTitle>
                <CardDescription>
                  Get notified about game changes, new players joining, and upcoming matches you're part of.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center border bg-primary/5">
                  <TrophyIcon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Track Your Activity</CardTitle>
                <CardDescription>
                  View your game history, track the sports you play, and see your involvement over time.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-28 bg-muted/30 border-y">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">How it works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Three simple steps to get in the game</p>
          </div>

          <div className="grid gap-12 md:grid-cols-3">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 border-2 border-primary flex items-center justify-center bg-primary/5">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold">Create Your Profile</h3>
              <p className="text-muted-foreground">
                Sign up and add your favorite sports, location, and availability preferences.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 border-2 border-primary flex items-center justify-center bg-primary/5">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold">Find or Create Games</h3>
              <p className="text-muted-foreground">
                Browse recommended games near you or create your own and invite players.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 border-2 border-primary flex items-center justify-center bg-primary/5">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold">Play & Connect</h3>
              <p className="text-muted-foreground">Show up and play! Build your community and make every game count.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-6">
          <Card className="border-2 border-primary/20">
            <CardContent className="py-16 text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">Ready to get started?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join Trego today and start organizing games with your friends. It's free and takes less than a minute.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link to="/login">
                  <Button size="lg" className="text-base px-8">
                    Create Account
                    <ChevronRightIcon />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left flex items-center gap-3">
              <img src={tregoLogo} alt="Trego Logo" className="h-8" />
              <div>
                <p className="text-2xl font-bold">Trego</p>
                <p className="text-sm text-muted-foreground">Organize sports games with your friends</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-muted-foreground">© 2025 Trego. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
