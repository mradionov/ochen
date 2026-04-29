import type { EffectRenderer, EffectRendererContext } from './effect_renderer';
import { EdgeEffectRenderer } from './effects/edge/edge_effect_renderer';
import { GrainEffectRenderer } from './effects/grain/grain_effect_renderer';
import { TintEffectRenderer } from './effects/tint/tint_effect_renderer';
import { VignetteEffectRenderer } from './effects/vignette/vignette_effect_renderer';
import { PixelateEffectRenderer } from './effects/pixelate/pixelate_effect_renderer';
import { GlitchEffectRenderer } from './effects/glitch/glitch_effect_renderer';
import { DuotoneEffectRenderer } from './effects/duotone/duotone_effect_renderer';
import { ChromaticEffectRenderer } from './effects/chromatic/chromatic_effect_renderer';
import { ScanlinesEffectRenderer } from './effects/scanlines/scanlines_effect_renderer';
import { MirrorEffectRenderer } from './effects/mirror/mirror_effect_renderer';
import { PosterizeEffectRenderer } from './effects/posterize/posterize_effect_renderer';
import { TileEffectRenderer } from './effects/tile/tile_effect_renderer';
import { ChannelSwapEffectRenderer } from './effects/channel_swap/channel_swap_effect_renderer';
import { GhostEffectRenderer } from './effects/ghost/ghost_effect_renderer';
import { HalftoneEffectRenderer } from './effects/halftone/halftone_effect_renderer';
import { AsciiEffectRenderer } from './effects/ascii/ascii_effect_renderer';
import { DitherEffectRenderer } from './effects/dither/dither_effect_renderer';
import { RippleEffectRenderer } from './effects/ripple/ripple_effect_renderer';
import { DvdEffectRenderer } from './effects/dvd/dvd_effect_renderer';
import { FaceOverlayEffectRenderer } from './effects/face_overlay/face_overlay_effect_renderer';
import { defaultEffectsOrder, type EffectType } from './effects_schema';
import type { EffectsState } from './effects_store';

export class EffectsCompositor {
  private readonly effectRendererMap: Record<
    EffectType,
    EffectRenderer<EffectType>
  >;

  constructor() {
    this.effectRendererMap = {
      grain: new GrainEffectRenderer(),
      edge: new EdgeEffectRenderer(),
      tint: new TintEffectRenderer(),
      vignette: new VignetteEffectRenderer(),
      pixelate: new PixelateEffectRenderer(),
      glitch: new GlitchEffectRenderer(),
      duotone: new DuotoneEffectRenderer(),
      chromatic: new ChromaticEffectRenderer(),
      scanlines: new ScanlinesEffectRenderer(),
      mirror: new MirrorEffectRenderer(),
      posterize: new PosterizeEffectRenderer(),
      tile: new TileEffectRenderer(),
      channelSwap: new ChannelSwapEffectRenderer(),
      ghost: new GhostEffectRenderer(),
      halftone: new HalftoneEffectRenderer(),
      ascii: new AsciiEffectRenderer(),
      dither: new DitherEffectRenderer(),
      ripple: new RippleEffectRenderer(),
      dvd: new DvdEffectRenderer(),
      faceOverlay: new FaceOverlayEffectRenderer(),
    };
  }

  applyEffects(effectsState: EffectsState, effectContext: EffectRendererContext) {
    const defaultOrder = effectsState.order ?? defaultEffectsOrder;

    for (const effectKey of defaultOrder) {
      const effectConfig = effectsState.configMap?.[effectKey];
      if (effectConfig == null || !effectConfig.enabled) {
        continue;
      }

      const effectRenderer = this.effectRendererMap[effectKey];
      if (!effectRenderer) {
        continue;
      }

      effectRenderer.render(effectContext, effectConfig);
    }
  }
}
