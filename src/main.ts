import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './app.vue';
import PreviewPage from './preview/preview_page.vue';
import HomePage from './home/home_page.vue';
import PerformancePage from './performance/performance_page.vue';
import { VideoResolver } from '@/video_resolver.ts';
import { PlayerFactoryKey, RenderLoopKey, VideoResolverKey } from '@/keys.ts';
import { RenderLoop } from '@/render_loop.ts';
import { PlayerFactory } from '@/player_factory.ts';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },
    {
      path: '/prev',
      name: 'preview',
      component: PreviewPage,
    },
    {
      path: '/perf',
      name: 'performance',
      component: PerformancePage,
    },
  ],
});

const app = createApp(App);

app.use(router);

app.provide(VideoResolverKey, new VideoResolver());
app.provide(RenderLoopKey, new RenderLoop());
app.provide(PlayerFactoryKey, new PlayerFactory());

app.mount('#app');
