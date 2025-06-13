import React, { useEffect, useState } from 'react';
import Header from '../components/Header';

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  const apiBaseUrl = 'https://fixmyshoesadmin.runasp.net';

  useEffect(() => {
    fetch(`${apiBaseUrl}/api/productos`)
      .then(res => res.json())
      .then(data => setProductos(data))
      .catch(err => console.error('Error cargando productos:', err));
  }, []);

  const abrirModal = (producto) => {
    setProductoSeleccionado(producto);
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setProductoSeleccionado(null);
  };

  const agregarAlCarrito = () => {
    const producto = productoSeleccionado;
    const cantidad = parseInt(prompt(`¿Cuántas unidades de "${producto.prodNombre}" deseas agregar al carrito?`, "1"));

    if (isNaN(cantidad) || cantidad <= 0) {
      alert("Cantidad inválida. No se agregó nada al carrito.");
      return;
    }

    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const index = carrito.findIndex(p => p.idProducto === producto.idProducto);

    if (index >= 0) {
      carrito[index].cantidad += cantidad;
    } else {
      carrito.push({
        idProducto: producto.idProducto,
        nombre: producto.prodNombre,
        precio: typeof producto.prodPrecio === 'number' ? producto.prodPrecio : 0,
        imagen: producto.prodImg?.[0] || '/images/default.png',
        cantidad
      });
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));
    alert(`${producto.prodNombre} agregado (${cantidad}) al carrito`);
    cerrarModal();
  };

  return (
    <>
      <Header />
      <main className="container" style={{ padding: '2rem', maxWidth: '1200px', margin: 'auto' }}>
        <h1>Productos Disponibles</h1>
        <section id="productosGrid" className="productos-grid">
          {productos.map((prod) => {
            const urlImagen = Array.isArray(prod.prodImg) && prod.prodImg.length > 0
              ? prod.prodImg[0]
              : '/images/default.png';

            return (
              <div key={prod.idProducto} className="producto-card">
                <img src={urlImagen} alt={prod.prodNombre} className="producto-imagen" />
                <h3 className="producto-nombre">{prod.prodNombre}</h3>
                <p className="producto-descripcion">{prod.prodDescripcion}</p>
                <p className="producto-precio">${Number(prod.prodPrecio).toFixed(2)}</p>
                <button className="btn-ver-detalles" onClick={() => abrirModal(prod)}>
                  Ver detalles
                </button>
              </div>
            );
          })}
        </section>

        {/* Modal */}
        {mostrarModal && productoSeleccionado && (
          <div className="modal" onClick={(e) => e.target.className === 'modal' && cerrarModal()}>
            <div className="modal-content">
              <span className="close" onClick={cerrarModal}>&times;</span>
              <img
                src={productoSeleccionado.prodImg?.[0] || '/images/default.png'}
                alt={productoSeleccionado.prodNombre}
              />
              <h2>{productoSeleccionado.prodNombre}</h2>
              <p>{productoSeleccionado.prodDescripcion}</p>
              <p className="producto-precio">Precio: ${Number(productoSeleccionado.prodPrecio).toFixed(2)}</p>
              <button onClick={agregarAlCarrito}>Agregar al carrito</button>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default Productos;
