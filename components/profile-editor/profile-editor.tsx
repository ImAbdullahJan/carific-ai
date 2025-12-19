"use client";

import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { useAppForm } from "@/hooks/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PDFPreview } from "@/components/pdf";
import type { getFullProfile } from "@/lib/db/profile";
import { BasicInfoSection } from "./sections/basic-info-section";
import { WorkExperienceSection } from "./sections/work-experience-section";
import { EducationSection } from "./sections/education-section";
import { SkillsSection } from "./sections/skills-section";
import { ProjectsSection } from "./sections/projects-section";
import { CertificationsSection } from "./sections/certifications-section";
import { LanguagesSection } from "./sections/languages-section";
import { AchievementsSection } from "./sections/achievements-section";
import { SocialLinksSection } from "./sections/social-links-section";
import {
  profileToFormValues,
  mergeFormValuesWithProfile,
} from "@/lib/profile-transformation";

type FullProfile = NonNullable<Awaited<ReturnType<typeof getFullProfile>>>;

interface ProfileEditorProps {
  profile: FullProfile;
}

// Transform profile data to form values
// (Imports handled above)

export function ProfileEditor({ profile }: ProfileEditorProps) {
  const router = useRouter();

  const form = useAppForm({
    defaultValues: profileToFormValues(profile),
    onSubmit: async ({ value }) => {
      try {
        const response = await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(value),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to update profile");
        }

        toast.success("Profile updated successfully");
        // Refresh server data to update preview with fresh profile
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update profile"
        );
        throw error;
      }
    },
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-120px)]">
      {/* Left Side - PDF Preview */}
      <form.Subscribe selector={(state) => [state.values]}>
        {([values]) => {
          const liveProfile = mergeFormValuesWithProfile(profile, values);

          return (
            <PDFPreview profile={liveProfile} height="calc(100vh - 180px)" />
          );
        }}
      </form.Subscribe>

      {/* Right Side - Edit Form */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Edit Profile</h2>
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button
                size="sm"
                onClick={() => form.handleSubmit()}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            )}
          </form.Subscribe>
        </div>

        <Card className="flex-1 overflow-hidden">
          <ScrollArea className="h-[calc(100vh-220px)]">
            <CardContent className="p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  form.handleSubmit();
                }}
              >
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5 mb-4">
                    <TabsTrigger value="basic">Basic</TabsTrigger>
                    <TabsTrigger value="experience">Experience</TabsTrigger>
                    <TabsTrigger value="education">Education</TabsTrigger>
                    <TabsTrigger value="skills">Skills</TabsTrigger>
                    <TabsTrigger value="more">More</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-6">
                    <BasicInfoSection form={form} />
                    <SocialLinksSection form={form} />
                  </TabsContent>

                  <TabsContent value="experience" className="space-y-6">
                    <WorkExperienceSection form={form} />
                  </TabsContent>

                  <TabsContent value="education" className="space-y-6">
                    <EducationSection form={form} />
                  </TabsContent>

                  <TabsContent value="skills" className="space-y-6">
                    <SkillsSection form={form} />
                  </TabsContent>

                  <TabsContent value="more" className="space-y-6">
                    <ProjectsSection form={form} />
                    <CertificationsSection form={form} />
                    <LanguagesSection form={form} />
                    <AchievementsSection form={form} />
                  </TabsContent>
                </Tabs>
              </form>
            </CardContent>
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
}
