/******************************************************************
 * APP.JS - SISTEMA DE COMPRAS FAMILIAR CPB
 * Archivo de ampliación optimizado para CLOUD FIRESTORE.
 ******************************************************************/

console.clear();
console.log("======================================");
console.log(" APP.JS CONFIGURADO PARA FIRESTORE ");
console.log("======================================");

// Almacenamiento local temporal para controlar las cantidades antes de confirmar
const seleccionesTemporales = {};

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM del Sistema de Compras cargado correctamente.");

    // 1. CAPTURAR CLICS EN EL BOTÓN "+" EN TIEMPO REAL
    document.body.addEventListener("click", (e) => {
        // Detecta si se hace clic en el botón "+" o en el icono dentro de él
        if (e.target.matches('.btn-agregar-mas, .btn-agregar-mas *') || e.target.textContent.trim() === '+') {
            e.preventDefault();
            
            const botonMas = e.target.closest('button') || e.target;
            const tarjetaProducto = botonMas.closest('.tarjeta-producto, .product-card') || botonMas.parentElement;
            
            // Obtenemos el nombre del producto para usarlo como identificador temporal
            const productoNombre = tarjetaProducto.querySelector('h3, .product-title, .Pan\\ de\\ Molde')?.textContent.trim() || "Producto Sin Nombre";
            
            transformarTarjetaAContador(tarjetaProducto, productoNombre, botonMas);
        }
    });

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

    // Manejo del botón restar
    contenedorContador.querySelector('.btn-restar').addEventListener('click', (e) => {
        e.stopPropagation();
        if (seleccionesTemporales[productoId] > 1) {
            seleccionesTemporales[productoId]--;
            txtCantidad.textContent = seleccionesTemporales[productoId];
        }
    });

    // Manejo del botón sumar
    contenedorContador.querySelector('.btn-sumar').addEventListener('click', (e) => {
        e.stopPropagation();
        seleccionesTemporales[productoId]++;
        txtCantidad.textContent = seleccionesTemporales[productoId];
    });

    // Manejo del botón definitivo "Agregar"
    contenedorContador.querySelector('.btn-confirmar-agregar').addEventListener('click', (e) => {
        e.stopPropagation();
        const cantidadFinal = seleccionesTemporales[productoId];
        
        // Guardar directamente en la colección de Firestore
        registrarPedidoFirestore(productoId, cantidadFinal, tarjeta);

        // Devolver la tarjeta a su estado original
        contenedorContador.remove();
        botonOriginal.style.display = 'block';
        delete seleccionesTemporales[productoId];
    });
}

/**
 * Inserta el pedido de forma instantánea en la colección 'pedidos' de Cloud Firestore
 */
function registrarPedidoFirestore(productoId, cantidad, tarjeta) {
    console.log(`Enviando a Firestore: ${cantidad} unidades de "${productoId}"`);
    
    // Extrae el precio limpio de la interfaz del producto
    const precioTexto = tarjeta.querySelector('span, .precio, p').textContent.replace('$', '').trim();
    const precioUnitario = parseFloat(precioTexto) || 0.00;
    const totalPedido = precioUnitario * cantidad;

    // Verificamos que la variable de Firestore esté disponible de forma global (usualmente se llama 'db')
    if (typeof db !== 'undefined' && typeof db.collection === 'function') {
        db.collection('pedidos').add({
            producto: productoId,
            cantidad: cantidad,
            precioUnitario: precioUnitario,
            total: totalPedido,
            fecha: new Date()
        })
        .then((docRef) => {
            console.log("Pedido registrado en Firestore con ID: ", docRef.id);
        })
        .catch((error) => {
            console.error("Error al añadir el pedido a Firestore: ", error);
        });
    } else {
        console.warn("Instancia de Firestore ('db') no detectada globalmente. El proceso se ejecutó de forma local.");
    }
}

/**
 * Escucha cambios en tiempo real en la colección 'productos' de Cloud Firestore
 * Actualiza automáticamente los precios y las imágenes si cambian en la base de datos
 */
function inicializarEscuchaFirestore() {
    if (typeof db !== 'undefined' && typeof db.collection === 'function') {
        
        // El método onSnapshot es el encargado del "Tiempo Real" en Firestore
        db.collection('productos').onSnapshot((snapshot) => {
            snapshot.forEach((doc) => {
                const datos = doc.data();
                if (!datos) return;

                // Buscamos las tarjetas de producto en el HTML para actualizarlas sobre la marcha
                const elementosTarjeta = document.querySelectorAll('.tarjeta-producto, .product-card');
                elementosTarjeta.forEach(tarjeta => {
                    const titulo = tarjeta.querySelector('h3, .product-title')?.textContent.trim();
                    
                    // Si el nombre en el HTML coincide con el campo 'nombre' en Firestore
                    if (titulo === datos.nombre) {
                        // 1. Actualizar el Precio al instante
                        const elementoPrecio = tarjeta.querySelector('.precio, span');
                        if (elementoPrecio && datos.precio !== undefined) {
                            elementoPrecio.textContent = `$ ${parseFloat(datos.precio).toFixed(2)}`;
                        }

                        // 2. Actualizar la Imagen al instante
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