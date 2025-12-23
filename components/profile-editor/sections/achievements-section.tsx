"use client";

import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { withForm } from "@/hooks/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  type ProfileFormValues,
  createEmptyAchievement,
} from "@/lib/validations/profile-update";

export const AchievementsSection = withForm({
  defaultValues: {} as ProfileFormValues,
  render: function Render({ form }) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-md font-medium">Awards & Achievements</h3>
          <form.Field name="achievements" mode="array">
            {(field) => (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => field.pushValue(createEmptyAchievement())}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Achievement
              </Button>
            )}
          </form.Field>
        </div>

        <form.Field name="achievements" mode="array">
          {(field) => (
            <div className="space-y-4">
              {field.state.value.map((achievement, index) => (
                <Card key={achievement.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">
                        Achievement {index + 1}
                      </CardTitle>
                      <ButtonGroup className="shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => field.moveValue(index, index - 1)}
                          disabled={index === 0}
                          className="h-8 w-8 p-0"
                          title="Move Up"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => field.moveValue(index, index + 1)}
                          disabled={index === field.state.value.length - 1}
                          className="h-8 w-8 p-0"
                          title="Move Down"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => field.removeValue(index)}
                          className="h-8 w-8 p-0"
                          title="Remove"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </ButtonGroup>
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
          )}
        </form.Field>
      </div>
    );
  },
});
