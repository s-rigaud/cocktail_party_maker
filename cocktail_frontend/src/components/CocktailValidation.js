import React, {useState, useEffect} from "react"

import { Card, Label, Image, List, Divider, Button } from 'semantic-ui-react'

export const CocktailValidation = () => {

  const [cocktail, setCocktail] = useState({})

  useEffect(() => {
    getCocktailToValidate()
  }, [])

  const getCocktailToValidate = async() => {
    const response = await fetch("cocktail/tovalidate")
    const responseContent = await response.json()
    console.log(responseContent)
    setCocktail(responseContent.cocktail)
  }

  const capitalize = (string) => {
    if (typeof string === "string"){
      return string.charAt(0).toUpperCase() + string.slice(1)
    }
    return string
  }

  const NothingContent = () => {
      return (
        <h1>Sorry we foud no cocktail to review</h1>
      )
  }

  const validateCocktailRequest = async() => {
    await fetch("cocktail/validate?id=" + cocktail.id, {method: "POST"})
    await getCocktailToValidate()
  }

  const refuseCocktailRequest = async() => {
    await fetch("cocktail/refuse?id=" + cocktail.id, {method: "POST"})
    await getCocktailToValidate()
  }

  const CardOrNone = () => {
      if(cocktail.hasOwnProperty("name")){
          return (
            <Card centered style={{width: "400px"}}>
                <Image src={cocktail.picture} wrapped ui={false} />
                <Card.Content>
                    <Card.Header>{capitalize(cocktail.name)}</Card.Header>
                    <Card.Meta>
                        <span className='date'>Added the {cocktail.creation_date} by {cocktail.creator}</span>
                    </Card.Meta>
                    <Card.Description>
                        <List>
                            {cocktail.ingredients.map(ingredient => {
                            return (
                                <List.Item>
                                  <List.Header>{capitalize(ingredient[0])}</List.Header>
                                  {ingredient[1]}
                                </List.Item>
                            )
                            })}
                        </List>
                        <Divider />
                        {cocktail.instructions}
                    </Card.Description>

                    <Divider hidden />
                    {cocktail.tags.map(tag => {
                      return <Label>{capitalize(tag)}</Label>
                    })}
                </Card.Content>
                <Card.Content extra>
                    <Button color="green" icon="check" onClick={validateCocktailRequest}></Button>
                    <Button color="red" icon="times" onClick={refuseCocktailRequest}></Button>
                </Card.Content>
            </Card>
          )
      }
      return <NothingContent />
  }

  return (
    <div>
        <CardOrNone />
    </div>
  )
}
