"use client";

import { Plus } from "lucide-react";
import { withForm } from "@/hooks/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { ArrayFieldActions } from "@/components/form/form-components";
import {
  createEmptyProject,
  DEFAULT_PROFILE_FORM_VALUES,
} from "@/lib/validations/profile-update";

export const ProjectsSection = withForm({
  defaultValues: DEFAULT_PROFILE_FORM_VALUES,
  render: function Render({ form }) {
    return (
      <form.AppField name="projects" mode="array">
        {(field) => (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-medium">Projects</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => field.pushValue(createEmptyProject())}
                aria-label="Add project"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Project
              </Button>
            </div>

            <div className="space-y-4">
              {field.state.value.map((_, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">
                        Project {index + 1}
                      </CardTitle>
                      <ArrayFieldActions index={index} className="shrink-0" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <FieldGroup>
                      <form.AppField name={`projects[${index}].name`}>
                        {(subField) => (
                          <subField.TextField
                            label="Project Name"
                            placeholder="My Awesome Project"
                          />
                        )}
                      </form.AppField>

                      <form.AppField name={`projects[${index}].description`}>
                        {(subField) => (
                          <subField.TextAreaField
                            label="Description"
                            placeholder="Brief description of the project..."
                            rows={2}
                          />
                        )}
                      </form.AppField>

                      <form.AppField name={`projects[${index}].url`}>
                        {(subField) => (
                          <subField.TextField
                            label="URL"
                            placeholder="https://github.com/user/project"
                          />
                        )}
                      </form.AppField>

                      <div className="grid grid-cols-2 gap-4">
                        <form.AppField name={`projects[${index}].startDate`}>
                          {(subField) => (
                            <subField.DateField label="Start Date" />
                          )}
                        </form.AppField>
                        <form.AppField name={`projects[${index}].endDate`}>
                          {(subField) => (
                            <subField.DateField label="End Date" />
                          )}
                        </form.AppField>
                      </div>

                      <form.AppField
                        name={`projects[${index}].highlights`}
                        mode="array"
                      >
                        {(subField) => (
                          <subField.StringArrayField
                            label="Highlights"
                            placeholder="Key feature, technology, or achievement..."
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
