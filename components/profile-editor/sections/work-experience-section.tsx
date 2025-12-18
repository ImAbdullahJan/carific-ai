"use client";

import { Plus, Trash2 } from "lucide-react";
import { withForm } from "@/hooks/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import {
  type ProfileFormValues,
  createEmptyWorkExperience,
} from "@/lib/validations/profile-update";

export const WorkExperienceSection = withForm({
  defaultValues: {} as ProfileFormValues,
  render: function Render({ form }) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-md font-medium">Work Experience</h3>
          <form.Field name="workExperiences" mode="array">
            {(field) => (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => field.pushValue(createEmptyWorkExperience())}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Experience
              </Button>
            )}
          </form.Field>
        </div>

        <form.Field name="workExperiences" mode="array">
          {(field) => (
            <div className="space-y-4">
              {field.state.value.map((workExperience, index) => (
                <Card key={workExperience.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">
                        Experience {index + 1}
                      </CardTitle>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => field.removeValue(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <FieldGroup>
                      <div className="grid grid-cols-2 gap-4">
                        <form.AppField
                          name={`workExperiences[${index}].company`}
                        >
                          {(subField) => (
                            <subField.TextField
                              label="Company"
                              placeholder="Acme Inc."
                            />
                          )}
                        </form.AppField>
                        <form.AppField
                          name={`workExperiences[${index}].position`}
                        >
                          {(subField) => (
                            <subField.TextField
                              label="Position"
                              placeholder="Software Engineer"
                            />
                          )}
                        </form.AppField>
                      </div>

                      <form.AppField
                        name={`workExperiences[${index}].location`}
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
                          name={`workExperiences[${index}].startDate`}
                        >
                          {(subField) => (
                            <subField.DateField label="Start Date" />
                          )}
                        </form.AppField>
                        <form.AppField
                          name={`workExperiences[${index}].endDate`}
                        >
                          {(subField) => (
                            <subField.DateField label="End Date" />
                          )}
                        </form.AppField>
                      </div>

                      <form.AppField name={`workExperiences[${index}].current`}>
                        {(subField) => (
                          <subField.CheckboxField label="I currently work here" />
                        )}
                      </form.AppField>

                      <form.AppField name={`workExperiences[${index}].bullets`}>
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
          )}
        </form.Field>
      </div>
    );
  },
});
