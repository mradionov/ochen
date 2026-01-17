import type { VideoFileAsset } from '../../features/assets/assets_controller';
import { useAssets } from '../../features/assets/use_assets';
import { ManifestSaveButton } from '../../features/manifest/manifest_save_button';
import { VideoTrackStore } from '../../features/manifest/stores/video_track_store';
import { useManifest } from '../../features/manifest/use_manifest';
import { useVideoTimeline } from '../../features/video_timeline/use_video_timeline';
import { type VideoTimelineClip } from '../../features/video_timeline/video_timeline_selectors';
import { toMinutesString } from '../../lib/time_utils';
import { Page } from '../../ui/page/page';
import { ClipItem } from './clip_item';
import { UnimportedItem } from './unimported_item';
import { Button, Divider, Group, Loader, Stack, Title } from '@mantine/core';
import * as Lucide from 'lucide-react';

export const AssetsPage = () => {
  const { assetsController, assetsState } = useAssets();
  const { manifestState, manifestStore } = useManifest();
  const { videoTimelineSnap } = useVideoTimeline();

  if (manifestStore == null) {
    return <Loader />;
  }

  const importedNames = VideoTrackStore.selectVideoFilenames(
    manifestState.videoTrack,
  );
  const unimportedVideoFiles = assetsState.videoFileAssets.filter(
    (file) => !importedNames.includes(file.name),
  );

  const timelineClips = videoTimelineSnap.getTimelineClips();
  const totalDuration = videoTimelineSnap.getTotalDuration();

  const tint = manifestState.videoTrack.effects?.tint;

  const onUploadVideos = async () => {
    await assetsController.pickAndUploadVideoFiles();
  };

  const onMoveLeft = (timelineClip: VideoTimelineClip) => {
    manifestStore.videoTrackStore.moveLeft(timelineClip.videoId);
  };

  const onMoveRight = (timelineClip: VideoTimelineClip) => {
    manifestStore.videoTrackStore.moveRight(timelineClip.videoId);
  };

  const onRemove = (timelineClip: VideoTimelineClip) => {
    manifestStore.videoTrackStore.removeClipAndVideo(timelineClip.videoId);
  };

  const onImport = (videoFileAsset: VideoFileAsset) => {
    manifestStore.videoTrackStore.addClipAndVideo(
      videoFileAsset.name,
      videoFileAsset.path,
    );
  };

  const onDeleteFile = async (videoFileAsset: VideoFileAsset) => {
    await assetsController.deleteVideoFile(videoFileAsset.name);
  };

  const onTintChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const color = event.target.value;
    manifestStore.videoTrackStore.effectsStore.setTint(color);
  };

  return (
    <Page>
      <Group justify="space-between">
        <Group>
          <Button leftSection={<Lucide.Upload />} onClick={onUploadVideos}>
            Upload videos
          </Button>
        </Group>
        <Group>
          <ManifestSaveButton />
        </Group>
      </Group>

      <Divider my="sm" />

      <div>total duration: {toMinutesString(totalDuration)}</div>
      <input type="color" value={tint ?? '#000000'} onChange={onTintChange} />

      <Divider my="sm" />

      {timelineClips.length > 0 && (
        <Stack>
          <Title>Clips</Title>
          <Group>
            {timelineClips.map((timelineClip) => (
              <ClipItem
                key={timelineClip.videoId}
                timelineClip={timelineClip}
                onMoveLeft={() => onMoveLeft(timelineClip)}
                onMoveRight={() => onMoveRight(timelineClip)}
                onRemove={() => onRemove(timelineClip)}
              />
            ))}
          </Group>
        </Stack>
      )}

      {unimportedVideoFiles.length > 0 && (
        <Stack>
          <Title>Unimported</Title>
          <Group>
            {unimportedVideoFiles.map((videoFileAsset) => (
              <UnimportedItem
                key={videoFileAsset.path}
                videoFileAsset={videoFileAsset}
                onImport={() => onImport(videoFileAsset)}
                onDelete={() => onDeleteFile(videoFileAsset)}
              />
            ))}
          </Group>
        </Stack>
      )}
    </Page>
  );
};
