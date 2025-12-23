"use client";

import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { withForm } from "@/hooks/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  type ProfileFormValues,
  createEmptySkill,
} from "@/lib/validations/profile-update";

const SKILL_CATEGORIES = [
  { value: "Technical Skills", label: "Technical Skills" },
  { value: "Programming Languages", label: "Programming Languages" },
  { value: "Frameworks", label: "Frameworks" },
  { value: "Tools", label: "Tools" },
  { value: "Databases", label: "Databases" },
  { value: "Soft Skills", label: "Soft Skills" },
  { value: "Other", label: "Other" },
];

const SKILL_LEVELS = [
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
  { value: "Expert", label: "Expert" },
];

export const SkillsSection = withForm({
  defaultValues: {} as ProfileFormValues,
  render: function Render({ form }) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-md font-medium">Skills</h3>
          <form.Field name="skills" mode="array">
            {(field) => (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => field.pushValue(createEmptySkill())}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Skill
              </Button>
            )}
          </form.Field>
        </div>

        <form.Field name="skills" mode="array">
          {(field) => (
            <div className="space-y-3">
              {field.state.value.map((skill, index) => (
                <Card key={skill.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">
                        Skill {index + 1}
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
                      <div className="grid grid-cols-3 gap-4">
                        <form.AppField name={`skills[${index}].name`}>
                          {(subField) => (
                            <subField.TextField
                              label="Skill Name"
                              placeholder="React"
                            />
                          )}
                        </form.AppField>
                        <form.AppField name={`skills[${index}].category`}>
                          {(subField) => (
                            <subField.SelectField
                              label="Category"
                              options={SKILL_CATEGORIES}
                              placeholder="Select category"
                            />
                          )}
                        </form.AppField>
                        <form.AppField name={`skills[${index}].level`}>
                          {(subField) => (
                            <subField.SelectField
                              label="Level"
                              options={SKILL_LEVELS}
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
        </form.Field>
      </div>
    );
  },
});
