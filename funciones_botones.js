// ==========================================
// BASE DE DATOS LOCAL DEL CARRITO Y CATÁLOGO
// ==========================================
let carrito = [];
const catalogoCategorias = {
    "Verduras 🥦": ["Tomate", "Cebolla Paiteña", "Lechuga", "Zanahoria", "Pimiento", "Papas"],
    "Frutas 🍎": ["Plátano", "Manzana", "Naranja", "Frutillas", "Uvas"],
    "Abarrotes 🍞": ["Arroz", "Aceite", "Azúcar", "Café", "Pan de Molde"]
};

// ==========================================
// INYECCIÓN DE ESTILOS PARA LOS MODALES
// ==========================================
const sheet = window.document.styleSheets[0] || document.head.appendChild(document.createElement('style')).sheet;
const estilosModales = `
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); display: flex; justify-content: center; align-items: center; z-index: 1000; box-sizing: border-box; padding: 16px; }
    .modal-content { background: rgba(28, 28, 33, 0.95); border: 1px solid #2d2d35; border-radius: 24px; width: 100%; max-width: 400px; padding: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.6); text-align: center; color: white; box-sizing: border-box; }
    .modal-title { font-size: 22px; font-weight: 700; margin-bottom: 16px; color: #ffffff; }
    .modal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 16px; }
    .btn-modal-item { background: #232329; border: 1px solid #2d2d35; color: white; padding: 14px; border-radius: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
    .btn-modal-item:hover { background: #10b981; border-color: #10b981; }
    .modal-input-group { text-align: left; margin-bottom: 14px; }
    .modal-input-group label { display: block; font-size: 12px; color: #a1a1aa; margin-bottom: 6px; font-weight: 600; text-transform: uppercase; }
    .modal-input { width: 100%; background: #232329; border: 1px solid #2d2d35; border-radius: 12px; padding: 12px; font-size: 14px; color: white; outline: none; box-sizing: border-box; }
    .modal-input:focus { border-color: #10b981; }
    .btn-modal-action { width: 100%; padding: 14px; border: none; border-radius: 25px; font-size: 15px; font-weight: 600; cursor: pointer; margin-top: 10px; }
    .btn-modal-close { background: #232329; color: #e4e4e7; border: 1px solid rgba(255,255,255,0.05); margin-top: 8px; }
    .cart-item-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #2d2d35; font-size: 14px; }
`;
sheet.insertRule ? sheet.insertRule(estilosModales, 0) : sheet.innerHTML = estilosModales;


// ==========================================
// VINCULACIÓN DIRECTA A LOS BOTONES FISICOS
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const btnSolicitar = document.getElementById("btnMenuSolicitar");
    const btnComprar = document.getElementById("btnMenuComprar");

    if (btnSolicitar) {
        btnSolicitar.addEventListener("click", abrirModalCategorias);
    }
    if (btnComprar) {
        btnComprar.addEventListener("click", abrirModalComprarAhora);
    }
});


// ==========================================
// FUNCIÓN: SOLICITAR COMPRA (PASO 1: CATEGORÍAS)
// ==========================================
function abrirModalCategorias() {
    const modal = crearEstructuraModal("Selecciona una Categoría");
    const grid = document.createElement("div");
    grid.className = "modal-grid";

    Object.keys(catalogoCategorias).forEach(categoria => {
        const btn = document.createElement("button");
        btn.className = "btn-modal-item";
        btn.textContent = categoria;
        btn.addEventListener("click", () => {
            modal.remove();
            abrirModalProductos(categoria);
        });
        grid.appendChild(btn);
    });

    modal.querySelector(".modal-content").appendChild(grid);
    agregarBotonCerrar(modal);
}


// ==========================================
// PASO 2: SELECCIÓN DE PRODUCTOS 
// ==========================================
function abrirModalProductos(categoria) {
    const modal = crearEstructuraModal(`Categoría: ${categoria}`);
    const grid = document.createElement("div");
    grid.className = "modal-grid";

    catalogoCategorias[categoria].forEach(producto => {
        const btn = document.createElement("button");
        btn.className = "btn-modal-item";
        btn.textContent = producto;
        btn.addEventListener("click", () => {
            modal.remove();
            abrirModalConfigurarProducto(producto);
        });
        grid.appendChild(btn);
    });

    modal.querySelector(".modal-content").appendChild(grid);
    agregarBotonCerrar(modal, () => abrirModalCategorias());
}


