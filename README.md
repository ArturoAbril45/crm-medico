# CRM Medico — Med-Advance

Sistema de gestion integral para clinicas, consultorios y centros de salud, con un fuerte foco en la atencion al paciente por WhatsApp. Reune en una sola plataforma la comunicacion por WhatsApp (automatica y manual), la agenda de turnos, la historia clinica, la facturacion, la administracion del personal y una tienda interna de productos medicos.

Es un sistema multi-empresa: una misma instalacion puede atender a varias clinicas al mismo tiempo, cada una con su propia informacion, su propio numero de WhatsApp y sus propios usuarios, totalmente aisladas entre si.

---

## Arquitectura: tres componentes

El sistema esta formado por tres piezas que trabajan juntas:

1. Backend (Laravel): el "cerebro". Guarda toda la informacion en la base de datos, aplica las reglas, controla los permisos, y decide que responder de forma automatica. Expone una API REST y recibe los mensajes de WhatsApp a traves de un webhook.

2. Frontend (React + Vite): el panel web. Es lo que ve y usa el equipo del centro: pantallas, listados, formularios y el editor visual de flujos.

3. Servicio de WhatsApp (Node.js + Baileys): mantiene viva la conexion con WhatsApp. Es el que realmente envia y recibe los mensajes. Se conecta como un dispositivo enlazado (igual que WhatsApp Web) escaneando un codigo QR. Soporta una sesion independiente por cada compañia.

Flujo general: el paciente escribe por WhatsApp, el servicio de Node recibe el mensaje y lo reenvia al backend (webhook), el backend identifica o crea al paciente y la conversacion y decide la respuesta automatica, y cuando corresponde responde pidiendole al servicio de Node que envie el mensaje.

---

## Stack tecnologico

- Backend: PHP 8.3, Laravel 13. Autenticacion con token propio. Multi-tenant (aislamiento por compañia).
- Frontend: React con Vite, React Router, React Query.
- Servicio de WhatsApp: Node.js, Express, Baileys (@whiskeysockets/baileys), qrcode, axios, pino.
- Inteligencia artificial: proveedor configurable (OpenAI / Anthropic), la clave se guarda en la base de datos desde el panel, no en el codigo.

---

## Estructura de carpetas

```
CRM_medico/
  backend/                         API en Laravel
    app/
      Models/                      ~50 modelos de datos (ver abajo)
      Http/Controllers/Api/        Controladores de la API
      Http/Middleware/             Autenticacion por token y resolucion de compañia (multi-tenant)
      Services/                    Logica central: motor de flujos, cliente de WhatsApp, bot de IA
    routes/
      api.php                      ~122 endpoints de la API
    database/
      migrations/                  Estructura de las tablas
      seeders/                     Carga inicial de datos
      database.sqlite              Base de datos (NO se incluye en el repo)
    .env.example                   Ejemplo de variables de entorno

  frontend/                        Panel web en React (Vite)
    src/
      pages/                       Pantallas principales y por area:
        clinica/                   Modulos de la clinica
        finanzas/                  Facturacion y caja
        herramientas/              Herramientas y configuracion avanzada
        marketplace/               Tienda interna
      components/
        Layout.jsx                 Menu lateral y estructura del panel
        flow/                      Editor visual de flujos (nodos, conexiones, panel)
        bandeja/                   Bandeja de entrada de WhatsApp
      services/                    Cliente de la API
      lib/, context/               Utilidades y estado global

  whatsapp-service/                Servicio de WhatsApp en Node.js
    index.js                       Servidor Express + conexion Baileys (QR, envio, recepcion, webhook)
    baileys-buttons.cjs            Helper para menus interactivos (botones y listas)
    auth_session/                  Credenciales de sesion por compañia (NO se incluye)
    media_recibida/                Archivos recibidos por WhatsApp (NO se incluye)
    .env.example                   Ejemplo de variables de entorno
```

---

## Modulos del sistema (detallado)

El panel esta organizado en seis areas, mas una seccion de administracion.

### Panel de Control

