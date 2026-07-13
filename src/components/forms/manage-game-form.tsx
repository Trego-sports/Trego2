import { useSuspenseQuery } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import { CalendarIcon, CheckIcon, SettingsIcon, ShieldAlertIcon, TrophyIcon } from "lucide-react";
import { type ReactNode, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const [cancelOpen, setCancelOpen] = useState(false);
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
    await cancelGame.mutateAsync(existingGame.id);
    setCancelOpen(false);
  };

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="space-y-6 pb-24"
      >
        <FormSection title="Game Details" icon={<TrophyIcon className="size-5" />}>
          <div className="grid gap-5">
            <div className="grid gap-2">
              <Label className="text-sm font-semibold text-[#0b1c30]">Sport</Label>
              <div className="flex h-12 items-center gap-2 rounded-lg border border-[#c3c5d9] bg-[#f8f9ff] px-3 text-sm font-semibold text-[#434656]">
                <TrophyIcon className="size-5 text-[#004ac6]" />
                {existingGame.sport}
                <span className="ml-auto text-xs font-medium text-[#737688]">Locked</span>
              </div>
            </div>

            <form.AppField name="title">
              {(field) => <field.TextField label="Title" placeholder="e.g., Saturday morning pickup" />}
            </form.AppField>

            <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_180px]">
              <form.AppField name="scheduledAt">{(field) => <field.DateTimeField label="Date & Time" />}</form.AppField>
              <form.AppField name="durationMinutes">
                {(field) => <field.NumberField label="Duration" description="Minutes" min={15} step={15} />}
              </form.AppField>
            </div>

            <form.AppField name="locationName">
              {(field) => <field.TextField label="Location" placeholder="e.g., Downtown Rec Center" />}
            </form.AppField>

            <div className="hidden">
              <form.AppField name="location.lat">{(field) => <field.TextField label="Latitude" />}</form.AppField>
              <form.AppField name="location.lon">{(field) => <field.TextField label="Longitude" />}</form.AppField>
            </div>
          </div>
        </FormSection>

        <FormSection title="Settings & Limits" icon={<SettingsIcon className="size-5" />}>
          <div className="grid gap-5 md:grid-cols-2">
            <form.AppField name="spotsTotal">
              {(field) => <field.NumberField label="Player Limit" description="Maximum players allowed" min={2} />}
            </form.AppField>

            <form.AppField name="allowedSkillLevels">
              {(field) => (
                <field.MultiSelectField
                  label="Allowed Skill Levels"
                  options={skillLevelSchema.options}
                  description="Who can join"
                />
              )}
            </form.AppField>
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
                          label="Allow players without history"
                          description="Let new players join before they have a score."
                        />
                      )}
                    </form.AppField>
                  </div>
                ) : null
              }
            </form.Subscribe>
          </div>
        </FormSection>

        <section className="rounded-xl border border-[#ffb4ab] bg-[#fff7f6] p-5 shadow-sm md:rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#ffdad6] text-[#93000a]">
              <ShieldAlertIcon className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-[#93000a]">Danger Zone</h2>
              <p className="mt-1 text-sm text-[#38485d]">Canceling this game notifies players and cannot be undone.</p>
              <button
                type="button"
                onClick={() => setCancelOpen(true)}
                className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-lg border border-[#ba1a1a] bg-white px-4 text-sm font-bold text-[#ba1a1a] transition hover:bg-[#ffdad6] md:w-auto"
              >
                Cancel Game
              </button>
            </div>
          </div>
        </section>

        <div className="fixed right-0 bottom-0 left-0 z-40 border-t border-[#d8dadc] bg-white/95 p-4 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <div className="hidden items-center gap-2 text-sm font-semibold text-[#38485d] md:flex">
              <CalendarIcon className="size-4 text-[#004ac6]" />
              Unsaved changes
            </div>
            <form.Subscribe selector={(state) => state.canSubmit}>
              {(canSubmit) => (
                <button
                  type="submit"
                  disabled={!canSubmit || updateGame.isPending}
                  className="ml-auto inline-flex h-12 min-w-40 items-center justify-center gap-2 rounded-lg bg-[#004ac6] px-6 text-sm font-bold text-white shadow-sm transition hover:bg-[#0038a8] disabled:opacity-60"
                >
                  <CheckIcon className="size-4" />
                  {updateGame.isPending ? "Saving..." : "Save Changes"}
                </button>
              )}
            </form.Subscribe>
          </div>
        </div>
      </form>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent showCloseButton={false} className="border-[#ffb4ab]">
          <DialogHeader>
            <DialogTitle className="text-[#93000a]">Cancel this game?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. All joined players will be notified that the game was cancelled.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setCancelOpen(false)}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-[#c3c5d9] px-4 text-sm font-semibold text-[#0b1c30]"
            >
              Keep Game
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={cancelGame.isPending}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-[#ba1a1a] px-4 text-sm font-bold text-white disabled:opacity-60"
            >
              {cancelGame.isPending ? "Canceling..." : "Cancel Game"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function FormSection({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-[#d8dadc] bg-white shadow-sm md:rounded-lg">
      <div className="flex items-center gap-3 border-b border-[#e0e3e5] px-5 py-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#d3e4fe] text-[#004ac6]">
          {icon}
        </div>
        <h2 className="text-xl font-bold text-[#0b1c30] [font-family:'Hanken_Grotesk',Inter,ui-sans-serif,sans-serif]">
          {title}
        </h2>
      </div>
      <div className="space-y-5 p-5">{children}</div>
    </section>
  );
}
