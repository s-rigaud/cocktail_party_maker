import React, {useState} from "react"

import { Button, Icon } from 'semantic-ui-react'

export const Header = ({username, setActiveIndex, getTabActiveIndex}) => {

  const [loading, setLoading] = useState(false)

  const callLoadCocktailDB = async() => {
    setLoading(true)
    await fetch("cocktail/cocktaildb")
    setLoading(false)
  }

  const setProfileTab = () => {
    setActiveIndex(getTabActiveIndex("Profile"))
  }

  const LoginButton = () => {
    if (username !== ""){
      return (
        <Button
          onClick={setProfileTab}
        >
          <Icon name='user' />
          {username}
        </Button>
      )
    }
    return <div></div>
  }
  return (
    <header>
        <div className="navbar navbar-dark bg-dark shadow-sm">
            <div className="container d-flex justify-content-between">
                <h5 style={{ color: "white", margin:"5px",  font_weight: "50" }}>🍹 Cocktail Party Maker</h5>
            </div>
            <LoginButton />
            <Button
              disabled={loading}
              loading={loading}
              onClick={callLoadCocktailDB}
          >
              <Icon name='database' />
              Load Cocktail DB
          </Button>
        </div>
    </header>
  )
}
