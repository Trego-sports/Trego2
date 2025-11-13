import { Link } from "@tanstack/react-router";
import { AlertCircleIcon, ArrowRightIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function CompleteSetupAlert() {
  return (
    <Alert variant="warning">
      <AlertCircleIcon />
      <AlertTitle>Add your sports</AlertTitle>
      <AlertDescription>
        <p>Add at least one sport to your profile to start finding games and players.</p>
        <Link to="/profile">
          <Button variant="outline" size="sm" className="mt-3">
            Add Sports
            <ArrowRightIcon />
          </Button>
        </Link>
      </AlertDescription>
    </Alert>
  );
}
