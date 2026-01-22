import { Box, Container, Drawer } from '@mui/material';
import type { ReactNode } from 'react';

import { SidebarNavigation } from './SidebarNavigation';

const DRAWER_WIDTH = 240;

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        <SidebarNavigation />
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
        }}
      >
        <Container maxWidth="xl">{children}</Container>
      </Box>
    </Box>
  );
}
