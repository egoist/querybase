import './css/tailwind.css'
import './css/spinner.css'
import '@fontsource-variable/jetbrains-mono'

import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import App from './App'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/query-client'
import { TooltipProvider } from './components/Tooltip'
import { showNativeMenu } from './lib/native-menu'
import { actionsProxy } from './lib/actions-proxy'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: 'connections/:id',
        lazy: () => import('./pages/connections/[id]'),
        children: [
          { path: 'schema', lazy: () => import('./pages/connections/[id]/schema') },
          {
            path: 'queries/:queryId',
            lazy: () => import('./pages/connections/[id]/queries/[queryId]')
          }
        ]
      },
      {
        path: 'updater',
        lazy: () => import('./pages/updater')
      },
      {
        path: '',
        lazy: () => import('./pages/index')
      }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <TooltipProvider delayDuration={0} disableHoverableContent>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </TooltipProvider>
  </React.StrictMode>
)

document.addEventListener('contextmenu', (e) => {
  e.preventDefault()
  showNativeMenu([], e)
})

if (location.pathname === '/') {
  actionsProxy.checkForUpdates.invoke()
}
