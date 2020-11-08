import React, {useState} from 'react'

import { Button, Form, Message } from 'semantic-ui-react'

export const ConnectionForm = ({setUsername}) => {

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
        if (response.ok) {
            setUsername(responseContent.user.login)
            setSuccess(true)
        }else{
            setFailure(true)
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
        console.log(response)
        let responseContent = await response.json()
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
        <Form size="large">
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
                required
                fluid
                label='Login'
                placeholder='Bernard123'
                value={login}
                onChange={(e) => {
                    setLogin(e.target.value)
                    resetRequestStatus()
                }}
            />

            <Form.Input
                required
                fluid
                label='Password'
                placeholder='*****'
                value={password}
                onChange={(e) => {
                    setPassword(e.target.value)
                    resetRequestStatus()
                }}
            />

            <Button
                onClick={loginRequest}
            >
                Log In
            </Button>


            <Form.Group inline widths='equal'>
                <Form.Input
                    required
                    fluid
                    label='Mail'
                    placeholder='bernard123@gmail.com'
                    value={"mail"}
                    //onChange={e => setIngr2(e.target.value)}
                />
                <Form.Input
                    required
                    fluid
                    label='Confirm password'
                    placeholder='25'
                    value={"Confirm Password"}
                    // onChange={e => setQuantity2(e.target.value)}
                />

            </Form.Group>

            <Button
                onClick={registerRequest}
            >
                Register
            </Button>
        </Form>
  )
}