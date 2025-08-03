import React from 'react'
import { Link } from 'react-router-dom'
import './Navigation.css'

const Navigation = () => {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/chat-page">Chat</Link>
      <Link to="/not-found">Not Found</Link>
      <Link to="/register">Register</Link>
      <Link to="/login">Login</Link>
      <Link to="/video-call" >Video Call</Link>
    </nav>
  )
}

export default Navigation