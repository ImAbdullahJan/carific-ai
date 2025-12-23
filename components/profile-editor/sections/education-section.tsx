"use client";

import { Plus } from "lucide-react";
import { withForm } from "@/hooks/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { ArrayFieldActions } from "@/components/form/form-components";
import {
  type ProfileFormValues,
  createEmptyEducation,
} from "@/lib/validations/profile-update";

export const EducationSection = withForm({
  defaultValues: {} as ProfileFormValues,
  render: function Render({ form }) {
    return (
      <form.AppField name="educations" mode="array">
        {(field) => (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-medium">Education</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => field.pushValue(createEmptyEducation())}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Education
              </Button>
            </div>

            <div className="space-y-4">
              {field.state.value.map((education, index) => (
                <Card key={education.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">
                        Education {index + 1}
                      </CardTitle>
                      <ArrayFieldActions index={index} className="shrink-0" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <FieldGroup>
                      <form.AppField name={`educations[${index}].school`}>
                        {(subField) => (
                          <subField.TextField
                            label="School"
                            placeholder="University of California"
                          />
                        )}
                      </form.AppField>

                      <div className="grid grid-cols-2 gap-4">
                        <form.AppField name={`educations[${index}].degree`}>
                          {(subField) => (
                            <subField.TextField
                              label="Degree"
                              placeholder="Bachelor of Science"
                            />
                          )}
                        </form.AppField>
                        <form.AppField
                          name={`educations[${index}].fieldOfStudy`}
                        >
                          {(subField) => (
                            <subField.TextField
                              label="Field of Study"
                              placeholder="Computer Science"
                            />
                          )}
                        </form.AppField>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <form.AppField name={`educations[${index}].startDate`}>
                          {(subField) => (
                            <subField.DateField label="Start Date" />
                          )}
                        </form.AppField>
                        <form.AppField name={`educations[${index}].endDate`}>
                          {(subField) => (
                            <subField.DateField label="End Date" />
                          )}
                        </form.AppField>
                      </div>

                      <form.AppField name={`educations[${index}].location`}>
                        {(subField) => (
                          <subField.TextField
                            label="Location"
                            placeholder="Berkeley, CA"
                          />
                        )}
                      </form.AppField>

                      <form.AppField name={`educations[${index}].current`}>
                        {(subField) => (
                          <subField.CheckboxField label="Currently studying here" />
                        )}
                      </form.AppField>

                      <form.AppField
                        name={`educations[${index}].highlights`}
                        mode="array"
                      >
                        {(subField) => (
                          <subField.StringArrayField
                            label="Highlights"
                            placeholder="Notable achievement, course, or activity..."
                            addButtonText="Add Highlight"
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
