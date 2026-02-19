import { useState, useMemo } from 'react';
import {
  FolderOpen,
  CheckCircle2,
  Loader2,
  TrendingUp,
  Users,
  ThumbsDown,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/auth';
import {
  useDashboardStats,
  useProjectTrends,
  useEngagementTrends,
  useTopProjects,
  useWorstProjects,
  useStatusTrends,
} from '@/hooks/use-dashboard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Donut Chart component
function DonutChart({
  data,
  size = 200,
  showLegend = true,
  totalValue
}: {
  data: { label: string; value: number; color: string }[];
  size?: number;
  showLegend?: boolean;
  totalValue: number;
}) {
  const chartItems = useMemo(() => {
    const items = [];
    let currentAngle = 0;
    for (const item of data) {
      const angle = (item.value / totalValue) * 360 || 0;
      const startAngle = currentAngle;
      if (angle > 0) currentAngle += angle;
      items.push({ ...item, angle, startAngle });
    }
    return items;
  }, [data, totalValue]);

  // Calculate donut chart dimensions dynamically
  const center = size / 2;
  const strokeWidth = size / 10; // 10% of size for stroke width
  const radius = (size - strokeWidth) / 2; // Radius accounting for stroke width

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {chartItems.map((item, index) => {
          if (item.angle === 0) return null;
          const { startAngle, angle } = item;

          const startRad = (startAngle - 90) * (Math.PI / 180);
          const endRad = (startAngle + angle - 90) * (Math.PI / 180);

          const x1 = center + radius * Math.cos(startRad);
          const y1 = center + radius * Math.sin(startRad);
          const x2 = center + radius * Math.cos(endRad);
          const y2 = center + radius * Math.sin(endRad);

          const largeArc = angle > 180 ? 1 : 0;

          // Handle full circle case
          if (angle >= 359.99) {
            return (
              <circle
                key={index}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth={strokeWidth}
                className="animate-in fade-in duration-700"
              />
            );
          }

          return (
            <path
              key={index}
              d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`}
              fill="none"
              stroke={item.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              className="animate-in fade-in duration-700"
              style={{ animationDelay: `${index * 100}ms` }}
            />
          );
        })}
      </svg>

      {showLegend && (
        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 w-full">
          {data.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full shrink-0 "
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <span className="ml-auto text-sm font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Grouped Bar Chart Component
function GroupedBarChart({
  data,
  timeFilter
}: {
  data: Array<{
    month: string;
    ongoing: number;
    completed: number;
    planned: number;
    approved_proposal: number;
    on_hold: number;
    cancelled: number;
  }>;
  timeFilter: 'monthly' | 'yearly';
}) {
  const [hoveredData, setHoveredData] = useState<{
    month: string;
    status: string;
    value: number;
    x: number;
    y: number;
  } | null>(null);

  const statusConfig = [
    { key: 'ongoing', label: 'Ongoing', color: '#0082f3' },
    { key: 'completed', label: 'Completed', color: '#10b981' },
    { key: 'planned', label: 'Planned', color: '#f59e0b' },
    { key: 'approved_proposal', label: 'Approved Proposal', color: '#8b5cf6' },
    { key: 'on_hold', label: 'On Hold', color: '#f97316' },
    { key: 'cancelled', label: 'Cancelled', color: '#ff3352' },
  ];

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No data available
      </div>
    );
  }

  // Chart dimensions
  const margin = { top: 20, right: 20, bottom: 60, left: 50 };
  const width = 600;
  const height = 300;
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Calculate max value for Y scale
  const allValues = data.flatMap(d =>
    statusConfig.map(s => d[s.key as keyof typeof d] as number)
  );
  const maxValue = Math.max(...allValues, 1);
  const yMax = Math.ceil(maxValue * 1.1); // Add 10% padding

  // Calculate scales
  const groupWidth = chartWidth / data.length;
  const barWidth = (groupWidth * 0.7) / statusConfig.length;
  const groupPadding = groupWidth * 0.15;

  // Format month label
  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    if (timeFilter === 'yearly') {
      return year;
    }
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  // Y-axis ticks
  const yTicks = 5;
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) =>
    Math.round((yMax / yTicks) * i)
  );

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-64"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Background grid */}
        {yTickValues.map((tick, i) => {
          const y = margin.top + chartHeight - (tick / yMax) * chartHeight;
          return (
            <g key={i}>
              <line
                x1={margin.left}
                y1={y}
                x2={width - margin.right}
                y2={y}
                stroke="currentColor"
                strokeOpacity="0.1"
                className="text-border"
              />
            </g>
          );
        })}

        {/* Y-axis */}
        <line
          x1={margin.left}
          y1={margin.top}
          x2={margin.left}
          y2={height - margin.bottom}
          stroke="currentColor"
          strokeOpacity="0.3"
          className="text-foreground"
        />

        {/* Y-axis labels */}
        {yTickValues.map((tick, i) => {
          const y = margin.top + chartHeight - (tick / yMax) * chartHeight;
          return (
            <text
              key={i}
              x={margin.left - 10}
              y={y + 4}
              textAnchor="end"
              fontSize="11"
              fill="currentColor"
              className="text-muted-foreground"
            >
              {tick}
            </text>
          );
        })}

        {/* X-axis */}
        <line
          x1={margin.left}
          y1={height - margin.bottom}
          x2={width - margin.right}
          y2={height - margin.bottom}
          stroke="currentColor"
          strokeOpacity="0.3"
          className="text-foreground"
        />

        {/* Bars and X-axis labels */}
        {data.map((d, groupIndex) => {
          const groupX = margin.left + groupIndex * groupWidth + groupPadding;

          return (
            <g key={d.month}>
              {/* X-axis label */}
              <text
                x={groupX + (groupWidth - groupPadding * 2) / 2}
                y={height - margin.bottom + 20}
                textAnchor="middle"
                fontSize="10"
                fill="currentColor"
                className="text-muted-foreground"
                transform={`rotate(-45, ${groupX + (groupWidth - groupPadding * 2) / 2}, ${height - margin.bottom + 20})`}
              >
                {formatMonth(d.month)}
              </text>

              {/* Bars for each status */}
              {statusConfig.map((status, statusIndex) => {
                const value = d[status.key as keyof typeof d] as number;
                const barHeight = (value / yMax) * chartHeight;
                const x = groupX + statusIndex * barWidth;
                const y = margin.top + chartHeight - barHeight;

                return (
                  <rect
                    key={`${d.month}-${status.key}`}
                    x={x}
                    y={y}
                    width={barWidth - 1}
                    height={barHeight}
                    fill={status.color}
                    rx={2}
                    className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                    style={{
                      animationDelay: `${groupIndex * 50 + statusIndex * 30}ms`
                    }}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setHoveredData({
                        month: d.month,
                        status: status.label,
                        value,
                        x: rect.left + rect.width / 2,
                        y: rect.top
                      });
                    }}
                    onMouseLeave={() => setHoveredData(null)}
                  />
                );
              })}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        {statusConfig.map((status) => (
          <div key={status.key} className="flex items-center gap-1.5">
            <div
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: status.color }}
            />
            <span className="text-xs text-muted-foreground">{status.label}</span>
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {hoveredData && (
        <div
          className="fixed z-50 px-3 py-2 bg-popover border rounded-lg shadow-lg text-sm pointer-events-none"
          style={{
            left: hoveredData.x,
            top: hoveredData.y - 60,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="font-medium">{hoveredData.status}</div>
          <div className="text-muted-foreground">
            {formatMonth(hoveredData.month)}: {hoveredData.value} projects
          </div>
        </div>
      )}
    </div>
  );
}

// Sparkline component
function Sparkline({ data, color = '#0082f3' }: { data: number[]; color?: string }) {
  if (data.length < 2) {
    return (
      <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs italic">
        Insufficient data for trend
      </div>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        className="animate-in fade-in duration-1000"
      />
    </svg>
  );
}

// Stat Card
function StatCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
  trendUp
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  trend?: string;
  trendUp?: boolean;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {trend !== undefined && (
            <div className={cn(
              'mt-1 flex items-center gap-1 text-xs font-medium',
              trendUp ? 'text-green-500' : 'text-red-500'
            )}>
              <TrendingUp className={cn('h-3 w-3', !trendUp && 'rotate-180')} />
              <span>{trend}</span>
            </div>
          )}
        </div>
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', color)}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}

// Activity Item
function ActivityItem({
  icon: Icon,
  title,
  description,
  time,
  color
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  time: string;
  color: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-muted">
      <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', color)}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-muted-foreground line-clamp-1">{description}</p>
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap">{time}</span>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Placeholder */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48 sm:h-12" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Key Stats Placeholder */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-2xl" />
        ))}
      </div>

      {/* Charts Grid Placeholder */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Skeleton className="h-[400px] w-full rounded-2xl" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-2xl" />
      </div>

      {/* Bottom Grid Placeholder */}
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-96 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    </div>
  );
}

export function Dashboard() {
  const { user } = useAuth();
  const [timeFilter, setTimeFilter] = useState<'monthly' | 'yearly'>('monthly');
  const months = timeFilter === 'monthly' ? 12 : 60;

  const { data: stats, isLoading: statsLoading, isError: statsError } = useDashboardStats();
  const { data: projectTrends } = useProjectTrends(months);
  const { data: engagementTrends } = useEngagementTrends(months);
  const { data: topProjects = [] } = useTopProjects(4);
  const { data: worstProjects = [] } = useWorstProjects(3);
  const { data: statusTrends } = useStatusTrends(months);

  const statusData = useMemo(() => {
    if (!stats) return [];
    return [
      { label: 'Ongoing', value: stats.ongoingProjects, color: '#0082f3' },
      { label: 'Completed', value: stats.completedProjects, color: '#10b981' },
      { label: 'Planned', value: stats.plannedProjects, color: '#f59e0b' },
      { label: 'Approved Proposal', value: stats.approvedProposalProjects, color: '#8b5cf6' },
      { label: 'On Hold', value: stats.onHoldProjects, color: '#f97316' },
      { label: 'Cancelled', value: stats.cancelledProjects, color: '#ff3352' },
    ].filter(d => d.value > 0);
  }, [stats]);

  if (statsLoading) return <DashboardSkeleton />;

  if (statsError || !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <ThumbsDown className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold">Failed to load dashboard</h2>
        <p className="text-muted-foreground">Please try again later.</p>
      </div>
    );
  }

  // const completedPct = stats.totalProjects > 0 ? Math.round((stats.completedProjects / stats.totalProjects) * 100) : 0;
  // const ongoingPct = stats.totalProjects > 0 ? Math.round((stats.ongoingProjects / stats.totalProjects) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-muted-foreground">
            Overview of civic projects and community engagement
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={timeFilter} onValueChange={(v) => setTimeFilter(v as 'monthly' | 'yearly')}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="City Population"
          value={stats.cityPopulation.toLocaleString()}
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Projects"
          value={stats.totalProjects}
          icon={FolderOpen}
          color="bg-indigo-500"
        />
        <StatCard
          title="Completed"
          value={`${stats.completedProjects}`}
          icon={CheckCircle2}
          color="bg-green-500"
        />
        <StatCard
          title="Ongoing"
          value={`${stats.ongoingProjects}`}
          icon={Loader2}
          color="bg-amber-500"
        />
      </div>

      {/* Main Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Project Status Donut Chart */}
        <div className="rounded-2xl border bg-card p-6">
          <h3 className="text-lg font-semibold mb-6">Project Status Distribution</h3>
          <div className="flex justify-center">
            <DonutChart
              data={statusData}
              size={220}
              totalValue={stats.totalProjects}
            />
          </div>
        </div>

        {/* Project Status Bar Chart */}
        <div className="rounded-2xl border bg-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Projects by Status</h3>
            <span className="text-sm text-muted-foreground">
              Last {months} months
            </span>
          </div>
          {statusTrends ? (
            <GroupedBarChart data={statusTrends} timeFilter={timeFilter} />
          ) : (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </div>

      {/* Trends Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Project Trend */}
        <div className="rounded-2xl border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Project Initiation Trend</h3>
            <span className="text-sm text-muted-foreground">
              Last {months} months
            </span>
          </div>
          <div className="h-40">
            {projectTrends ? (
              <Sparkline
                data={projectTrends.trends.map(t => t.count)}
                color="#0082f3"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">New projects trend</span>
            {projectTrends && (
              <span className={cn(
                "font-semibold flex items-center gap-1",
                projectTrends.percentChange >= 0 ? "text-green-500" : "text-red-500"
              )}>
                <ArrowUpRight className={cn("h-4 w-4", projectTrends.percentChange < 0 && "rotate-90")} />
                {projectTrends.percentChange >= 0 ? '+' : ''}{projectTrends.percentChange}%
              </span>
            )}
          </div>
        </div>

        {/* Approval Trend */}
        <div className="rounded-2xl border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Community Engagement Trend</h3>
            <span className="text-sm text-muted-foreground">
              Last {months} months
            </span>
          </div>
          <div className="h-40">
            {engagementTrends ? (
              <Sparkline
                data={engagementTrends.trends.map(t => t.count)}
                color="#10b981"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Engagement trend</span>
            {engagementTrends && (
              <span className={cn(
                "font-semibold flex items-center gap-1",
                engagementTrends.percentChange >= 0 ? "text-green-500" : "text-red-500"
              )}>
                <ArrowUpRight className={cn("h-4 w-4", engagementTrends.percentChange < 0 && "rotate-90")} />
                {engagementTrends.percentChange >= 0 ? '+' : ''}{engagementTrends.percentChange}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Secondary Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <div className="rounded-2xl border bg-card p-6">
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          {!user ? (
            <div className="py-8 text-center space-y-3">
              <p className="text-sm text-muted-foreground">Sign in to see your recent activity and engagement.</p>
              <Button asChild variant="outline" size="sm">
                <a href="/login">Sign In</a>
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
              <ActivityItem
                icon={CheckCircle2}
                title="Activity tracking active"
                description="Your contributions are being recorded."
                time="Now"
                color="bg-blue-500"
              />
              <p className="text-xs text-muted-foreground text-center py-4 italic">
                Full activity feed coming soon to your profile.
              </p>
            </div>
          )}
        </div>

        {/* Top Projects */}
        <div className="rounded-2xl border bg-card p-6">
          <h3 className="font-semibold mb-4">Top Performing Projects</h3>
          <div className="space-y-4">
            {topProjects.length > 0 ? (
              topProjects.map((project, index) => (
                <div key={project.id} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{project.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{project.approveCount} approvals</span>
                      <span>•</span>
                      <span>{project.commentCount} comments</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No project data available</p>
            )}
          </div>
        </div>

        {/* Worst Performing Projects */}
        <div className="rounded-2xl border bg-card p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <ThumbsDown className="h-4 w-4 text-red-500" />
            Most Disapproved
          </h3>
          <div className="space-y-4">
            {worstProjects.length > 0 ? (
              worstProjects.map((project, index) => (
                <div key={project.id} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-xs font-semibold text-red-600 dark:text-red-400">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{project.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="text-red-500">{project.disapproveCount} disapprovals</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No project data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
