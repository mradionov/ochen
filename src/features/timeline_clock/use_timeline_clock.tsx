import { useRenderLoop } from '../use_render_loop';
import { timelineClock } from './install';
import { useThrottledCallback } from '@mantine/hooks';
import React from 'react';

export const useTimelineClock = () => {
  const { subscribeToTick } = useRenderLoop();

  const [playheadTime, setPlayheadTime] = React.useState(0);

  const setThrottledPlayheadTime = useThrottledCallback(
    (value) => setPlayheadTime(value),
    300,
  );

  React.useEffect(() => {
    return timelineClock.timeUpdate.addListener(({ time }) => {
      setThrottledPlayheadTime(time);
    });
  }, []);

  React.useEffect(
    () =>
      subscribeToTick(({ deltaTime }) => {
        timelineClock.update({ deltaTime });
      }),
    [],
  );

  return { playheadTime, timelineClock };
};
