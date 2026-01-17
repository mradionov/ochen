import { useManifest } from '../../../manifest/use_manifest';
import { ColorInput } from '@mantine/core';

export const TintEffectPanel = () => {
  const { manifestState, manifestStore } = useManifest();

  const value = manifestState.videoTrack.effects.configMap?.tint?.value;

  const onChange = (color: string) => {
    manifestStore.videoTrackStore.effectsStore.setTint(color);
  };

  return <ColorInput value={value} onChange={onChange} />;
};
