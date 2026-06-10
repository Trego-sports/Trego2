import { useSuspenseQuery } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCancelGame, useUpdateGame } from "@/modules/games/mutations";
import { gameQueries } from "@/modules/games/queries";
import { type UpdateGameInput, updateGameSchema } from "@/modules/games/update-game";
import { skillLevelSchema } from "@/modules/sports/sports";
import { useAppForm } from "./form-context";

interface ManageGameFormProps {
  gameId: string;
}

export function ManageGameForm({ gameId }: ManageGameFormProps) {
  const { userId } = useRouteContext({ from: "/_authed" });
  const updateGame = useUpdateGame();
  const cancelGame = useCancelGame();
  const { data: existingGame } = useSuspenseQuery(gameQueries.getGame(gameId));
  const isHost = existingGame.hostId === userId;

  const form = useAppForm({
    defaultValues: {
      gameId: existingGame.id,
      title: existingGame.title,
      locationName: existingGame.locationName,
      location: { lat: existingGame.location.lat.toString(), lon: existingGame.location.lon.toString() },
      durationMinutes: existingGame.durationMinutes,
      spotsTotal: existingGame.spotsTotal,
      scheduledAt: existingGame.scheduledAt,
      allowedSkillLevels: existingGame.allowedSkillLevels,
      requiresAttendanceScore: existingGame.requiresAttendanceScore,
      minimumAttendanceScore: existingGame.minimumAttendanceScore ?? 80,
      allowPlayersWithoutAttendanceHistory: existingGame.allowPlayersWithoutAttendanceHistory,
    } as UpdateGameInput,
    validators: { onChange: updateGameSchema },
    onSubmit: async ({ value }) => {
      await updateGame.mutateAsync(value);
    },
  });

  if (!isHost) {
    return null;
  }

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this game? This action cannot be undone.")) {
      return;
    }
    await cancelGame.mutateAsync(existingGame.id);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="space-y-6"
    >
      {/* Game ID (disabled) */}
      <div className="grid gap-2">
        <Label>Game ID</Label>
        <Input value={existingGame.id} disabled className="bg-muted" />
      </div>

      {/* Sport (read-only) */}
      <div className="space-y-2">
        <Label>Sport</Label>
        <Input value={existingGame.sport} disabled className="bg-muted" />
        <p className="text-xs text-muted-foreground">Sport cannot be changed after creation</p>
      </div>

      {/* Title */}
      <form.AppField name="title">
        {(field) => <field.TextField label="Game Title" placeholder="e.g., Pickup Basketball at University Gym" />}
      </form.AppField>

      {/* Location Name */}
      <form.AppField name="locationName">
        {(field) => <field.TextField label="Location Name" placeholder="e.g., University Gym" />}
      </form.AppField>

      {/* Coordinates */}
      <div className="grid grid-cols-2 gap-4">
        <form.AppField name="location.lat">{(field) => <field.TextField label="Latitude" />}</form.AppField>
        <form.AppField name="location.lon">{(field) => <field.TextField label="Longitude" />}</form.AppField>
      </div>

      {/* Scheduled At */}
      <form.AppField name="scheduledAt">{(field) => <field.DateTimeField label="Date & Time" />}</form.AppField>

      {/* Duration */}
      <form.AppField name="durationMinutes">
        {(field) => <field.NumberField label="Duration (minutes)" description="How long will the game last?" />}
      </form.AppField>

      {/* Allowed Skill Levels */}
      <form.AppField name="allowedSkillLevels">
        {(field) => (
          <field.MultiSelectField
            label="Allowed Skill Levels"
            options={skillLevelSchema.options}
            description="Select which skill levels can join this game"
          />
        )}
      </form.AppField>

      {/* Total Spots */}
      <form.AppField name="spotsTotal">
        {(field) => <field.NumberField label="Total Spots" description="How many players can join this game?" />}
      </form.AppField>

      <div className="space-y-4 border-t pt-6">
        <form.AppField name="requiresAttendanceScore">
          {(field) => (
            <field.CheckboxField
              label="Require minimum attendance score"
              description="Restrict public joins to players who meet an attendance standard."
            />
          )}
        </form.AppField>

        <form.Subscribe selector={(state) => state.values.requiresAttendanceScore}>
          {(requiresAttendanceScore) =>
            requiresAttendanceScore ? (
              <div className="space-y-4 pl-7">
                <form.AppField name="minimumAttendanceScore">
                  {(field) => (
                    <field.NumberField
                      label="Minimum Attendance Score"
                      description="Enter a percentage from 0 to 100."
                      min={0}
                      max={100}
                    />
                  )}
                </form.AppField>

                <form.AppField name="allowPlayersWithoutAttendanceHistory">
                  {(field) => (
                    <field.CheckboxField
                      label="Allow players without attendance history"
                      description="Let new players join even if they do not have a score yet."
                    />
                  )}
                </form.AppField>
              </div>
            ) : null
          }
        </form.Subscribe>
      </div>

      <div className="flex gap-4">
        <form.Subscribe selector={(state) => state.canSubmit}>
          {(canSubmit) => (
            <Button type="submit" disabled={!canSubmit}>
              Update Game
            </Button>
          )}
        </form.Subscribe>
        <Button type="button" variant="destructive" onClick={handleCancel}>
          Cancel Game
        </Button>
      </div>
    </form>
  );
}
