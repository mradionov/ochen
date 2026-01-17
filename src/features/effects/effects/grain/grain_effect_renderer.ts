import type {
  EffectRenderer,
  EffectRendererContext,
} from '../../effect_renderer';
import type { EffectConfig } from '../../effects_schema';

export class GrainEffectRenderer implements EffectRenderer<'grain'> {
  render(
    { ctx, width, height }: EffectRendererContext,
    config: EffectConfig<'grain'>,
  ) {
    let intensity = config.intensity ?? 0;

    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const rand = (Math.random() - 0.5) * intensity;
      data[i] += rand; // R
      data[i + 1] += rand; // G
      data[i + 2] += rand; // B
    }
    ctx.putImageData(imageData, 0, 0);
  }
}
