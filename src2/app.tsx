import { AppShell, Box, NavLink } from '@mantine/core';
import { Link, Outlet } from 'react-router-dom';

export const App = () => (
  <AppShell
    navbar={{
      width: 80,
      breakpoint: 'sm',
    }}
  >
    <AppShell.Navbar>
      <NavLink component={Link} to="/" label="Projects" />
      <NavLink component={Link} to="/preview" label="Preview" />
      <NavLink component={Link} to="/timeline" label="Timeline" />
    </AppShell.Navbar>
    <AppShell.Main>
      <Box p="md">
        <Outlet />
      </Box>
    </AppShell.Main>
  </AppShell>
);
