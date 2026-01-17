import { useManifest } from '../../manifest/use_manifest';
import { EdgeEffectPanel } from '../effects/edge/edge_effect_panel';
import { GrainEffectPanel } from '../effects/grain/grain_effect_panel';
import { TintEffectPanel } from '../effects/tint/tint_effect_panel';
import type { EffectType } from '../effects_schema';
import { EffectsList } from './effects_list';
import { PlaceholderEffectPanel } from './placeholder_effect_panel';
import { Tabs } from '@mantine/core';

const typeToPanelMap: Record<EffectType, React.FC> = {
  tint: TintEffectPanel,
  edge: EdgeEffectPanel,
  grain: GrainEffectPanel,
  vignette: PlaceholderEffectPanel,
};

export const EffectsPanel = () => {
  const { manifestState } = useManifest();

  const enabledTypes = Object.entries(
    manifestState.videoTrack.effects.configMap || {},
  )
    .map(([type, config]) =>
      config?.enabled === true ? (type as EffectType) : null,
    )
    .filter((type): type is EffectType => type !== null);

  return (
    <Tabs defaultValue="main">
      <Tabs.List>
        <Tabs.Tab value="main">Effects</Tabs.Tab>
        {enabledTypes.map((type) => (
          <Tabs.Tab key={type} value={type}>
            {type}
          </Tabs.Tab>
        ))}
      </Tabs.List>

      <Tabs.Panel value="main" py="md">
        <EffectsList />
      </Tabs.Panel>

      {enabledTypes.map((type) => {
        const PanelComponent = typeToPanelMap[type];
        return (
          <Tabs.Panel key={type} value={type} py="md">
            <PanelComponent />
          </Tabs.Panel>
        );
      })}
    </Tabs>
  );
};
