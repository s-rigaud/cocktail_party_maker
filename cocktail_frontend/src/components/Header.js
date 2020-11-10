import React, {useState} from "react"

import { Button, Icon } from 'semantic-ui-react'

export const Header = ({username, setTab, isStaff}) => {

  const [loading, setLoading] = useState(false)

  const callLoadCocktailDB = async() => {
    setLoading(true)
    await fetch("cocktail/cocktaildb")
    setLoading(false)
  }

  const setProfileTab = () => {
    setTab("Profile")
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

  const CocktailDBButton = () => {
    if (isStaff){
      return (
        <Button
            disabled={loading}
            loading={loading}
            onClick={callLoadCocktailDB}
        >
            <Icon name='database' />
            Load Cocktail DB
        </Button>
      )
    }
    return <div></div>
  }


  return (
    <header>
        <div className="navbar navbar-dark bg-dark shadow-sm">
            <div className="container d-flex justify-content-between">
                <h5 style={{ color: "white", margin:"5px"}}>🍹 Cocktail Party Maker</h5>
            </div>
            <p>a{isStaff}a</p>
            <LoginButton />
            <CocktailDBButton />
        </div>
    </header>
  )
}
