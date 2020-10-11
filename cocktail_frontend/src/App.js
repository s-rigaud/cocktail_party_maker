import React, {useEffect, useState} from 'react';
import './App.css';
import { Header } from './components/Header'
function App() {

  // TODO
  /*  Use Tabs
      Split into multiple files
      Create forms to add new cocktails easily
      Add images
      O -> circle ingredient display
      Disapearing animation
      Rework UI-UX
  */
  const [ingredient, setIngredient] = useState("")
  const [commonIngredients, setCommonIngredients] = useState([])
  const [selectedIngredients, setSelectedIngredients] = useState([])
  const [cocktail, setCocktail] = useState([])

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

  const getExactCocktailNameByIngredients = async(newlyMovedIngr, mode) => {
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
      return ingredient_json.cocktails[0].name
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

    setCocktail(await getExactCocktailNameByIngredients(name, "select"))
  }

  const unselectIngredient = async (event) => {
    const name = event.target.id
    setIngredient("")

    setCommonIngredients(await getAdditionalIngredients(name, "unselect"))
    setSelectedIngredients(currIngr => currIngr.filter(
      ingr => ingr !== name
    ))

    setCocktail(await getExactCocktailNameByIngredients(name, "unselect"))
  }

  return (
    <div className="App">
      <Header />
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
          <p>{capitalize(cocktail)}</p>
        </div>
      </div>

    </div>
  );
}

export default App;
