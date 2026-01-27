# Guía de Despliegue (Deployment) - SuEmpresa.com

Esta guía detalla los pasos para subir tu sistema a tu hosting, aprovechando que ya confirmaste el soporte para **Node.js**.

---

## 1. Preparación de la Base de Datos

1.  **Exportar Localmente**:
    *   **Opción A (phpMyAdmin Local):**
        1. Entra a `http://localhost/phpmyadmin`.
        2. Selecciona tu base de datos en la izquierda (`school_db` o el nombre que tengas).
        3. Ve a la pestaña **Exportar** (Export) en el menú superior.
        4. Deja marcado "Rápido" y formato "SQL".
        5. Clic en **Continuar** (Go) y guarda el archivo.
    *   **Opción B (Otras):** Workbench, TablePlus o `mysqldump`.
    *   *Nota: En el ZIP he incluido un archivo `schema.sql` con la estructura básica, pero te recomiendo exportar tu propia base de datos para no perder tu información.*
2.  **Crear en Hosting**:
    *   Entra al cPanel de tu hosting -> **MySQL Databases**.
    *   Crea una nueva base de datos (ej. `usuario_escuela`).
    *   Crea un usuario y asígnale contraseña segura.
    *   **Importante**: Asocia el usuario a la base de datos con "Todos los Privilegios".
3.  **Importar Datos**:
    *   Ve a **phpMyAdmin** en tu hosting.
    *   Selecciona la nueva base de datos.
    *   Pestaña "Importar" -> Sube tu archivo `.sql`.

---

## 2. Preparación de Archivos (Backend)

1.  **Paquete Listo**:
    *   He generado un archivo llamado `deployment_package_final.zip` en la raíz de este proyecto. Este archivo contiene todo tu código, plantillas y archivos públicos.
    *   **No incluye** `node_modules` (se instalan allá) ni `.env` (se configura allá).

2.  **Variables de Entorno (.env)**:
    *   Necesitarás crear un archivo `.env` en tu hosting con los datos de **producción**:
    ```env
    DB_HOST=localhost
    DB_USER=usuario_escuela
    DB_PASSWORD=tu_contraseña_hosting
    DB_NAME=usuario_escuela
    PORT=3000
    PUBLIC_URL=https://tu-dominio.com
    # SMTP (Usa los mismos de tu local si funcionan, o los del hosting)
    EMAIL_USER=tu@correo.com
    EMAIL_PASS=tu_password
    ```

---

## 3. Subir Archivos

1.  **Subir a cPanel**:
    *   Ve al **Administrador de Archivos** (File Manager).
    *   Sube el archivo `deployment_package.zip` a la carpeta donde alojarás la app (ej. `/home/usuario/miapp` o la raíz si así lo indica la guía de suempresa).
2.  **Descomprimir**:
    *   Click derecho en el zip -> **Extract**.
    *   Verifica que veas `server.js`, `package.json`, `public`, etc.

---

## 4. Configuración de Node.js (cPanel)

1.  Busca **"Setup Node.js App"** en cPanel.
2.  **Create Application**:
    *   **Node.js Version**: Elige la recomendada (ej. 18.x o 20.x).
    *   **Application Root**: La carpeta donde descomprimiste los archivos.
    *   **Application URL**: La ruta web (ej. `midominio.com`).
    *   **Application Startup File**: `server.js`.
3.  Click en **Create**.
4.  **Instalar Dependencias**:
    *   Una vez creada, busca el botón **"Run NPM Install"**. Esto leerá el `package.json` e instalará todo automáticamente.
5.  **Restart**: Reinicia la aplicación desde el botón Restart.

---

## 5. Verificación

1.  Entra a `https://tu-dominio.com/agendar_cita.html`.
2.  Intenta hacer una prueba completa (agendar una cita).
3.  Verifica que los correos lleguen.

> [!TIP]
> Si los estilos no cargan, verifica que la carpeta `public` esté en el lugar correcto o que tu archivo `server.js` tenga configurado correctamente `app.use(express.static('public'))` (que ya lo tiene).
