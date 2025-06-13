import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/FIXMYSHOES.png';

const Header = () => {
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
    }
  }, []);

  const cerrarSesion = () => {
    localStorage.removeItem('usuario');
    alert('Sesión cerrada correctamente');
    setUsuario(null);
    navigate('/');
  };

  return (
    <header>
      <figure className="logo">
        <img src={logo} alt="FIXMYSHOES" />
      </figure>
      <nav className="main-nav">
        {usuario && (
          <div id="bienvenida" className="bienvenida-usuario">
            ¡Bienvenido, {usuario.nombre}!
          </div>
        )}
        <ul>
          <li><Link to="/">Inicio</Link></li>
          <li><Link to="/productos">Productos</Link></li>
          <li><Link to="/nosotros">Nosotros</Link></li>
          <button id="menuToggle" className="menu-toggle" aria-label="Menú">&#9776;</button>
        </ul>
      </nav>

      {!usuario ? (
        <div className="auth-buttons" id="authButtons">
          <Link to="/login" className="btn-auth">Iniciar Sesión</Link>
          <Link to="/registro" className="btn-auth">Registrarse</Link>
        </div>
      ) : (
        <div className="logout-button" id="logoutButton">
          <Link to="/carrito" className="btn-auth">🛒 Ver Carrito</Link>
          <button className="btn-auth" onClick={cerrarSesion}>Cerrar Sesión</button>
        </div>
      )}
    </header>
  );
};

export default Header;
