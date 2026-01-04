import { NavLink, type NavLinkProps } from '@mantine/core';
import { Link, useMatch, type LinkProps } from 'react-router-dom';

export const NavItem = (props: LinkProps & NavLinkProps) => {
  const { to } = props;
  const match = useMatch(typeof to === 'string' ? to : (to.pathname ?? ''));
  const isActive = match != null;

  return <NavLink component={Link} active={isActive} {...props} />;
};
