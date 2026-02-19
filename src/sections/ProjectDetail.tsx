import { ArrowLeft, MapPin, Calendar, CircleDollarSign, Building2, FileText, Users, ThumbsUp, CheckCircle2, Clock, Briefcase } from 'lucide-react';
import { useParams, useNavigate, Navigate } from 'react-router';

import type { Project } from '@/types';
import { GlassmorphicBadge } from '@/components/badges/GlassmorphicBadge';
import { CommentThread } from '@/components/interactions/CommentThread';
import { ImageGallery } from '@/components/visualizations/ImageGallery';
import { ApprovalButtons } from '@/components/interactions/ApprovalButtons';
import { ShareDialog } from '@/components/interactions/ShareDialog';
import { RichTextRenderer } from '@/components/ui/rich-text-renderer';
import { useProject } from '@/hooks/use-projects';
import { useComments } from '@/hooks/use-comments';
import { useReactions } from '@/hooks/use-reactions';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from "@/lib/utils";
import * as React from "react";

// Updates Timeline Component
function UpdatesTimeline({ updates }: { updates: Project['updates'] }) {
  if (!updates || updates.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No updates yet
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {updates.map((update, index) => (
        <div key={update.id} className="relative pl-8 pb-6 last:pb-0">
          {/* Timeline line */}
          {index < updates.length - 1 && (
            <div className="absolute left-3 top-6 bottom-0 w-px bg-border" />
          )}

          {/* Checkmark icon */}
          <div className="absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </div>

          {/* Content */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              {new Date(update.date || update.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
            <h4 className="font-semibold mb-1">{update.title}</h4>
            <RichTextRenderer
              content={update.content}
              className="text-sm text-muted-foreground"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// Info Row Component for Sidebar
function InfoRow({
  icon: Icon,
  label,
  value,
  subValue,
  isLast = false,
  highlight = false
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  subValue?: string;
  isLast?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className={cn(
      "flex items-start gap-4 py-4 first:pt-0",
      !isLast && "border-b border-border/40 border-dashed"
    )}>
      <div className={cn(
        "flex h-10 w-10 items-center justify-center rounded-xl shrink-0 transition-colors",
        highlight ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
      )}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em] mb-0.5">{label}</p>
        <p className={cn(
          "font-semibold text-sm sm:text-base leading-tight wrap-break-word",
          highlight ? "text-primary" : "text-foreground"
        )}>{value}</p>
        {subValue && <p className="text-xs text-muted-foreground mt-1 font-medium">{subValue}</p>}
      </div>
    </div>
  );
}

// Approval Rate Component
function ApprovalRate({ approveCount, disapproveCount }: { approveCount: number; disapproveCount: number }) {
  const total = approveCount + disapproveCount;
  const approvalRate = total > 0 ? Math.round((approveCount / total) * 100) : 0;

  return (
    <div className="p-4 rounded-xl  from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ThumbsUp className="h-5 w-5 text-green-600" />
          <span className="font-semibold">Community Approval</span>
        </div>
        <span className="text-2xl font-bold text-green-600">{approvalRate}%</span>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-muted-foreground">{approveCount.toLocaleString()} Approve</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-muted-foreground">{disapproveCount.toLocaleString()} Disapprove</span>
        </div>
      </div>
      <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
          style={{ width: `${approvalRate}%` }}
        />
      </div>
    </div>
  );
}

function ProjectDetailSkeleton() {
  return (
    <div className="animate-in fade-in duration-500">
      {/* Back Button Placeholder */}
      <Skeleton className="h-6 w-32 mb-6" />

      {/* Image Gallery Placeholder */}
      <Skeleton className="w-full aspect-video rounded-3xl mb-8" />

      {/* Header Section Placeholder */}
      <div className="mb-8 space-y-4">
        <div className="flex gap-3">
          <Skeleton className="h-7 w-24 rounded-full" />
          <Skeleton className="h-7 w-20 rounded-full" />
        </div>
        <Skeleton className="h-10 w-3/4 sm:w-1/2" />
        <Skeleton className="h-5 w-40" />
      </div>

      {/* Two Column Layout Placeholder */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <div className="grid gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: project, isLoading: isProjectLoading, isError: isProjectError } = useProject(id!);
  const { data: comments = [], isLoading: isCommentsLoading } = useComments(id!);
  const { data: reactionsData } = useReactions(id!);

  if (isProjectLoading) {
    return <ProjectDetailSkeleton />;
  }

  if (isProjectError || !project) {
    return <Navigate to="/" replace />;
  }

  const approveCount = reactionsData?.likes ?? project.approveCount;
  const disapproveCount = reactionsData?.dislikes ?? project.disapproveCount;
  const totalVotes = approveCount + disapproveCount;
  // const approvalRate = totalVotes > 0 ? Math.round((approveCount / totalVotes) * 100) : 0;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="group mb-6 flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
        <span className="font-medium">Back to projects</span>
      </button>

      {/* Image Gallery */}
      <div className="mb-8">
        <ImageGallery images={project.images} title={project.title} />
      </div>

      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <GlassmorphicBadge status={project.status} />
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            {project.category}
          </span>
        </div>
        <h1 className="text-3xl font-bold sm:text-4xl mb-2">
          {project.title}
        </h1>
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{project.location}</span>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description Card */}
          <section className="rounded-2xl border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              About This Project
            </h2>
            <RichTextRenderer
              content={project.description}
              className="leading-relaxed text-muted-foreground"
            />
          </section>

          {/* Updates Section */}
          <section className="rounded-2xl border bg-card p-6">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Project Updates
            </h2>
            <UpdatesTimeline updates={project.updates} />
          </section>

          {/* Comments Section */}
          <section>
            <CommentThread
              projectId={id!}
              initialComments={comments}
              isLoading={isCommentsLoading}
            />
          </section>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Approval Rate Card */}
          <ApprovalRate
            approveCount={approveCount}
            disapproveCount={disapproveCount}
          />

          {/* Your Vote Card */}
          <div className="rounded-2xl border bg-card p-6">
            <h3 className="font-semibold mb-4 text-center">Cast Your Vote</h3>
            <ApprovalButtons
              projectId={id!}
              approveCount={approveCount}
              disapproveCount={disapproveCount}
              size="lg"
            />
            <div className="flex items-center justify-center gap-2 mt-4 text-sm font-medium text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{totalVotes.toLocaleString()} people have voted</span>
            </div>
          </div>

          {/* Share Card */}
          <div className="rounded-2xl border bg-card p-6">
            <h3 className="font-semibold mb-4">Share This Project</h3>
            <ShareDialog
              title={project.title}
              description={project.description}
            />
          </div>

          {/* Key Info List - Keeping the design the user liked */}
          <div className="rounded-4xl border bg-card backdrop-blur-md p-8 relative overflow-hidden group/info">

            <h3 className="font-bold text-lg mb-8 flex items-center gap-3 text-foreground">
              Project Details
            </h3>

            <div className="relative">
              <InfoRow
                icon={CircleDollarSign}
                label="Estimated Budget"
                value={project.budget}
                highlight
              />
              <InfoRow
                icon={Calendar}
                label="Execution Timeline"
                value={project.timeline}
              />
              {project.contractor && (
                <InfoRow
                  icon={Building2}
                  label="Contractor"
                  value={project.contractor}
                />
              )}
              {project.implementingAgency && (
                <InfoRow
                  icon={Briefcase}
                  label="Implementing Agency"
                  value={project.implementingAgency}
                />
              )}
              {project.contractTerm && (
                <InfoRow
                  icon={Clock}
                  label="Contract Term"
                  value={project.contractTerm}
                />
              )}
              <InfoRow
                icon={Calendar}
                label="Date Started"
                value={new Date(project.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
                subValue={project.endedAt ? `Completed: ${new Date(project.endedAt).toLocaleDateString()}` : undefined}
                isLast
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
