import type { EffectRenderer, EffectRendererContext } from '../../effect_renderer';
import type { EffectConfig } from '../../effects_schema';

export class DvdEffectRenderer implements EffectRenderer<'dvd'> {
  private x = 0;
  private y = 0;
  private vx = 60;
  private vy = 60;
  private lastTime = -1;
  private initialized = false;

  private loadedUrl: string | null = null;
  private img: HTMLImageElement | null = null;
  private imgReady = false;

  private loadImage(url: string) {
    this.loadedUrl = url;
    this.imgReady = false;
    const img = new Image();
    img.onload = () => {
      this.img = img;
      this.imgReady = true;
    };
    img.src = url;
  }

  render({ ctx, width, height, lastTime }: EffectRendererContext, config: EffectConfig<'dvd'>) {
    const scale = config.scale ?? 0.25;
    const url = config.imageUrl ?? null;

    if (url !== this.loadedUrl) {
      if (url) this.loadImage(url);
      else { this.img = null; this.imgReady = false; this.loadedUrl = null; }
    }

    if (!this.imgReady || !this.img) return;

    const imgH = height * scale;
    const imgW = imgH * (this.img.naturalWidth / this.img.naturalHeight);

    if (!this.initialized) {
      this.x = Math.random() * (width - imgW);
      this.y = Math.random() * (height - imgH);
      this.vx = (Math.random() < 0.5 ? 1 : -1) * 60;
      this.vy = (Math.random() < 0.5 ? 1 : -1) * 60;
      this.lastTime = lastTime;
      this.initialized = true;
    }

    const dt = this.lastTime < 0 ? 0 : Math.min(lastTime - this.lastTime, 0.1);
    this.lastTime = lastTime;

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    if (this.x <= 0)              { this.x = 0;              this.vx =  Math.abs(this.vx); }
    if (this.y <= 0)              { this.y = 0;              this.vy =  Math.abs(this.vy); }
    if (this.x + imgW >= width)   { this.x = width - imgW;  this.vx = -Math.abs(this.vx); }
    if (this.y + imgH >= height)  { this.y = height - imgH; this.vy = -Math.abs(this.vy); }

    ctx.drawImage(this.img, Math.round(this.x), Math.round(this.y), Math.round(imgW), Math.round(imgH));
  }
}
