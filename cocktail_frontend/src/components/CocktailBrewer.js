import React, {useEffect, useState} from 'react'

import { Card, Icon, Image, List, Divider, Header, Input, Button, Segment } from 'semantic-ui-react'

export const CocktailBrewer = () => {
 const [ingredient, setIngredient] = useState('') // Search ingredient

 const [commonIngredients, setCommonIngredients] = useState([]) // List of object
 const [selectedIngredients, setSelectedIngredients] = useState([]) // List of object
 const [cocktailDescription, setCocktailDescription] = useState({}) // Cocktail properties

 useEffect(() => {
   populateCommonIngredients()
 }, [])

 useEffect(() => {
   //updateCommonIngredients()
 }, [ingredient])

 const updateCommonIngredients = async() => {
   await populateCommonIngredients()
   setCommonIngredients(currIngr => currIngr.filter(
     ingr => ingr.includes(ingredient) && !selectedIngredients.includes(ingr)
   ))
 }

 const capitalize = (string) => {
   if (typeof string === 'string'){
     return string.charAt(0).toUpperCase() + string.slice(1)
   }
   return string
 }

 const requestRandomCocktail = async() =>{
  const response = await fetch('/cocktail/random')
  const cocktail = await response.json()
  return cocktail
 }
 const getAdditionalIngredients = async(newlyMovedIngr, mode) => {
   // As setCommonIngredients asn't updated the list yet we have to
   // pass the new selected ingredients as parameter

   let updatedSelectedItems = selectedIngredients.map(ingr_object => ingr_object.name)
   if (mode === 'select') {
     updatedSelectedItems.push(newlyMovedIngr)
   }else{
     updatedSelectedItems = updatedSelectedItems.filter(item => item !== newlyMovedIngr)
   }

   let url = '/ingredients/suggestion'
   for (let ingr of updatedSelectedItems) {
    if (updatedSelectedItems.indexOf(ingr) === 0){
     url += '?ingredients=' + ingr
    }else{
     url += '&ingredients=' + ingr
    }
  }

   const response = await fetch(url)
   const ingredient_json = await response.json()
   return ingredient_json.ingredients
 }

 const getApiIngredientsByName = async(name) => {
   let url = '/ingredients'
   if(name){
     url += '?name=' + name
   }
   const response = await fetch(url)
   const ingredient_json = await response.json()
   return ingredient_json.ingredients
 }

 const getExactCocktailByIngredients = async(newlyMovedIngr, mode) => {
   // As setCommonIngredients asn't updated the list yet we have to
   // pass the new selected or unselected ingredients as parameter

   let updatedSelectedItems = selectedIngredients.map(ingr_object => ingr_object.name)
   if (mode === 'select') {
     updatedSelectedItems.push(newlyMovedIngr)
   }else{
     updatedSelectedItems = updatedSelectedItems.filter(item => item !== newlyMovedIngr)
   }

   let url = '/cocktail/exact'
   for (let ingr of updatedSelectedItems) {
     if (updatedSelectedItems.indexOf(ingr) === 0){
      url += '?ingredients=' + ingr
     }else{
      url += '&ingredients=' + ingr
     }
   }
   const response = await fetch(url)
   const ingredient_json = await response.json()
   return ingredient_json.cocktail
 }

 const populateCommonIngredients = async() => {
   const ingredients = await getApiIngredientsByName('')
   console.log(ingredients)
   setCommonIngredients(ingredients)
 }

 const selectIngredient = async(name) => {
   setIngredient('')
   //Need to retrieve object to pass color
   let ingr_object = commonIngredients.filter(ingr => ingr.name === name)[0]

   setSelectedIngredients(currIngrs => [...currIngrs, ingr_object])
   setCommonIngredients(await getAdditionalIngredients(name, 'select'))

   const cocktailDescription = await getExactCocktailByIngredients(name, 'select')
   setCocktailDescription(cocktailDescription)
 }

 const unselectIngredient = async (name) => {
   setIngredient('')

   setCommonIngredients(await getAdditionalIngredients(name, 'unselect'))
   setSelectedIngredients(currIngr => currIngr.filter(
     ingr => ingr.name !== name
   ))

   const cocktailDescription = await getExactCocktailByIngredients(name, 'unselect')
   setCocktailDescription(cocktailDescription)
 }

 const SelectedIngredientDisplay = () => {
    if (selectedIngredients.length){
      return(
        <Segment style={{ backgroundColor: '#fa983a' }}>
          <Header block as='h1'>Selected ingredients</Header>
          <div id='selected_ingredients'>
          {selectedIngredients.map(selected_ingr => {
              return (
                <Button
                  key={selected_ingr.name}
                  id={selected_ingr.name}
                  color={selected_ingr.color}
                  size='tiny'
                  onClick={() => {unselectIngredient(selected_ingr.name)}}
                >
                {capitalize(selected_ingr.name)}
              </Button>
              )
            })}
          </div>
        </Segment>
      )
    }
    return <div></div>
 }

 const IngredientSelectorDisplay = () => {
  if (commonIngredients.length){
    return(
      <Segment style={{ backgroundColor: '#1e3799' }}>
        <Header block as='h1'>All ingredients</Header>
        <div id='all_ingredients'>
          {commonIngredients.map(common_ingr => {
            return (
              <Button
                key={common_ingr.name}
                id={common_ingr.name}
                color={common_ingr.color}
                size='tiny'
                onClick={() => {selectIngredient(common_ingr.name)}}
              >
                {capitalize(common_ingr.name)}
              </Button>
            )
          })}
        </div>
      </Segment>
    )
  }
  return <div></div>
}

 const CocktailCard = () => {
  if (cocktailDescription.hasOwnProperty('name')){
    return (
      <Segment style={{ backgroundColor: '#eb2f06' }}>
        <Header block as='h1'>Cocktails</Header>
        <Card centered>
          <Image src={cocktailDescription.picture} wrapped ui={false} />
          <Card.Content>
            <Card.Header>{capitalize(cocktailDescription.name)}</Card.Header>
            <Card.Meta>
                <span className='date'>Added the {cocktailDescription.creation_date}</span>
            </Card.Meta>
            <Card.Description>
              <List>
                {cocktailDescription.ingredients.map(ingredient => {
                  return (
                    <List.Item key={ingredient[0]} style={{color: ingredient[2]}}>
                      <Header>{capitalize(ingredient[0])}</Header>
                      {ingredient[1]}
                    </List.Item>
                  )
                })}
              </List>
              <Divider />
              {cocktailDescription.instructions}
            </Card.Description>
          </Card.Content>
          <Card.Content extra>
              <Icon name='user' />
              Already made {cocktailDescription.usage} times
          </Card.Content>
        </Card>
      </Segment>
    )
  }else{
    return <div></div>
  }
}



 return (
   <div className='App'>
     <Button icon='random' onClick={requestRandomCocktail}></Button>
     <Segment.Group piled>

        <Segment style={{ backgroundColor: '#343A40' }}>
            <Header as='h2' icon textAlign='center'>
              <Icon name='cocktail' circular style={{ color: 'white', backgroundColor: '#3c6382' }}/>
              <Header.Content style={{ color: 'white' }}>Cocktail Maker</Header.Content>
            </Header>

            <Header as='h3' icon textAlign='center' style={{ color: 'white' }}>Start making cocktail now !</Header>

            <Input
              autoFocus
              icon='search'
              iconPosition='left'
              placeholder='Search for ingredient'
              onInput={(e) => {setIngredient(e.target.value)}}
              value={ingredient}
            />
        </Segment>

        <SelectedIngredientDisplay />

        <IngredientSelectorDisplay />

        <CocktailCard />

     </Segment.Group>
   </div>
 )
}
