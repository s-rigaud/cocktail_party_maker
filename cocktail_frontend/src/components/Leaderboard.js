import React, {useState, useEffect} from "react"

import { Table, Divider, Header, Icon } from 'semantic-ui-react'

export const Leaderboard = () => {

  const [users, setUsers] = useState([])

  useEffect(() => {
    leaderboardRequest()
  }, [])

  const leaderboardRequest = async() => {
    const response = await fetch("user/leaderboard")
    let responseContent = await response.json()
    console.log(responseContent)
    setUsers(responseContent.users)
  }

  return (
    <div>

      <Header as='h2' icon textAlign='center'>
        <Icon name='users' circular />
        <Header.Content>Leaderboard</Header.Content>
      </Header>

      <p>Here, you can find the user who contributes the most to the website.</p>
      <p>Each time your cocktail get validated you earn a 🥇 and you make other
        people parties even better.</p>

      <Divider horizontal>
        <Header as='h5'>
          <Icon name='bar chart' />
          Monthly results
        </Header>
      </Divider>

      <Table celled inverted selectable>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>User</Table.HeaderCell>
            <Table.HeaderCell>Points</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {users.map(user => {
            return (
              <Table.Row key={user.creator__username}>
                <Table.Cell>{user.creator__username}</Table.Cell>
                <Table.Cell>{user.count +" 🥇"}</Table.Cell>
              </Table.Row>
            )
          })}

        </Table.Body>
      </Table>
    </div>
  )
}
