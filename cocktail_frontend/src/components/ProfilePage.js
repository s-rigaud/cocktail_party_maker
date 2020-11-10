import React, {useState, useEffect} from "react"

import { Table, Card, Button, Icon } from 'semantic-ui-react'

export const ProfilePage = ({username, setUsername, setTab}) => {

  const [points, setPoints] = useState(0)
  const [cocktails, setCocktails] = useState([])

  useEffect(() => {
    profileRequest()
  }, [])

  const profileRequest = async() => {
    const response = await fetch("user/profile")
    let responseContent = await response.json()
    console.log(responseContent)
    setPoints(responseContent.user.points)
    setCocktails(responseContent.cocktails)
  }

  const logoutRequest = async() => {
    setPoints(0)
    setCocktails([])
    setUsername("")
    setTab("Brew")
    await fetch("user/logout")
  }

  return (
    <div>
      <Card
        centered
        image='https://images.ladbible.com/resize?type=jpeg&url=http://beta.ems.ladbiblegroup.com/s3/content/1bb3cdf35dc6d4a97a9891fef90de232.png&quality=70&width=720&aspectratio=16:9&extend=white'
        header={username}
        extra={points + " 🥇"}
      />
      <Button
          onClick={logoutRequest}
          color="red"
      >
          <Icon name='times' />
          Log out
      </Button>

      <Table celled inverted selectable>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>Submission date</Table.HeaderCell>
            <Table.HeaderCell>State</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {cocktails.map(cocktail => {
            return (
              <Table.Row key={cocktails.indexOf(cocktail)}>
                <Table.Cell>{cocktail.name}</Table.Cell>
                <Table.Cell>{cocktail.creation_date}</Table.Cell>
                <Table.Cell positive={cocktail.state === "AC"}>{cocktail.state}</Table.Cell>
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table>
    </div>
  )
}
