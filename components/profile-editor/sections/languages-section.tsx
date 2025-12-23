"use client";

import { Plus } from "lucide-react";
import { withForm } from "@/hooks/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { ArrayFieldActions } from "@/components/form/form-components";
import {
  type ProfileFormValues,
  createEmptyLanguage,
} from "@/lib/validations/profile-update";

const PROFICIENCY_LEVELS = [
  { value: "Native", label: "Native" },
  { value: "Fluent", label: "Fluent" },
  { value: "Professional", label: "Professional" },
  { value: "Conversational", label: "Conversational" },
  { value: "Basic", label: "Basic" },
];

export const LanguagesSection = withForm({
  defaultValues: {} as ProfileFormValues,
  render: function Render({ form }) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-md font-medium">Languages</h3>
          <form.AppField name="languages" mode="array">
            {(field) => (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => field.pushValue(createEmptyLanguage())}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Language
              </Button>
            )}
          </form.AppField>
        </div>

        <form.AppField name="languages" mode="array">
          {(field) => (
            <div className="space-y-3">
              {field.state.value.map((language, index) => (
                <Card key={language.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">
                        Language {index + 1}
                      </CardTitle>
                      <ArrayFieldActions index={index} className="shrink-0" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <FieldGroup>
                      <div className="grid grid-cols-2 gap-4">
                        <form.AppField name={`languages[${index}].name`}>
                          {(subField) => (
                            <subField.TextField
                              label="Language"
                              placeholder="English"
                            />
                          )}
                        </form.AppField>
                        <form.AppField name={`languages[${index}].proficiency`}>
                          {(subField) => (
                            <subField.SelectField
                              label="Proficiency"
                              options={PROFICIENCY_LEVELS}
                              placeholder="Select level"
                            />
                          )}
                        </form.AppField>
                      </div>
                    </FieldGroup>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </form.AppField>
      </div>
    );
  },
});