Pantalla de inicio con un resumen del estado del centro: turnos, actividad reciente, conversaciones pendientes y los numeros mas importantes del dia.

### CRM y atencion por WhatsApp

- Contactos: lista de todas las personas registradas (pacientes y contactos potenciales), con datos, estado, etiquetas y notas.
- Bandeja de Entrada: centro de atencion por WhatsApp. Muestra todas las conversaciones; cada una se puede tomar, responder, devolver o resolver. Incluye respuestas rapidas, adjuntar archivos y sugerencia de respuesta por inteligencia artificial.
- Campañas: preparar y enviar mensajes a varios contactos.
- Transmision: envio masivo de un mismo mensaje a una lista.
- Automatizacion: respuestas automaticas por palabra clave (se activan y desactivan).
- Flujos de Conversacion: editor visual que arma conversaciones guiadas con bloques (inicio, contenido, menu, condicion, accion). Permite construir, por ejemplo, un asistente que ofrece un menu y guia al paciente para agendar.
- Configuracion: conexion del WhatsApp (QR, estado de conexion) y ajustes de comunicacion.

### Clinica Medica

- Pacientes: ficha clinica, historial, archivos y notas.
- Turnos: agenda de citas con vista de calendario.
- Medicos: profesionales, especialidad y disponibilidad. Puede vincularse con Google Calendar.
- Horarios: dias y franjas de atencion de cada profesional.
- Control de Sala: seguimiento de los pacientes en espera.
- Monitor TV: pantalla para mostrar en un televisor en la sala de espera.
- Consultas: registro y seguimiento de las atenciones (presentarse, atender, completar).
- Departamentos: areas o servicios del centro.
- Informes de Imagenes: informes de estudios por imagenes.
- Psiquiatria y Psicologia: registros clinicos especializados por sesion.

### Finanzas

- Facturacion y Convenios: obras sociales y prepagas, prestaciones y practicas facturables, generacion de presentaciones para el cobro y calculo de honorarios por profesional.
- Cierre de Caja: control diario de ingresos (cerrar y reabrir caja).

### Marketplace (tienda interna)

- Mi Tienda, Tienda Digital y Tienda Medica: catalogos y venta de productos.
- Proveedores: registro de proveedores.
- Mi Carrito y Mis Pedidos: compras y seguimiento de pedidos.
- Cotizaciones: presupuestos de productos.

### Herramientas

- Metodos de Pago: formas de cobro disponibles.
- RRHH: empleados y licencias.
- AFIP: facturacion electronica (organismo fiscal de Argentina).
- Medicina Laboral y ART: control de medicina laboral y siniestros de ART.
- WhatsApp AI Bot: configuracion del asistente de inteligencia artificial (proveedor, modelo, prompt, clave de API).
- Plantillas de Informes: modelos predefinidos para generar informes.
- Ajustes Globales: configuracion general de la compañia.
- Academy: publicaciones o contenidos internos (crear, votar, moderar).

### Administracion

- Compañias: alta y gestion de las clinicas dentro del sistema (multi-empresa).
- Usuarios y Roles: cada persona entra con su usuario y ve solo lo que su rol permite.
- Modelos: plantillas de mensajes reutilizables.

---

## Como funciona la atencion por WhatsApp

### Conexion

El servicio de Node (`whatsapp-service/index.js`) usa Baileys para conectarse a WhatsApp por el protocolo multi-dispositivo. Al iniciar una sesion muestra un codigo QR; se escanea desde el telefono del centro (WhatsApp, Dispositivos vinculados). Cada compañia tiene su propia carpeta de credenciales en `auth_session/<companiaId>/` y su propia sesion en memoria.

Endpoints del servicio de Node: `/status`, `/qr`, `/disconnect`, `/send` (texto), `/send-media` (imagen/audio/documento/video) y `/send-list` (menu con lista de opciones). Cada peticion opera sobre la sesion de la compañia indicada por cabecera.

### Mensaje entrante

Cuando llega un mensaje, el servicio de Node:

