import classes from './app.module.css';
import { NavItem } from './nav_item';
import { AppShell } from '@mantine/core';
import * as Lucide from 'lucide-react';
import { Outlet } from 'react-router-dom';

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
      <NavItem to="/audio" label="Audio" leftSection={<Lucide.Music />} />
      <NavItem
        to="/performance"
        label="Perform"
        leftSection={<Lucide.Projector />}
      />
      <NavItem to="/game" label="Game" leftSection={<Lucide.Gamepad />} />
    </AppShell.Navbar>
    <AppShell.Main>
      <Outlet />
    </AppShell.Main>
  </AppShell>
);
