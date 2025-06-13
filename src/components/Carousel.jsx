import React, { useState, useEffect, useCallback } from 'react';

const colores = ['#f5bfaf', '#dedfe1', '#9c4d2f', '#7eb63d', '#d7d3b5'];

const Carousel = ({ productos }) => {
  const [active, setActive] = useState(0);
  const [other1, setOther1] = useState(1);
  const [other2, setOther2] = useState(2);
  const [animacion, setAnimacion] = useState('next');

  // Avanzar al siguiente producto
  const avanzar = useCallback(() => {
    setAnimacion('next');
    setActive(prev => {
      const next = (prev + 1) % productos.length;
      const o1 = (next + 1) % productos.length;
      const o2 = (next + 2) % productos.length;
      setOther1(o1);
      setOther2(o2);
      return next;
    });
  }, [productos.length]);

  // Retroceder al producto anterior
  const retroceder = useCallback(() => {
    setAnimacion('prev');
    setActive(prev => {
      const next = (prev - 1 + productos.length) % productos.length;
      const o1 = (next + 1) % productos.length;
      const o2 = (next + 2) % productos.length;
      setOther1(o1);
      setOther2(o2);
      return next;
    });
  }, [productos.length]);

  // Autoplay cada 5 segundos
  useEffect(() => {
    if (productos.length === 0) return;
    const interval = setInterval(avanzar, 5000);
    return () => clearInterval(interval);
  }, [productos, avanzar]);

  // Clases dinámicas
  const getClase = (index) => {
    if (index === active) return 'item active';
    if (index === other1) return 'item other_1';
    if (index === other2) return 'item other_2';
    return 'item';
  };

  // Lógica de carrito
  const agregarAlCarrito = (producto) => {
    const cantidad = parseInt(prompt(`¿Cuántas unidades de "${producto.prodNombre}" deseas agregar?`, "1"));

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
        precio: producto.prodPrecio,
        imagen: producto.prodImg?.[0] || '/images/default.png',
        cantidad
      });
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));
    alert(`${producto.prodNombre} agregado (${cantidad}) al carrito`);
  };

  return (
    <section className={`carousel ${animacion}`}>
      <div className="list">
        {productos.map((prod, index) => {
          const clase = getClase(index);
          const colorFondo = colores[index % colores.length];
          const imagen = prod.prodImg?.[0] || '/images/default.png';

          return (
            <article key={prod.idProducto} className={clase}>
              <div className="main-content" style={{ backgroundColor: colorFondo }}>
                <div className="content">
                  <h2>{prod.prodNombre}</h2>
                  <p className="price">$ {Number(prod.prodPrecio).toFixed(2)}</p>
                  <p className="description">{prod.prodDescripcion}</p>
                  <button className="addToCard" onClick={() => agregarAlCarrito(prod)}>
                    Agregar al carrito
                  </button>
                </div>
              </div>
              <figure className="image">
                <img src={imagen} alt={prod.prodNombre} />
                <figcaption>{prod.prodNombre}</figcaption>
              </figure>
            </article>
          );
        })}
      </div>

      <div className="arrows">
        <button onClick={retroceder}>&lt;</button>
        <button onClick={avanzar}>&gt;</button>
      </div>
    </section>
  );
};

export default Carousel;
