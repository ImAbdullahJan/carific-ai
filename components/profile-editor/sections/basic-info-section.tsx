"use client";

import { withForm } from "@/hooks/form";
import { FieldGroup } from "@/components/ui/field";
import type { ProfileFormValues } from "@/lib/validations/profile-update";

export const BasicInfoSection = withForm({
  defaultValues: {} as ProfileFormValues,
  render: function Render({ form }) {
    return (
      <div className="space-y-4">
        <h3 className="text-md font-medium">Basic Information</h3>
        <FieldGroup>
          <form.AppField name="displayName">
            {(field) => (
              <field.TextField label="Full Name" placeholder="John Doe" />
            )}
          </form.AppField>

          <form.AppField name="headline">
            {(field) => (
              <field.TextField
                label="Headline"
                placeholder="Senior Software Engineer"
              />
            )}
          </form.AppField>

          <form.AppField name="bio">
            {(field) => (
              <field.TextAreaField
                label="Professional Summary"
                placeholder="Brief description of your professional background..."
                rows={4}
              />
            )}
          </form.AppField>

          <div className="grid grid-cols-2 gap-4">
            <form.AppField name="email">
              {(field) => (
                <field.TextField
                  label="Email"
                  type="email"
                  placeholder="john@example.com"
                />
              )}
            </form.AppField>

            <form.AppField name="phone">
              {(field) => (
                <field.TextField
                  label="Phone"
                  placeholder="+1 (555) 123-4567"
                />
              )}
            </form.AppField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <form.AppField name="location">
              {(field) => (
                <field.TextField
                  label="Location"
                  placeholder="San Francisco, CA"
                />
              )}
            </form.AppField>

            <form.AppField name="website">
              {(field) => (
                <field.TextField
                  label="Website"
                  placeholder="https://yourwebsite.com"
                />
              )}
            </form.AppField>
          </div>
        </FieldGroup>
      </div>
    );
  },
});
