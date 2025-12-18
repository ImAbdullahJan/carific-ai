"use client";

import { FileText, Upload } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
