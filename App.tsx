
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { VibraEngine } from './services/vibraEngine';
import { getEmotionalAnalysisAsync as getEmotionalAnalysis } from './services/geminiService';
import { VibraMetrics, ProcessingConfig } from './types';
import ControlPanel from './components/ControlPanel';
import MetricsDisplay from './components/MetricsDisplay';

const DEFAULT_CONFIG: ProcessingConfig = {
  threshold: 8,
  sensitivity: 4,
  smoothing: 0.85,
  showRaw: true,
  showAura: true,
};

const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const auraCanvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<VibraEngine>(new VibraEngine());
  const requestRef = useRef<number>(undefined);

  const [config, setConfig] = useState<ProcessingConfig>(DEFAULT_CONFIG);
  const [metrics, setMetrics] = useState<VibraMetrics>({
    stress: 0, anxiety: 0, aggression: 0, energy: 0, balance: 100, timestamp: Date.now()
  });
  const [history, setHistory] = useState<VibraMetrics[]>([]);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480, frameRate: 30 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setHasCamera(true);
      }
    } catch (err) {
      setError("无法访问摄像头或摄像头不可用。");
      console.error(err);
    }
  };

  const processFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !auraCanvasRef.current) {
      requestRef.current = requestAnimationFrame(processFrame);
      return;
    }
    
    const video = videoRef.current;
    
    if (video.readyState >= video.HAVE_METADATA && video.videoWidth > 0) {
      const { videoWidth: width, videoHeight: height } = video;

      if (canvasRef.current.width !== width) canvasRef.current.width = width;
      if (canvasRef.current.height !== height) canvasRef.current.height = height;
      if (auraCanvasRef.current.width !== width) auraCanvasRef.current.width = width;
      if (auraCanvasRef.current.height !== height) auraCanvasRef.current.height = height;

      const ctx = canvasRef.current.getContext('2d', { willReadFrequently: true });
      const auraCtx = auraCanvasRef.current.getContext('2d');
      
      if (ctx && auraCtx) {
        const result = engineRef.current.process(ctx, video, config);
        
        if (result) {
          setMetrics(result.metrics);
          setHistory(prev => [...prev.slice(-100), result.metrics]);

          auraCtx.clearRect(0, 0, width, height);
          if (config.showAura) {
            auraCtx.putImageData(result.auraData, 0, 0);
          }
        }
      }
    }
    requestRef.current = requestAnimationFrame(processFrame);
  }, [config]);

  useEffect(() => {
    startCamera();
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  useEffect(() => {
    if (hasCamera) {
      requestRef.current = requestAnimationFrame(processFrame);
    }
  }, [hasCamera, processFrame]);

  const handleDeepScan = async () => {
    setIsAnalyzing(true);
    const result = await getEmotionalAnalysis(metrics);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200 p-4 md:p-8">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
            VIBRAVISION PRO
          </h1>
          <p className="text-zinc-500 text-sm font-medium tracking-wide">前庭-情感反射分析系统 v3.4</p>
        </div>
        <div className="flex gap-2 bg-zinc-900 border border-zinc-800 p-1 rounded-lg">
          <div className={`px-3 py-1 rounded-md text-xs font-bold ${hasCamera ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
            摄像头: {hasCamera ? '运行中' : '空闲'}
          </div>
          <div className="px-3 py-1 rounded-md text-xs font-bold bg-blue-500/10 text-blue-500">
            帧率: 30 FPS
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="relative aspect-[4/3] bg-zinc-950 rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl group">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${config.showRaw ? 'opacity-40' : 'opacity-0'}`}
            />
            
            <canvas 
              ref={auraCanvasRef} 
              className="absolute inset-0 w-full h-full object-cover mix-blend-screen"
            />

            <canvas ref={canvasRef} className="hidden" />

            {!hasCamera && !error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-zinc-500 animate-pulse font-mono tracking-widest text-xs">传感器初始化中...</p>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 px-8 text-center">
                <div className="text-red-500 mb-4">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                </div>
                <h3 className="text-xl font-bold mb-2">传感器故障</h3>
                <p className="text-zinc-500 text-sm mb-6">{error}</p>
                <button onClick={startCamera} className="bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-zinc-200 transition-colors">重试</button>
              </div>
            )}

            <div className="absolute top-4 left-4 pointer-events-none">
              <div className="bg-black/50 backdrop-blur-md px-3 py-1 rounded border border-white/10 text-[10px] font-mono text-blue-400">
                REC [实时扫描中...]
              </div>
            </div>
            
            <div className="absolute bottom-4 right-4 pointer-events-none">
              <div className="bg-black/50 backdrop-blur-md px-3 py-1 rounded border border-white/10 text-[10px] font-mono text-zinc-400">
                VER ENGINE v3.4 (机密)
              </div>
            </div>
          </div>

          <MetricsDisplay 
            metrics={metrics} 
            history={history} 
            analysis={analysis}
            onAnalyze={handleDeepScan}
            loading={isAnalyzing}
          />
        </div>

        <div className="lg:col-span-5 space-y-6">
          <ControlPanel config={config} setConfig={setConfig} />
          
          <div className="bg-zinc-900/80 p-6 rounded-2xl border border-zinc-800 shadow-xl">
            <h3 className="text-xs font-bold text-zinc-500 uppercase mb-6 tracking-widest">技术简报</h3>
            <div className="space-y-4 text-xs text-zinc-400 leading-relaxed">
              <p>
                <strong className="text-zinc-200 block mb-1">前庭-情感反射 (VER)</strong>
                人类头部受前庭系统控制，会产生不自主的微振动（约 0.1-10 Hz）。研究表明，这些振动与人的情感和生理状态直接相关。
              </p>
              <p>
                <strong className="text-zinc-200 block mb-1">Vibraimage 逻辑</strong>
                该系统使用高频帧差法处理视频序列，提取这些微运动。颜色光谱映射振动频率：蓝色（低频/放松）到红色（高频/压力）。
              </p>
              <div className="p-4 bg-blue-500/5 rounded-lg border border-blue-500/10">
                <span className="text-blue-400 font-bold block mb-1">操作提示:</span>
                请保持头部稳定，并确保光线均匀，以获得最准确的生物特征数据提取效果。
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto mt-12 py-8 border-t border-zinc-900 text-center">
        <p className="text-zinc-600 text-[10px] uppercase tracking-[0.2em]">
          &copy; 2024 VIBRAVISION TECHNOLOGIES. CLASSIFIED COMPUTER VISION ENGINE.
        </p>
      </footer>
    </div>
  );
};

export default App;
