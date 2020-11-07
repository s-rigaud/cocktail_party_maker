import React, {useState} from "react"

import { Button } from 'semantic-ui-react'

export const Header = () => {

  const [loading, setLoading] = useState(false)

  const callLoadCocktailDB = async() => {
    setLoading(true)
    await fetch("cocktail/cocktaildb")
    setLoading(false)
  }

    return (
      <header>
          <div className="navbar navbar-dark bg-dark shadow-sm">
              <div className="container d-flex justify-content-between">
                  <strong style={{ color: "white", margin:"5px"}}>
                    🍹 Cocktail Party Maker
                  </strong>
              </div>
              <Button
                disabled={loading}
                loading={loading}
                onClick={callLoadCocktailDB}
            >
                Load Cocktail DB
            </Button>
          </div>
      </header>
  )
}
