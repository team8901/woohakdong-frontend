import React from 'react';
import { SignUpCardClient } from './_clientBoundary/SignUpCardClient';

const SignUpPage = () => {
  return (
    <div className="bg-background md:p-18 flex min-h-screen w-screen items-center justify-center px-5 py-12">
      <div className="mx-auto flex w-full max-w-lg flex-col">
        <SignUpCardClient />
      </div>
    </div>
  );
};

export default SignUpPage;
