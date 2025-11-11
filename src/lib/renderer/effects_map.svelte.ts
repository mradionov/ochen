export type EffectsMapRaw = {
  tint?: string;
  vignette?: boolean;
  grain?: number;
  blur?: number;
  edge?: boolean;
};

export class EffectsMap {
  tint: string | undefined;
  vignette: boolean | undefined;
  grain: number | undefined;
  blur: number | undefined;
  edge: boolean | undefined;

  constructor(args: {
    tint?: string;
    vignette?: boolean;
    grain?: number;
    blur?: number;
    edge?: boolean;
  }) {
    this.tint = $state(args.tint);
    this.vignette = $state(args.vignette);
    this.grain = $state(args.grain);
    this.blur = $state(args.blur);
    this.edge = $state(args.edge);
  }

  static createEmpty(): EffectsMap {
    return new EffectsMap({
      tint: undefined,
      vignette: undefined,
      grain: undefined,
      blur: undefined,
      edge: undefined,
    });
  }

  toRaw(): EffectsMapRaw {
    return {
      tint: this.tint,
      vignette: this.vignette,
      grain: this.grain,
      blur: this.blur,
      edge: this.edge,
    };
  }
}
