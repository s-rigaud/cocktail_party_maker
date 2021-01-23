import React, {useState, useEffect} from 'react'

import { Button, Divider, Form, Popup, Message, Segment, Header, Icon, Label } from 'semantic-ui-react'

import { ColorPicker } from './ColorPicker'


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
    const [ingrColor1, setIngrColor1] = useState('grey')

    const [ingr2, setIngr2] = useState('')
    const [quantity2, setQuantity2] = useState('')
    const [quantityUnit2, setQuantityUnit2] = useState('mL')
    const [ingrColor2, setIngrColor2] = useState('grey')

    const [ingr3, setIngr3] = useState('')
    const [quantity3, setQuantity3] = useState('')
    const [quantityUnit3, setQuantityUnit3] = useState('mL')
    const [ingrColor3, setIngrColor3] = useState('grey')

    const [ingr4, setIngr4] = useState('')
    const [quantity4, setQuantity4] = useState('')
    const [quantityUnit4, setQuantityUnit4] = useState('mL')
    const [ingrColor4, setIngrColor4] = useState('grey')

    const [tags, setTags] = useState([])
    const [availableTags, setAvailableTags] = useState([])

    // List attributes to avoid using eval in loop creation fields
    const quantityStates = [quantity1, quantity2, quantity3, quantity4]
    const setQuantityStates = [setQuantity1, setQuantity2, setQuantity3, setQuantity4]
    const ingredientStates = [ingr1, ingr2, ingr3, ingr4]
    const setIngrStates = [setIngr1, setIngr2, setIngr3, setIngr4]
    const quantityUnitStates = [quantityUnit1, quantityUnit2, quantityUnit3, quantityUnit4]
    const setQuantityUnitStates = [setQuantityUnit1, setQuantityUnit2, setQuantityUnit3, setQuantityUnit4]
    const ingrColorStates = [ingrColor1, ingrColor2, ingrColor3, ingrColor4]
    const setIngrColorStates = [setIngrColor1, setIngrColor2, setIngrColor3, setIngrColor4]

    const quantityUnitOptions = [
        { key: 'g', text: 'g', value: 'g' },
        { key: 'm', text: 'mL', value: 'mL' },
        { key: 'oz', text: 'oz', value: 'oz' },
    ]

    useEffect(() => {
        requestAvailableTags()
      }, [])

    const resetRequestStatus = () => {
        setSuccess(false)
        setFailure(false)
    }

    const clearFormFields = () => {
        setName('')
        setTags([])
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

    const mergeIngrAndQuantitiesAndColor = () => {
        let mergedIngrAndQty = []
        // Backend is waiting for [(name, quantity, color)]
        for (let i = 0; i < visibleIngredient; i++){
            mergedIngrAndQty.push(
                [ingredientStates[i], quantityStates[i] + ' ' + quantityUnitStates[i], ingrColorStates[i]]
            )
        }
        return mergedIngrAndQty
    }

    const requestAvailableTags = async() => {
        const response = await fetch('cocktail/tags')
        const responseContent = await response.json()

        let options = []
        for (let tag of responseContent.tags){
            options.push({ key: tag, text: tag, value: tag })
        }
        setAvailableTags(options)
    }

    const requestAddCocktail = async() => {
        resetRequestStatus()

        let cocktail = {
            'name': name,
            'ingredients': mergeIngrAndQuantitiesAndColor(),
            'image': 'https://i.pinimg.com/originals/7b/20/cb/7b20cb24e5093df0dbcea8f3f49eeddd.jpg',
            'instructions': instructions,
            'tags': tags,
        }
        console.log(cocktail)

        const response = await fetch('cocktail/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(cocktail)
        })
        const responseContent = await response.json()
        console.log(responseContent);
        if (response.ok) {
            setSuccess(true)
            clearFormFields()
            setResponseMessage(responseContent.message)
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
                        fluid
                        required={i < 2}
                        label='Ingredient'
                        placeholder='Rhum'
                        value={ingredientStates[i]}
                        onChange={e => setIngrStates[i](e.target.value)}
                    />
                    <Form.Input
                        fluid
                        required={i < 2}
                        label='Quantity'
                        placeholder='15'
                        value={quantityStates[i]}
                        onChange={e => setQuantityStates[i](e.target.value)}
                    />
                    <Form.Select
                        fluid
                        label='⠀'
                        options={quantityUnitOptions}
                        value={quantityUnitStates[i]}
                        // ugly hack
                        onChange={e => setQuantityUnitStates[i](e.target.children[0].innerHTML)}
                    />
                    <div
                        className="field"
                    >
                        <label>Color</label>
                        <ColorPicker
                            colors={["red", "orange", "yellow", "olive", "green", "teal", "blue", "violet", "purple", "pink", "brown", "grey", "black"]}
                            onChange={setIngrColorStates[i]}
                        />
                    </div>
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
                content={'📝 Recipe of ' + responseMessage + ' learnt.'}
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
                autoFocus
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

            <Form.TextArea
                label='Instructions'
                placeholder='Add Mint, Vodka and mix everything ...'
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
            />

            <Divider />

            <Form.Select
                label='Add tags'
                placeholder='Chrismass, Summer, ...'
                options={availableTags}
                onChange={(e, {value}) => setTags(tags => [...tags, value])}
            />

            {tags.map(tag => {
                return (
                <Label>
                    {tag}
                    <Icon
                        name="delete"
                        onClick={() => setTags(tags => tags.filter(
                            currTag => currTag !== tag
                        ))}
                    />
                </Label>
                )
            })}

            <Divider />

            <Segment placeholder>
                <Header icon>
                    <Icon name='image file outline' style={{height: '60px'}}/>
                    Missing image for the cocktail
                </Header>
                <Button primary>Browse</Button>
            </Segment>

            <Button
                onClick={requestAddCocktail}
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