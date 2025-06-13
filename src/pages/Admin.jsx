// admin.jsx
import React, { useState, useEffect } from 'react';
import '../styles/admin.css';

const apiBase = 'https://fixmyshoesadmin.runasp.net/api';

export default function AdminPanel() {
  const [section, setSection] = useState('usuarios');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [formData, setFormData] = useState({});
  const [editId, setEditId] = useState(null);
  const [data, setData] = useState({ usuarios: [], clientes: [], productos: [], facturas: [], detalles: [] });

  useEffect(() => {
    cargarDatos(section);
  }, [section]);

  const cargarDatos = async (seccion) => {
    try {
      const res = await fetch(`${apiBase}/${seccion === 'detalles' ? 'detallefacturas' : seccion}`);
      const result = await res.json();
      setData(prev => ({ ...prev, [seccion]: result }));
    } catch (error) {
      console.error(`Error cargando ${seccion}:`, error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const abrirModal = (titulo, item = {}, id = null) => {
    setModalTitle(titulo);
    setFormData(item);
    setEditId(id);
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setFormData({});
    setEditId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar?')) return;
    const endpoint = section === 'detalles' ? 'detallefacturas' : section;
    await fetch(`${apiBase}/${endpoint}/${id}`, { method: 'DELETE' });
    cargarDatos(section);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = section === 'detalles' ? 'detallefacturas' : section;
    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `${apiBase}/${endpoint}/${editId}` : `${apiBase}/${endpoint}`;
    const payload = { ...formData };
    if (section === 'productos') {
      payload.prodPrecio = parseFloat(payload.prodPrecio);
      payload.prodStock = parseInt(payload.prodStock);
    }
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      if (section === 'productos' && !editId && formData.prodImagen) {
        const productoCreado = await res.json();
        await fetch(`${apiBase}/imagen`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idProducto: productoCreado.idProducto, urlImagen: formData.prodImagen })
        });
      }
      cargarDatos(section);
      cerrarModal();
    } else {
      alert('Error en el proceso');
    }
  };

  const editarEstadoFactura = async (factura) => {
    const nuevoEstado = prompt('Nuevo estado:', factura.estado);
    if (!nuevoEstado || nuevoEstado === factura.estado) return;
    await fetch(`${apiBase}/facturas/${factura.idFactura}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: nuevoEstado })
    });
    cargarDatos('facturas');
  };

  const editarDetalleFactura = async (detalle) => {
    const nuevaCantidad = parseInt(prompt('Nueva cantidad:', detalle.cantidad));
    if (!nuevaCantidad || nuevaCantidad === detalle.cantidad) return;
    await fetch(`${apiBase}/detallefacturas/${detalle.idDetalleFactura}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cantidad: nuevaCantidad })
    });
    cargarDatos('detalles');
  };

  const renderSection = () => {
    const items = data[section] || [];
    const campos = {
      usuarios: ['idUsuario', 'nombre', 'correo', 'idRol'],
      clientes: ['idCliente', 'idUsuario', 'nombre', 'apellido', 'cedulaRuc', 'telefono', 'direccion', 'fechaNacimiento'],
      productos: ['idProducto', 'prodNombre', 'prodDescripcion', 'prodPrecio', 'prodStock', 'prodCategoria', 'prodProveedor', 'prodImagen'],
      facturas: ['idFactura', 'idCliente', 'fechaHora', 'metodoPago', 'direccion', 'subtotal', 'iva', 'total', 'estado'],
      detalles: ['idDetalleFactura', 'idFactura', 'idProducto', 'cantidad', 'precioVenta']
    };
    return (
      <>
        <button onClick={() => abrirModal(`Agregar ${section.slice(0, -1)}`)}>Agregar</button>
        <table>
          <thead>
            <tr>
              {campos[section].map(c => <th key={c}>{c}</th>)}
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i}>
                {campos[section].map(c => <td key={c}>{item[c]}</td>)}
                <td>
                  <button onClick={() => abrirModal(`Editar ${section.slice(0, -1)}`, item, item[campos[section][0]])}>Editar</button>
                  <button onClick={() => handleDelete(item[campos[section][0]])}>Eliminar</button>
                  {section === 'facturas' && <button onClick={() => editarEstadoFactura(item)}>Editar Estado</button>}
                  {section === 'detalles' && <button onClick={() => editarDetalleFactura(item)}>Editar Cantidad</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  };

  return (
    <div className="admin-panel">
      <header>
        <h1>Panel Administrativo - FixMyShoes</h1>
        <button onClick={() => { localStorage.removeItem('usuario'); window.location.href = '/'; }}>Cerrar Sesión</button>
      </header>
      <nav id="menuAdmin">
        {['usuarios', 'clientes', 'productos', 'facturas', 'detalles'].map(s => (
          <button key={s} className={section === s ? 'active' : ''} onClick={() => setSection(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </nav>
      <main>
        {renderSection()}
      </main>
      {modalVisible && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={cerrarModal}>&times;</span>
            <h2>{modalTitle}</h2>
            <form onSubmit={handleSubmit}>
              {Object.entries(formData).map(([key, val]) => (
                <label key={key}>{key}:
                  <input name={key} value={val || ''} onChange={handleInputChange} required />
                </label>
              ))}
              <button type="submit">Guardar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
