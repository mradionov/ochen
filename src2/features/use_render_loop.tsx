import React from 'react';
import { RenderLoop, type RenderLoopTickEvent } from '../lib/render_loop';

const renderLoop = new RenderLoop();

let subscriberCount = 0;

export function useRenderLoop() {
  const subscribeToTick = React.useCallback(
    (cb: (event: RenderLoopTickEvent) => void) => {
      const unsubscribe = renderLoop.tick.addListener(cb);

      subscriberCount += 1;
      if (subscriberCount === 1) {
        renderLoop.start();
      }

      return () => {
        subscriberCount -= 1;
        if (subscriberCount === 0) {
          renderLoop.stop();
        }

        return unsubscribe();
      };
    },
    [],
  );

  return { subscribeToTick };
}
