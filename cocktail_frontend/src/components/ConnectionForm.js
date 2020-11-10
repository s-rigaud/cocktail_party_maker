import React, {useState} from 'react'

import { Button, Form, Message, Grid, Divider, Segment } from 'semantic-ui-react'

export const ConnectionForm = ({setUsername, setIsStaff, setTab}) => {

    const [success, setSuccess] = useState(false)
    const [failure, setFailure] = useState(false)
    const [login, setLogin] = useState("")
    const [password, setPassword] = useState("")

    const clearFormFields = () => {
        setLogin("")
        setPassword("")
    }

    const loginRequest = async() => {
        let login_infos = {
            "login": login,
            "password": password,
        }

        const response = await fetch("user/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(login_infos)
        })

        let responseContent = await response.json()

        resetRequestStatus()
        clearFormFields()
        console.log(responseContent)
        if (response.ok) {
            setUsername(responseContent.user.login)
            setIsStaff(responseContent.user.is_staff)
            setTab("Brew")
        }else{
            setUsername("")
        }
      }

    const registerRequest = async() => {
        let login_infos = {
            "login": login,
            "password": password,
        }

        const response = await fetch("user/register", {
            method: "POST",
            headers: {
            "Content-Type": "application/json"
            },
            body: JSON.stringify(login_infos)
        })
        resetRequestStatus()
        if (response.ok) {
            setSuccess(true)
            clearFormFields()
        }else{
            setFailure(true)
        }
    }
    const resetRequestStatus = () => {
        setSuccess(false)
        setFailure(false)
    }

    return (
        <Segment placeholder>
            <Grid columns={2} relaxed='very' stackable>
                <Grid.Column>
                    <Form>
                        <Form.Input
                            icon='user'
                            iconPosition='left'
                            label='Username'
                            placeholder='Username'
                            value={login}
                            onChange={(e) => {
                                setLogin(e.target.value)
                                resetRequestStatus()
                            }}
                        />
                        <Form.Input
                            icon='lock'
                            iconPosition='left'
                            label='Password'
                            type='password'
                            placeholder='*****'
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value)
                                resetRequestStatus()
                            }}
                        />

                        <Button content='Login' primary onClick={loginRequest}/>
                    </Form>
                </Grid.Column>

                <Grid.Column verticalAlign='middle'>
                    <Form>
                        <Message
                            success
                            icon='cocktail'
                            header='Success ✔️'
                            content={'Logged'}
                            visible={success}
                        />
                        <Message
                            error
                            icon='times'
                            header='Error'
                            content={"Not logged"}
                            visible={failure}
                        />

                        <Form.Input
                            icon='user'
                            iconPosition='left'
                            label='Username'
                            placeholder='Username'
                            value={login}
                            onChange={(e) => {
                                setLogin(e.target.value)
                                resetRequestStatus()
                            }}
                        />
                        <Form.Input
                            icon='user'
                            iconPosition='left'
                            label='Mail'
                            placeholder='bernard123@gmail.com'
                            value={"mail"}
                        />
                        <Form.Input
                            icon='lock'
                            iconPosition='left'
                            label='Password'
                            type='password'
                            placeholder='*****'
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value)
                                resetRequestStatus()
                            }}
                        />
                        <Form.Input
                            icon='lock'
                            iconPosition='left'
                            label='Confirm password'
                            type='password'
                            placeholder='*****'
                        />

                        <Button content='Sign up' icon='signup' primary onClick={registerRequest}/>
                    </Form>
                </Grid.Column>
            </Grid>

            <Divider vertical>Or</Divider>
        </Segment>
  )
}