import { AppShell } from '@mantine/core';
import { Outlet } from 'react-router-dom';
import * as Lucide from 'lucide-react';

import classes from './app.module.css';
import { NavItem } from './nav_item';

export const App = () => (
  <AppShell
    navbar={{
      width: 110,
      breakpoint: 'sm',
    }}
    classNames={classes}
  >
    <AppShell.Navbar>
      <NavItem to="/" label="Projects" leftSection={<Lucide.Folder />} />
      <NavItem to="/assets" label="Assets" leftSection={<Lucide.Image />} />
      <NavItem to="/timeline" label="Timeline" leftSection={<Lucide.Clock />} />
    </AppShell.Navbar>
    <AppShell.Main>
      <Outlet />
    </AppShell.Main>
  </AppShell>
);
