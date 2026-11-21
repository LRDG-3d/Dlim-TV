import React from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import { FavoritesProvider } from './hooks/useFavorites.jsx'
import { TitlesProvider } from './hooks/useTitles.jsx'
import { loadTheme, applyTheme } from './lib/theme.js'
import './styles/global.css'

applyTheme(loadTheme())

createRoot(document.getElementById('root')).render(
  <HashRouter>
    <FavoritesProvider>
      <TitlesProvider><App /></TitlesProvider>
    </FavoritesProvider>
  </HashRouter>
)
