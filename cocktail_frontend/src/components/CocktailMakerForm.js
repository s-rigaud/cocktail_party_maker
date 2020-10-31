import React, {useState} from 'react'

import { Button, Divider, Form, Popup, Message } from 'semantic-ui-react'

export const CocktailMakerForm = () => {

    const [success, setSuccess] = useState(false)
    const [failure, setFailure] = useState(false)
    const [responseMessage, setResponseMessage] = useState("")

    const [name, setName] = useState("")
    const [ingr1, setIngr1] = useState("")
    const [quantity1, setQuantity1] = useState("")
    const [ingr2, setIngr2] = useState("")
    const [quantity2, setQuantity2] = useState("")
    const [ingr3, setIngr3] = useState("")
    const [quantity3, setQuantity3] = useState("")

    const resetRequestStatus = () => {
        setSuccess(false)
        setFailure(false)
    }

    const clearFormFields = () => {
        setName("")
        setIngr1("")
        setIngr2("")
        setIngr3("")
        setQuantity1("")
        setQuantity2("")
        setQuantity3("")
    }

    const mergeIngrAndQuantities = () => {
        let mergedIngrAndQty = []
        mergedIngrAndQty.push([ingr1, quantity1])
        mergedIngrAndQty.push([ingr2, quantity2])
        mergedIngrAndQty.push([ingr3, quantity3])
        return mergedIngrAndQty
    }

    const addCocktailRequest = async() => {
        resetRequestStatus()

        let cocktail = {
            "name": name,
            "ingredients": mergeIngrAndQuantities()
        }

        const response = await fetch("cocktails/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(cocktail)
        })

        console.log(response)
        setResponseMessage(await response.json())
        if (response.ok) {
            setSuccess(true)
            clearFormFields()
        }else{
            setFailure(true)
        }
      }

    const formatIngredientsToDisplay = () => {
        // [0] is ingredient name
        // [1] is inredient quantity
        let sentences = []
        if (responseMessage.hasOwnProperty("ingredients")){
            responseMessage.ingredients.map(
                ingredientQuantity => {
                    sentences.push(ingredientQuantity[1] + " of " + ingredientQuantity[0])
                }
            )
        }
        return sentences
    }


    return (
        <Form size="large">
            <Message
                success
                icon='cocktail'
                header='Success !'
                list={formatIngredientsToDisplay()}
                content={'=> ' + responseMessage["name"] + " was added to the db"}
                visible={success}
            />
            <Message
                error
                icon='times'
                header='Error'
                content={responseMessage}
                visible={failure}
            />
            <Form.Input
                required
                fluid
                label='Cocktail Name'
                placeholder='Margaritta, Dracula, ...'
                value={name}
                onChange={(e) => {
                    setName(e.target.value)
                    resetRequestStatus()
                }}
            />
            <Divider />

            <Form.Group inline widths='equal'>
                <Form.Input
                    required
                    fluid
                    label='Ingredient 1'
                    placeholder='Ingredient 1'
                    value={ingr1}
                    onChange={e => setIngr1(e.target.value)}

                />
                <Form.Input
                    required
                    fluid
                    label='Quantity 1'
                    placeholder='Quantity 1'
                    value={quantity1}
                    onChange={e => setQuantity1(e.target.value)}
                />
            </Form.Group>

            <Form.Group inline widths='equal'>
                <Form.Input
                    required
                    fluid
                    label='Ingredient 2'
                    placeholder='Ingredient 2'
                    value={ingr2}
                    onChange={e => setIngr2(e.target.value)}
                />
                <Form.Input
                    required
                    fluid
                    label='Quantity 2'
                    placeholder='Quantity 2'
                    value={quantity2}
                    onChange={e => setQuantity2(e.target.value)}
                />
            </Form.Group>

            <Form.Group inline widths='equal'>
                <Form.Input
                    fluid
                    label='Ingredient 3'
                    placeholder='Ingredient 3'
                    value={ingr3}
                    onChange={e => setIngr3(e.target.value)}
                />
                <Form.Input
                    fluid
                    label='Quantity 3'
                    placeholder='Quantity 3'
                    value={quantity3}
                    onChange={e => setQuantity3(e.target.value)}
                />
            </Form.Group>

            <Button
                onClick={addCocktailRequest}
            >
                Submit cocktail
            </Button>
            <Popup
                content='Add cocktail to the database'
                trigger={<Button icon='question circle' />}
            />
        </Form>
  )
}