import React, {useState, useEffect} from 'react'

import { Table, Card, Button, Icon, Pagination, Label, Grid, List, Segment } from 'semantic-ui-react'

export const ProfilePage = ({username, setUsername, setTab, notifications, setNotifications}) => {

  const [points, setPoints] = useState(0)
  const [cocktails, setCocktails] = useState([])
  const [activePage, setActivePage] = useState(1)
  const [pages, setPages] = useState(1)
  const [notificationMessages, setNotificationMessages] = useState([])

  useEffect(() => {
    requestGetProfileInfo()
    requestGetCocktailsPaginate(1)
    setNotificationMessages(notifications)
    setNotifications([])
  }, [])

  const requestGetProfileInfo = async() => {
    const response = await fetch('user/profile/info')
    let responseContent = await response.json()
    setPoints(responseContent.user.points)
  }

  const requestGetCocktailsPaginate = async(page) => {
    const response = await fetch('user/profile/cocktails?page=' + page)
    let responseContent = await response.json()
    setCocktails(responseContent.cocktails)
    setPages(responseContent.pages)
  }

  const requestLogout = async() => {
    setPoints(0)
    setCocktails([])
    setUsername('')
    setTab('Brew')
    await fetch('user/logout')
  }

  const getColorLabel = (state) => {
    let color = "grey"
    if (state === "Refused") color = "red"
    if (state === "Accepted") color = "green"
    if (state === "Pending") color = "orange"
    return color
  }

  const getIcon = (state) => {
    let color = "times"
    if (state === "Refused") color = "times"
    if (state === "Accepted") color = "check"
    if (state === "Pending") color = "bar"
    return color
  }

  const NotificationList = () =>{
    if (notificationMessages.length){
      return (
        <Segment>
          <List divided inverted relaxed>
            {notificationMessages.map(notification => {
              return (
                <List.Item>
                  <List.Content>
                    {notification}
                  </List.Content>
                </List.Item>
              )
            })}
          </List>
        </Segment>
      )
    }
    return <div></div>
  }

  const PaginationArrows = () => {
    if (pages.length > 10){
      return (
        <Grid columns={6} centered>
          <Grid.Row>
            <Grid.Column>
              <Pagination
                activePage={activePage}
                onPageChange={(e, {activePage}) => {setActivePage(activePage); requestGetCocktailsPaginate(activePage)}}
                totalPages={pages}
                firstItem={null}
                lastItem={null}
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      )
    }
    return <div></div>
  }

  return (
    <div>
      <Card
        centered
        image='https://images.ladbible.com/resize?type=jpeg&url=http://beta.ems.ladbiblegroup.com/s3/content/1bb3cdf35dc6d4a97a9891fef90de232.png&quality=70&width=720&aspectratio=16:9&extend=white'
        header={username}
        extra={points + ' 🥇'}
      />
      <Button
          onClick={requestLogout}
          color='red'
      >
          <Icon name='times' />
          Log out
      </Button>

      <NotificationList />

      <Table celled inverted selectable>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>Submission date</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {cocktails.map(cocktail => {
            return (
              <Table.Row key={cocktails.indexOf(cocktail)}>
                <Table.Cell>{cocktail.name}</Table.Cell>
                <Table.Cell>
                  <Label color={getColorLabel(cocktail.state)} ribbon>
                    <Icon name={getIcon(cocktail.state)} />
                    {cocktail.state}
                  </Label>{cocktail.creation_date}
                </Table.Cell>
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table>

      <PaginationArrows />

    </div>
  )
}
