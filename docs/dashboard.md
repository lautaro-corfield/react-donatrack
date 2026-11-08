# Contexto del Proyecto
Estamos desarrollando el frontend de "DonaTrack", una plataforma de gestión basada en microservicios.
- **Stack Tecnológico:** React + TypeScript + Vite.
- **Librería de Componentes:** Chakra UI.
- **Enrutamiento:** React Router DOM.
- **Manejo de Estado:** Zustand (ya tenemos un `useAuthStore` para manejar el JWT y el logout).
- **Cliente HTTP:** Axios configurado apuntando al API Gateway.

# Objetivo
Crear la estructura principal de la aplicación para usuarios autenticados: un **Dashboard** que incluya un menú lateral (Sidebar) y un área de contenido dinámico.

# Requerimientos Funcionales y Visuales

## 1. Dashboard Layout (`DashboardLayout.tsx`)
- Crear un componente layout que ocupe el 100% del alto y ancho de la pantalla (`100vh`, `100vw`).
- Debe componerse de un `Sidebar` a la izquierda y un contenedor principal (Main Content) a la derecha.
- El contenedor principal debe renderizar las vistas hijas usando el componente `<Outlet />` de React Router DOM.

## 2. Menú Lateral (Sidebar)
El menú lateral debe tener un diseño limpio e incluir las siguientes opciones de navegación:

1. 👥 **Donantes** -> ruta: `/dashboard/donantes`
2. 📦 **Donaciones** -> ruta: `/dashboard/donaciones`
3. 🏢 **Entidades beneficiarias** -> ruta: `/dashboard/entidades`

**Características adicionales del Sidebar:**
- Indicar visualmente cuál es la pestaña que está activa actualmente.
- En la parte inferior del Sidebar, agregar un botón de "Cerrar Sesión". Este botón debe consumir la acción `logout()` de nuestro `useAuthStore` y redirigir al usuario a `/login`.

## 3. Responsive Design
- **Desktop:** El menú lateral debe quedar fijo a la izquierda.
- **Mobile:** El menú lateral debe ocultarse y reemplazarse por un botón de menú hamburguesa en la parte superior (usando un componente `Drawer` de Chakra UI), para que el área de contenido principal ocupe el 100% del ancho.

# Entregables Esperados
Por favor, escribí el código paso a paso para:
1. Crear el componente `Sidebar`.
2. Crear el componente `DashboardLayout`.
3. Actualizar la configuración de rutas (Router) para implementar este layout y agregar vistas "placeholder" (vistas vacías de prueba) para Donantes, Donaciones y Entidades beneficiarias.