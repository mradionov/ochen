import React from 'react';

import classes from './page.module.css';

export const Page: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  return <div className={classes.root}>{children}</div>;
};
