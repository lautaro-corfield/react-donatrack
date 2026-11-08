Por favor, generame o actualizame los siguientes 3 archivos dentro de src/features/auth/:

1. model/types.ts

Agrega la interfaz EmailLoginRequest que contenga:

email (string)

password (string)

2. api/auth.service.ts

Agrega el método asíncrono loginWithEmail(payload: EmailLoginRequest): Promise<AuthResponse>.

Debe hacer un POST a la ruta /api/auth/login (utilizando la base URL del backend VITE_IAM_API_URL).

Debe devolver la data de la respuesta (AuthResponse ya existe en los tipos y contiene el token y el user).

3. components/LoginForm.tsx

Crea un componente de formulario funcional que cumpla con lo siguiente:

Utilizar componentes de Chakra UI v3 (Stack, Input, Button, Text).

Tener estados locales para email, password, isLoading y error.

Al hacer submit, prevenir el comportamiento por defecto y llamar a authService.loginWithEmail.

Si la petición es exitosa, recuperar la función setAuth de useAuthStore e inyectarle el token y los datos del usuario.

Si la petición falla, capturar el error y mostrar el mensaje en color rojo (red.500) debajo de los inputs.

Deshabilitar el botón de submit y mostrar un texto de carga mientras isLoading sea true.

Genera únicamente el código de estos tres archivos, asegurando buenas prácticas, tipado estricto y un diseño limpio del formulario.