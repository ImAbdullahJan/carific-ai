"use client";

import { Plus } from "lucide-react";
import { withForm } from "@/hooks/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { ArrayFieldActions } from "@/components/form/form-components";
import {
  type ProfileFormValues,
  createEmptyVolunteerExperience,
} from "@/lib/validations/profile-update";

export const VolunteerExperienceSection = withForm({
  defaultValues: {} as ProfileFormValues,
  render: function Render({ form }) {
    return (
      <form.AppField name="volunteerExperiences" mode="array">
        {(field) => (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-medium">Volunteer Experience</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  field.pushValue(createEmptyVolunteerExperience())
                }
                aria-label="Add volunteer experience"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Volunteer Experience
              </Button>
            </div>

            <div className="space-y-4">
              {field.state.value.map((volunteerExperience, index) => (
                <Card key={volunteerExperience.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">
                        Volunteer Experience {index + 1}
                      </CardTitle>
                      <ArrayFieldActions index={index} className="shrink-0" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <FieldGroup>
                      <div className="grid grid-cols-2 gap-4">
                        <form.AppField
                          name={`volunteerExperiences[${index}].organization`}
                        >
                          {(subField) => (
                            <subField.TextField
                              label="Organization"
                              placeholder="Red Cross"
                            />
                          )}
                        </form.AppField>
                        <form.AppField
                          name={`volunteerExperiences[${index}].role`}
                        >
                          {(subField) => (
                            <subField.TextField
                              label="Role"
                              placeholder="Volunteer Coordinator"
                            />
                          )}
                        </form.AppField>
                      </div>

                      <form.AppField
                        name={`volunteerExperiences[${index}].location`}
                      >
                        {(subField) => (
                          <subField.TextField
                            label="Location"
                            placeholder="San Francisco, CA"
                          />
                        )}
                      </form.AppField>

                      <div className="grid grid-cols-2 gap-4">
                        <form.AppField
                          name={`volunteerExperiences[${index}].startDate`}
                        >
                          {(subField) => (
                            <subField.DateField label="Start Date" />
                          )}
                        </form.AppField>
                        <form.AppField
                          name={`volunteerExperiences[${index}].endDate`}
                        >
                          {(subField) => (
                            <subField.DateField label="End Date" />
                          )}
                        </form.AppField>
                      </div>

                      <form.AppField
                        name={`volunteerExperiences[${index}].current`}
                      >
                        {(subField) => (
                          <subField.CheckboxField label="I currently volunteer here" />
                        )}
                      </form.AppField>

                      <form.AppField
                        name={`volunteerExperiences[${index}].bullets`}
                        mode="array"
                      >
                        {(subField) => (
                          <subField.StringArrayField
                            label="Key Responsibilities & Achievements"
                            placeholder="Describe a responsibility or achievement..."
                            addButtonText="Add Bullet"
                          />
                        )}
                      </form.AppField>
                    </FieldGroup>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </form.AppField>
    );
  },
});
