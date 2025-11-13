import { useSuspenseQuery } from "@tanstack/react-query";
import { MapPin, Plus, X } from "lucide-react";
import { useAppForm } from "@/components/forms/form-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
      {/* Name Field */}
      <Card>
        <CardHeader>
          <CardTitle>Name</CardTitle>
          <CardDescription>Your display name</CardDescription>
        </CardHeader>
        <CardContent>
          <form.AppField name="name">
            {(field) => <field.TextField placeholder="Enter your name" maxLength={100} />}
          </form.AppField>
        </CardContent>
      </Card>

      {/* Location Coordinates */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Location</CardTitle>
              <CardDescription>Set your location to find games nearby</CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={handleUseCurrentLocation}>
              <MapPin className="mr-2 size-4" />
              Use Current Location
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <form.AppField name="location.lat">
              {(field) => <field.TextField label="Latitude (Optional)" />}
            </form.AppField>
            <form.AppField name="location.lon">
              {(field) => <field.TextField label="Longitude (Optional)" />}
            </form.AppField>
          </div>
        </CardContent>
      </Card>

      {/* Sports Field */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sports</CardTitle>
              <CardDescription>Add the sports you play and your skill level</CardDescription>
            </div>
            <form.AppField name="sports" mode="array">
              {(field) => (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => field.pushValue({ sport: "Basketball", skillLevel: "Intermediate", position: null })}
                >
                  <Plus className="mr-2 size-4" />
                  Add Sport
                </Button>
              )}
            </form.AppField>
          </div>
        </CardHeader>
        <CardContent>
          <form.AppField name="sports" mode="array">
            {(field) => (
              <div className="space-y-4">
                {field.state.value.map((_, index) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: Form array fields are bound to their index positions
                  <div key={index} className="flex gap-2 border p-4">
                    <div className="flex-1 space-y-4">
                      {/* Sport Select */}
                      <form.AppField name={`sports[${index}].sport`}>
                        {(subField) => <subField.SelectField label="Sport" options={sportsSchema.options} />}
                      </form.AppField>

                      {/* Skill Level Select */}
                      <form.AppField name={`sports[${index}].skillLevel`}>
                        {(subField) => <subField.SelectField label="Skill Level" options={skillLevelSchema.options} />}
                      </form.AppField>

                      {/* Position Input */}
                      <form.AppField name={`sports[${index}].position`}>
                        {(subField) => (
                          <subField.TextField
                            label="Position (optional)"
                            placeholder="e.g., point guard, striker"
                            maxLength={50}
                          />
                        )}
                      </form.AppField>
                    </div>

                    {/* Remove Button */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => field.removeValue(index)}
                      className="self-start"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ))}

                {field.state.value.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No sports added yet. Click "Add Sport" to get started.
                  </p>
                )}

                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-destructive">{field.state.meta.errors.join(", ")}</p>
                )}
              </div>
            )}
          </form.AppField>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <form.Subscribe selector={(state) => state.canSubmit}>
          {(canSubmit) => (
            <Button type="submit" disabled={!canSubmit} size="lg">
              Save Changes
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
