import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Carousel from '../components/Carousel';

function Home() {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    const apiBaseUrl = 'https://fixmyshoesadmin.runasp.net';
    fetch(`${apiBaseUrl}/api/productos`)
      .then(res => res.json())
      .then(data => setProductos(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <>
      <Header />
      <main>
        {productos.length > 0 ? (
          <Carousel productos={productos} />
        ) : (
          <p style={{ textAlign: 'center', padding: '2rem' }}>Cargando productos...</p>
        )}
      </main>
    </>
  );
}

export default Home;
