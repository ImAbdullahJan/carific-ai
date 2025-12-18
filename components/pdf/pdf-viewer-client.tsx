"use client";

import { PDFViewer } from "@react-pdf/renderer";
import { ResumeTemplate } from "./resume-template";
import type { getFullProfile } from "@/lib/db/profile";

type FullProfile = NonNullable<Awaited<ReturnType<typeof getFullProfile>>>;

interface PDFViewerClientProps {
  profile: FullProfile;
}

export function PDFViewerClient({ profile }: PDFViewerClientProps) {
  const profileKey = profile.updatedAt.toISOString();

  return (
    <PDFViewer
      key={profileKey}
      style={{
        width: "100%",
        height: "calc(100vh - 200px)",
        border: "none",
      }}
      showToolbar={false}
    >
      <ResumeTemplate key={profileKey} profile={profile} />
    </PDFViewer>
  );
}
