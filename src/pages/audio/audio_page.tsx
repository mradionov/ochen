import { Button, Divider, Group } from '@mantine/core';
import { Page } from '../../ui/page/page';
import { AudioFrequencyChart } from '../../features/audio_processing/audio_frequency_chart';
import {
  AudioCapture,
  type AudioCaptureData,
} from '../../features/audio_processing/audio_capture';
import React from 'react';
import { useRenderLoop } from '../../features/use_render_loop';

const audioCapture = new AudioCapture();

export const AudioPage = () => {
  const { subscribeToTick } = useRenderLoop();

  const [audioCaptureData, setAudioCaptureData] = React.useState<
    AudioCaptureData | undefined
  >(undefined);

  React.useEffect(() => {
    audioCapture.connectStream();
  }, []);

  React.useEffect(
    () =>
      subscribeToTick(() => {
        setAudioCaptureData(audioCapture.update());
      }),
    [],
  );

  const onStart = () => {
    audioCapture.start();
  };
  const onStop = () => {
    audioCapture.stop();
  };

  return (
    <Page>
      <Group>
        <Button onClick={onStart}>start</Button>
        <Button onClick={onStop}>stop</Button>
      </Group>
      <Divider my="lg" />
      <AudioFrequencyChart audioCaptureData={audioCaptureData} />
    </Page>
  );
};
