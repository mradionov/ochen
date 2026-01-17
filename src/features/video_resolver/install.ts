import { VideoResolver } from './video_resolver';
import { VideoResolverStore } from './video_resolver_store';

export const videoResolverStore = new VideoResolverStore();
export const videoResolver = new VideoResolver(videoResolverStore);
