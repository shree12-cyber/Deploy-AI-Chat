import { SignIn } from '@clerk/clerk-react'
import React from 'react'
import './signInPage.css'

const SignInPage = () => {
  return (
    <div className='signInPage'>
      <SignIn signUpUrl='/sign-up' forceRedirectUrl="/dashboard" />
    </div>
  )
}

export default SignInPage