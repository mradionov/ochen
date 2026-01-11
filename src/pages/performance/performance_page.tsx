import { Button, Divider, Group } from '@mantine/core';
import { Page } from '../../ui/page/page';

import classes from './performance_page.module.css';
import React from 'react';
import { CompositePlayer } from '../../features/composite_player/composite_player';
import { CompositePlayerController } from '../../features/composite_player/composite_player_controller';

export const PerformancePage = () => {
  const compositeControllerRef = React.useRef<CompositePlayerController>(
    new CompositePlayerController(),
  );
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  const onFullscreen = () => {
    contentRef.current?.requestFullscreen();
  };

  const onFullscreenPlay = () => {
    compositeControllerRef.current.play({ video: true, audio: false });
    contentRef.current?.requestFullscreen();
  };

  const onFullscreenPlayWithAudio = () => {
    compositeControllerRef.current.play();
    contentRef.current?.requestFullscreen();
    // audioCapture.start();
  };

  React.useEffect(() => {
    window.addEventListener('keypress', (e) => {
      if (e.code === 'Space') {
        compositeControllerRef.current.play();
        // audioCapture.start();
      }
    });
  }, []);

  return (
    <Page>
      <Group>
        <Button onClick={onFullscreen}>fullscreen</Button>
        <Button onClick={onFullscreenPlay}>
          fullscreen and play (only video)
        </Button>
        <Button onClick={onFullscreenPlayWithAudio}>
          fullscreen and play (with audio)
        </Button>
      </Group>
      <Divider my="lg" />
      <div className={classes.content} ref={contentRef}>
        <CompositePlayer
          controllerRef={compositeControllerRef}
          width={800}
          height={800}
        />
      </div>
    </Page>
  );
};
