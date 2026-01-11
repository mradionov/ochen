import { Page } from '../../ui/page/page';
import { createGame } from './game';
import classes from './game_page.module.css';
import React from 'react';

export const GamePage = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const create = () => {
      const abortController = new AbortController();
      createGame().then(({ canvas }) => {
        if (abortController.signal.aborted) {
          return;
        }
        if (containerRef.current) {
          containerRef.current.appendChild(canvas);
        }
      });
      return () => {
        abortController.abort();
      };
    };
    return create();
  }, []);

  return (
    <Page>
      <div className={classes.content} ref={containerRef}></div>
    </Page>
  );
};
