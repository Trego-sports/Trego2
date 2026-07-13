import { useSuspenseQuery } from "@tanstack/react-query";
import { MapPinIcon, PlusIcon, SaveIcon, TrophyIcon, XIcon } from "lucide-react";
import { useAppForm } from "@/components/forms/form-context";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useUpdateProfile } from "@/modules/profile/mutations";
import { userQueries } from "@/modules/profile/queries";
import { type ProfileFormInput, updateProfileSchema } from "@/modules/profile/update-profile";
import { skillLevelSchema, sportsSchema } from "@/modules/sports/sports";

export function ProfileForm() {
  const toast = useToast();
  const updateProfile = useUpdateProfile();
  const { data: myProfile } = useSuspenseQuery(userQueries.getMyProfile());

  const form = useAppForm({
    defaultValues: {
      name: myProfile.name,
      sports: myProfile.playerSports,
      location: {
        lat: myProfile.location?.lat.toString() ?? null,
        lon: myProfile.location?.lon.toString() ?? null,
      },
    } as ProfileFormInput,
    validators: { onChange: updateProfileSchema },
    onSubmit: async ({ value }) => {
      await updateProfile.mutateAsync(value);
    },
  });

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.add({
        type: "error",
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation.",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        form.setFieldValue("location", {
          lat: position.coords.latitude.toString(),
          lon: position.coords.longitude.toString(),
        });
      },
      () => {
        toast.add({
          type: "error",
          title: "Location access denied",
          description: "Please enable location permissions in your browser to use this feature.",
        });
      },
    );
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="space-y-6"
    >
      <section className="rounded-lg border border-[#c3c6d7] bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-black text-[#0b1c30] [font-family:'Hanken_Grotesk',Inter,ui-sans-serif,sans-serif]">
              Account Settings
            </h2>
            <p className="mt-1 text-sm font-medium text-[#647086]">Keep your public player details current.</p>
          </div>
          <form.Subscribe selector={(state) => state.canSubmit}>
            {(canSubmit) => (
              <Button
                type="submit"
                disabled={!canSubmit || updateProfile.isPending}
                className="h-11 rounded-lg bg-[#004ac6] px-5 font-bold text-white hover:bg-[#003ea8]"
              >
                <SaveIcon className="size-4" />
                {updateProfile.isPending ? "Saving..." : "Save Changes"}
              </Button>
            )}
          </form.Subscribe>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <form.AppField name="name">
            {(field) => (
              <field.TextField
                label="Full Name"
                placeholder="Enter your name"
                maxLength={100}
                className="h-12 rounded-lg border-[#c3c6d7] bg-[#f8f9ff] text-base font-semibold text-[#0b1c30]"
              />
            )}
          </form.AppField>

          <ReadOnlyField label="Email Address" value={myProfile.email} />
        </div>

        <div className="mt-5 rounded-lg border border-[#d8def0] bg-[#f8f9ff] p-4">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-black text-[#0b1c30]">Default Game Radius</h3>
              <p className="text-sm font-medium text-[#647086]">Set location coordinates for nearby game discovery.</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleUseCurrentLocation}
              className="rounded-lg border-[#9aa3b8] bg-white text-[#0b1c30] hover:bg-[#eff4ff]"
            >
              <MapPinIcon className="size-4" />
              Use Current Location
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <form.AppField name="location.lat">
              {(field) => (
                <field.TextField
                  label="Latitude"
                  placeholder="Optional"
                  className="h-11 rounded-lg border-[#c3c6d7] bg-white"
                />
              )}
            </form.AppField>
            <form.AppField name="location.lon">
              {(field) => (
                <field.TextField
                  label="Longitude"
                  placeholder="Optional"
                  className="h-11 rounded-lg border-[#c3c6d7] bg-white"
                />
              )}
            </form.AppField>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-[#c3c6d7] bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-[#0b1c30] [font-family:'Hanken_Grotesk',Inter,ui-sans-serif,sans-serif]">
              Preferred Sports
            </h2>
            <p className="mt-1 text-sm font-medium text-[#647086]">Tell hosts what you play and where you fit.</p>
          </div>
          <form.AppField name="sports" mode="array">
            {(field) => (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => field.pushValue({ sport: "Basketball", skillLevel: "Intermediate", position: null })}
                className="rounded-lg text-[#004ac6] hover:bg-[#eff4ff]"
              >
                <PlusIcon className="size-4" />
                Add Sport
              </Button>
            )}
          </form.AppField>
        </div>

        <form.AppField name="sports" mode="array">
          {(field) => (
            <div className="grid gap-4 lg:grid-cols-2">
              {field.state.value.map((sport, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: Form array fields are bound to their index positions
                <div key={index} className="rounded-lg border border-[#c3c6d7] bg-[#f8f9ff] p-4">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#dce9ff] text-[#004ac6]">
                        <TrophyIcon className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-black text-[#0b1c30]">{sport.sport}</p>
                        <p className="text-xs font-black uppercase tracking-[0.08em] text-[#004ac6]">
                          {sport.skillLevel}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => field.removeValue(index)}
                      className="rounded-lg text-[#647086] hover:bg-[#e5eeff] hover:text-[#0b1c30]"
                      aria-label={`Remove ${sport.sport}`}
                    >
                      <XIcon className="size-4" />
                    </Button>
                  </div>

                  <div className="grid gap-3">
                    <form.AppField name={`sports[${index}].sport`}>
                      {(subField) => <subField.SelectField label="Sport" options={sportsSchema.options} />}
                    </form.AppField>
                    <form.AppField name={`sports[${index}].skillLevel`}>
                      {(subField) => <subField.SelectField label="Skill Level" options={skillLevelSchema.options} />}
                    </form.AppField>
                    <form.AppField name={`sports[${index}].position`}>
                      {(subField) => (
                        <subField.TextField
                          label="Position"
                          placeholder="e.g., point guard, striker"
                          maxLength={50}
                          className="h-11 rounded-lg border-[#c3c6d7] bg-white"
                        />
                      )}
                    </form.AppField>
                  </div>
                </div>
              ))}

              {field.state.value.length === 0 && (
                <div className="rounded-lg border border-dashed border-[#c3c6d7] bg-[#f8f9ff] p-6 text-center lg:col-span-2">
                  <p className="font-bold text-[#0b1c30]">No sports added yet</p>
                  <p className="mt-1 text-sm font-medium text-[#647086]">
                    Add sports to personalize game recommendations.
                  </p>
                </div>
              )}

              {field.state.meta.errors.length > 0 && (
                <p className="text-sm font-medium text-[#b91c1c] lg:col-span-2">{field.state.meta.errors.join(", ")}</p>
              )}
            </div>
          )}
        </form.AppField>
      </section>
    </form>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-2">
      <p className="text-sm font-medium">{label}</p>
      <div className="flex h-12 items-center rounded-lg border border-[#c3c6d7] bg-[#f8f9ff] px-3 text-base font-semibold text-[#38485d]">
        {value}
      </div>
      <p className="min-h-5 text-sm">&nbsp;</p>
    </div>
  );
}
