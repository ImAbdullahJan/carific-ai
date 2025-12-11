"use client";

import {
  Search,
  Plus,
  Wrench,
  Users,
  BookOpen,
  LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MissingKeyword } from "@/lib/validations/resume-analysis";
import { cn } from "@/lib/utils";

interface MissingKeywordsProps {
  keywords?: MissingKeyword[];
}

type Category = MissingKeyword["category"];

interface CategoryConfig {
  icon: LucideIcon;
  label: string;
  className: string;
  description: string;
}

const CATEGORY_CONFIG: Record<Category, CategoryConfig> = {
  "Hard Skill": {
    icon: Wrench,
    label: "Hard Skills",
    className: "text-blue-500",
    description: "Learnable, measurable skills you can add",
  },
  "Soft Skill": {
    icon: Users,
    label: "Soft Skills",
    className: "text-purple-500",
    description: "Reframe existing experience to highlight these",
  },
  Domain: {
    icon: BookOpen,
    label: "Domain Knowledge",
    className: "text-emerald-500",
    description: "Industry-specific expertise",
  },
};

const CATEGORY_ORDER: Category[] = ["Hard Skill", "Soft Skill", "Domain"];

export function MissingKeywords({ keywords }: MissingKeywordsProps) {
  if (!keywords || keywords.length === 0) return null;

  const getImportanceStyles = (importance: MissingKeyword["importance"]) => {
    switch (importance) {
      case "Critical":
        return {
          badge: "bg-red-500/10 text-red-600 border-red-500/20",
          dot: "bg-red-500",
        };
      case "Important":
        return {
          badge: "bg-amber-500/10 text-amber-600 border-amber-500/20",
          dot: "bg-amber-500",
        };
      case "Nice to Have":
        return {
          badge: "bg-slate-500/10 text-slate-600 border-slate-500/20",
          dot: "bg-slate-400",
        };
    }
  };

  // Group keywords by category
  const groupedKeywords = keywords.reduce(
    (acc, keyword) => {
      if (!acc[keyword.category]) {
        acc[keyword.category] = [];
      }
      acc[keyword.category].push(keyword);
      return acc;
    },
    {} as Record<Category, MissingKeyword[]>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Search className="h-5 w-5 text-amber-500" />
          Missing Keywords
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          These terms from the job posting aren&apos;t in your resume
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-6">
          {CATEGORY_ORDER.map((category) => {
            const items = groupedKeywords[category];
            if (!items || items.length === 0) return null;

            const config = CATEGORY_CONFIG[category];
            const CategoryIcon = config.icon;

            return (
              <div key={category}>
                <div className="flex items-center gap-2 mb-3">
                  <CategoryIcon className={cn("h-4 w-4", config.className)} />
                  <h4 className="font-medium text-sm">{config.label}</h4>
                  <span className="text-xs text-muted-foreground">
                    ({items.length})
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-3 -mt-1">
                  {config.description}
                </p>
                <div className="space-y-2">
                  {items.map((item, index) => {
                    const styles = getImportanceStyles(item.importance);
                    return (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full mt-2 shrink-0",
                            styles.dot
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm">
                              {item.keyword}
                            </span>
                            <Badge
                              variant="outline"
                              className={cn("text-xs", styles.badge)}
                            >
                              {item.importance}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                            <Plus className="h-3 w-3 shrink-0" />
                            {item.whereToAdd}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
