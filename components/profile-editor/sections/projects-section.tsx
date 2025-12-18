"use client";

import { Plus, Trash2 } from "lucide-react";
import { withForm } from "@/hooks/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import {
  type ProfileFormValues,
  createEmptyProject,
} from "@/lib/validations/profile-update";

export const ProjectsSection = withForm({
  defaultValues: {} as ProfileFormValues,
  render: function Render({ form }) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-md font-medium">Projects</h3>
          <form.Field name="projects" mode="array">
            {(field) => (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => field.pushValue(createEmptyProject())}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Project
              </Button>
            )}
          </form.Field>
        </div>

        <form.Field name="projects" mode="array">
          {(field) => (
            <div className="space-y-4">
              {field.state.value.map((project, index) => (
                <Card key={project.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">
                        Project {index + 1}
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

                      <form.AppField name={`projects[${index}].highlights`}>
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
          )}
        </form.Field>
      </div>
    );
  },
});
