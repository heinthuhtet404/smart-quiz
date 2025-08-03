
import './App.css'
import ChatPage from './pages/Chat/ChatPage.jsx'
import Register from './pages/Auth/Register.jsx'
import Home from './pages/Home/Home.jsx'
import NotFound from './pages/NotFound/NotFound.jsx'
import { Route, Routes } from 'react-router-dom'
import Navigation from './components/layouts/Navigation.jsx'
import Login from './pages/Auth/Login.jsx'
import VideoCall from './pages/VideoCall/VideoCall.jsx'

function App() {

  return (
    <>
      <Navigation />
      <Routes className='app-container'>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/chat-page" element={<ChatPage />} />
        <Route path='/register' element={<Register />} />
        <Route path='/login' element={<Login />} />
        <Route path='/video-call' element={<VideoCall />} />
      </Routes>
    </>
  )
}

export default App
