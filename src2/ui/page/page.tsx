import React from 'react';

import classes from './page.module.css';

export const Page = ({ children }: React.PropsWithChildren) => {
  return <div className={classes.root}>{children}</div>;
};

Page.Fixed = ({ children }: React.PropsWithChildren) => {
  return <div className={classes.fixed}>{children}</div>;
};
