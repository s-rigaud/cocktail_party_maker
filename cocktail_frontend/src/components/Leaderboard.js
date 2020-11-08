import React, {useState, useEffect} from "react"

import { Table } from 'semantic-ui-react'

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
      <Table celled inverted selectable>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>Points</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {users.map(user => {
            return (
              <Table.Row key={user.creator__username}>
                <Table.Cell>{user.creator__username}</Table.Cell>
                <Table.Cell>{user.count}</Table.Cell>
              </Table.Row>
            )
          })}

        </Table.Body>
      </Table>
    </div>
  )
}
