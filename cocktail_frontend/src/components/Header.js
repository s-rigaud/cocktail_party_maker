import React, {useState} from 'react'

import { Button, Icon, Label } from 'semantic-ui-react'

export const Header = ({username, setTab, isStaff, notifications}) => {

  const [loading, setLoading] = useState(false)

  const callLoadCocktailDB = async() => {
    setLoading(true)
    await fetch('cocktail/cocktaildb')
    setLoading(false)
  }

  const setProfileTab = () => {
    setTab('Profile')
  }

  const NotificationBubble = () =>{
    if(notifications.length) {
      return <Label circular color="red" size="mini">{notifications.length}</Label>
    }
    return <div></div>
  }

  const LoginButton = () => {
    if (username !== ''){
      return (
        <Button
          onClick={setProfileTab}
        >
          <Icon name='user' />
          {username}
          <NotificationBubble />
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
        <div className='navbar navbar-dark bg-dark shadow-sm'>
            <div className='container d-flex justify-content-between'>
                <h5 style={{ color: 'white', margin:'5px'}}>🍹 Cocktail Party Maker</h5>
            </div>
            <LoginButton />
            <Button
              onClick={() => setTab("Leaderboard")}
            >
              <Icon name='user' />
              Lead
            </Button>
            <CocktailDBButton />
        </div>
    </header>
  )
}
