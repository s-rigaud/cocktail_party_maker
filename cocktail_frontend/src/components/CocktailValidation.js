import React, {useState, useEffect} from 'react'

import { Card, Label, Image, List, Divider, Button, Header, Grid } from 'semantic-ui-react'

export const CocktailValidation = () => {

  const [cocktail, setCocktail] = useState({})
  const [cocktailCount, setCocktailCount] = useState(1)

  useEffect(() => {
    getCocktailToValidate()
  }, [])

  const getCocktailToValidate = async() => {
    const response = await fetch('cocktail/tovalidate')
    const responseContent = await response.json()
    console.log(responseContent)
    setCocktail(responseContent.cocktail)
    setCocktailCount(responseContent.count)
  }

  const capitalize = (string) => {
    if (typeof string === 'string'){
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
    await fetch('cocktail/validate?id=' + cocktail.id, {method: 'POST'})
    await getCocktailToValidate()
  }

  const refuseCocktailRequest = async() => {
    await fetch('cocktail/refuse?id=' + cocktail.id, {method: 'POST'})
    await getCocktailToValidate()
  }

  const CardOrNone = () => {
      if(cocktail.hasOwnProperty('name')){
          return (
            <div>
              <Card centered style={{width: '400px'}}>
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
                                    {capitalize(ingredient[1])}
                                  </List.Item>
                              )
                              })}
                          </List>
                          <Divider />
                          {cocktail.instructions}
                      </Card.Description>

                      <Divider hidden/>
                      {cocktail.tags.map(tag => {
                        return <Label>{capitalize(tag)}</Label>
                      })}
                  </Card.Content>

                  <Card.Content extra>
                  <Grid columns={2} centered>
                    <Grid.Row>
                      <Grid.Column>
                        <Button
                          fluid
                          color='green'
                          icon='check'
                          floated='left'
                          onClick={validateCocktailRequest}
                        />
                      </Grid.Column>
                      <Grid.Column>
                        <Button
                          fluid
                          color='red'
                          icon='times'
                          floated='right'
                          onClick={refuseCocktailRequest}
                        />
                      </Grid.Column>
                    </Grid.Row>
                  </Grid>
                  </Card.Content>
              </Card>

              <Header textAlign='center'>Cocktail 1 out of {cocktailCount}</Header>
            </div>
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
