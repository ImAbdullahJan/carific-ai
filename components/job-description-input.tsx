"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";

interface JobDescriptionInputProps {
  value: string;
  onChange: (text: string) => void;
  disabled?: boolean;
}

export function JobDescriptionInput({
  value,
  onChange,
  disabled,
}: JobDescriptionInputProps) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>
          Paste the job description you&apos;re applying for
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          placeholder="Paste the full job description here including requirements, responsibilities, and qualifications..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="min-h-[300px] text-sm"
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {value.length.toLocaleString()} characters
          </p>
          {value && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange("")}
              disabled={disabled}
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
