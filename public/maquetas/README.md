# Maquetas de la Entrega 1

Bocetos estáticos (HTML + CSS) de las pantallas principales de DonaTrack, tal como se presentaron en la Entrega 1. Se copiaron desde el backend (`servicio-donaciones/src/main/resources/static/app/`) para usarlos como referencia al implementar las pantallas en React.

Son solo de referencia visual: no consumen la API ni forman parte de la aplicación React.

## Cómo verlas

Con el servidor de desarrollo levantado (`npm run dev`), abrir:

http://localhost:5173/maquetas/index.html

Vite sirve la carpeta `public/` sin procesarla, así que los links entre páginas y `styles.css` funcionan igual que en el original.

## Pantallas

| Rol | Pantalla | Archivo |
|---|---|---|
| Público | Landing | `index.html` |
| Público | Inicio de sesión | `login.html` |
| Público | Registro | `registro.html` |
| Donante | Dashboard | `donante-dashboard.html` |
| Donante | Mis donaciones | `donante-donaciones.html` |
| Donante | Entidades beneficiarias | `donante-entidades.html` |
| Entidad | Dashboard | `entidad-dashboard.html` |
| Entidad | Donaciones asignadas | `entidad-donaciones.html` |
| Entidad | Gestión de necesidades | `entidad-necesidades.html` |
| Administración | Dashboard | `admin-dashboard.html` |
| Administración | Gestión de donantes | `admin-donantes.html` |
| Administración | Registro de donaciones | `admin-donaciones.html` |
| Administración | Importación CSV | `admin-importar.html` |
