import React, { useState } from 'react';
import '../styles/style.css';

const Registro = () => {
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        correo: '',
        password: '',
        cedula: '',
        telefono: '',
        direccion: '',
        nacimiento: ''
    });

    const apiBaseUrl = 'https://fixmyshoesadmin.runasp.net';

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    function validarCedulaEcuatoriana(cedula) {
        if (!/^\d{10}$/.test(cedula)) return false;
        const provincia = parseInt(cedula.substring(0, 2), 10);
        const provinciasValidas = [...Array(24).keys()].map(n => n + 1).concat(30);
        if (!provinciasValidas.includes(provincia)) return false;
        const digitos = cedula.split('').map(Number);
        const verificador = digitos.pop();
        let suma = 0;
        for (let i = 0; i < digitos.length; i++) {
            let mult = digitos[i] * (i % 2 === 0 ? 2 : 1);
            if (mult > 9) mult -= 9;
            suma += mult;
        }
        const decena = Math.ceil(suma / 10) * 10;
        return verificador === (decena - suma) % 10;
    }

    function validarRucEcuatoriano(ruc) {
        return /^\d{13}$/.test(ruc) && ruc.endsWith('001') && validarCedulaEcuatoriana(ruc.substring(0, 10));
    }

    function validarTelefonoEcuador(telefono) {
        return /^09\d{8}$/.test(telefono);
    }

    function esFechaValida(fecha) {
        const hoy = new Date();
        const hoySinHora = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
        const fechaIngresada = new Date(fecha);
        return fechaIngresada <= hoySinHora;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const {
            nombre, apellido, correo, password, cedula,
            telefono, direccion, nacimiento
        } = formData;

        const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);

        // Validaciones campo por campo
        if (!nombre.trim()) {
            alert("El campo 'Nombre' es obligatorio.");
            return;
        }
        if (!correo.trim()) {
            alert("El campo 'Correo' es obligatorio.");
            return;
        }
        if (!correoValido) {
            alert("Ingresa un correo electrónico válido.");
            return;
        }
        if (!password.trim()) {
            alert("El campo 'Contraseña' es obligatorio.");
            return;
        }
        if (!apellido.trim()) {
            alert("El campo 'Apellido' es obligatorio.");
            return;
        }
        if (!cedula.trim()) {
            alert("El campo 'Cédula o RUC' es obligatorio.");
            return;
        }
        if (!(validarCedulaEcuatoriana(cedula) || validarRucEcuatoriano(cedula))) {
            alert("Cédula o RUC ecuatoriano inválido.");
            return;
        }
        if (!telefono.trim()) {
            alert("El campo 'Teléfono' es obligatorio.");
            return;
        }
        if (!validarTelefonoEcuador(telefono)) {
            alert("Número de celular inválido. Debe tener 10 dígitos y comenzar con 09.");
            return;
        }
        if (!direccion.trim()) {
            alert("El campo 'Dirección' es obligatorio.");
            return;
        }
        if (!nacimiento) {
            alert("La fecha de nacimiento es obligatoria.");
            return;
        }
        if (!esFechaValida(nacimiento)) {
            alert("La fecha de nacimiento no puede ser en el futuro.");
            return;
        }

        try {
            const resUsuarios = await fetch(`${apiBaseUrl}/api/usuarios`);
            const usuarios = await resUsuarios.json();
            const existeCorreo = usuarios.some(u => u.correo.toLowerCase() === correo.toLowerCase());

            if (existeCorreo) {
                alert('Ya existe una cuenta con ese correo electrónico.');
                return;
            }

            const nuevoUsuario = {
                idRol: 2,
                nombre,
                correo,
                password,
                fechaRegistro: new Date().toISOString().split('T')[0],
                rolNombre: 'Cliente'
            };

            const resUsuario = await fetch(`${apiBaseUrl}/api/usuarios`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoUsuario)
            });

            if (!resUsuario.ok) throw new Error('No se pudo registrar el usuario');
            const usuarioCreado = await resUsuario.json();

            const nuevoCliente = {
                idUsuario: usuarioCreado.idUsuario,
                nombre,
                apellido,
                cedulaRuc: cedula,
                telefono,
                direccion,
                fechaNacimiento: nacimiento
            };

            const resCliente = await fetch(`${apiBaseUrl}/api/clientes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoCliente)
            });

            if (!resCliente.ok) throw new Error('No se pudo registrar el cliente');

            alert('Registro exitoso. Ya puedes iniciar sesión.');
            window.location.href = '/login';

        } catch (error) {
            console.error('Error al registrar:', error);
            alert('Ocurrió un error. Inténtalo de nuevo más tarde.');
        }
    };

    return (
        <main className="auth-container">
            <section className="register-form">
                <h1>Crear una Cuenta</h1>
                <form onSubmit={handleSubmit} id="registroForm">
                    <h3>Datos de usuario</h3>
                    <input type="text" name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleChange} required />
                    <input type="email" name="correo" placeholder="Correo" value={formData.correo} onChange={handleChange} required />
                    <input type="password" name="password" placeholder="Contraseña" value={formData.password} onChange={handleChange} required />

                    <h3>Datos de cliente</h3>
                    <input type="text" name="apellido" placeholder="Apellido" value={formData.apellido} onChange={handleChange} required />
                    <input type="text" name="cedula" placeholder="Cédula o RUC" value={formData.cedula} onChange={handleChange} required />
                    <input type="text" name="telefono" placeholder="Teléfono" value={formData.telefono} onChange={handleChange} required />
                    <input type="text" name="direccion" placeholder="Dirección" value={formData.direccion} onChange={handleChange} required />
                    <input type="date" name="nacimiento" placeholder="Fecha de Nacimiento" value={formData.nacimiento} onChange={handleChange} required />

                    <button type="submit">Registrarse</button>
                </form>

                <p className="redirect-text">
                    ¿Ya tienes cuenta? <a href="/login">Inicia sesión aquí</a>
                </p>
            </section>
        </main>
    );
};

export default Registro;
