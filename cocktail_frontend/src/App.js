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
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    requestUserInfo()
  }, [])

  const requestUserInfo = async() => {
    const response = await fetch("user/logged")
    if (response.ok){
      let responseContent = await response.json()
      setUsername(responseContent.user.login)
      setIsStaff(responseContent.user.is_staff)
      setNotifications(responseContent.notifications)
      console.log(notifications)
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
    return tabNameMapping.indexOf(tabName)
  }

  const handleTabChange = (e) => setActiveIndex(getTabActiveIndex(e.target.innerHTML.split(" ")[1]))

  const getPanes = () => {
      let panes = [
        {
          menuItem: '🥃 Brew cocktail',
          render: () =>
            <Tab.Pane>
              <CocktailBrewer />
            </Tab.Pane>,
        },
        {
          menuItem: "🏆 Leaderboard",
          render: () =>
            <Tab.Pane>
              <Leaderboard />
            </Tab.Pane>,
        }
     ]

     if (username === ""){
        panes.push(
          {
            menuItem: "👤 Log in",
            render: () =>
              <Tab.Pane>
                <ConnectionForm
                  setUsername={setUsername}
                  setIsStaff={setIsStaff}
                  setTab={setTab}
                  setNotifications={setNotifications}
                />
              </Tab.Pane>,
          },
        )
      }else{
        panes.push(
          {
            menuItem: "➕ Add cocktail",
            render: () =>
              <Tab.Pane>
                <CocktailMakerForm />
              </Tab.Pane>,
          },
          {
            menuItem: "👤 Profile Page",
            render: () =>
              <Tab.Pane>
                <ProfilePage
                  username={username}
                  setUsername={setUsername}
                  setTab={setTab}
                  notifications={notifications}
                  setNotifications={setNotifications}
                />
              </Tab.Pane>,
          },
        )

        if(isStaff){
          panes.push(
            {
              menuItem: "👨‍🍳 Administrate cocktails",
              render: () =>
                <Tab.Pane>
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
        notifications={notifications}
      />
      <Tab
        menu={{
          secondary: true,
          attached: 'top',
          pointing: true,
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
