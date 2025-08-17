// Transformed format
export type Manifest = {
  effects?: EffectsObj;
  transitionOut?: TransitionOutObj;
  scenes: Scene[];
  videos: {
    id: VideoId;
    path: string;
  }[];
};

export type Scene = SceneObj & { videoPath: string; effects?: EffectsObj };

export type Effects = EffectsObj;
export type TransitionOut = TransitionOutObj;

// Original JSON format
type ManifestObj = {
  effects?: EffectsObj;
  transitionOut?: TransitionOutObj;
  scenes: {
    videoId: string;
    rate?: number;
    offsetX?: number | string;
    offsetY?: number | string;
  }[];
  videos: Record<string, string>;
};

type EffectsObj = {
  tint?: string;
  vignette?: boolean;
  grain?: number;
  blur?: number;
};

type TransitionOutObj = {
  duration?: number;
  kind?: 'cut' | 'fade';
};

type SceneObj = {
  videoId: VideoId;
  rate?: number;
  offsetX?: number | string;
  offsetY?: number | string;
};

type VideoId = string;

export async function fetchManifest(setId: string): Promise<Manifest> {
  const res = await fetch(`/sets/${setId}/manifest.json`);
  const manifest: ManifestObj = await res.json();

  const videoMap = parseVideoMap(setId, manifest);
  const { effects, transitionOut } = manifest;

  const videoIdSet = new Set<VideoId>();
  const scenes = manifest.scenes.map((sceneMetadata) => {
    const { videoId, offsetX, offsetY, rate } = sceneMetadata;

    if (videoIdSet.has(videoId)) {
      console.log(`Duplicate video id: "${videoId}"`);
    }
    videoIdSet.add(videoId);

    return {
      videoId,
      videoPath: videoMap.get(videoId),
      offsetX,
      offsetY,
      rate,
      effects,
    };
  });

  const videos = Object.keys(manifest.videos).map((id) => {
    return { id, path: videoMap.get(id) };
  });

  return {
    scenes,
    effects,
    transitionOut,
    videos,
  };
}

function parseVideoMap(
  setId: string,
  manifest: ManifestObj,
): ReadonlyMap<string, string> {
  const { videos } = manifest;

  const videoMap = new Map<string, string>();
  const basePath = `/sets/${setId}/videos/`;

  Object.keys(videos).forEach((name) => {
    const fileName = videos[name];
    const filePath = `${basePath}/${fileName}`;
    videoMap.set(name, filePath);
  });

  return videoMap;
}
