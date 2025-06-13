import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Factura = () => {
  const [factura, setFactura] = useState(null);
  const [carrito, setCarrito] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();

  const idFactura = localStorage.getItem('idFactura');

  useEffect(() => {
    if (!idFactura) {
      alert('No se encontró la factura.');
      navigate('/');
      return;
    }

    const fetchFactura = async () => {
      try {
        const res = await fetch(`https://fixmyshoesadmin.runasp.net/api/facturas/${idFactura}`);
        if (!res.ok) throw new Error('Error al obtener la factura');
        const data = await res.json();
        setFactura(data);

        const carritoData = JSON.parse(localStorage.getItem('carrito')) || [];
        setCarrito(carritoData);

        const user = JSON.parse(localStorage.getItem('usuario'));
        setUsuario(user);
      } catch (error) {
        console.error(error);
        alert('Hubo un error al cargar la factura.');
      }
    };

    fetchFactura();
  }, [idFactura, navigate]);

  const pagarFactura = async () => {
    try {
      const res = await fetch('https://fixmyshoesadmin.runasp.net/api/compraYTransacciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idFactura })
      });

      const data = await res.json();
      if (data.Message === 'OK') {
        alert('Pago realizado con éxito.');
        localStorage.removeItem('carrito');
        localStorage.removeItem('idFactura');
        navigate('/');
      } else {
        alert('Hubo un error al procesar el pago.');
      }
    } catch (error) {
      console.error(error);
      alert('Hubo un error al intentar pagar la factura.');
    }
  };

  const volverAProductos = () => {
    localStorage.removeItem('carrito');
    localStorage.removeItem('idFactura');
    navigate('/');
  };

  return (
    <main className="factura-container">
      <h1>FACTURA DE COMPRA</h1>

      {factura ? (
        <>
          <div id="facturaContainer">
            <p><b>Factura #{factura.idFactura}</b></p>
            <p>Fecha: {factura.fechaHora}</p>
            <p>Dirección: {factura.direccion}</p>
            <p>Método de Pago: {factura.metodoPago}</p>
            <p>Subtotal: ${factura.subtotal.toFixed(2)}</p>
            <p>IVA: ${factura.iva.toFixed(2)}</p>
            <p>Total: ${factura.total.toFixed(2)}</p>
            {usuario && <p>Cliente: {usuario.nombre}</p>}
          </div>

          <h2>PRODUCTOS:</h2>
          <div id="productosFactura">
            {carrito.map((p, i) => (
              <div key={i}>
                <p>{p.nombre} - ${p.precio.toFixed(2)} x {p.cantidad}</p>
              </div>
            ))}
          </div>

          <div className="botones-footer">
            <button id="pagarBtn" className="btn-comprar" onClick={pagarFactura}>Pagar Factura</button>
            <button id="regresarBtn" className="btn-seguir-comprando" onClick={volverAProductos}>Volver a productos</button>
          </div>
        </>
      ) : (
        <p>Cargando factura...</p>
      )}
    </main>
  );
};

export default Factura;
