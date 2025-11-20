export type EdgeEffectConfig = {
  threshold?: number;
  transparency?: number;
  strength?: number;
};

export type GlitchEffectConfig = {};

export type GrainEffectConfig = {
  intensity?: number;
};

export type EffectsMapRaw = {
  tint?: string;
  vignette?: boolean;
  grain?: GrainEffectConfig;
  blur?: number;
  edge?: EdgeEffectConfig;
  glitch?: GlitchEffectConfig;
  order?: string[];
};

export class EffectsMap {
  tint: string | undefined;
  vignette: boolean | undefined;
  grain: GrainEffectConfig | undefined;
  blur: number | undefined;
  edge: EdgeEffectConfig | undefined;
  glitch: GlitchEffectConfig | undefined;
  order?: string[];

  constructor(args: {
    tint?: string;
    vignette?: boolean;
    grain?: GrainEffectConfig;
    blur?: number;
    edge?: EdgeEffectConfig;
    glitch?: GlitchEffectConfig;
    order?: string[];
  }) {
    this.tint = $state(args.tint);
    this.vignette = $state(args.vignette);
    this.grain = $state(args.grain);
    this.blur = $state(args.blur);
    this.edge = $state(args.edge);
    this.glitch = $state(args.glitch);
    this.order = $state(args.order);
  }

  static createEmpty(): EffectsMap {
    return new EffectsMap({
      tint: undefined,
      vignette: undefined,
      grain: undefined,
      blur: undefined,
      edge: undefined,
      glitch: undefined,
      order: undefined,
    });
  }

  toRaw(): EffectsMapRaw {
    return {
      tint: this.tint,
      vignette: this.vignette,
      grain: {
        intensity: this.grain?.intensity,
      },
      blur: this.blur,
      edge: {
        threshold: this.edge?.threshold,
      },
      order: this.order,
    };
  }
}
