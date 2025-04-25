import React from "react";

interface AdminPageTitleProps {
  title: string;
  description?: string;
}

export function AdminPageTitle({ title, description }: AdminPageTitleProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
} 