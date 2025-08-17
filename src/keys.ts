import type { InjectionKey } from 'vue';
import type { VideoResolver } from '@/video_resolver.ts';
import type { RenderLoop } from '@/render_loop.ts';
import type { PlayerFactory } from '@/player_factory.ts';

export const VideoResolverKey: InjectionKey<VideoResolver> =
  Symbol('VideoResolver');
export const RenderLoopKey: InjectionKey<RenderLoop> = Symbol('RenderLoop');
export const PlayerFactoryKey: InjectionKey<PlayerFactory> =
  Symbol('PlayerFactory');
