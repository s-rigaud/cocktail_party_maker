import React, {useState} from 'react'

import { Button, Divider, Form, Popup, Message, TextArea, Segment, Header, Icon } from 'semantic-ui-react'

export const CocktailMakerForm = () => {

    const [success, setSuccess] = useState(false)
    const [failure, setFailure] = useState(false)
    const [responseMessage, setResponseMessage] = useState('')

    const [name, setName] = useState('')
    const [instructions, setInstructions] = useState('')

    const [visibleIngredient, setVisibleIngredient] = useState(2)

    const [ingr1, setIngr1] = useState('')
    const [quantity1, setQuantity1] = useState('')
    const [quantityUnit1, setQuantityUnit1] = useState('mL')

    const [ingr2, setIngr2] = useState('')
    const [quantity2, setQuantity2] = useState('')
    const [quantityUnit2, setQuantityUnit2] = useState('mL')

    const [ingr3, setIngr3] = useState('')
    const [quantity3, setQuantity3] = useState('')
    const [quantityUnit3, setQuantityUnit3] = useState('mL')

    const [ingr4, setIngr4] = useState('')
    const [quantity4, setQuantity4] = useState('')
    const [quantityUnit4, setQuantityUnit4] = useState('mL')

    // List attributes to avoid using eval in loop creation fields
    const quantityStates = [quantity1, quantity2, quantity3, quantity4]
    const setQuantityStates = [setQuantity1, setQuantity2, setQuantity3, setQuantity4]
    const ingredientStates = [ingr1, ingr2, ingr3, ingr4]
    const setIngrStates = [setIngr1, setIngr2, setIngr3, setIngr4]
    const quantityUnitStates = [quantityUnit1, quantityUnit2, quantityUnit3, quantityUnit4]
    const setQuantityUnitStates = [setQuantityUnit1, setQuantityUnit2, setQuantityUnit3, setQuantityUnit4]

    const quantityUnitOptions = [
        { key: 'g', text: 'g', value: 'g' },
        { key: 'm', text: 'mL', value: 'mL' },
        { key: 'oz', text: 'oz', value: 'oz' },
      ]


    const resetRequestStatus = () => {
        setSuccess(false)
        setFailure(false)
    }

    const clearFormFields = () => {
        setName('')
        for (let i = 0; i < visibleIngredient; i++){
            setIngrStates[i]('')
        }
        for (let i = 0; i < visibleIngredient; i++){
            setQuantityStates[i]('')
        }
        for (let i = 0; i < visibleIngredient; i++){
            setQuantityUnitStates[i]('mL')
        }
    }

    const mergeIngrAndQuantities = () => {
        let mergedIngrAndQty = []
        // [0] is ingredient name
        // [1] is ingredient quantity
        for (let i = 0; i < visibleIngredient; i++){
            mergedIngrAndQty.push([ingredientStates[i], quantityStates[i] + ' ' + quantityUnitStates[i]])
        }
        return mergedIngrAndQty
    }

    const addCocktailRequest = async() => {
        resetRequestStatus()

        let cocktail = {
            'name': name,
            'ingredients': mergeIngrAndQuantities(),
            'image': 'https://i.pinimg.com/originals/7b/20/cb/7b20cb24e5093df0dbcea8f3f49eeddd.jpg',
            'instructions': instructions,
        }

        const response = await fetch('cocktail/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(cocktail)
        })
        let responseContent = await response.json()
        console.log(responseContent)

        if (response.ok) {
            setSuccess(true)
            clearFormFields()
            setResponseMessage(responseContent)
        }else{
            setFailure(true)
            setResponseMessage(responseContent.message)
        }
      }

    const formatIngredientsToDisplay = () => {
        let sentences = []
        if (responseMessage.hasOwnProperty('ingredients')){
            responseMessage.ingredients.map(
                ingredientQuantity => {
                    // [0] is ingredient name
                    // [1] is ingredient quantity
                    sentences.push(ingredientQuantity[1] + ' of ' + ingredientQuantity[0])
                }
            )
        }
        return sentences
    }

    const handleAdd = () => setVisibleIngredient(visibleIngredient + 1)

    const handleRemove = () => setVisibleIngredient(visibleIngredient - 1)


    const ingredientFieldList = () => {
        let fields = []
        for (let i = 0; i < visibleIngredient; i++){
            fields.push(
                <Form.Group inline widths='equal' key={'ingredientFormGroup' + i}>
                    <Form.Input
                        required={i < 2}
                        fluid
                        label='Ingredient'
                        placeholder='Rhum'
                        value={ingredientStates[i]}
                        onChange={e => setIngrStates[i](e.target.value)}
                    />
                    <Form.Input
                        required={i < 2}
                        fluid
                        label='Quantity'
                        placeholder='15'
                        value={quantityStates[i]}
                        onChange={e => setQuantityStates[i](e.target.value)}
                    />
                    <Form.Select
                        fluid
                        label=' '
                        options={quantityUnitOptions}
                        value={quantityUnitStates[i]}
                        // ugly hack
                        onChange={e => setQuantityUnitStates[i](e.target.children[0].innerHTML)}
                    />
                </Form.Group>
            )
        }
        return fields
    }

    return (
        <Form size='large'>
            <Message
                success
                icon='cocktail'
                header='Success ✔️'
                list={formatIngredientsToDisplay()}
                content={'📝 Recipe of ' + responseMessage.name + ' learnt.'}
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

            {ingredientFieldList({visibleIngredient}).map(ingrdient_fields => {
                return ingrdient_fields
            })}

            <Button.Group>
                <Button
                    disabled={visibleIngredient < 3}
                    icon='minus'
                    onClick={handleRemove}
                />
                <Button
                    disabled={visibleIngredient > 3}
                    icon='plus'
                    onClick={handleAdd}
                />
            </Button.Group>

            <Divider />

            <Form.Field
                control={TextArea}
                label='Instructions'
                placeholder='Add Mint, Vodka and mix everything ...'
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
            />

            <Divider />

            <Segment placeholder>
                <Header icon>
                    <Icon name='image file outline' style={{height: '60px'}}/>
                    Missing Image for the cocktail
                </Header>
                <Button primary>Browse</Button>
            </Segment>

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