import { Link } from 'react-router-dom'
import React from 'react'
import { assets } from '../../assets/assets'

const AdminNavbar = () => {
  return (
    <div>
        <Link to="/">
        <img src={assets.logo} alt='logo'/>
        </Link>
    </div>
  )
}
 
export default AdminNavbar