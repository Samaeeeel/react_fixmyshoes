import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/style.css';

function Login() {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('https://fixmyshoesadmin.runasp.net/api/usuarios');
      const usuarios = await res.json();
      const usuario = usuarios.find(u => u.correo === correo && u.password === password);

      if (usuario) {
        localStorage.setItem('usuario', JSON.stringify(usuario));
        alert('Inicio de sesión exitoso');
        if (usuario.rolNombre === 'Administrador') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        alert('Correo o contraseña incorrectos');
      }
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      alert('Error al conectar con el servidor');
    }
  };

  return (
    <main className="auth-container">
      <section className="login-form">
        <h1>Iniciar Sesión</h1>
        <form onSubmit={handleLogin}>
          <label htmlFor="correo">Correo electrónico</label>
          <input
            type="email"
            id="correo"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="tu@email.com"
            required
          />

          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            required
          />

          <button type="submit">Entrar</button>
        </form>
        <p className="redirect-text">
          ¿No tienes cuenta? <a href="/registro">Regístrate aquí</a>
        </p>
      </section>
    </main>
  );
}

export default Login;
