import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { App } from './app.tsx';
import { MantineProvider } from '@mantine/core';
import { ProjectsPage } from './pages/projects/projects_page.tsx';
import { PreviewPage } from './pages/preview/preview_page.tsx';
import { TimelinePage } from './pages/timeline/timeline_page.tsx';

import '@mantine/core/styles.css';
import { theme } from './theme/theme.ts';
import './theme/styles.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <ProjectsPage /> },
      { path: 'preview', element: <PreviewPage /> },
      { path: 'timeline', element: <TimelinePage /> },
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
