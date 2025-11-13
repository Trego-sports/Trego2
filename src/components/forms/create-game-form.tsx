import { Button } from "@/components/ui/button";
import { type CreateGameInput, createGameSchema } from "@/modules/games/create-game";
import { useCreateGame } from "@/modules/games/mutations";
import { skillLevelSchema, sportsSchema } from "@/modules/sports/sports";
import { useAppForm } from "./form-context";

export function CreateGameForm() {
  const createGame = useCreateGame();

  const form = useAppForm({
    defaultValues: {
      sport: "Basketball",
      title: "",
      locationName: "",
      location: { lat: "", lon: "" },
      scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      durationMinutes: 90,
      allowedSkillLevels: skillLevelSchema.options,
      spotsTotal: 10,
    } as CreateGameInput,
    validators: { onChange: createGameSchema },
    onSubmit: async ({ value }) => {
      await createGame.mutateAsync(value);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="space-y-6"
    >
      {/* Sport */}
      <form.AppField name="sport">
        {(field) => <field.SelectField label="Sport" options={sportsSchema.options} />}
      </form.AppField>

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
        <form.AppField name="location.lat">
          {(field) => <field.TextField label="Latitude" placeholder="37.7749" />}
        </form.AppField>

        <form.AppField name="location.lon">
          {(field) => <field.TextField label="Longitude" placeholder="-122.4194" />}
        </form.AppField>
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

      <div className="flex gap-4">
        <form.Subscribe selector={(state) => state.canSubmit}>
          {(canSubmit) => (
            <Button type="submit" disabled={!canSubmit}>
              Create Game
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
