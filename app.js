/******************************************************************
 * APP.JS - SISTEMA DE COMPRAS FAMILIAR CPB
 * Versión: Alta Estética Minimalista & Intercepción Avanzada
 ******************************************************************/

console.clear();
console.log("======================================");
console.log(" APP.JS: EDICIÓN MINIMALISTA PREMIUM ");
console.log("======================================");

// Almacenamiento local de las cantidades elegidas
const seleccionesTemporales = {};

// Inyectar estilos de animación fluidos en el documento de forma automática
if (!document.getElementById('cpb-minimal-styles')) {
    const estiloCss = document.createElement('style');
    estiloCss.id = 'cpb-minimal-styles';
    estiloCss.innerHTML = `
        @keyframes cpbEmerger {
            from { opacity: 0; transform: translateY(6px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .control-cantidad-contenedor {
            animation: cpbEmerger 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
        }
        .btn-interaccion-minimal {
            transition: all 0.2s ease;
        }
        .btn-interaccion-minimal:active {
            transform: scale(0.92);
        }
    `;
    document.head.appendChild(estiloCss);
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM del Sistema de Compras cargado correctamente.");

    // Interceptamos el click original en fase de captura con el escudo protector
    document.body.addEventListener("click", (e) => {
        
        const esBotonMasOriginal = 
            (e.target.matches('.btn-agregar-mas, .btn-agregar-mas *') && !e.target.closest('.control-cantidad-contenedor')) || 
            (e.target.textContent.trim() === '+' && !e.target.closest('.control-cantidad-contenedor'));

        if (esBotonMasOriginal) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            const botonMas = e.target.closest('button') || e.target;
            // Buscamos la fila de acciones (el contenedor padre directo del botón y del precio)
            const filaAcciones = botonMas.parentElement;
            const tarjetaProducto = botonMas.closest('.tarjeta-producto, .product-card') || filaAcciones;
            
            const productoNombre = tarjetaProducto.querySelector('h3, .product-title, .Pan\\ de\\ Molde')?.textContent.trim() || "Producto Sin Nombre";
            
            transformarTarjetaAContador(filaAcciones, productoNombre, botonMas, tarjetaProducto);
        }
    }, true);

    inicializarEscuchaFirestore();
});

/**
 * Transforma la fila de acciones ocultando el precio/botón original y mostrando la interfaz minimalista
 */
function transformarTarjetaAContador(filaAcciones, productoId, botonOriginal, tarjetaProducto) {
    if (filaAcciones.querySelector('.control-cantidad-contenedor')) return;

    seleccionesTemporales[productoId] = 1;

    // Ocultamos de forma limpia todos los elementos nativos de esa fila para ganar espacio completo
    const elementosNativos = Array.from(filaAcciones.children);
    elementosNativos.forEach(el => el.style.display = 'none');

    // Creamos la nueva estructura minimalista estilizada
    const contenedorContador = document.createElement('div');
    contenedorContador.className = 'control-cantidad-contenedor';

    contenedorContador.innerHTML = `
        <div style="display: flex; align-items: center; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1); border-radius: 25px; padding: 4px 14px; height: 36px; box-sizing: border-box;">
            <button class="btn-restar btn-interaccion-minimal" style="background: none; border: none; color: rgba(255,255,255,0.6); font-size: 20px; font-weight: 300; cursor: pointer; padding: 0 4px; display: flex; align-items: center; justify-content: center;">−</button>
            <span class="txt-cantidad" style="margin: 0 14px; color: #ffffff; font-weight: 600; font-size: 15px; min-width: 14px; text-align: center; font-family: sans-serif;">1</span>
            <button class="btn-sumar btn-interaccion-minimal" style="background: none; border: none; color: rgba(255,255,255,0.6); font-size: 20px; font-weight: 300; cursor: pointer; padding: 0 4px; display: flex; align-items: center; justify-content: center;">+</button>
        </div>
        <button class="btn-confirmar-agregar btn-interaccion-minimal" style="background: #00e5ff; border: none; color: #0a0a0a; padding: 0 20px; border-radius: 25px; font-weight: 700; font-size: 11px; letter-spacing: 1.2px; text-transform: uppercase; cursor: pointer; height: 36px; flex-grow: 1; box-shadow: 0 4px 15px rgba(0,229,255,0.2); font-family: sans-serif;">
            Añadir
        </button>
    `;

    filaAcciones.appendChild(contenedorContador);
    const txtCantidad = contenedorContador.querySelector('.txt-cantidad');

    // Manejador del botón restar unidades
    contenedorContador.querySelector('.btn-restar').addEventListener('click', (e) => {
        e.stopPropagation();
        if (seleccionesTemporales[productoId] > 1) {
            seleccionesTemporales[productoId]--;
            txtCantidad.textContent = seleccionesTemporales[productoId];
        }
    });

    // Manejador del botón sumar unidades
    contenedorContador.querySelector('.btn-sumar').addEventListener('click', (e) => {
        e.stopPropagation();
        seleccionesTemporales[productoId]++;
        txtCantidad.textContent = seleccionesTemporales[productoId];
    });

    // Botón definitivo de Confirmación "Añadir"
    contenedorContador.querySelector('.btn-confirmar-agregar').addEventListener('click', (e) => {
        e.stopPropagation();
        const cantidadFinal = seleccionesTemporales[productoId];
        
        // Enviar datos limpios a Cloud Firestore
        registrarPedidoFirestore(productoId, cantidadFinal, tarjetaProducto);

        // Destruir contenedor minimalista y restaurar la fila a su estado original impecable
        contenedorContador.remove();
        elementosNativos.forEach(el => el.style.display = '');
        delete seleccionesTemporales[productoId];
    });
}

