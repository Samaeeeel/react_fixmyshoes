import React, { useEffect } from 'react';
import Header from '../components/Header';
import videoEmpresa from '../assets/Cosedora de Calzado.mp4';


function Nosotros() {
  useEffect(() => {
    const menuToggle = document.getElementById('menuToggle');
    const authButtons = document.getElementById('authButtons');
    const logoutButton = document.getElementById('logoutButton');
    const bienvenida = document.getElementById('bienvenida');
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    if (menuToggle && authButtons) {
      menuToggle.onclick = () => {
        authButtons.classList.toggle('show');
        logoutButton?.classList.toggle('show');
      };
    }

    if (usuario) {
      if (bienvenida) bienvenida.textContent = `¡Bienvenido, ${usuario.nombre}!`;
      if (authButtons) authButtons.style.display = 'none';
      if (logoutButton) logoutButton.style.display = 'flex';
    } else {
      if (authButtons) authButtons.style.display = 'flex';
      if (logoutButton) logoutButton.style.display = 'none';
    }
  }, []);

  return (
    <>
      <Header />
      <main>
        <section className="about-us" style={{ padding: '2rem', maxWidth: '900px', margin: 'auto' }}>
          <h1>FIX MY SHOES</h1>
          <h2>Sobre Nosotros</h2>
          <p>
            Somos una empresa dedicada a la reparación y restauración de calzado y accesorios.
            Contamos con años de experiencia y un equipo profesional que garantiza calidad y confianza en cada servicio.
          </p>
          <p>
            Nuestro compromiso es brindar soluciones duraderas y un excelente servicio al cliente, usando materiales
            de primera calidad y técnicas tradicionales.
          </p>
          <p>
            Visítanos y conoce por qué somos la mejor opción para cuidar y restaurar tus zapatos y accesorios favoritos.
          </p>
        </section>

        <section className="video-section container">
          <h2>Conoce Nuestra Empresa</h2>
          <div className="video-wrapper">
            <video controls>
              <source src={videoEmpresa} type="video/mp4" />
              Tu navegador no soporta el video.
            </video>
          </div>
        </section>
      </main>
    </>
  );
}

export default Nosotros;
