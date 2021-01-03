import React, {useState} from 'react'

import { Button, Segment, Label } from 'semantic-ui-react'

export const ColorPicker = ({colors, onChange}) => {
    const [color, setColor] = useState("grey")

    return (
        <Segment className={"fluid"}>
            {colors.map(colorItem => {
                return (
                    <Button
                        key={colorItem}
                        compact={colorItem === color}
                        size="mini"
                        color={colorItem}
                        onClick={() => {setColor(colorItem); onChange(colorItem)}}
                    />
                )
            })}
        </Segment>
    )
}