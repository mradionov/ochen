import { useManifest } from '../../../manifest/use_manifest';
import { NumberInput } from '@mantine/core';

export const GrainEffectPanel = () => {
  const { manifestState, manifestStore } = useManifest();

  const intensity =
    manifestState.videoTrack.effects.configMap?.grain?.intensity;

  const onChange = (newIntensity: string | number) => {
    manifestStore.videoTrackStore.effectsStore.setGrain({
      intensity: Number(newIntensity),
    });
  };

  return <NumberInput value={intensity} min={0} onChange={onChange} />;
};
