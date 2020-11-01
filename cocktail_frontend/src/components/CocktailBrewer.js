import React, {useEffect, useState} from 'react'

import { Card, Icon, Image } from 'semantic-ui-react'


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
 const [cocktailDescription, setCocktailDescription] = useState([])

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
   console.log(ingredient_json.cocktails)
   if (ingredient_json.cocktails.length === 1){
     return ingredient_json.cocktails[0]
   }
   return ""
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

   let cocktailResponse = await getExactCocktailByIngredients(name, "select")
   setCocktailDescription(formatCocktailResponse(cocktailResponse))
 }

 const unselectIngredient = async (event) => {
   const name = event.target.id
   setIngredient("")

   setCommonIngredients(await getAdditionalIngredients(name, "unselect"))
   setSelectedIngredients(currIngr => currIngr.filter(
     ingr => ingr !== name
   ))

   let cocktailResponse = await getExactCocktailByIngredients(name, "unselect")
   setCocktailDescription(formatCocktailResponse(cocktailResponse))
 }

 const formatCocktailResponse = (cocktailResponse) => {
   return cocktailResponse.name

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
       <h1>All ingredients</h1>
       <div id="all_ingredients">
         {commonIngredients.map(common_ingr => {
           return (
             <img
               key={common_ingr}
               id={common_ingr}
               name={capitalize(common_ingr)}
               alt={capitalize(common_ingr)}
               onClick={selectIngredient}
             />
           )
         })}
       </div>
     </div>

     <br/>

     <div style={{ backgroundColor: "#487eb0" }}>
       <h1>Selected ingredients</h1>
       <div id="selected_ingredients">
       {selectedIngredients.map(selected_ingr => {
           return (
             <img
               key={selected_ingr}
               id={selected_ingr}
               name={capitalize(selected_ingr)}
               alt={capitalize(selected_ingr)}
               onClick={unselectIngredient}
             />
           )
         })}
       </div>
     </div>

     <div style={{ backgroundColor: "#7ed6df" }}>
       <h1>Cocktail</h1>
       <div id="cocktail">
         <Card centered>
          <Image src='http://shake-that.com/wp-content/uploads/2015/07/Vampiro.jpg' wrapped ui={false} />
          <Card.Content>
            <Card.Header>{capitalize(cocktailDescription)}</Card.Header>
            <Card.Meta>
              <span className='date'>Added the XXX</span>
            </Card.Meta>
            <Card.Description>
              <ul>
                <li>Ingr ..</li>
                <li>Ingr ..</li>
                <li>Ingr ..</li>
              </ul>
            </Card.Description>
          </Card.Content>
          <Card.Content extra>
              <Icon name='user' />
              Already made XXX times
          </Card.Content>
         </Card>
       </div>
     </div>

   </div>
 )
}
