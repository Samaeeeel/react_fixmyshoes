import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Carousel from '../components/Carousel';

function Home() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiBaseUrl = 'https://fixmyshoesadmin.runasp.net';
    fetch(`${apiBaseUrl}/api/productos`)
      .then(res => res.json())
      .then(data => {
        setProductos(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Header />
      <main>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem' }}>
            <div className="spinner"></div>
            <p style={{ marginTop: '1rem', fontSize: '1.2rem', color: '#a67843' }}>
              Cargando productos...
            </p>
          </div>
        ) : (
          <Carousel productos={productos} />
        )}
      </main>

      {/* Spinner style */}
      <style>{`
        .spinner {
          border: 6px solid #eee;
          border-top: 6px solid #a67843;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}

export default Home;
