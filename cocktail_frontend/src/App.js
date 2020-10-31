import React from 'react'
import './App.css'

import { Tab } from 'semantic-ui-react'

import { Header } from './components/Header'
import { CocktailBrewer } from './components/CocktailBrewer'
import { CocktailMakerForm } from './components/CocktailMakerForm'


function App() {

  const panes = [
    {
      menuItem: '🥃 Brew cocktail',
      render: () =>
        <Tab.Pane attached="left">
          <CocktailBrewer />
        </Tab.Pane>,
    },
    {
      menuItem: "➕ Add cocktail",
      render: () =>
        <Tab.Pane attached="left">
          <CocktailMakerForm />
        </Tab.Pane>,
    },
  ]

  return (
    <div>
      <Header />
      <Tab
        menu={{
          secondary: true,
          vertical: true,
          pointing: true,
          attached: 'top',
          fluid: true,
        }}
        panes={panes}
      />

    </div>
  )
}

export default App
