import React from 'react'
import { NavLink } from 'react-router-dom';
import './Navigation.css'

const Navigation = () => {
  return (
    <nav>
      <NavLink to="/" end>Home</NavLink>
      <NavLink to="/chat-page">Chat</NavLink>
      <NavLink to="/video-call">Video Call</NavLink>
      <NavLink to="/register">Register</NavLink>
      <NavLink to="/login">Login</NavLink>
      <NavLink to="/not-found">Not Found</NavLink>
    </nav>
  )
}

export default Navigation