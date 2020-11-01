import React, {useState} from 'react'

import { Button, Divider, Form, Popup, Message } from 'semantic-ui-react'

export const CocktailMakerForm = () => {

    const [success, setSuccess] = useState(false)
    const [failure, setFailure] = useState(false)
    const [responseMessage, setResponseMessage] = useState("")

    const [name, setName] = useState("")

    const [ingr1, setIngr1] = useState("")
    const [quantity1, setQuantity1] = useState("")
    const [quantityUnit1, setQuantityUnit1] = useState("mL")

    const [ingr2, setIngr2] = useState("")
    const [quantity2, setQuantity2] = useState("")
    const [quantityUnit2, setQuantityUnit2] = useState("mL")

    const [ingr3, setIngr3] = useState("")
    const [quantity3, setQuantity3] = useState("")
    const [quantityUnit3, setQuantityUnit3] = useState("mL")

    const [ingr4, setIngr4] = useState("")
    const [quantity4, setQuantity4] = useState("")
    const [quantityUnit4, setQuantityUnit4] = useState("mL")


    const quantityUnitOptions = [
        { key: 'o', text: 'oz', value: 'oz' },
        { key: 'g', text: 'g', value: 'g' },
        { key: 'm', text: 'mL', value: 'mL' },
      ]


    const resetRequestStatus = () => {
        setSuccess(false)
        setFailure(false)
    }

    const clearFormFields = () => {
        setName("")
        setIngr1("")
        setIngr2("")
        setIngr3("")
        setIngr4("")
        setQuantity1("")
        setQuantity2("")
        setQuantity3("")
        setQuantity4("")
        setQuantityUnit1("")
        setQuantityUnit2("")
        setQuantityUnit3("")
        setQuantityUnit4("")
    }

    const mergeIngrAndQuantities = () => {
        let mergedIngrAndQty = []
        mergedIngrAndQty.push([ingr1, quantity1 + " " + quantityUnit1])
        mergedIngrAndQty.push([ingr2, quantity2 + " " + quantityUnit2])
        mergedIngrAndQty.push([ingr3, quantity3 + " " + quantityUnit3])
        mergedIngrAndQty.push([ingr4, quantity4 + " " + quantityUnit4])
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
                header='Success ✔️'
                list={formatIngredientsToDisplay()}
                content={'📝 Recipe of the ' + responseMessage["name"] + " learnt."}
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
                    label='Ingredient'
                    placeholder='Mint syrup'
                    value={ingr1}
                    onChange={e => setIngr1(e.target.value)}

                />
                <Form.Input
                    required
                    fluid
                    label='Quantity'
                    placeholder='15'
                    value={quantity1}
                    onChange={e => setQuantity1(e.target.value)}
                />
                <Form.Select
                    fluid
                    label=' '
                    options={quantityUnitOptions}
                    value={quantityUnit1}
                    // ugly hack
                    onChange={e => setQuantityUnit1(e.target.children[0].innerHTML)}
                />
            </Form.Group>

            <Form.Group inline widths='equal'>
                <Form.Input
                    required
                    fluid
                    label='Ingredient'
                    placeholder='Rhum'
                    value={ingr2}
                    onChange={e => setIngr2(e.target.value)}
                />
                <Form.Input
                    required
                    fluid
                    label='Quantity'
                    placeholder='25'
                    value={quantity2}
                    onChange={e => setQuantity2(e.target.value)}
                />
                <Form.Select
                    fluid
                    label=' '
                    options={quantityUnitOptions}
                    value={quantityUnit2}
                    // ugly hack
                    onChange={e => setQuantityUnit2(e.target.children[0].innerHTML)}
                />
            </Form.Group>

            <Form.Group inline widths='equal'>
                <Form.Input
                    fluid
                    label='Ingredient'
                    placeholder='Vodka'
                    value={ingr3}
                    onChange={e => setIngr3(e.target.value)}
                />
                <Form.Input
                    fluid
                    label='Quantity'
                    placeholder='125'
                    value={quantity3}
                    onChange={e => setQuantity3(e.target.value)}
                />
                <Form.Select
                    fluid
                    label=' '
                    options={quantityUnitOptions}
                    value={quantityUnit3}
                    // ugly hack
                    onChange={e => setQuantityUnit3(e.target.children[0].innerHTML)}
                />
            </Form.Group>


            <Form.Group inline widths='equal'>
                <Form.Input
                    fluid
                    label='Ingredient'
                    placeholder='Kiwi'
                    value={ingr4}
                    onChange={e => setIngr4(e.target.value)}
                />
                <Form.Input
                    fluid
                    label='Quantity'
                    placeholder='25'
                    value={quantity4}
                    onChange={e => setQuantity4(e.target.value)}
                />
                <Form.Select
                    fluid
                    label=' '
                    options={quantityUnitOptions}
                    value={quantityUnit4}
                    // ugly hack
                    onChange={e => setQuantityUnit4(e.target.children[0].innerHTML)}
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