// ==========================================
// PASO 3: AGREGAR PRECIO, UNIDADES Y AL CARRITO
// ==========================================
function abrirModalConfigurarProducto(nombreProducto) {
    const modal = crearEstructuraModal(`Configurar: ${nombreProducto}`);
    const content = modal.querySelector(".modal-content");

    content.innerHTML += `
        <div class="modal-input-group">
            <label>Función: Agregar Precio Estimado ($)</label>
            <input type="number" id="prodPrecio" class="modal-input" placeholder="0.00" step="0.01" min="0">
        </div>
        <div class="modal-input-group">
            <label>Función: Agregar Producto por Unidad / Cantidad</label>
            <input type="number" id="prodCantidad" class="modal-input" value="1" min="1">
        </div>
        <button id="btnAgregarACompra" class="btn-modal-action" style="background: #2bc48a; color: white;">🛒 Agregar a la Compra</button>
    `;

    document.body.appendChild(modal);

    document.getElementById("btnAgregarACompra").addEventListener("click", () => {
        const precio = parseFloat(document.getElementById("prodPrecio").value) || 0;
        const cantidad = parseInt(document.getElementById("prodCantidad").value) || 1;

        // Guarda la estructura dentro del arreglo de compras local
        carrito.push({
            producto: nombreProducto,
            precio: precio,
            cantidad: cantidad,
            subtotal: precio * cantidad
        });

        alert(`¡${nombreProducto} añadido correctamente a la lista de compras!`);
        modal.remove();
    });

    agregarBotonCerrar(modal, () => abrirModalCategorias());
}


// ==========================================
// FUNCIÓN: COMPRAR AHORA (RESUMEN Y DESPACHO)
// ==========================================
function abrirModalComprarAhora() {
    const modal = crearEstructuraModal("Resumen de Compra Familiar");
    const content = modal.querySelector(".modal-content");

    if (carrito.length === 0) {
        content.innerHTML += `<p style="color: #a1a1aa; margin: 20px 0;">Tu lista de compras solicitadas está vacía.</p>`;
    } else {
        const listaContenedor = document.createElement("div");
        listaContenedor.style.margin = "15px 0";
        listaContenedor.style.maxHeight = "200px";
        listaContenedor.style.overflowY = "auto";

        let granTotal = 0;

        carrito.forEach((item) => {
            granTotal += item.subtotal;
            const fila = document.createElement("div");
            fila.className = "cart-item-row";
            fila.innerHTML = `
                <span>${item.producto} (x${item.cantidad})</span>
                <span style="color: #10b981; font-weight: 600;">$${item.subtotal.toFixed(2)}</span>
            `;
            listaContenedor.appendChild(fila);
        });

        content.appendChild(listaContenedor);

        content.innerHTML += `
            <div style="display: flex; justify-content: space-between; margin: 15px 0; font-weight: 700; font-size: 18px; border-top: 2px solid #2d2d35; padding-top: 10px;">
                <span>TOTAL ESTIMADO:</span>
                <span style="color: #10b981;">$${granTotal.toFixed(2)}</span>
            </div>
            <button id="btnFinalizarDespacho" class="btn-modal-action" style="background: white; color: #121214;">Despachar / Registrar Compra</button>
        `;
    }

    agregarBotonCerrar(modal);

    const btnFinalizar = document.getElementById("btnFinalizarDespacho");
    if (btnFinalizar) {
        btnFinalizar.addEventListener("click", () => {
            carrito = []; // Vacía por completo el arreglo para reiniciar la app
            alert("¡La compra de tu hogar ha sido procesada y registrada exitosamente!");
            modal.remove();
        });
    }
}


// ==========================================
// UTILERÍAS DE ARMADO DE INTERFAZ MODAL
// ==========================================
function crearEstructuraModal(titulo) {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";

    const content = document.createElement("div");
    content.className = "modal-content";
    content.innerHTML = `<div class="modal-title">${titulo}</div>`;

    overlay.appendChild(content);
    document.body.appendChild(overlay);
    return overlay;
}

function agregarBotonCerrar(modalElement, accionAlCerrar = null) {
    const content = modalElement.querySelector(".modal-content");
    const btnCerrar = document.createElement("button");
    btnCerrar.className = "btn-modal-action btn-modal-close";
    btnCerrar.textContent = "Volver Atrás";
    
    btnCerrar.addEventListener("click", () => {
        modalElement.remove();
        if (accionAlCerrar) accionAlCerrar();
    });
    
    content.appendChild(btnCerrar);
}