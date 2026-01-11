import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { App } from './app/app.tsx';
import { MantineProvider } from '@mantine/core';
import { ProjectsPage } from './pages/projects/projects_page.tsx';
import { AssetsPage } from './pages/assets/assets_page.tsx';
import { TimelinePage } from './pages/timeline/timeline_page.tsx';
import { theme } from './theme/theme.ts';
import { scan } from 'react-scan';
import { AudioPage } from './pages/audio/audio_page.tsx';
import { PerformancePage } from './pages/performance/performance_page.tsx';

import './theme/styles.css';
import '@mantine/core/styles.css';

scan({
  enabled: true,
});

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <ProjectsPage /> },
      { path: 'assets', element: <AssetsPage /> },
      { path: 'timeline', element: <TimelinePage /> },
      { path: 'audio', element: <AudioPage /> },
      { path: 'performance', element: <PerformancePage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MantineProvider theme={theme}>
      <RouterProvider router={router} />
    </MantineProvider>
  </React.StrictMode>,
);
