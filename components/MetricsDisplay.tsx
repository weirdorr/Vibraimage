
import React from 'react';
import { VibraMetrics } from '../types';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from 'recharts';

interface Props {
  metrics: VibraMetrics;
  history: VibraMetrics[];
  analysis: string | null;
  onAnalyze: () => void;
  loading: boolean;
}

const MetricCard = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="bg-zinc-800/40 border border-zinc-700/50 p-4 rounded-xl">
    <div className="flex justify-between items-end mb-2">
      <span className="text-xs font-bold text-zinc-400 uppercase tracking-tighter">{label}</span>
      <span className="text-lg font-mono font-bold" style={{ color }}>{value.toFixed(1)}%</span>
    </div>
    <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
      <div 
        className="h-full transition-all duration-300 ease-out" 
        style={{ width: `${value}%`, backgroundColor: color }}
      ></div>
    </div>
  </div>
);

const MetricsDisplay: React.FC<Props> = ({ metrics, history, analysis, onAnalyze, loading }) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Real-time Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <MetricCard label="压力值" value={metrics.stress} color="#f87171" />
        <MetricCard label="焦虑感" value={metrics.anxiety} color="#fb923c" />
        <MetricCard label="攻击性" value={metrics.aggression} color="#ef4444" />
        <MetricCard label="能量水平" value={metrics.energy} color="#4ade80" />
        <MetricCard label="平衡度" value={metrics.balance} color="#60a5fa" />
      </div>

      {/* Historical Chart */}
      <div className="bg-zinc-900/80 p-6 rounded-2xl border border-zinc-800 h-64 shadow-xl">
        <h3 className="text-xs font-bold text-zinc-500 uppercase mb-4 tracking-widest">时间动力学趋势</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history.slice(-30)}>
            <defs>
              <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f87171" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis hide dataKey="timestamp" />
            <YAxis hide domain={[0, 100]} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }}
              labelStyle={{ display: 'none' }}
            />
            <Area type="monotone" dataKey="stress" stroke="#f87171" fillOpacity={1} fill="url(#colorStress)" strokeWidth={2} name="压力" />
            <Area type="monotone" dataKey="balance" stroke="#60a5fa" fill="transparent" strokeWidth={2} name="平衡" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Gemini Analysis Section */}
      <div className="bg-gradient-to-br from-indigo-900/20 to-zinc-900 border border-indigo-500/20 p-6 rounded-2xl shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
            AI 认知洞察
          </h3>
          <button 
            onClick={onAnalyze}
            disabled={loading}
            className="text-xs bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-700 px-4 py-2 rounded-full font-bold transition-all flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                深度扫描中...
              </>
            ) : "开始深度扫描"}
          </button>
        </div>
        
        <div className="min-h-[100px] flex items-center justify-center">
          {analysis ? (
            <p className="text-zinc-300 text-sm leading-relaxed italic animate-in fade-in slide-in-from-bottom-2 duration-700">
              "{analysis}"
            </p>
          ) : (
            <p className="text-zinc-500 text-sm italic">
              点击“开始深度扫描”以获取心理生理状态的专业解读。
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetricsDisplay;
