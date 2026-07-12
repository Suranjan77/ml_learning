"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  ArrowLeft,
  Clock3,
  FlaskConical,
  House,
  Route,
} from "lucide-react";
import {
  algorithmsList,
  type TrackId,
} from "@/data/algorithms_content";
import { getPrerequisiteModules, getTrackModules } from "@/lib/prerequisiteGraph";
import { getTrackAnchor } from "@/lib/tracks";

const trackLabels: Partial<Record<TrackId, string>> = {
  practitioner: "ML Practitioner",
  "modern-ai": "Deep Learning",
  "computer-vision": "Computer Vision",
};

function getModuleId(pathname: string) {
  const match = pathname.match(/^\/algorithms\/([^/]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export default function Sidebar() {
  const pathname = usePathname();
  const moduleId = getModuleId(pathname);
  const currentModule = algorithmsList.find((module) => module.id === moduleId);
  const primaryTrack = currentModule?.tracks?.[0];
  const trackModules = primaryTrack
    ? getTrackModules(primaryTrack)
    : algorithmsList;
  const prerequisites = currentModule
    ? getPrerequisiteModules(currentModule.id)
    : [];
  return (
    <aside
      aria-label="Study navigator"
      className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-[300px] lg:flex-col lg:border-r lg:border-outline lg:bg-surface"
    >
      <div className="shrink-0 border-b border-outline px-5 py-5">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo-favicon.svg"
            alt=""
            width={38}
            height={38}
            priority
            className="h-[38px] w-[38px] shrink-0"
          />
          <div className="min-w-0">
            <p className="font-headline text-base font-medium tracking-wide text-on-surface">
              ML Learn
            </p>
            <p className="font-mono text-[12px] uppercase tracking-[0.1em] text-on-surface-variant">
              Study workspace
            </p>
          </div>
        </Link>
      </div>

      <div className="border-b border-outline bg-surface-container-low px-5 py-5">
        <Link
          href="/tracks"
          className="mb-4 inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.1em] text-on-surface-variant transition-colors hover:text-primary"
        >
          <ArrowLeft size={13} aria-hidden="true" />
          All modules
        </Link>

        {currentModule && (
          <>
            <p className="font-mono text-[12px] uppercase tracking-[0.1em] text-primary">
              Current module
            </p>
            <h2 className="mt-2 text-pretty font-headline text-xl font-medium leading-snug text-on-surface">
              {currentModule.title}
            </h2>
            <div className="mt-3 flex items-center gap-3 font-mono text-[12px] text-on-surface-variant">
              {currentModule.estimatedMinutes && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 size={12} aria-hidden="true" />
                  {currentModule.estimatedMinutes} min
                </span>
              )}
              {currentModule.difficulty && (
                <span>Level {currentModule.difficulty}/4</span>
              )}
            </div>
          </>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        {primaryTrack && (
          <div className="shrink-0 border-b border-outline px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[12px] uppercase tracking-[0.1em] text-on-surface-variant">
                  Learning track
                </p>
                <Link
                  href={`/tracks#${getTrackAnchor(primaryTrack)}`}
                  className="mt-1 block text-sm font-medium text-on-surface transition-colors hover:text-primary"
                >
                  {trackLabels[primaryTrack] ?? primaryTrack}
                </Link>
              </div>
              <span className="font-mono text-[12px] text-on-surface-variant">
                {trackModules.length} modules
              </span>
            </div>
          </div>
        )}

        <nav
          aria-label="Modules in this track"
          className="min-h-0 flex-1 overflow-y-auto px-3 py-4"
        >
          <p className="mb-2 px-2 font-mono text-[12px] uppercase tracking-[0.1em] text-on-surface-variant">
            Track sequence
          </p>
          <ol className="space-y-0.5">
            {trackModules.map((module, index) => {
              const href = `/algorithms/${module.id}`;
              const isActive = currentModule?.id === module.id;
              return (
                <li key={module.id}>
                  <Link
                    href={href}
                    aria-current={isActive ? "page" : undefined}
                    className={clsx(
                      "group relative grid grid-cols-[22px_1fr] items-center gap-2 border px-2 py-2 text-[13px] leading-snug transition-colors",
                      isActive
                        ? "border-outline bg-surface-container-high text-on-surface"
                        : "border-transparent text-on-surface-variant hover:border-outline hover:bg-surface-container-low hover:text-on-surface",
                    )}
                  >
                    {isActive && (
                      <span className="absolute inset-y-1 left-0 w-px bg-primary" />
                    )}
                    <span className="font-mono text-[11px] text-outline-dark">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className={clsx("min-w-0", isActive && "font-medium")}>
                      {module.title}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      <div className="shrink-0 border-t border-outline px-4 py-4">
        {prerequisites.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 font-mono text-[12px] uppercase tracking-[0.1em] text-on-surface-variant">
              Prerequisites
            </p>
            <div className="flex flex-wrap gap-1.5">
              {prerequisites.map((module) => (
                <Link
                  key={module.id}
                  href={`/algorithms/${module.id}`}
                  className="border border-outline bg-surface-container-low px-2 py-1 text-[12px] text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
                >
                  {module.title}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-1">
          <SidebarUtilityLink href="/" label="Home" icon={House} />
          <SidebarUtilityLink href="/tracks" label="Tracks" icon={Route} />
          <SidebarUtilityLink
            href="/playground"
            label="Play"
            icon={FlaskConical}
          />
        </div>
        <p className="mt-3 text-center font-mono text-[12px] uppercase tracking-[0.1em] text-on-surface-variant">
          {algorithmsList.length} modules · 1 interactive lab
        </p>
      </div>
    </aside>
  );
}

function SidebarUtilityLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: typeof House;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className="flex items-center justify-center border border-transparent py-2.5 text-on-surface-variant transition-colors hover:border-outline hover:bg-surface-container-low hover:text-primary"
    >
      <Icon size={18} strokeWidth={1.7} aria-hidden="true" />
    </Link>
  );
}
