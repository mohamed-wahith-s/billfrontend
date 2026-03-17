import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Billing from './pages/Billing'
import ProductList from './pages/ProductList'
import Login from './pages/Login'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/products" element={<ProductList />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
