import { Link } from "@tanstack/react-router";
import { CalendarIcon, CheckIcon, MapPinIcon, TrophyIcon, UsersIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { type CreateGameInput, createGameSchema } from "@/modules/games/create-game";
import { useCreateGame } from "@/modules/games/mutations";
import { skillLevelSchema, sportsSchema } from "@/modules/sports/sports";
import { useAppForm } from "./form-context";

const locations = [
  {
    name: "PAC Gym",
    latitude: 43.47207760272214,
    longitude: -80.546056,
  },
  {
    name: "CIF Gym",
    latitude: 43.474972,
    longitude: -80.548167,
  },
  {
    name: "Waterloo Tennis Club",
    latitude: 43.468919,
    longitude: -80.530799,
  },
  {
    name: "Waterloo Park",
    latitude: 43.467538,
    longitude: -80.527243,
  },
  {
    name: "Waterloo SkatePark",
    latitude: 43.46539,
    longitude: -80.533686,
  },
];

const featuredSports = sportsSchema.options.slice(0, 5);

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
      requiresAttendanceScore: false,
      minimumAttendanceScore: 80,
      allowPlayersWithoutAttendanceHistory: true,
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
      className="pb-24 md:pb-0"
    >
      <div className="space-y-6">
        <FormSection
          title="Game Details"
          description="Choose the sport and give players a clear, scannable title."
          icon={<TrophyIcon className="size-5" />}
        >
          <form.AppField name="sport">
            {(field) => (
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-[0.12em] text-[#434656]">Select Sport</Label>
                <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 md:grid md:grid-cols-5 md:overflow-visible">
                  {featuredSports.map((sport) => {
                    const isSelected = field.state.value === sport;
                    return (
                      <button
                        key={sport}
                        type="button"
                        onClick={() => field.handleChange(sport)}
                        className={cn(
                          "flex h-28 min-w-32 flex-col items-center justify-center gap-3 rounded-xl border px-4 text-center transition md:min-w-0",
                          isSelected
                            ? "border-[#0038b6] bg-[#0052ff] text-white shadow-sm"
                            : "border-[#c3c5d9] bg-white text-[#434656] hover:border-[#004ac6] hover:bg-[#eff4ff]",
                        )}
                      >
                        <TrophyIcon className="size-8" />
                        <span className="max-w-full truncate text-base font-semibold">{sport}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </form.AppField>

          <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_260px]">
            <form.AppField name="title">
              {(field) => <field.TextField label="Game Title" placeholder="e.g., Saturday morning pickup" />}
            </form.AppField>

            <form.AppField name="allowedSkillLevels">
              {(field) => (
                <field.MultiSelectField
                  label="Skill Level"
                  options={skillLevelSchema.options}
                  description="Who can join"
                />
              )}
            </form.AppField>
          </div>
        </FormSection>

        <FormSection
          title="When & Where"
          description="Set the game time and choose a saved court or field."
          icon={<CalendarIcon className="size-5" />}
        >
          <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_180px]">
            <form.AppField name="scheduledAt">{(field) => <field.DateTimeField label="Date & Time" />}</form.AppField>
            <form.AppField name="durationMinutes">
              {(field) => <field.NumberField label="Duration" description="Minutes" min={15} step={15} />}
            </form.AppField>
          </div>

          <form.Subscribe selector={(state) => state.values.locationName}>
            {(locationName) => (
              <div className="grid gap-2">
                <Label className="text-sm font-semibold text-[#0b1c30]">Location</Label>
                <Select
                  value={locationName || ""}
                  onValueChange={(value) => {
                    const selectedLocation = locations.find((loc) => loc.name === value);
                    if (selectedLocation) {
                      form.setFieldValue("locationName", selectedLocation.name);
                      form.setFieldValue("location.lat", selectedLocation.latitude.toString());
                      form.setFieldValue("location.lon", selectedLocation.longitude.toString());
                    }
                  }}
                >
                  <SelectTrigger className="h-12 w-full border-[#c3c5d9] bg-white">
                    <span className="flex min-w-0 items-center gap-2">
                      <MapPinIcon className="size-5 shrink-0 text-[#737688]" />
                      <SelectValue>{locationName || "Select a venue"}</SelectValue>
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.name} value={location.name}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Subscribe>

          <div className="hidden">
            <form.AppField name="locationName">
              {(field) => <field.TextField label="Location Name" placeholder="e.g., University Gym" />}
            </form.AppField>
            <form.AppField name="location.lat">{(field) => <field.TextField label="Latitude" />}</form.AppField>
            <form.AppField name="location.lon">{(field) => <field.TextField label="Longitude" />}</form.AppField>
          </div>

          <div className="flex h-36 items-center justify-center overflow-hidden rounded-lg border border-[#c3c5d9] bg-[#e6e8ea] md:h-48">
            <div className="text-center text-sm font-medium text-[#434656]">
              <MapPinIcon className="mx-auto mb-2 size-8 text-[#004ac6]" />
              Venue preview appears after selecting a location
            </div>
          </div>
        </FormSection>

        <FormSection
          title="Roster & Rules"
          description="Define capacity and optional attendance requirements."
          icon={<UsersIcon className="size-5" />}
        >
          <div className="grid gap-5 md:grid-cols-2">
            <form.AppField name="spotsTotal">
              {(field) => <field.NumberField label="Max Players" description="Capacity" min={2} />}
            </form.AppField>
            <div className="rounded-lg border border-dashed border-[#c3c5d9] bg-[#f8f9ff] p-4">
              <p className="text-sm font-semibold text-[#0b1c30]">Entry Fee</p>
              <p className="mt-2 text-sm text-[#434656]">Fee collection is not enabled for this game yet.</p>
            </div>
          </div>

          <div className="rounded-lg border border-[#e0e3e5] bg-white p-4">
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
                  <div className="mt-4 grid gap-4 border-t border-[#e0e3e5] pt-4 md:grid-cols-2">
                    <form.AppField name="minimumAttendanceScore">
                      {(field) => (
                        <field.NumberField label="Minimum Attendance Score" description="0 to 100" min={0} max={100} />
                      )}
                    </form.AppField>

                    <form.AppField name="allowPlayersWithoutAttendanceHistory">
                      {(field) => (
                        <field.CheckboxField
                          label="Allow new players"
                          description="Let players without score history join."
                        />
                      )}
                    </form.AppField>
                  </div>
                ) : null
              }
            </form.Subscribe>
          </div>
        </FormSection>
      </div>

      <ActionBar>
        <Link
          to="/dashboard"
          className="inline-flex h-12 items-center justify-center rounded-lg border border-[#c3c5d9] bg-white px-6 text-sm font-semibold text-[#0b1c30] transition hover:bg-[#eff4ff]"
        >
          Cancel
        </Link>
        <form.Subscribe selector={(state) => state.canSubmit}>
          {(canSubmit) => (
            <button
              type="submit"
              disabled={!canSubmit || createGame.isPending}
              className="inline-flex h-12 min-w-44 items-center justify-center gap-2 rounded-lg bg-[#004ac6] px-6 text-sm font-bold text-white shadow-sm transition hover:bg-[#0038a8] disabled:opacity-60"
            >
              <CheckIcon className="size-4" />
              {createGame.isPending ? "Creating..." : "Create Game"}
            </button>
          )}
        </form.Subscribe>
      </ActionBar>
    </form>
  );
}

function FormSection({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[#d8dadc] bg-white p-5 shadow-sm md:rounded-lg md:p-6">
      <div className="mb-5 flex items-start gap-3 border-b border-[#e0e3e5] pb-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#d3e4fe] text-[#004ac6]">
          {icon}
        </div>
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-[#0b1c30] [font-family:'Hanken_Grotesk',Inter,ui-sans-serif,sans-serif]">
            {title}
          </h2>
          <p className="mt-1 text-sm text-[#434656]">{description}</p>
        </div>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function ActionBar({ children }: { children: ReactNode }) {
  return (
    <div className="fixed right-0 bottom-0 left-0 z-40 border-t border-[#d8dadc] bg-white/95 p-4 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur md:static md:mt-8 md:border-0 md:bg-transparent md:p-0 md:shadow-none">
      <div className="mx-auto flex w-full max-w-3xl justify-end gap-3">{children}</div>
    </div>
  );
}
