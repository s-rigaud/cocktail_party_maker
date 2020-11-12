import React, {useEffect, useState} from 'react'

import { Card, Icon, Image, List, Divider, Label, Header, Input, Button } from 'semantic-ui-react'

export const CocktailBrewer = () => {
 const [ingredient, setIngredient] = useState("") // Search ingredient

 const [commonIngredients, setCommonIngredients] = useState([])
 const [selectedIngredients, setSelectedIngredients] = useState([])
 const [cocktailDescription, setCocktailDescription] = useState({})

 useEffect(() => {
   populateCommonIngredients()
 }, [])

 useEffect(() => {
   updateCommonIngredients()
 }, [ingredient])

 const updateCommonIngredients = async() => {
   await populateCommonIngredients()
   setCommonIngredients(currIngr => currIngr.filter(
     ingr => ingr.includes(ingredient) && !selectedIngredients.includes(ingr)
   ))
 }

 const capitalize = (string) => {
   if (typeof string === "string"){
     return string.charAt(0).toUpperCase() + string.slice(1)
   }
   return string
 }

 const getAdditionalIngredients = async(newlyMovedIngr, mode) => {
   // As setCommonIngredients asn't updated the list yet we have to
   // pass the new selected ingredients as parameter

   // Slice to work with a copy of prop value
   console.log(selectedIngredients, newlyMovedIngr, mode)
   let updatedSelectedItems = selectedIngredients.slice()
   if (mode === "select") {
     updatedSelectedItems.push(newlyMovedIngr)
   }else{
     updatedSelectedItems = updatedSelectedItems.filter(item => item !== newlyMovedIngr)
   }

   let url = "/ingredients/suggestion"
   if (updatedSelectedItems.length > 0) {
     url += "?ingredients=" + JSON.stringify(updatedSelectedItems)
   }

   const response = await fetch(url)
   const ingredient_json = await response.json()
   return ingredient_json.ingredients
 }

 const getApiIngredientsByName = async(name) => {
   let url = "/ingredients"
   if(name){
     url += "?name=" + name
   }
   const response = await fetch(url)
   const ingredient_json = await response.json()
   console.log(ingredient_json)
   return ingredient_json.ingredients
 }

 const getExactCocktailByIngredients = async(newlyMovedIngr, mode) => {
   // As setCommonIngredients asn't updated the list yet we have to
   // pass the new selected ingredients as parameter

   // Concat to work with a copy of prop value
   let updatedSelectedItems = selectedIngredients.slice()
   if (mode === "select") {
     updatedSelectedItems.push(newlyMovedIngr)
   }else{
     updatedSelectedItems = updatedSelectedItems.filter(item => item !== newlyMovedIngr)
   }
   let url = "/cocktail/exact"
   if (updatedSelectedItems.length > 0) {
    url += "?ingredients=" + JSON.stringify(updatedSelectedItems)
   }
   const response = await fetch(url)
   const ingredient_json = await response.json()
   console.log(ingredient_json.cocktail)
   return ingredient_json.cocktail
 }

 const populateCommonIngredients = async() => {
   const ingredients = await getApiIngredientsByName("")
   setCommonIngredients(ingredients.map(ingr => ingr.name))
 }

 const selectIngredient = async(event) => {
   const name = event.target.id
   setIngredient("")

   setSelectedIngredients(currIngr => [...currIngr, name])
   setCommonIngredients(await getAdditionalIngredients(name, "select"))

   const cocktailDescription = await getExactCocktailByIngredients(name, "select")
   setCocktailDescription(cocktailDescription)
 }

 const unselectIngredient = async (event) => {
   const name = event.target.id
   setIngredient("")

   setCommonIngredients(await getAdditionalIngredients(name, "unselect"))
   setSelectedIngredients(currIngr => currIngr.filter(
     ingr => ingr !== name
   ))

   const cocktailDescription = await getExactCocktailByIngredients(name, "unselect")
   setCocktailDescription(cocktailDescription)
 }

 const CocktailCard = () => {
  if (cocktailDescription.hasOwnProperty("name")){
    console.log(cocktailDescription)
    return (
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
              <List.Item>
                <List.Header>{capitalize(ingredient[0])}</List.Header>
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
    )
  }else{
    return <div></div>
  }
}

 return (
   <div className="App">
      <Input
        icon='search'
        iconPosition='left'
        placeholder='Search for ingredient'
        onInput={(e) => {setIngredient(e.target.value)}}
        value={ingredient}
      />

     <div style={{ backgroundColor: "#273c75" }}>
       <Header block as='h1'>All ingredients</Header>
       <div id="all_ingredients">
         {commonIngredients.map(common_ingr => {
           return (
             <Button
               key={common_ingr}
               id={common_ingr}
               size='tiny'
               onClick={selectIngredient}
             >
               {capitalize(common_ingr)}
             </Button>
           )
         })}
       </div>

       <Header block as='h1'>Selected ingredients</Header>
       <div id="selected_ingredients">
       {selectedIngredients.map(selected_ingr => {
           return (
            <Label
               key={selected_ingr}
               id={selected_ingr}
               onClick={unselectIngredient}
             >
               {capitalize(selected_ingr)}
               <Icon name='cocktail' />
            </Label>
           )
         })}
       </div>

       <Header block as='h1'>Cocktails</Header>
       <div id="cocktail">
         <CocktailCard />
       </div>
     </div>

   </div>
 )
}
