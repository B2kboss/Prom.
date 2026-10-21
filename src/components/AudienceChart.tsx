import React, { useState } from 'react';
import { StatisticsSnapshot } from '../types';
import { TrendingUp, TrendingDown, Calendar, Eye } from 'lucide-react';

interface AudienceChartProps {
  snapshots: StatisticsSnapshot[];
  title?: string;
  metricType?: 'subscribers' | 'views';
}

export const AudienceChart: React.FC<AudienceChartProps> = ({
  snapshots = [],
  title = 'Audience Analytics',
  metricType = 'subscribers',
}) => {
  const [period, setPeriod] = useState<7 | 30 | 90>(30);
  const [hoveredPoint, setHoveredPoint] = useState<StatisticsSnapshot | null>(null);

  // Filter snapshots based on selected period
  const sorted = [...snapshots].sort((a, b) => new Date(a.snapshotDate).getTime() - new Date(b.snapshotDate).getTime());
  const data = sorted.slice(-period);

  if (data.length < 2) {
    return (
      <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-6 text-center text-slate-400 text-sm">
        Insufficient statistical history. Automated sync will populate this graph over the next 24 hours.
      </div>
    );
  }

  const values = data.map((d) => (metricType === 'views' ? d.viewsPerPost : d.audienceCount));
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  const firstVal = values[0];
  const lastVal = values[values.length - 1];
  const netChange = lastVal - firstVal;
  const pctChange = firstVal > 0 ? +((netChange / firstVal) * 100).toFixed(2) : 0;
  const isPositive = netChange >= 0;

  // SVG Chart geometry
  const width = 640;
  const height = 180;
  const paddingX = 20;
  const paddingY = 25;

  const points = data.map((d, idx) => {
    const val = metricType === 'views' ? d.viewsPerPost : d.audienceCount;
    const x = paddingX + (idx / (data.length - 1)) * (width - paddingX * 2);
    const y = height - paddingY - ((val - minVal) / range) * (height - paddingY * 2);
    return { x, y, snapshot: d, value: val };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className="bg-[#0b0f19] border border-slate-800/90 rounded-xl p-5 shadow-sm">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="text-xs font-medium text-slate-400 flex items-center gap-2">
            <span>{title}</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-500">{metricType === 'views' ? 'Avg. Views Per Post' : 'Subscribers / Followers'}</span>
          </div>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-2xl font-bold text-white tabular-nums">
              {lastVal.toLocaleString()}
            </span>
            <span className={`text-xs font-semibold tabular-nums flex items-center gap-1 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {isPositive ? '+' : ''}{netChange.toLocaleString()} ({isPositive ? '+' : ''}{pctChange}%)
            </span>
          </div>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg self-start sm:self-auto">
          {([7, 30, 90] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                period === p ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {p}D
            </button>
          ))}
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-hidden">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-44 overflow-visible"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal gridlines */}
          <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="#1e293b" strokeDasharray="3 3" />
          <line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} stroke="#1e293b" strokeDasharray="3 3" />
          <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="#1e293b" />

          {/* Area fill */}
          <path d={areaD} fill="url(#chartGradient)" />

          {/* Stroke path */}
          <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Data points */}
          {points.map((pt, i) => (
            <g key={i}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredPoint?.id === pt.snapshot.id ? 5 : 2.5}
                className="fill-blue-500 transition-all cursor-pointer"
                stroke="#07090e"
                strokeWidth="2"
                onMouseEnter={() => setHoveredPoint(pt.snapshot)}
              />
              {/* Invisible larger hover hit area */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r="12"
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint(pt.snapshot)}
              />
            </g>
          ))}
        </svg>

        {/* Hover Tooltip Box */}
        {hoveredPoint && (
          <div className="absolute top-2 right-2 bg-slate-900 border border-slate-700/80 px-3 py-2 rounded-lg text-xs shadow-xl pointer-events-none">
            <div className="text-slate-400 text-[11px] flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-slate-500" />
              <span>{hoveredPoint.snapshotDate}</span>
            </div>
            <div className="font-bold text-white text-sm tabular-nums mt-0.5">
              {(metricType === 'views' ? hoveredPoint.viewsPerPost : hoveredPoint.audienceCount).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              24h Change: <span className={hoveredPoint.absoluteChange24h >= 0 ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                {hoveredPoint.absoluteChange24h >= 0 ? '+' : ''}{hoveredPoint.absoluteChange24h.toLocaleString()} ({hoveredPoint.percentChange24h}%)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Axis Footer */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
        <span>{data[0].snapshotDate}</span>
        <span className="text-slate-400">Verified 24h Snapshot Intervals</span>
        <span>{data[data.length - 1].snapshotDate}</span>
      </div>
    </div>
  );
};
