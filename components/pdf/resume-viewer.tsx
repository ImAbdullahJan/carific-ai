"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { pdf } from "@react-pdf/renderer";
import { Download, Loader2, FileText, Upload } from "lucide-react";
import Link from "next/link";
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
        style={{ height: "calc(100vh - 200px)" }}
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

interface ResumeViewerProps {
  profile: FullProfile;
}

export function ResumeViewer({ profile }: ResumeViewerProps) {
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
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {profile.displayName}&apos;s Resume
          </h1>
          <p className="text-muted-foreground">
            Preview and download your generated resume
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/profile">
              <Upload className="h-4 w-4 mr-2" />
              Update Profile
            </Link>
          </Button>
          <Button onClick={handleDownload} disabled={isDownloading}>
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
        </div>
      </div>

      {/* PDF Viewer - dynamically loaded to avoid SSR issues */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <PDFViewerClient profile={profile} />
        </CardContent>
      </Card>
    </div>
  );
}

export function EmptyProfileState() {
  return (
    <Card className="max-w-md mx-auto mt-12">
      <CardContent className="pt-6 text-center space-y-4">
        <FileText className="h-16 w-16 text-muted-foreground mx-auto" />
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">No Profile Found</h2>
          <p className="text-muted-foreground">
            You haven&apos;t created a profile yet. Upload your resume to get
            started.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/profile">
            <Upload className="h-4 w-4 mr-2" />
            Upload Resume
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
