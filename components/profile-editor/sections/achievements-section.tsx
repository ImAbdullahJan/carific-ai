"use client";

import { Plus } from "lucide-react";
import { withForm } from "@/hooks/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { ArrayFieldActions } from "@/components/form/form-components";
import {
  createEmptyAchievement,
  DEFAULT_PROFILE_FORM_VALUES,
} from "@/lib/validations/profile-update";

export const AchievementsSection = withForm({
  defaultValues: DEFAULT_PROFILE_FORM_VALUES,
  render: function Render({ form }) {
    return (
      <form.AppField name="achievements" mode="array">
        {(field) => (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-medium">Awards & Achievements</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => field.pushValue(createEmptyAchievement())}
                aria-label="Add achievement"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Achievement
              </Button>
            </div>

            <div className="space-y-4">
              {field.state.value.map((achievement, index) => (
                <Card key={achievement.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">
                        Achievement {index + 1}
                      </CardTitle>
                      <ArrayFieldActions index={index} className="shrink-0" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <FieldGroup>
                      <div className="grid grid-cols-2 gap-4">
                        <form.AppField name={`achievements[${index}].title`}>
                          {(subField) => (
                            <subField.TextField
                              label="Achievement Title"
                              placeholder="Employee of the Year"
                            />
                          )}
                        </form.AppField>
                        <form.AppField name={`achievements[${index}].issuer`}>
                          {(subField) => (
                            <subField.TextField
                              label="Issuer"
                              placeholder="Company Name"
                            />
                          )}
                        </form.AppField>
                      </div>

                      <form.AppField name={`achievements[${index}].date`}>
                        {(subField) => <subField.DateField label="Date" />}
                      </form.AppField>

                      <form.AppField
                        name={`achievements[${index}].description`}
                      >
                        {(subField) => (
                          <subField.TextAreaField
                            label="Description"
                            placeholder="Brief description..."
                            rows={2}
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
