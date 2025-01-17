'use client'
import React from 'react';
import useAuth from '@/utils/useAuth';

const Page: React.FC = () => {

  const user = useAuth();

  if (!user) {
    return null;
  }
  
  return (
    <div>
      <h1>Welcome to My Dev Tools</h1>
      <p>This is the main page of the application.</p>
    </div>
  );
};

export default Page;