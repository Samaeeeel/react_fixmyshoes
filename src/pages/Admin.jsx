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
  const [imagenes, setImagenes] = useState([]);
  const [facturaEditando, setFacturaEditando] = useState(null);
  const [nuevoEstado, setNuevoEstado] = useState('');

  useEffect(() => {
    cargarDatos(section);
    if (section === 'productos') cargarImagenes();
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

  const cargarImagenes = async () => {
    try {
      const res = await fetch(`${apiBase}/imagenes`);
      const result = await res.json();
      setImagenes(result);
    } catch (error) {
      console.error('Error cargando imágenes:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const abrirModal = (titulo, item = {}, id = null) => {
    const camposPorSeccion = {
      usuarios: { nombre: '', correo: '', contrasena: '', idRol: '' },
      clientes: { idUsuario: '', nombre: '', apellido: '', cedulaRuc: '', telefono: '', direccion: '', fechaNacimiento: '' },
      productos: { prodNombre: '', prodDescripcion: '', prodPrecio: '', prodStock: '', prodCategoria: '', prodProveedor: 'FIXMYSHOES', prodImagen: '' }
    };
    const plantilla = camposPorSeccion[section] || item;
    setModalTitle(titulo);
    setFormData(id ? item : plantilla);
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

  const validarFormulario = () => {
    if (section === 'usuarios') {
      if (!formData.contrasena || formData.contrasena.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres.');
        return false;
      }
    }
    if (section === 'clientes') {
      const telefonoValido = /^09\d{8}$/.test(formData.telefono);
      const cedulaRucValido = /^\d{10}(\d{3})?$/.test(formData.cedulaRuc);
      const fechaValida = new Date(formData.fechaNacimiento) <= new Date();
      if (!telefonoValido || !cedulaRucValido || !fechaValida) {
        alert('Datos de cliente inválidos. Verifique teléfono, cédula/RUC y fecha.');
        return false;
      }
    }
    if (section === 'productos') {
      if (formData.prodPrecio < 1 || formData.prodStock < 1) {
        alert('El precio y stock no pueden ser menores a 0.');
        return false;
      }
    }
    if (formData.correo && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.correo)) {
      alert('Correo electrónico inválido.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    const endpoint = section === 'detalles' ? 'detallefacturas' : section;
    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `${apiBase}/${endpoint}/${editId}` : `${apiBase}/${endpoint}`;
    const payload = { ...formData };

    if (section === 'productos') {
      payload.prodPrecio = parseFloat(payload.prodPrecio);
      payload.prodStock = parseInt(payload.prodStock);
      payload.prodProveedor = 'FIXMYSHOES';
    }

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const nuevoProducto = !editId && section === 'productos' ? await res.json() : null;

      if (section === 'productos' && !editId && formData.prodImagen) {
        const extensionMatch = formData.prodImagen.match(/\.(jpg|jpeg|png|webp|gif|bmp)(\?|$)/i);
        const imgTipo = extensionMatch ? extensionMatch[1].toLowerCase() : 'jpg';

        await fetch(`${apiBase}/imagenes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idProducto: nuevoProducto.idProducto,
            imgUrl: formData.prodImagen,
            imgTipo
          })
        });
      }

      cargarDatos(section);
      if (section === 'productos') cargarImagenes();
      cerrarModal();
    } else {
      alert('Error en el proceso');
    }
  };

  const editarEstadoFactura = (factura) => {
    setFacturaEditando(factura);
    setNuevoEstado(factura.estado);
  };

  const guardarNuevoEstado = async () => {
    if (!nuevoEstado || !facturaEditando) return;

    const facturaActualizada = {
      ...facturaEditando,
      estado: nuevoEstado
    };

    const res = await fetch(`${apiBase}/facturas/${facturaEditando.idFactura}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(facturaActualizada)
    });

    if (res.ok) {
      cargarDatos('facturas');
      setFacturaEditando(null);
    } else {
      alert('Error al actualizar el estado.');
    }
  };

  const editarDetalleFactura = async (detalle) => {
    const nuevaCantidad = parseInt(prompt('Nueva cantidad:', detalle.cantidad));
    if (!nuevaCantidad || nuevaCantidad === detalle.cantidad) return;
    await fetch(`${apiBase}/detallefacturas/${detalle.idDetalleFactura}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...detalle, cantidad: nuevaCantidad })
    });
    cargarDatos('detalles');
  };

  const renderSection = () => {
    const items = data[section] || [];
    const campos = {
      usuarios: ['idUsuario', 'nombre', 'correo', 'contrasena', 'idRol'],
      clientes: ['idCliente', 'idUsuario', 'nombre', 'apellido', 'cedulaRuc', 'telefono', 'direccion', 'fechaNacimiento'],
      productos: ['idProducto', 'prodNombre', 'prodDescripcion', 'prodPrecio', 'prodStock', 'prodCategoria', 'prodProveedor', 'prodImagen'],
      facturas: ['idFactura', 'idCliente', 'fechaHora', 'metodoPago', 'direccion', 'subtotal', 'iva', 'total', 'estado'],
      detalles: ['idDetalleFactura', 'idFactura', 'idProducto', 'cantidad', 'precioVenta']
    };
    return (
      <>
        {(section !== 'facturas' && section !== 'detalles') && (
          <button className="btn-agregar" onClick={() => abrirModal(`Agregar ${section.slice(0, -1)}`)}>➕ Agregar</button>
        )}
        <div className="tabla-scroll">
          <table>
            <thead>
              <tr>
                {campos[section].map(c => <th key={c}>{c.toUpperCase()}</th>)}
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i}>
                  {campos[section].map(c => (
                    <td key={c}>
                      {c === 'prodImagen' && section === 'productos' ? (
                        <img src={(imagenes.find(img => img.idProducto === item.idProducto) || {}).imgUrl || ''} alt="img" style={{ width: '60px' }} />
                      ) : item[c]}
                    </td>
                  ))}
                  <td className="acciones">
                    {(section !== 'facturas' && section !== 'detalles') && (
                      <>
                        <button className="btn-editar" onClick={() => abrirModal(`Editar ${section.slice(0, -1)}`, item, item[campos[section][0]])}>Editar</button>
                        <button className="btn-eliminar" onClick={() => handleDelete(item[campos[section][0]])}>Eliminar</button>
                      </>
                    )}
                    {section === 'facturas' && (
                      facturaEditando?.idFactura === item.idFactura ? (
                        <div>
                          <select value={nuevoEstado} onChange={(e) => setNuevoEstado(e.target.value)}>
                            <option value="Creado">Creado</option>
                            <option value="Pagado">Pagado</option>
                            <option value="Cancelado">Cancelado</option>
                          </select>
                          <button className="btn-submit" onClick={guardarNuevoEstado}>Guardar</button>
                        </div>
                      ) : (
                        <button className="btn-estado" onClick={() => editarEstadoFactura(item)}>Editar Estado</button>
                      )
                    )}
                    {section === 'detalles' && <button className="btn-estado" onClick={() => editarDetalleFactura(item)}>Editar Cantidad</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  return (
    <div className="admin-panel">
      <header>
        <h1>Panel Administrativo - FixMyShoes</h1>
        <button className="cerrar-sesion" onClick={() => { localStorage.removeItem('usuario'); window.location.href = '/'; }}>Cerrar Sesión</button>
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
                <label key={key}>{key.toUpperCase()}:
                  {key === 'idRol' ? (
                    <select name={key} value={val} onChange={handleInputChange} required>
                      <option value="">Seleccione Rol</option>
                      <option value="1">Administrador</option>
                      <option value="2">Cliente</option>
                    </select>
                  ) : key === 'prodCategoria' ? (
                    <select name={key} value={val} onChange={handleInputChange} required>
                      <option value="">Seleccione Categoría</option>
                      <option value="Plantillas">Plantillas</option>
                      <option value="Cordones">Cordones</option>
                      <option value="Accesorios de limpieza">Accesorios de limpieza</option>
                      <option value="Tintas y pigmentos">Tintas y pigmentos</option>
                    </select>
                  ) : (
                    <input name={key} type={key === 'fechaNacimiento' ? 'date' : 'text'} value={val || ''} onChange={handleInputChange} required />
                  )}
                </label>
              ))}
              <button className="btn-submit" type="submit">Guardar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
