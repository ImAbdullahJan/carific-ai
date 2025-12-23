"use client";

import { AlertTriangle } from "lucide-react";
import { withForm } from "@/hooks/form";
import { FieldGroup } from "@/components/ui/field";
import { DEFAULT_PROFILE_FORM_VALUES } from "@/lib/validations/profile-update";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export const BasicInfoSection = withForm({
  defaultValues: DEFAULT_PROFILE_FORM_VALUES,
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

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="personal-details" className="border-none">
              <AccordionTrigger className="hover:no-underline py-2">
                <span className="text-sm font-medium">
                  Personal Details (Optional)
                </span>
              </AccordionTrigger>
              <AccordionContent className="pt-2">
                <Alert
                  variant="destructive"
                  className="mb-6 bg-destructive/5 border-destructive/20"
                >
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Privacy & Discrimination Risk</AlertTitle>
                  <AlertDescription>
                    Including protected characteristics (gender, nationality,
                    etc.) is discouraged or illegal in many regions (e.g., US,
                    UK). Only include these if strictly required for your target
                    location or visa requirements.
                  </AlertDescription>
                </Alert>

                <form.AppField name="privacyConsent">
                  {(consentField) => (
                    <>
                      <div className="flex items-center space-x-2 mb-6 p-3 bg-muted/50 rounded-lg border">
                        <Checkbox
                          id="privacy-consent"
                          checked={consentField.state.value}
                          onCheckedChange={(checked) =>
                            consentField.handleChange(checked === true)
                          }
                        />
                        <Label
                          htmlFor="privacy-consent"
                          className="text-xs leading-snug cursor-pointer"
                        >
                          I understand these details are optional and I consent
                          to providing this sensitive information for my resume.
                        </Label>
                      </div>

                      <div
                        className={cn(
                          "space-y-4 transition-opacity duration-200",
                          !consentField.state.value &&
                            "opacity-50 pointer-events-none"
                        )}
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <form.AppField name="dateOfBirth">
                            {(field) => (
                              <field.DateField
                                label="Date of Birth"
                                disabled={!consentField.state.value}
                              />
                            )}
                          </form.AppField>
                          <form.AppField name="gender">
                            {(field) => (
                              <field.SelectField
                                label="Gender"
                                placeholder="Select gender"
                                disabled={!consentField.state.value}
                                options={[
                                  { value: "male", label: "Male" },
                                  { value: "female", label: "Female" },
                                  { value: "other", label: "Other" },
                                  {
                                    value: "prefer-not-to-say",
                                    label: "Prefer not to say",
                                  },
                                ]}
                              />
                            )}
                          </form.AppField>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <form.AppField name="nationality">
                            {(field) => (
                              <field.TextField
                                label="Nationality"
                                placeholder="American"
                                disabled={!consentField.state.value}
                              />
                            )}
                          </form.AppField>
                          <form.AppField name="maritalStatus">
                            {(field) => (
                              <field.SelectField
                                label="Marital Status"
                                placeholder="Select status"
                                disabled={!consentField.state.value}
                                options={[
                                  { value: "single", label: "Single" },
                                  { value: "married", label: "Married" },
                                  { value: "divorced", label: "Divorced" },
                                  { value: "widowed", label: "Widowed" },
                                ]}
                              />
                            )}
                          </form.AppField>
                        </div>

                        <form.AppField name="visaStatus">
                          {(field) => (
                            <field.TextField
                              label="Visa Status"
                              placeholder="H-1B, Citizen, etc."
                              disabled={!consentField.state.value}
                            />
                          )}
                        </form.AppField>
                      </div>
                    </>
                  )}
                </form.AppField>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </FieldGroup>
      </div>
    );
  },
});
