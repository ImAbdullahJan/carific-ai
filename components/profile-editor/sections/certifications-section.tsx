"use client";

import { Plus } from "lucide-react";
import { withForm } from "@/hooks/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { ArrayFieldActions } from "@/components/form/form-components";
import {
  type ProfileFormValues,
  createEmptyCertification,
} from "@/lib/validations/profile-update";

export const CertificationsSection = withForm({
  defaultValues: {} as ProfileFormValues,
  render: function Render({ form }) {
    return (
      <form.AppField name="certifications" mode="array">
        {(field) => (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-medium">Certifications</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => field.pushValue(createEmptyCertification())}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Certification
              </Button>
            </div>

            <div className="space-y-4">
              {field.state.value.map((certification, index) => (
                <Card key={certification.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">
                        Certification {index + 1}
                      </CardTitle>
                      <ArrayFieldActions index={index} className="shrink-0" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <FieldGroup>
                      <div className="grid grid-cols-2 gap-4">
                        <form.AppField name={`certifications[${index}].name`}>
                          {(subField) => (
                            <subField.TextField
                              label="Certification Name"
                              placeholder="AWS Solutions Architect"
                            />
                          )}
                        </form.AppField>
                        <form.AppField name={`certifications[${index}].issuer`}>
                          {(subField) => (
                            <subField.TextField
                              label="Issuing Organization"
                              placeholder="Amazon Web Services"
                            />
                          )}
                        </form.AppField>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <form.AppField
                          name={`certifications[${index}].issueDate`}
                        >
                          {(subField) => (
                            <subField.DateField label="Issue Date" />
                          )}
                        </form.AppField>
                        <form.AppField
                          name={`certifications[${index}].expiryDate`}
                        >
                          {(subField) => (
                            <subField.DateField label="Expiry Date" />
                          )}
                        </form.AppField>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <form.AppField
                          name={`certifications[${index}].credentialId`}
                        >
                          {(subField) => (
                            <subField.TextField
                              label="Credential ID"
                              placeholder="ABC123XYZ"
                            />
                          )}
                        </form.AppField>
                        <form.AppField
                          name={`certifications[${index}].credentialUrl`}
                        >
                          {(subField) => (
                            <subField.TextField
                              label="Credential URL"
                              placeholder="https://..."
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
