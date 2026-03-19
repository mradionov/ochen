// Selected subset of MediaPipe Face Mesh 478-point model.
// Chosen to cover all face states needed for sprite selection,
// plus anchor points for position/scale/rotation.

export const FACE_ANCHOR = {
  NOSE_TIP: 1,
  CHIN: 152,
  FOREHEAD: 10,
  LEFT_FACE: 234,
  RIGHT_FACE: 454,
};

export const MOUTH = {
  UPPER_CENTER: 13,
  LOWER_CENTER: 14,
  LEFT_CORNER: 61,
  RIGHT_CORNER: 291,
  UPPER_TOP: 0,
  LOWER_BOTTOM: 17,
};

export const LEFT_EYE = {
  OUTER: 33,
  INNER: 133,
  TOP: 159,
  BOTTOM: 145,
};

export const RIGHT_EYE = {
  OUTER: 263,
  INNER: 362,
  TOP: 386,
  BOTTOM: 374,
};

export const EYEBROWS = {
  LEFT_INNER: 107,
  LEFT_MID: 70,
  RIGHT_INNER: 336,
  RIGHT_MID: 300,
};

// Ordered list of all indices we record — order must stay stable
// since the recording stores landmarks positionally.
export const KEY_LANDMARK_INDICES: number[] = [
  FACE_ANCHOR.NOSE_TIP,
  FACE_ANCHOR.CHIN,
  FACE_ANCHOR.FOREHEAD,
  FACE_ANCHOR.LEFT_FACE,
  FACE_ANCHOR.RIGHT_FACE,
  MOUTH.UPPER_CENTER,
  MOUTH.LOWER_CENTER,
  MOUTH.LEFT_CORNER,
  MOUTH.RIGHT_CORNER,
  MOUTH.UPPER_TOP,
  MOUTH.LOWER_BOTTOM,
  LEFT_EYE.OUTER,
  LEFT_EYE.INNER,
  LEFT_EYE.TOP,
  LEFT_EYE.BOTTOM,
  RIGHT_EYE.OUTER,
  RIGHT_EYE.INNER,
  RIGHT_EYE.TOP,
  RIGHT_EYE.BOTTOM,
  EYEBROWS.LEFT_INNER,
  EYEBROWS.LEFT_MID,
  EYEBROWS.RIGHT_INNER,
  EYEBROWS.RIGHT_MID,
];

// Lookup: landmark index → position in KEY_LANDMARK_INDICES array
export const KEY_LANDMARK_POSITION: Record<number, number> = Object.fromEntries(
  KEY_LANDMARK_INDICES.map((idx, pos) => [idx, pos]),
);
