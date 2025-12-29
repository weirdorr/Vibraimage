
import { VibraMetrics } from '../types';

export class VibraEngine {
  private prevFrame: Uint8ClampedArray | null = null;
  private accumulator: Float32Array | null = null;
  private width: number = 0;
  private height: number = 0;
  private history: number[] = [];
  private varianceHistory: number[] = [];
  private readonly HISTORY_LIMIT = 60;

  constructor() {}

  public process(
    ctx: CanvasRenderingContext2D,
    video: HTMLVideoElement,
    config: { threshold: number; sensitivity: number; smoothing: number }
  ): { metrics: VibraMetrics; auraData: ImageData } | null {
    const width = video.videoWidth;
    const height = video.videoHeight;

    if (width === 0 || height === 0) return null;

    if (this.width !== width || this.height !== height) {
      this.width = width;
      this.height = height;
      this.prevFrame = null;
      this.accumulator = new Float32Array(width * height);
    }

    ctx.drawImage(video, 0, 0, width, height);
    const currentFrameData = ctx.getImageData(0, 0, width, height);
    const pixels = currentFrameData.data;
    const auraImageData = new ImageData(width, height);
    const auraPixels = auraImageData.data;

    let totalAmplitude = 0;
    let activityCount = 0;

    if (this.prevFrame && this.prevFrame.length === pixels.length) {
      for (let i = 0; i < pixels.length; i += 4) {
        const idx = i / 4;
        
        // 使用亮度感知公式 (Rec. 601) 提高精度
        const currLum = pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114;
        const prevLum = this.prevFrame[i] * 0.299 + this.prevFrame[i + 1] * 0.587 + this.prevFrame[i + 2] * 0.114;
        
        const diff = Math.abs(currLum - prevLum);
        
        // 累积器用于模拟 Vibraimage 的“频率时间集成”
        const target = diff > config.threshold ? (diff - config.threshold) * config.sensitivity : 0;
        this.accumulator![idx] = this.accumulator![idx] * config.smoothing + target * (1 - config.smoothing);
        
        const val = this.accumulator![idx];
        if (val > 0.1) {
          totalAmplitude += val;
          activityCount++;

          // 绘制光控光谱
          const color = this.getVibraColor(val);
          auraPixels[i] = color[0];
          auraPixels[i + 1] = color[1];
          auraPixels[i + 2] = color[2];
          auraPixels[i + 3] = Math.min(180, val * 8); 
        } else {
          auraPixels[i + 3] = 0;
        }
      }
    }

    this.prevFrame = new Uint8ClampedArray(pixels);

    // 核心算法：基于幅度和变异性的生理指标映射
    // 在 Vibraimage 理论中：
    // - 能量 = 总振动量
    // - 攻击性 = 高频高幅振动 (极端的头部微颤)
    // - 压力 = 振动的不对称性和不稳定性
    // - 焦虑 = 高变异性 (不协调的微动作)
    // - 平衡 = 振动的节律性和一致性

    const avgAmplitude = activityCount > 0 ? totalAmplitude / activityCount : 0;
    this.history.push(avgAmplitude);
    if (this.history.length > this.HISTORY_LIMIT) this.history.shift();

    const currentVariance = this.calculateVariance(this.history);
    this.varianceHistory.push(currentVariance);
    if (this.varianceHistory.length > this.HISTORY_LIMIT) this.varianceHistory.shift();

    // 计算长期稳定性 (用于平衡度)
    const longTermStability = 1 / (1 + this.calculateVariance(this.varianceHistory) * 10);

    // 归一化函数 (使用 Sigmoid 曲线使指标在 20-80 之间更敏感)
    const normalize = (val: number, k: number = 0.1) => (1 / (1 + Math.exp(-k * (val - 50)))) * 100;

    // 重新设计的指标公式
    const rawEnergy = avgAmplitude * 4;
    const rawAggression = Math.max(0, avgAmplitude * 5 - 20);
    const rawStress = avgAmplitude * 2 + currentVariance * 15;
    const rawAnxiety = currentVariance * 40;
    const rawBalance = (1 - (currentVariance / (avgAmplitude + 1))) * 100 * longTermStability;

    return {
      metrics: {
        stress: Math.min(100, Math.max(0, rawStress)),
        anxiety: Math.min(100, Math.max(0, rawAnxiety)),
        aggression: Math.min(100, Math.max(0, rawAggression)),
        energy: Math.min(100, Math.max(0, rawEnergy)),
        balance: Math.min(100, Math.max(0, rawBalance)),
        timestamp: Date.now()
      },
      auraData: auraImageData
    };
  }

  private getVibraColor(val: number): [number, number, number] {
    // 经典 Vibraimage 冷暖色调映射
    if (val < 4) return [0, 100, 255];   // 极静：深蓝
    if (val < 8) return [0, 255, 200];  // 安静：青色
    if (val < 15) return [0, 255, 0];    // 正常：绿色
    if (val < 25) return [255, 255, 0];  // 活跃：黄色
    if (val < 40) return [255, 120, 0];  // 紧张：橙色
    return [255, 0, 0];                  // 极度：红色
  }

  private calculateVariance(arr: number[]): number {
    if (arr.length < 2) return 0;
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    return arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length;
  }
}
