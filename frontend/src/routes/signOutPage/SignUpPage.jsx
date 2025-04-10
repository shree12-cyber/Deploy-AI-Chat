import { SignUp } from "@clerk/clerk-react";
import React from "react";
import './signUpPage.css'

const SignUpPage = () => {
  return (
    <div className="signUpPage">
      <SignUp signInUrl="/sign-in" />
    </div>
  );
};

export default SignUpPage;