/**
 * Registra la orden de compra exacta en la colección 'pedidos' de Cloud Firestore
 */
function registrarPedidoFirestore(productoId, cantidad, tarjetaProducto) {
    console.log(`Enviando a Firestore de forma definitiva: ${cantidad} unidades de "${productoId}"`);
    
    // Extraer el precio numérico sin el símbolo de dólar
    const precioTexto = tarjetaProducto.querySelector('.precio, span, p')?.textContent || "$ 0.00";
    const precioLimpiado = precioTexto.replace('$', '').trim();
    const precioUnitario = parseFloat(precioLimpiado) || 0.00;
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
            console.log("Pedido guardado en la nube con ID: ", docRef.id);
            mostrarNotificacionExito("Añadido al carrito con éxito");
        })
        .catch((error) => {
            console.error("Error al añadir el pedido a Firestore: ", error);
        });
    } else {
        console.warn("La variable global 'db' de Firestore no está disponible.");
        mostrarNotificacionExito("Añadido (Modo Demo Local)");
    }
}

/**
 * Mantiene sincronizados los precios y fotos desde la consola de Firestore al instante
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
            console.error("Error en la escucha de Firestore: ", error);
        });
    }
}

/**
 * Notificación flotante de diseño limpio y minimalista
 */
function mostrarNotificacionExito(mensaje) {
    const alerta = document.createElement('div');
    alerta.style.position = 'fixed';
    alerta.style.bottom = '30px';
    alerta.style.left = '50%';
    alerta.style.transform = 'translateX(-50%)';
    alerta.style.background = '#0a0a0a';
    alerta.style.color = '#00e5ff';
    alerta.style.border = '1px solid #00e5ff';
    alerta.style.padding = '10px 22px';
    alerta.style.borderRadius = '30px';
    alerta.style.boxShadow = '0 10px 30px rgba(0,229,255,0.15)';
    alerta.style.zIndex = '100000';
    alerta.style.fontWeight = '600';
    alerta.style.fontSize = '12px';
    alerta.style.letterSpacing = '0.5px';
    alerta.style.textTransform = 'uppercase';
    alerta.style.animation = 'cpbEmerger 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    
    alerta.innerHTML = `<span>✓</span> &nbsp; ${mensaje}`;
    document.body.appendChild(alerta);
    
    setTimeout(() => {
        alerta.style.transition = 'opacity 0.3s ease';
        alerta.style.opacity = '0';
        setTimeout(() => alerta.remove(), 300);
    }, 2500);
}
