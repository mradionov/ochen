import React from 'react';
import { useRenderLoop } from '../../features/use_render_loop';
import { RunningClock } from '../../lib/running_clock';

const timelineClock = new RunningClock();

export const useTimelineClock = () => {
  const { subscribeToTick } = useRenderLoop();

  const [playheadTime, setPlayheadTime] = React.useState(0);

  React.useEffect(() => {
    return timelineClock.timeUpdate.addListener(({ time }) => {
      setPlayheadTime(time);
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
