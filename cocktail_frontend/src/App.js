import React, {useState, useEffect} from 'react'
import './App.css'

import { Tab } from 'semantic-ui-react'

import { Header } from './components/Header'
import { CocktailBrewer } from './components/CocktailBrewer'
import { CocktailMakerForm } from './components/CocktailMakerForm'
import { ConnectionForm } from './components/ConnectionForm'
import { ProfilePage } from './components/ProfilePage'
import { Leaderboard } from './components/Leaderboard'
import { CocktailValidation } from './components/CocktailValidation'

function App() {

  const [username, setUsername] = useState("")
  const [isStaff, setIsStaff] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    getLoggedUserRequest()
  }, [])

  const getLoggedUserRequest = async() => {
    const response = await fetch("user/logged")
    if (response.ok){
      let responseContent = await response.json()
      setUsername(responseContent.user.login)
      setIsStaff(responseContent.user.isStaff)
    }
  }

  const setTab = (tabName) => {
    setActiveIndex(getTabActiveIndex(tabName))
  }

  const getTabActiveIndex = (tabName) => {
    let tabNameMapping;
    if (username === ""){
      tabNameMapping = ["Brew", "Leaderboard", "Log"]
    }else{
      tabNameMapping = ["Brew", "Leaderboard", "Add", "Profile"]
      if (isStaff){
        tabNameMapping.push("Administrate")
      }
    }
    console.log("Set index to ", tabNameMapping.indexOf(tabName))
    return tabNameMapping.indexOf(tabName)
  }

  const handleTabChange = (e) => setActiveIndex(getTabActiveIndex(e.target.innerHTML.split(" ")[1]))

  const getPanes = () => {
      let panes = [
        {
          menuItem: '🥃 Brew cocktail',
          render: () =>
            <Tab.Pane attached="left">
              <CocktailBrewer />
            </Tab.Pane>,
        },
        {
          menuItem: "🏆 Leaderboard",
          render: () =>
            <Tab.Pane attached="left">
              <Leaderboard />
            </Tab.Pane>,
        }
     ]

     if (username === ""){
        panes.push(
          {
            menuItem: "👤 Log in",
            render: () =>
              <Tab.Pane attached="left">
                <ConnectionForm
                  setUsername={setUsername}
                  setIsStaff={setIsStaff}
                  setTab={setTab}
                />
              </Tab.Pane>,
          },
        )
      }else{
        panes.push(
          {
            menuItem: "➕ Add cocktail",
            render: () =>
              <Tab.Pane attached="left">
                <CocktailMakerForm />
              </Tab.Pane>,
          },
          {
            menuItem: "👤 Profile Page",
            render: () =>
              <Tab.Pane attached="left">
                <ProfilePage
                  username={username}
                  setUsername={setUsername}
                  setTab={setTab}
                />
              </Tab.Pane>,
          },
        )

        if(isStaff){
          panes.push(
            {
              menuItem: "👨‍🍳 Administrate cocktails",
              render: () =>
                <Tab.Pane attached="left">
                  <CocktailValidation />
                </Tab.Pane>,
            },
          )
        }
      }
    return panes
  }

  return (
    <div>
      <Header
        username={username}
        setTab={setTab}
        isStaff={isStaff}
      />
      <Tab
        menu={{
          color: "#458585",
          secondary: true,
          vertical: true,
          pointing: true,
          attached: 'top',
          fluid: true,
        }}
        activeIndex={activeIndex}
        onTabChange={handleTabChange}
        panes={getPanes()}
      />

    </div>
  )
}

export default App
