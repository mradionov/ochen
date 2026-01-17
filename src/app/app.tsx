import { icon } from '../ui/icon';
import classes from './app.module.css';
import { NavItem } from './nav_item';
import { AppShell } from '@mantine/core';
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
      <NavItem to="/" label="Projects" leftSection={<icon.Folder />} />
      <NavItem to="/assets" label="Assets" leftSection={<icon.Image />} />
      <NavItem to="/timeline" label="Timeline" leftSection={<icon.Clock />} />
      <NavItem to="/audio" label="Audio" leftSection={<icon.Music />} />
      <NavItem
        to="/performance"
        label="Perform"
        leftSection={<icon.Projector />}
      />
      <NavItem to="/game" label="Game" leftSection={<icon.Gamepad />} />
    </AppShell.Navbar>
    <AppShell.Main>
      <Outlet />
    </AppShell.Main>
  </AppShell>
);
