# Fly Away Travel — Frontend Web

Frontend de la aplicación de reserva de vuelos, desarrollado para el laboratorio de la semana 14 del curso CS2031 - Desarrollo Basado en Plataformas (UTEC).

Consume el backend disponible en:
https://github.com/CS2031-DBP/cs2031-2026-1-week14-fly-away-backend

## ✅ Estado de cumplimiento de requisitos

| Funcionalidad              | Tipo         | Endpoint consumido            | Estado |
|-----------------------------|--------------|--------------------------------|:------:|
| Pantalla de Registro        | Must Have    | `POST /users/register`         | ✅ |
| Pantalla de Login           | Must Have    | `POST /auth/login`             | ✅ |
| Mostrar nombre de usuario    | Nice to Have | `GET /users/current`           | ✅ |
| Búsqueda de Vuelos          | Must Have    | `GET /flights/search`          | ✅ |
| Filtro por rango de fechas   | Nice to Have | `GET /flights/search`          | ✅ |
| Reservar un Vuelo           | Must Have    | `POST /flights/book`           | ✅ |
| Ver detalle de reserva      | Nice to Have | `GET /flights/book/{id}`       | ✅ |
| Mis Reservas                | Nice to Have | `GET /flights/book/{id}`       | ✅ |
| Logout & rutas protegidas   | Must Have    | —                               | ✅ |
| Navegación completa          | Must Have    | —                               | ✅ |

**Resumen:** todos los requisitos **Must Have** y **Nice to Have** de la rúbrica fueron implementados y probados contra el backend del repositorio del curso.

## 🚀 Cómo correr el proyecto

```bash
# 1. Clonar el repositorio
git clone https://github.com/luciano-msg/frontend-flyaway.git
cd frontend-flyaway

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno (ver .env.example)

# 4. Correr en modo desarrollo
npm run dev
```

## 📌 Notas

- El token JWT se almacena en `localStorage` tras un login exitoso.
- Las rutas protegidas redirigen automáticamente al login si no hay sesión activa.
- Se debe tener el backend corriendo localmente (o la URL configurada en las variables de entorno) para que la app funcione correctamente.
