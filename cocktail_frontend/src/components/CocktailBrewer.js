import React, {useEffect, useState} from 'react'

import { Card, Icon, Image, List, Divider, Label, Header } from 'semantic-ui-react'

export const CocktailBrewer = () => {

  // TODO
  /*  Add images
      O -> circle ingredient display
      Disapearing animation
      Rework UI-UX
  */
 const [ingredient, setIngredient] = useState("")
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

   // Concat to work with a copy of prop value
   let updatedSelectedItems = selectedIngredients.slice()
   if (mode === "select") {
     updatedSelectedItems.push(newlyMovedIngr)
   }else{
     updatedSelectedItems = updatedSelectedItems.filter(item => item !== newlyMovedIngr)
   }
   const url = "/ingredients/add?ingredients=" + JSON.stringify(updatedSelectedItems)
   const response = await fetch(url)
   const ingredient_json = await response.json()
   return ingredient_json.ingredients
 }

 const getApiIngredientsByName = async(name) => {
   const url = "/ingredients?name="+name
   const response = await fetch(url)
   const ingredient_json = await response.json()
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
   const url = "/cocktails/exact?ingredients=" + JSON.stringify(updatedSelectedItems)
   const response = await fetch(url)
   const ingredient_json = await response.json()
   if (ingredient_json.cocktails.length === 1){
     return ingredient_json.cocktails[0]
   }
   return {}
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

   const cocktailResponse = await getExactCocktailByIngredients(name, "select")
   setCocktailDescription(cocktailResponse)
 }

 const unselectIngredient = async (event) => {
   const name = event.target.id
   setIngredient("")

   setCommonIngredients(await getAdditionalIngredients(name, "unselect"))
   setSelectedIngredients(currIngr => currIngr.filter(
     ingr => ingr !== name
   ))

   const cocktailResponse = await getExactCocktailByIngredients(name, "unselect")
   setCocktailDescription(cocktailResponse)
 }

 const CocktailCard = () => {
  if (cocktailDescription.hasOwnProperty("name")){
    console.log(cocktailDescription)
    return (
      <Card centered>
      <Image src={cocktailDescription.image} wrapped ui={false} />
      <Card.Content>
      <Card.Header>{capitalize(cocktailDescription.name)}</Card.Header>
      <Card.Meta>
          <span className='date'>Added the XXX</span>
      </Card.Meta>
      <Card.Description>
        <List>
          {cocktailDescription["ingredients"].map(ingredient => {
            return (
              <List.Item>
                <List.Header>{capitalize(ingredient.name)}</List.Header>
                {ingredient.quantity}
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
          Already made XXX times
      </Card.Content>
      </Card>
    )
  }else{
    return <div></div>
  }
}

 return (
   <div className="App">

     <input
       id="search-bar"
       className="search-bar"
       type="text"
       onInput={(e) => {setIngredient(e.target.value)}}
       value={ingredient}
     />

     <div style={{ backgroundColor: "#273c75" }}>
       <Header block as='h1'>All ingredients</Header>
       <div id="all_ingredients">
         {commonIngredients.map(common_ingr => {
           return (
             <Label
               key={common_ingr}
               id={common_ingr}
               onClick={selectIngredient}
             >
               {capitalize(common_ingr)}
               <Icon name='cocktail' />
             </Label>
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
         <CocktailCard coctailDescription={cocktailDescription}/>
       </div>
     </div>

   </div>
 )
}
