<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Sistema de Compras Familiar CPB</title>
    <style>
        :root {
            --primary-glow: #10b981;
            --btn-solicitar: #2bc48a;
            --btn-comprar: #e2e8f0;
            --btn-ajustes: #4a5568;
            --text-light: #ffffff;
            --bg-dark-app: #121214;
        }

        body {
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
            background-image: linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.4)), url('foto_familiar.jpg.jpeg');
            background-size: cover;
            background-position: center;
            background-attachment: fixed;
            background-color: #141b2d;
            margin: 0;
            padding: 0;
            color: var(--text-light);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            box-sizing: border-box;
        }

        .app-card {
            width: 100%;
            max-width: 480px;
            padding: 20px 24px;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            position: relative;
        }

        .top-user-bar {
            position: absolute;
            top: -45px;
            right: 10px;
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 15px;
            font-weight: 600;
            text-shadow: 0 2px 4px rgba(0,0,0,0.8);
        }
        .top-user-bar span.user-name { color: #ffffff; margin-right: 6px; }

        .icon-top {
            cursor: pointer;
            width: 36px;
            height: 36px;
            background: rgba(255, 255, 255, 0.18);
            backdrop-filter: blur(6px);
            -webkit-backdrop-filter: blur(6px);
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
            color: #ffffff;
            box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        }
        .icon-top:hover { background: rgba(255, 255, 255, 0.28); box-shadow: 0 4px 12px rgba(0,0,0,0.35); }
        .icon-top:active { transform: scale(0.95); }
        .icon-top svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }

        .avatar-container {
            width: 140px;
            height: 140px;
            border-radius: 50%;
            border: 3px solid rgba(255, 255, 255, 0.9);
            box-shadow: 0 10px 25px rgba(0,0,0,0.6);
            margin-bottom: 20px;
            overflow: hidden;
            background: #2d3748;
        }

        .avatar-container img { width: 100%; height: 100%; object-fit: cover; object-position: top; }

        h1 { font-size: 32px; font-weight: 700; margin: 0 0 12px 0; text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8); color: #ffffff; line-height: 1.2; }
        .subtitle { color: #ffffff; font-size: 16px; margin: 0 0 35px 0; text-shadow: 0 2px 6px rgba(0, 0, 0, 0.8); max-width: 90%; font-weight: 400; }

        .menu-actions { width: 100%; display: flex; flex-direction: column; gap: 14px; margin-bottom: 25px; }

        .btn-cpb {
            width: 100%;
            padding: 14px 20px;
            border: none;
            border-radius: 25px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transition: transform 0.2s;
        }
        .btn-cpb:active { transform: scale(0.98); }

        .btn-solicitar { background-color: var(--btn-solicitar); color: white; }
        .btn-comprar { background-color: var(--btn-comprar); color: #2d3748; }
        .btn-ajustes { background-color: rgba(74, 85, 104, 0.9); color: white; border: 1px solid rgba(255,255,255,0.1); }

        .hidden { display: none !important; }
    </style>
</head>
<body>

    <!-- PORTAL DE ACCESO (LOGIN) -->
    <div id="login-card" class="app-card">
        <h1>Sistema de Compras<br>Familiar CPB</h1>
        <div class="subtitle">Organiza las compras de tu hogar de forma inteligente.</div>
        <button id="btnLogin" class="btn-cpb" style="background: white; color: #1a202c; border-radius: 25px; padding: 16px 24px; font-size: 18px;">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style="width:22px;">
            Continuar con Google
        </button>
    </div>

    <!-- PORTAL PRINCIPAL (LOGUEADO) -->
    <div id="portal-card" class="app-card hidden">
        <div class="top-user-bar">
            <span id="userNameField" class="user-name">Cargando...</span>
            <span id="btnShareUrl" class="icon-top" title="Compartir Sitio Familiar">
                <svg viewBox="0 0 24 24" style="fill: currentColor; stroke: none;"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z"/></svg>
            </span>
            <span id="btnLogOut" class="icon-top" title="Cerrar Sesión">
                <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            </span>
        </div>

        <div class="avatar-container">
            <img id="imgAvatar" src="perfil.jpg.jpeg" alt="Perfil Familiar">
        </div>

        <h1>Sistema de Compras<br>Familiar CPB</h1>
        <div class="subtitle">Organiza las compras de tu hogar de forma inteligente.</div>

        <div class="menu-actions">
            <button id="btnMenuSolicitar" class="btn-cpb btn-solicitar">🛒 Solicitar Compra</button>
            <button id="btnMenuComprar" class="btn-cpb btn-comprar">✔️ Comprar Ahora</button>
            <button id="btnMenuAjustes" class="btn-cpb btn-ajustes">⚙️ Ajustes del Sistema</button>
        </div>
    </div>

    <!-- ENLACE DIRECTO A FIREBASE Y FUNCIONES EXCLUSIVAS SOLICITADAS -->
    <script type="module">
        import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
        import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

        const firebaseConfig = {
            apiKey: "AIzaSyDkGmM0hMoOqQ5ughxqiCZxcN3bvlsSltI",
            authDomain: "gestion-compras-cpb.firebaseapp.com",
            projectId: "gestion-compras-cpb",
            storageBucket: "gestion-compras-cpb.firebasestorage.app",
            messagingSenderId: "643471531807",
            appId: "1:643471531807:web:9c254668692760ea6a9a2a"
        };

        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const provider = new GoogleAuthProvider();

        const loginCard = document.getElementById("login-card");
        const portalCard = document.getElementById("portal-card");
        const userNameField = document.getElementById("userNameField");
        const imgAvatar = document.getElementById("imgAvatar");

        // --- MANEJO DE SESIÓN DE GOOGLE ---
        document.getElementById("btnLogin").addEventListener("click", () => {
            signInWithPopup(auth, provider).catch(err => console.error("Error de login:", err));
        });

        // --- FUNCIÓN: CERRAR SESIÓN ---
        document.getElementById("btnLogOut").addEventListener("click", () => {
            signOut(auth);
        });

        // Monitoreo de estado de usuario
        onAuthStateChanged(auth, (user) => {
            if (user) {
                loginCard.classList.add("hidden");
                portalCard.classList.remove("hidden");
                userNameField.textContent = user.displayName || "Usuario Familiar";
                if (user.photoURL) {
                    imgAvatar.src = user.photoURL;
                }
            } else {
                loginCard.classList.remove("hidden");
                portalCard.classList.add("hidden");
            }
        });

        // --- FUNCIÓN: COMPARTIR ENLACE ---
        document.getElementById("btnShareUrl").addEventListener("click", () => {
            navigator.clipboard.writeText(window.location.href);
            alert("¡Enlace del sistema familiar copiado!");
        });

        // --- FUNCIÓN: AJUSTES DEL SISTEMA (Redirección a Perfil) ---
        document.getElementById("btnMenuAjustes").addEventListener("click", () => {
            window.location.href = "perfil.html";
        });

        // Botones sin funciones internas (solo diseño activo)
        document.getElementById("btnMenuSolicitar").addEventListener("click", () => {
            console.log("Botón Solicitar Compra presionado.");
        });
        document.getElementById("btnMenuComprar").addEventListener("click", () => {
            console.log("Botón Comprar Ahora presionado.");
        });
    </script>
</body>
</html>