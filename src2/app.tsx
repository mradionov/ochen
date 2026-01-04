import { AppShell, NavLink } from '@mantine/core';
import { Link, Outlet } from 'react-router-dom';
import { Page } from './ui/page/page';

import classes from './app.module.css';

export const App = () => (
  <AppShell
    navbar={{
      width: 80,
      breakpoint: 'sm',
    }}
    classNames={classes}
  >
    <AppShell.Navbar>
      <NavLink component={Link} to="/" label="Projects" />
      <NavLink component={Link} to="/preview" label="Preview" />
      <NavLink component={Link} to="/timeline" label="Timeline" />
    </AppShell.Navbar>
    <AppShell.Main>
      <Page>
        <Outlet />
      </Page>
    </AppShell.Main>
  </AppShell>
);
