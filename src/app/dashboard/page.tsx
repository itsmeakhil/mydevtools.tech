'use client'
import React from 'react';
// import { AppSidebar } from './layout/app-sidebar';
import useAuth from "@/utils/useAuth";

const DashboardPage: React.FC = () => {

  const user = useAuth();

  if (!user) {
    return null;
  }

  return (
    
    <div className="flex justify-center items-center h-screen ">
      <h1 style={{ fontSize: '3rem', fontWeight: 'bold' }}>Dashboard</h1>
      <p style={{ fontSize: '1.5rem' }} className='ml-10'>We are working on things!</p>
    </div>
  );
};

export default DashboardPage;