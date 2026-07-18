/******************************************************************
 * APP.JS - SISTEMA DE COMPRAS FAMILIAR CPB
 * Archivo de ampliación optimizado para CLOUD FIRESTORE.
 * CORRECCIÓN: Intercepción en fase de captura para frenar el envío inmediato.
 ******************************************************************/

console.clear();
console.log("======================================");
console.log(" APP.JS CONFIGURADO PARA FIRESTORE ");
console.log("======================================");

// Almacenamiento local temporal para controlar las cantidades antes de confirmar
const seleccionesTemporales = {};

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM del Sistema de Compras cargado correctamente.");

    // INDICAMOS 'TRUE' AL FINAL PARA USAR LA FASE DE CAPTURA
    // Esto intercepta el clic ANTES de que llegue a las funciones de tu index.html
    document.body.addEventListener("click", (e) => {
        
        // Verificamos si es el "+" ORIGINAL (y nos aseguramos de ignorar el "+" del nuevo contador)
        const esBotonMasOriginal = 
            (e.target.matches('.btn-agregar-mas, .btn-agregar-mas *') && !e.target.closest('.control-cantidad-contenedor')) || 
            (e.target.textContent.trim() === '+' && !e.target.closest('.control-cantidad-contenedor'));

        if (esBotonMasOriginal) {
            // ¡CONGELAMOS EL EVENTO! Detiene por completo el envío inmediato de tu index.html
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            const botonMas = e.target.closest('button') || e.target;
            const tarjetaProducto = botonMas.closest('.tarjeta-producto, .product-card') || botonMas.parentElement;
            
            // Obtenemos el nombre del producto
            const productoNombre = tarjetaProducto.querySelector('h3, .product-title, .Pan\\ de\\ Molde')?.textContent.trim() || "Producto Sin Nombre";
            
            transformarTarjetaAContador(tarjetaProducto, productoNombre, botonMas);
        }
    }, true); // <--- Este 'true' activa el escudo de interceptación avanzada

    // 2. INICIAR LA ESCUCHA EN TIEMPO REAL DESDE CLOUD FIRESTORE
    inicializarEscuchaFirestore();
});

/**
 * Transforma temporalmente el botón "+" en un selector de unidades (- 1 +) y un botón "Agregar"
 */
function transformarTarjetaAContador(tarjeta, productoId, botonOriginal) {
    if (tarjeta.querySelector('.control-cantidad-contenedor')) return;

    // Inicializamos la cantidad en 1
    seleccionesTemporales[productoId] = 1;
    botonOriginal.style.display = 'none';

    // Creamos el contenedor de controles dinámicos
    const contenedorContador = document.createElement('div');
    contenedorContador.className = 'control-cantidad-contenedor';
    contenedorContador.style.display = 'flex';
    contenedorContador.style.alignItems = 'center';
    contenedorContador.style.gap = '10px';
    contenedorContador.style.marginTop = '10px';

    contenedorContador.innerHTML = `
        <div style="display: flex; align-items: center; background: #2a2a2a; border-radius: 20px; padding: 2px 10px;">
            <button class="btn-restar" style="background: none; border: none; color: #fff; font-size: 18px; cursor: pointer; padding: 0 5px;">-</button>
            <span class="txt-cantidad" style="margin: 0 12px; color: #fff; font-weight: bold;">1</span>
            <button class="btn-sumar" style="background: none; border: none; color: #fff; font-size: 18px; cursor: pointer; padding: 0 5px;">+</button>
        </div>
        <button class="btn-confirmar-agregar" style="background: #00bcd4; border: none; color: #fff; padding: 6px 12px; border-radius: 5px; font-weight: bold; cursor: pointer; flex-grow: 1;">
            Agregar
        </button>
    `;

    tarjeta.appendChild(contenedorContador);
    const txtCantidad = contenedorContador.querySelector('.txt-cantidad');

    // Manejo del botón restar (Operación local normal)
    contenedorContador.querySelector('.btn-restar').addEventListener('click', (e) => {
        e.stopPropagation();
        if (seleccionesTemporales[productoId] > 1) {
            seleccionesTemporales[productoId]--;
            txtCantidad.textContent = seleccionesTemporales[productoId];
        }
    });

    // Manejo del botón sumar (Operación local normal)
    contenedorContador.querySelector('.btn-sumar').addEventListener('click', (e) => {
        e.stopPropagation();
        seleccionesTemporales[productoId]++;
        txtCantidad.textContent = seleccionesTemporales[productoId];
    });

    // Envío definitivo a la Base de Datos al pulsar el botón azul "Agregar"
    contenedorContador.querySelector('.btn-confirmar-agregar').addEventListener('click', (e) => {
        e.stopPropagation();
        const cantidadFinal = seleccionesTemporales[productoId];
        
        // Guardar la cantidad real elegida en Firestore
        registrarPedidoFirestore(productoId, cantidadFinal, tarjeta);

        // Devolver la interfaz a su estado inicial
        contenedorContador.remove();
        botonOriginal.style.display = 'block';
        delete seleccionesTemporales[productoId];
    });
}

