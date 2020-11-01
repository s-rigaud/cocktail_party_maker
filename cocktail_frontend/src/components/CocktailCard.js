import React from 'react'

import { Card, Icon, Image } from 'semantic-ui-react'


export const CocktailCard = ({cocktailDescription}) => {

    const capitalize = (string) => {
        if (typeof string === "string"){
          return string.charAt(0).toUpperCase() + string.slice(1)
        }
        return string
      }

 console.log(cocktailDescription)
 if (typeof cocktailDescription !== "undefined" && cocktailDescription.hasOwnProperty("name")){
    return (
        <Card centered>
        <Image src='http://shake-that.com/wp-content/uploads/2015/07/Vampiro.jpg' wrapped ui={false} />
        <Card.Content>
            <Card.Header>{capitalize(cocktailDescription.name)}</Card.Header>
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
    )
 }else{
     return <div></div>
 }
}
