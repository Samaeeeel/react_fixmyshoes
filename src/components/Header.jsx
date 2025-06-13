import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/FIXMYSHOES.png';

const Header = () => {
  const [usuario, setUsuario] = useState(null);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [esMovil, setEsMovil] = useState(window.innerWidth < 600);
  const navigate = useNavigate();

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
    }

    const handleResize = () => setEsMovil(window.innerWidth < 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const cerrarSesion = () => {
    localStorage.removeItem('usuario');
    setUsuario(null);
    navigate('/');
  };

  const toggleMenu = () => setMenuAbierto(!menuAbierto);

  return (
    <header className="header-grid">
      {/* IZQUIERDA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <figure className="logo">
          <img src={logo} alt="FIXMYSHOES" />
        </figure>
        {!esMovil && usuario && (
          <div className="bienvenida-usuario">¡Bienvenido, {usuario.nombre}!</div>
        )}
      </div>

      {/* CENTRO */}
      {!esMovil && (
        <nav className="main-nav center-nav">
          <ul className="nav-links">
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/productos">Productos</Link></li>
            <li><Link to="/nosotros">Nosotros</Link></li>
          </ul>
        </nav>
      )}

      {/* DERECHA */}
      {!esMovil ? (
        usuario ? (
          <div className="logout-button right-zone">
            <Link to="/carrito" className="btn-auth">🛒 Ver Carrito</Link>
            <button className="btn-auth" onClick={cerrarSesion}>Cerrar Sesión</button>
          </div>
        ) : (
          <div className="auth-buttons right-zone">
            <Link to="/login" className="btn-auth">Iniciar Sesión</Link>
            <Link to="/registro" className="btn-auth">Registrarse</Link>
          </div>
        )
      ) : (
        <div className="right-zone">
          {usuario && (
            <div className="bienvenida-usuario">¡Bienvenido, {usuario.nombre}!</div>
          )}
          <button className="menu-toggle" onClick={toggleMenu} aria-label="Menú">&#9776;</button>
        </div>
      )}

      {/* MENÚ HAMBURGUESA */}
      {esMovil && menuAbierto && (
        <div className="hamburguesa-menu">
          <ul>
            <li><Link to="/" onClick={toggleMenu}>Inicio</Link></li>
            <li><Link to="/productos" onClick={toggleMenu}>Productos</Link></li>
            <li><Link to="/nosotros" onClick={toggleMenu}>Nosotros</Link></li>
            {usuario ? (
              <>
                <li><Link to="/carrito" onClick={toggleMenu}>🛒 Ver Carrito</Link></li>
                <li><button className="btn-auth" onClick={cerrarSesion}>Cerrar Sesión</button></li>
              </>
            ) : (
              <>
                <li><Link to="/login" onClick={toggleMenu}>Iniciar Sesión</Link></li>
                <li><Link to="/registro" onClick={toggleMenu}>Registrarse</Link></li>
              </>
            )}
          </ul>
        </div>
      )}
    </header>
  );
};

export default Header;
