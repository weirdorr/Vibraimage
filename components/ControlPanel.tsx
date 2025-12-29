
import React from 'react';
import { ProcessingConfig } from '../types';

interface Props {
  config: ProcessingConfig;
  setConfig: React.Dispatch<React.SetStateAction<ProcessingConfig>>;
}

const ControlPanel: React.FC<Props> = ({ config, setConfig }) => {
  return (
    <div className="bg-zinc-900/80 backdrop-blur-md p-6 rounded-2xl border border-zinc-800 flex flex-col gap-6 shadow-xl">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
        引擎参数设置
      </h2>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-xs uppercase text-zinc-400 font-semibold tracking-wider">噪声阈值 (Threshold)</label>
            <span className="text-xs text-blue-400">{config.threshold}</span>
          </div>
          <input 
            type="range" min="1" max="50" step="1" 
            value={config.threshold} 
            onChange={(e) => setConfig(prev => ({ ...prev, threshold: Number(e.target.value) }))}
            className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <label className="text-xs uppercase text-zinc-400 font-semibold tracking-wider">振动灵敏度 (Sensitivity)</label>
            <span className="text-xs text-blue-400">{config.sensitivity}</span>
          </div>
          <input 
            type="range" min="1" max="20" step="0.5" 
            value={config.sensitivity} 
            onChange={(e) => setConfig(prev => ({ ...prev, sensitivity: Number(e.target.value) }))}
            className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <label className="text-xs uppercase text-zinc-400 font-semibold tracking-wider">时间平滑度 (Smoothing)</label>
            <span className="text-xs text-blue-400">{config.smoothing.toFixed(2)}</span>
          </div>
          <input 
            type="range" min="0.5" max="0.99" step="0.01" 
            value={config.smoothing} 
            onChange={(e) => setConfig(prev => ({ ...prev, smoothing: Number(e.target.value) }))}
            className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>
      </div>

      <div className="pt-4 border-t border-zinc-800 space-y-3">
        <label className="flex items-center gap-3 cursor-pointer group">
          <input 
            type="checkbox" 
            checked={config.showAura} 
            onChange={(e) => setConfig(prev => ({ ...prev, showAura: e.target.checked }))}
            className="w-4 h-4 rounded bg-zinc-800 border-zinc-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-zinc-900"
          />
          <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">开启光谱可视化 (Aura)</span>
        </label>
        
        <label className="flex items-center gap-3 cursor-pointer group">
          <input 
            type="checkbox" 
            checked={config.showRaw} 
            onChange={(e) => setConfig(prev => ({ ...prev, showRaw: e.target.checked }))}
            className="w-4 h-4 rounded bg-zinc-800 border-zinc-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-zinc-900"
          />
          <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">显示原始视频馈送</span>
        </label>
      </div>
    </div>
  );
};

export default ControlPanel;
