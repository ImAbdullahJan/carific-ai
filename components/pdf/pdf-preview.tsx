"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { pdf } from "@react-pdf/renderer";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ResumeTemplate } from "./resume-template";
import type { getFullProfile } from "@/lib/db/profile";

// Dynamically import PDFViewer with SSR disabled
const PDFViewerClient = dynamic(
  () => import("./pdf-viewer-client").then((mod) => mod.PDFViewerClient),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex items-center justify-center bg-muted"
        style={{ height: "calc(100vh - 220px)" }}
      >
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">Loading PDF viewer...</p>
        </div>
      </div>
    ),
  }
);

type FullProfile = NonNullable<Awaited<ReturnType<typeof getFullProfile>>>;

interface PDFPreviewProps {
  profile: FullProfile;
  title?: string;
  showDownload?: boolean;
  height?: string;
}

export function PDFPreview({
  profile,
  title = "Resume Preview",
  showDownload = true,
  height = "calc(100vh - 220px)",
}: PDFPreviewProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const blob = await pdf(<ResumeTemplate profile={profile} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${profile.displayName?.replace(/\s+/g, "_") || "resume"}_resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Resume downloaded successfully");
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        {showDownload && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </>
            )}
          </Button>
        )}
      </div>
      <Card className="flex-1 overflow-hidden">
        <CardContent className="p-0" style={{ height }}>
          <PDFViewerClient profile={profile} />
        </CardContent>
      </Card>
    </div>
  );
}