/**
 * Inserta el pedido final en la colección 'pedidos' de Cloud Firestore
 */
function registrarPedidoFirestore(productoId, cantidad, tarjeta) {
    console.log(`Subiendo a Firestore de forma definitiva: ${cantidad} unidades de "${productoId}"`);
    
    const precioTexto = tarjeta.querySelector('span, .precio, p').textContent.replace('$', '').trim();
    const precioUnitario = parseFloat(precioTexto) || 0.00;
    const totalPedido = precioUnitario * cantidad;

    if (typeof db !== 'undefined' && typeof db.collection === 'function') {
        db.collection('pedidos').add({
            producto: productoId,
            cantidad: cantidad,
            precioUnitario: precioUnitario,
            total: totalPedido,
            fecha: new Date()
        })
        .then((docRef) => {
            console.log("Pedido guardado exitosamente con ID: ", docRef.id);
            // Pintamos un cartel de éxito propio para confirmar la acción de este botón
            mostrarNotificacionExito("Solicitud enviada con éxito.");
        })
        .catch((error) => {
            console.error("Error al añadir el pedido: ", error);
        });
    } else {
        console.warn("Instancia 'db' de Firestore no detectada globalmente.");
    }
}

/**
 * Escucha cambios en tiempo real en la colección 'productos' de Cloud Firestore
 */
function inicializarEscuchaFirestore() {
    if (typeof db !== 'undefined' && typeof db.collection === 'function') {
        db.collection('productos').onSnapshot((snapshot) => {
            snapshot.forEach((doc) => {
                const datos = doc.data();
                if (!datos) return;

                const elementosTarjeta = document.querySelectorAll('.tarjeta-producto, .product-card');
                elementosTarjeta.forEach(tarjeta => {
                    const titulo = tarjeta.querySelector('h3, .product-title, .Pan\\ de\\ Molde')?.textContent.trim();
                    
                    if (titulo === datos.nombre) {
                        const elementoPrecio = tarjeta.querySelector('.precio, span');
                        if (elementoPrecio && datos.precio !== undefined) {
                            elementoPrecio.textContent = `$ ${parseFloat(datos.precio).toFixed(2)}`;
                        }
                        const elementoImg = tarjeta.querySelector('img');
                        if (elementoImg && datos.imagenUrl) {
                            elementoImg.src = datos.imagenUrl;
                        }
                    }
                });
            });
        }, (error) => {
            console.error("Error en la escucha de Firestore en tiempo real: ", error);
        });
    }
}

/**
 * Dibuja un aviso flotante de éxito exclusivo para las confirmaciones de app.js
 */
function mostrarNotificacionExito(mensaje) {
    const alerta = document.createElement('div');
    alerta.style.position = 'fixed';
    alerta.style.top = '20px';
    alerta.style.right = '20px';
    alerta.style.background = '#4caf50';
    alerta.style.color = '#fff';
    alerta.style.padding = '12px 25px';
    alerta.style.borderRadius = '8px';
    alerta.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    alerta.style.zIndex = '100000';
    alerta.style.fontWeight = 'bold';
    alerta.innerHTML = `🎯 ${mensaje}`;
    document.body.appendChild(alerta);
    setTimeout(() => alerta.remove(), 3000);
}
