import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Carrito = () => {
    const [carrito, setCarrito] = useState([]);
    const [total, setTotal] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const datos = JSON.parse(localStorage.getItem('carrito')) || [];
        setCarrito(datos);
    }, []);

    useEffect(() => {
        const nuevoTotal = carrito.reduce((sum, p) => sum + p.precio * p.cantidad, 0);
        setTotal(nuevoTotal);
    }, [carrito]);

    const cambiarCantidad = (index, delta) => {
        const actualizado = [...carrito];
        actualizado[index].cantidad += delta;
        if (actualizado[index].cantidad <= 0) actualizado.splice(index, 1);
        setCarrito(actualizado);
        localStorage.setItem('carrito', JSON.stringify(actualizado));
    };

    const eliminarProducto = (index) => {
        const actualizado = [...carrito];
        actualizado.splice(index, 1);
        setCarrito(actualizado);
        localStorage.setItem('carrito', JSON.stringify(actualizado));
    };

    const confirmarCompra = async () => {
        if (carrito.length === 0) {
            alert('El carrito está vacío.');
            return;
        }

        const usuario = JSON.parse(localStorage.getItem('usuario'));
        if (!usuario) {
            alert('Debes iniciar sesión para realizar una compra.');
            navigate('/login');
            return;
        }

        try {
            const resCliente = await fetch(`https://fixmyshoesadmin.runasp.net/api/clientes`);
            const clientes = await resCliente.json();
            const cliente = clientes.find(c => c.idUsuario === usuario.idUsuario);

            if (!cliente) {
                alert('No se encontró cliente asociado al usuario.');
                return;
            }

            const compraData = {
                carrito: {
                    productos: carrito.map(p => ({
                        idProducto: parseInt(p.idProducto || p.id),
                        cantidad: parseInt(p.cantidad)
                    }))
                },
                direccion: cliente.direccion || "Dirección cliente",
                metodoPago: "Transaccion",
                cliente: {
                    cliCedula: cliente.cedulaRuc,
                    cliNombre: cliente.nombre,
                    cliApellido: cliente.apellido,
                    cliTelefono: cliente.telefono
                }
            };

            const resCompra = await fetch('https://fixmyshoes.runasp.net/api/integracion/compra', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(compraData)
            });

            if (!resCompra.ok) throw new Error('Error al crear la compra');
            const idFactura = await resCompra.json();

            if (!idFactura) throw new Error('Factura no válida');
            localStorage.setItem('idFactura', idFactura);

            alert('Factura realizada con éxito!');
            localStorage.setItem('carrito', JSON.stringify(carrito));
            navigate('/factura');

        } catch (error) {
            console.error(error);
            alert('Hubo un error al procesar la compra.');
        }
    };

    return (
        <main>
            <h1 className="titulo-carrito">🛒 Carrito de Compras</h1>

            <div className="carrito-container">
                {carrito.length === 0 ? (
                    <p style={{ textAlign: 'center' }}>Tu carrito está vacío</p>
                ) : (
                    carrito.map((p, i) => (
                        <div key={i} style={{ margin: '1rem', padding: '1rem', border: '1px solid #ccc' }}>
                            <img src={p.imagen} alt={p.nombre} style={{ width: '80px' }} />
                            <h3>{p.nombre}</h3>
                            <p>Precio unitario: ${p.precio.toFixed(2)}</p>
                            <p>
                                Cantidad:
                                <button onClick={() => cambiarCantidad(i, -1)}>-</button>
                                {` ${p.cantidad} `}
                                <button onClick={() => cambiarCantidad(i, 1)}>+</button>
                            </p>
                            <p>Subtotal: ${(p.precio * p.cantidad).toFixed(2)}</p>
                            <button onClick={() => eliminarProducto(i)}>🗑️ Eliminar</button>
                        </div>
                    ))
                )}
            </div>

            {carrito.length > 0 && (
                <h2 className="total">Total: ${total.toFixed(2)}</h2>
            )}

            <div className="botones-footer">
                <button className="btn-seguir-comprando" onClick={() => navigate('/')}>← Seguir comprando</button>
                {carrito.length > 0 && (
                    <button id="btnComprar" className="btn-comprar" onClick={confirmarCompra}>Generar Factura</button>
                )}
            </div>
        </main>
    );

};

export default Carrito;
