import React from 'react'
import './register.css'

const Login = () => {
  return (
    <section className='login-page'>
      <div className="login-container">
        <h2>Login</h2>
        <form className='login-form'>
          <input type="email" placeholder="Email" required />
          <input type="password" placeholder="Password" required />
          <button type="submit">Login</button>
        </form>
      </div>
    </section>
  )
}

export default Login