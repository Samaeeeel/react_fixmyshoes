import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Nosotros from './pages/Nosotros';
import Productos from './pages/Productos';
import Registro from './pages/Registro';
import Login from './pages/Login';
import Carrito from './pages/Carrito';
import Factura from './pages/Factura';
import Admin from "./pages/Admin"; 



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/factura" element={<Factura />} />
        <Route path="/admin" element={<Admin />} />
        {/* Aquí irán otras rutas en el futuro */}
      </Routes>
    </Router>
  );
}

export default App;