1. Descarta grupos y estados.
2. Si el contacto eligio una opcion de un menu, traduce el id de la opcion al texto real.
3. Descarga y guarda el archivo si el mensaje trae media.
4. Envia los datos al backend mediante el webhook `POST /api/whatsapp/webhook`.

El backend, en ese webhook: fija la compañia (multi-tenant), identifica o crea el paciente por su telefono (los contactos nuevos quedan como potenciales con fuente WhatsApp), abre o retoma la conversacion, y pasa el mensaje al motor de flujos (`FlowEngine`), que decide la respuesta automatica (palabra clave, flujo o sugerencia de IA).

### Menus interactivos (botones y listas)

La integracion con WhatsApp se realiza a traves del servicio dedicado `whatsapp-service`, que envia y recibe mensajes y menus interactivos (botones y listas). Para un entorno de produccion, la via recomendada es la API oficial de WhatsApp Business (Meta Cloud API), que soporta de forma nativa los menus interactivos.

---

## Como levantarlo en local

Requisitos: PHP 8.3, Composer, Node.js 18 o superior, y una base de datos (MySQL o SQLite).

### 1. Backend (Laravel)

```
cd backend
composer install
copiar .env.example a .env
php artisan key:generate
(configurar la conexion a la base de datos en .env)
php artisan migrate
php artisan serve
```

Queda en `http://localhost:8000`.

### 2. Frontend (React)

```
cd frontend
npm install
(configurar VITE_API_URL apuntando al backend, por ejemplo http://localhost:8000/api)
npm run dev
```

### 3. Servicio de WhatsApp (Node)

```
cd whatsapp-service
npm install
copiar .env.example a .env
```

Variables principales del servicio (`.env`):

- `PORT` — puerto del servicio (por defecto 3300).
- `LARAVEL_WEBHOOK_URL` — URL del webhook del backend (por defecto `http://localhost:8000/api/whatsapp/webhook`).
- `SERVICE_TOKEN` — token compartido entre el servicio y el backend para autenticar las peticiones.
- `PUBLIC_BASE_URL` — URL publica del servicio para servir los archivos recibidos.

Luego:

```
node index.js
```

Con los tres componentes corriendo, se entra al panel web, se va a Configuracion y se conecta el WhatsApp escaneando el QR. A partir de ahi el sistema empieza a recibir y responder mensajes.

Nota: el servicio de WhatsApp se conecta hacia afuera, por lo que no requiere abrir puertos ni una direccion publica para funcionar. Debe mantenerse encendido para que los mensajes se procesen.

---

## Modelos de datos principales

Algunos de los modelos del backend (`backend/app/Models`): Compania, User, Role, Permiso, Paciente, NotaPaciente, PacienteArchivo, Cita, Medico, HorarioMedico, Departamento, Conversacion, Mensaje, Flujo, Bloque, BloqueEdge, CarpetaFlujo, Automatizacion, Campana, Transmision, RespuestaRapida, ModeloMensaje, ConfiguracionIaBot, Pago, MetodoPago, CierreCaja, Convenio, Prestacion, PracticaFacturable, Presentacion, ComprobanteAfip, ConfiguracionAfip, SiniestroArt, Empleado, LicenciaEmpleado, ProductoMarketplace, ProveedorMkt, PedidoMkt, Cotizacion, CarritoItem, InformeImagen, PlantillaInforme, PsicologiaRegistro, PsiquiatriaRegistro, PublicacionAcademy.

---

## Notas de seguridad

Por decision de este repositorio NO se incluyen:

- Los archivos `.env` de ninguno de los tres componentes (claves, tokens y configuracion).
- La base de datos `backend/database/database.sqlite` (datos reales de pacientes).
- La carpeta `whatsapp-service/auth_session` (credenciales de la sesion de WhatsApp).
- La carpeta `whatsapp-service/media_recibida` (archivos recibidos de los pacientes).

La clave de API de inteligencia artificial no esta en el codigo: se carga desde el panel (Herramientas, WhatsApp AI Bot) y se guarda en la base de datos.
