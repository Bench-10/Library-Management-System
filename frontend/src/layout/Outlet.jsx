import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Banner from '../components/Banner'

function Layout({ logout, userRole }) {
  return (
    <div className="flex min-h-screen w-full">
      <Navbar logout={logout} userRole={userRole} />

      <div className="flex-1 ml-60">
        <Banner />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>  
  )
}

export default Layout