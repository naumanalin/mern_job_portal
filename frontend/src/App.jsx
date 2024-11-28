import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from './pages/Navbar';
import Footer from './pages/Footer';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import PostApplication from './pages/PostApplication'
import {ToastContainer} from 'react-toastify'


function App() {

  return (
    <>
    <Router>
      <Navbar/>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              path="/post/application/:jobId"
              element={<PostApplication />}
            />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
      <Footer/>
      <ToastContainer position="top-right" theme="dark" />
    </Router>
    </>
  )
}

export default App
