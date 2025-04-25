"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, X, AlertTriangle, FileAudio, User } from "lucide-react";

const activities = [
  {
    id: 1,
    user: {
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
      avatar: "/avatars/01.png",
      initials: "SJ",
    },
    action: "completed",
    target: "Challenge #42",
    time: "2 minutes ago",
    icon: Check,
    iconClass: "text-green-500",
  },
  {
    id: 2,
    user: {
      name: "Michael Chen",
      email: "m.chen@example.com",
      avatar: "/avatars/02.png",
      initials: "MC",
    },
    action: "flagged",
    target: "Transcription in Challenge #78",
    time: "45 minutes ago",
    icon: AlertTriangle,
    iconClass: "text-yellow-500",
  },
  {
    id: 3,
    user: {
      name: "Admin",
      email: "admin@example.com",
      avatar: "/avatars/03.png",
      initials: "AD",
    },
    action: "added",
    target: "New Challenge #127",
    time: "2 hours ago",
    icon: FileAudio,
    iconClass: "text-blue-500",
  },
  {
    id: 4,
    user: {
      name: "Elena Rodriguez",
      email: "e.rod@example.com",
      avatar: "/avatars/04.png",
      initials: "ER",
    },
    action: "registered",
    target: "as a new contributor",
    time: "5 hours ago",
    icon: User,
    iconClass: "text-indigo-500",
  },
  {
    id: 5,
    user: {
      name: "James Wilson",
      email: "j.wilson@example.com",
      avatar: "/avatars/05.png",
      initials: "JW",
    },
    action: "failed",
    target: "Challenge #56 validation",
    time: "1 day ago",
    icon: X,
    iconClass: "text-red-500",
  },
];

export function RecentActivity() {
  return (
    <div className="space-y-8">
      {activities.map((activity) => {
        const Icon = activity.icon;
        return (
          <div key={activity.id} className="flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarImage src={activity.user.avatar} alt="Avatar" />
              <AvatarFallback>{activity.user.initials}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">
                {activity.user.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {activity.action} {activity.target}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <p className="text-xs text-muted-foreground">{activity.time}</p>
              <Icon className={`h-4 w-4 ${activity.iconClass}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
} 