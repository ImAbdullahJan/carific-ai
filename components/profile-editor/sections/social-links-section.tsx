"use client";

import { Plus } from "lucide-react";
import { withForm } from "@/hooks/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { ArrayFieldActions } from "@/components/form/form-components";
import {
  createEmptySocialLink,
  DEFAULT_PROFILE_FORM_VALUES,
} from "@/lib/validations/profile-update";

const PLATFORMS = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "github", label: "GitHub" },
  { value: "twitter", label: "Twitter/X" },
  { value: "dribbble", label: "Dribbble" },
  { value: "behance", label: "Behance" },
  { value: "medium", label: "Medium" },
  { value: "stackoverflow", label: "Stack Overflow" },
  { value: "custom", label: "Custom" },
];

export const SocialLinksSection = withForm({
  defaultValues: DEFAULT_PROFILE_FORM_VALUES,
  render: function Render({ form }) {
    return (
      <form.AppField name="socialLinks" mode="array">
        {(field) => (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-medium">Social Links</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => field.pushValue(createEmptySocialLink())}
                aria-label="Add social link"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Link
              </Button>
            </div>

            <div className="space-y-3">
              {field.state.value.map((link, index) => (
                <Card key={link.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">
                        Link {index + 1}
                      </CardTitle>
                      <ArrayFieldActions index={index} className="shrink-0" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <FieldGroup>
                      <div className="grid grid-cols-3 gap-4">
                        <form.AppField name={`socialLinks[${index}].platform`}>
                          {(subField) => (
                            <subField.SelectField
                              label="Platform"
                              options={PLATFORMS}
                              placeholder="Select platform"
                            />
                          )}
                        </form.AppField>
                        <form.AppField name={`socialLinks[${index}].url`}>
                          {(subField) => (
                            <subField.TextField
                              label="URL"
                              placeholder="https://linkedin.com/in/johndoe"
                            />
                          )}
                        </form.AppField>
                        <form.AppField name={`socialLinks[${index}].label`}>
                          {(subField) => (
                            <subField.TextField
                              label="Label (optional)"
                              placeholder="My LinkedIn"
                            />
                          )}
                        </form.AppField>
                      </div>
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
