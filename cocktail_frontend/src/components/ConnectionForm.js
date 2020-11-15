import React, {useState} from 'react'

import { Button, Form, Message, Divider, Segment, Accordion } from 'semantic-ui-react'

export const ConnectionForm = ({setUsername, setIsStaff, setTab}) => {

    const [success, setSuccess] = useState(false)
    const [failure, setFailure] = useState(false)

    const [login, setLogin] = useState('')
    const [mail, setMail] = useState('')
    const [password, setPassword] = useState('')
    const [password2, setPassword2] = useState('')

    const [isLoggingSelected, setIsLoggingSelected] = useState(true)

    const clearFormFields = () => {
        setLogin('')
        setPassword('')
    }

    const loginRequest = async() => {
        let login_infos = {
            'login': login,
            'password': password,
        }

        const response = await fetch('user/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(login_infos)
        })

        let responseContent = await response.json()
        resetRequestStatus()
        clearFormFields()

        if (response.ok) {
            setUsername(responseContent.user.login)
            setIsStaff(responseContent.user.is_staff)
            setTab('Brew')
        }else{
            setUsername('')
        }
      }

    const registerRequest = async() => {
        let sign_up_infos = {
            'login': login,
            'mail': mail,
            'password': password,
            'password_confirm': password2,
        }

        const response = await fetch('user/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sign_up_infos)
        })
        resetRequestStatus()

        if (response.ok) {
            setSuccess(true)
            clearFormFields()
            swapIsLogginSelected()
        }else{
            setFailure(true)
        }
    }
    const resetRequestStatus = () => {
        setSuccess(false)
        setFailure(false)
    }

    const computeActiveIndex = () => {
        if (isLoggingSelected) return 0
        return 1
    }

    const LoginForm = (
        <Form>
            <Message
                success
                icon='cocktail'
                header='Success ✔️'
                content={'Your account have been created. You can log right now !'}
                visible={success}
            />
            <Form.Input
                autoFocus
                id='username'
                name='_username'

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
                id='password'
                name='_password'

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
            <Divider hidden/>
            <Button content='Sign up' icon='signup' size='big' onClick={() => {setIsLoggingSelected(false)}}/>
        </Form>
    )

    const RegisterForm = (
        <Form>
            <Message
                error
                icon='times'
                header='Error'
                content={'Not logged'}
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
                icon='mail outline'
                iconPosition='left'
                label='Mail'
                placeholder='bernard123@gmail.com'
                value={mail}
                onChange={(e) => {
                    setMail(e.target.value)
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
            <Form.Input
                icon='lock'
                iconPosition='left'
                label='Confirm password'
                type='password'
                placeholder='*****'
                value={password2}
                onChange={(e) => {
                    setPassword2(e.target.value)
                    resetRequestStatus()
                }}
            />

            <Button content='Sign up' icon='signup' primary onClick={registerRequest}/>
        </Form>
    )

    const rootPanels = [
        { key: 'Login', title: 'Login', content: { content: LoginForm } },
        { key: 'Register', title: 'Register', content: { content: RegisterForm }, icon: 'signup' },
      ]

    const swapIsLogginSelected = () => setIsLoggingSelected(!isLoggingSelected)

    return (
        <Segment placeholder>
             <Accordion
                activeIndex={computeActiveIndex()}
                panels={rootPanels}
                styled
                onTitleClick={swapIsLogginSelected}
            />
        </Segment>
  )
}