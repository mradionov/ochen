import classes from './playhead_track.module.css';

export const PlayheadTrack = ({
  time,
  maxDuration,
  onSeek,
}: {
  time: number;
  maxDuration: number;
  onSeek: (seekedToTime: number) => void;
}) => {
  const playheadX = (time / maxDuration) * 100;

  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const x = e.nativeEvent.offsetX;
    const position = x / (e.target as HTMLDivElement).clientWidth;
    const seekedToTime = maxDuration * position;
    onSeek?.(seekedToTime);
  };

  return (
    <div className={classes.root} onClick={onClick}>
      <div className={classes.playhead} style={{ left: `${playheadX}%` }}></div>
    </div>
  );
};
