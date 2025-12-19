"use client";

import { PDFViewer } from "@react-pdf/renderer";
import { useMemo } from "react";
import { useDebounce } from "use-debounce";
import { ResumeTemplate } from "./resume-template";
import type { getFullProfile } from "@/lib/db/profile";

type FullProfile = NonNullable<Awaited<ReturnType<typeof getFullProfile>>>;

interface PDFViewerClientProps {
  profile: FullProfile;
}

export function PDFViewerClient({ profile }: PDFViewerClientProps) {
  // Distinct the preview update from the typing
  const [debouncedProfile] = useDebounce(profile, 500);

  const document = useMemo(
    () => <ResumeTemplate profile={debouncedProfile} />,
    [debouncedProfile]
  );

  // Generate a stable key for the PDFViewer to force remount when data changes.
  // This works around a known react-pdf bug where dynamic content changes
  // cause "Eo is not a function" errors.
  const viewerKey = JSON.stringify(debouncedProfile);

  return (
    <PDFViewer
      key={viewerKey}
      style={{
        width: "100%",
        height: "calc(100vh - 180px)",
        border: "none",
      }}
      showToolbar={false}
    >
      {document}
    </PDFViewer>
  );
}
