"use client";

import { withForm } from "@/hooks/form";
import { DEFAULT_PROFILE_FORM_VALUES } from "@/lib/validations/profile-update";

export const HobbiesSection = withForm({
  defaultValues: DEFAULT_PROFILE_FORM_VALUES,
  render: function Render({ form }) {
    return (
      <div className="space-y-4">
        <form.AppField name="hobbies" mode="array">
          {(field) => (
            <field.StringArrayField
              label="Hobbies & Interests"
              placeholder="Photography, Trekking, Chess..."
              addButtonText="Add Hobby"
            />
          )}
        </form.AppField>
      </div>
    );
  },
});
