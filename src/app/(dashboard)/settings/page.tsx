import Link from "next/link";
import { Image, Megaphone, Share2 } from "lucide-react";
import { PageLayout } from "@/components/admin/page-layout";

const SETTINGS_CARDS = [
  {
    label: "Hero Sliders",
    href: "/settings/hero-sliders",
    icon: Image,
    description: "Manage homepage carousel banners",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    label: "Advertisements",
    href: "/settings/ads",
    icon: Megaphone,
    description: "Manage ad placements across the site",
    color: "text-orange-400",
    bg: "bg-orange-400/10",
  },
  {
    label: "Social Links",
    href: "/settings/social-links",
    icon: Share2,
    description: "Manage social media profile links",
    color: "text-slate-700",
    bg: "bg-slate-200/70",
  },
];

export default function SettingsPage() {
  return (
    <PageLayout title="App Settings" description="Manage CMS content and operational configuration">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SETTINGS_CARDS.map(({ label, href, icon: Icon, description, color, bg }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50 hover:bg-accent"
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${bg}`}>
              <Icon className={`h-6 w-6 ${color}`} />
            </div>
            <div>
              <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {label}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </PageLayout>
  );
}
