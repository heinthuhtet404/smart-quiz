import './Register.css';

function Register() {
  return (
    <section className='register-page'>
      <div className="register-container">
        <h2>Register</h2>
        <form className='register-form'>
          <input type="text" placeholder="Name" required />
          <input type="email" placeholder="Email" required />
          <input type="password" placeholder="Password" required />
          <button type="submit">Register</button>
        </form>
      </div>
    </section>
  );
}

export default Register;
