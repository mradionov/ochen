import { SortableList } from '../../../ui/sortable_list/sortable_list';
import { useManifest } from '../../manifest/use_manifest';
import { defaultEffectsOrder, type EffectType } from '../effects_schema';
import { Checkbox, Group } from '@mantine/core';

type ListItem = {
  type: EffectType;
  name: string;
};

export const EffectsList = () => {
  const { manifestState, manifestStore } = useManifest();

  const order = manifestState.videoTrack.effects.order ?? defaultEffectsOrder;
  const items = order.map((type) => ({
    type,
    name: type,
  }));

  return (
    <SortableList
      items={items}
      renderItem={({ item }) => <EffectItem item={item} />}
      getId={(item) => item.type}
      onChange={(newItems) => {
        const newOrder = newItems.map((item) => item.type);
        manifestStore.videoTrackStore.effectsStore.setOrder(newOrder);
      }}
    />
  );
};

const EffectItem = ({ item }: { item: ListItem }) => {
  const { manifestState, manifestStore } = useManifest();

  const config = manifestState.videoTrack.effects.configMap?.[item.type];

  const isEnabled = config != null && config.enabled === true;

  const onToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.currentTarget.checked;
    console.log(checked);
    manifestStore.videoTrackStore.effectsStore.setEnabled(item.type, checked);
  };

  return (
    <Group gap={10}>
      <Checkbox checked={isEnabled} onChange={onToggle} />
      {item.name}
    </Group>
  );
};
