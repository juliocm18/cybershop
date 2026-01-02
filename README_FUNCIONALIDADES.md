# Mall & Cyber Shop - Documentación de Funcionalidades

## 📋 Tabla de Contenidos
- [Descripción General](#descripción-general)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Módulos Principales](#módulos-principales)
- [Base de Datos](#base-de-datos)
- [Autenticación y Seguridad](#autenticación-y-seguridad)
- [Internacionalización](#internacionalización)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)

---

## 📱 Descripción General

**Mall & Cyber Shop** es una aplicación móvil multiplataforma desarrollada con React Native y Expo que integra múltiples funcionalidades:

1. **Directorio de Socios Estratégicos (S.E)**: Catálogo de empresas organizadas por categorías y ubicación geográfica
2. **Sistema de Chat**: Mensajería en tiempo real con soporte para chats grupales e individuales
3. **Media Naranja**: Sistema de matchmaking/citas para conectar usuarios
4. **Panel Administrativo**: Gestión completa de empresas, usuarios, categorías y reportes

---

## 🏗️ Arquitectura del Sistema

### Frontend
- **Framework**: React Native 0.81.5 con Expo 54
- **Navegación**: Expo Router 6.0.14
- **Estado**: Context API (AuthContext)
- **UI Components**: React Native Paper, React Native Tab View
- **Internacionalización**: i18next + react-i18next

### Backend
- **BaaS**: Supabase (PostgreSQL + Realtime + Storage + Auth)
- **Autenticación**: Supabase Auth con JWT
- **Base de Datos**: PostgreSQL con Row Level Security (RLS)
- **Almacenamiento**: Supabase Storage para imágenes y archivos multimedia

### Monitoreo
- **Crashlytics**: Firebase Crashlytics para tracking de errores
- **Analytics**: Registro de sesiones y contadores de acceso

---

## 🎯 Módulos Principales

### 1. Sistema de Ubicación y Navegación

#### Funcionalidades
- **Selección de ubicación geográfica** (`app/index.tsx`)
  - Selección de continente, país y departamento
  - Datos precargados desde JSON locales
  - Persistencia de ubicación en AsyncStorage
  - Acceso secreto al login (7 clics en el título)

#### Componentes Clave
- `LocationHome`: Pantalla inicial de selección de ubicación
- `Select`: Componente reutilizable para dropdowns
- Datos: `continents.json`, `countries.json`, `departments.json`

---

### 2. Directorio de Socios Estratégicos

#### Funcionalidades Principales
- **Visualización de empresas por categorías** (`app/home/home.tsx`)
  - Sistema de pestañas dinámicas por categoría
  - Grid de logos de empresas (4 columnas)
  - Filtrado por ubicación geográfica (país/departamento)
  - Empresas globales visibles en todas las ubicaciones
  - Sistema de prioridad para ordenamiento

- **Modal de enlaces sociales** (`app/SocialLinksModal.tsx`)
  - Visualización de redes sociales y contactos
  - Apertura de enlaces externos (WhatsApp, Facebook, Instagram, etc.)
  - Contador de clics por empresa

- **Gestión de categorías** (`app/category/`)
  - CRUD completo de categorías
  - Asignación de prioridad
  - Ordenamiento personalizado

#### Modelos de Datos
```typescript
interface Company {
  id?: number;
  key: string;
  name: string;
  package: string;
  logo: string;
  categories: string[];
  priority: number;
  is_global: boolean;
  departments: string[];
  countries?: string[];
  information?: string;
  address?: string;
}

interface CompanyLink {
  id?: number;
  url: string;
  link?: Link;
  companyId: number;
}

interface Link {
  id?: number;
  name?: string;
  icon?: string;
  prefix?: string;
}
```

---

### 3. Sistema de Chat en Tiempo Real

#### Funcionalidades
- **Chats grupales** (`app/chatroom/GroupsScreen.tsx`)
  - Creación de grupos públicos y privados
  - Sistema de roles (super_admin, admin, member)
  - Límite configurable de participantes (default: 500)
  - Invitaciones a grupos
  - Gestión de participantes (agregar/eliminar)

- **Chats individuales** (`app/chatroom/ChatRoom.tsx`)
  - Mensajes privados entre usuarios
  - Creación automática de salas 1:1
  - Aliases personalizados para contactos

- **Tipos de mensajes soportados**
  - Texto
  - Imágenes
  - PDFs
  - Videos
  - Audio
  - Ubicación

- **Funcionalidades avanzadas**
  - Reacciones a mensajes (emojis)
  - Reportes de mensajes
  - Estado en línea/última conexión
  - Indicadores de escritura
  - Drawer de usuarios en línea
  - Eliminación de mensajes

#### Componentes Principales
- `ChatRoom`: Sala de chat principal
- `GroupsScreen`: Listado de grupos
- `MessageBubble`: Burbuja de mensaje individual
- `ChatInput`: Input de mensajes con soporte multimedia
- `OnlineUsersDrawer`: Panel lateral de usuarios conectados
- `CreateGroupModal`: Modal de creación de grupos

#### Modelos de Chat
```typescript
interface Room {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  created_by: string;
  is_private: boolean;
  type: 'group' | 'individual';
  max_participants?: number;
  image_url?: string;
}

interface Message {
  id: string;
  content: string;
  created_at: string;
  room_id: string;
  user_id: string;
  recipient_id?: string;
  is_private: boolean;
  message_type: MessageType;
  media_info?: MediaInfo;
  location_info?: LocationInfo;
}

type MessageType = 'text' | 'image' | 'pdf' | 'video' | 'audio' | 'location';
```

---

### 4. Media Naranja (Sistema de Matchmaking)

#### Funcionalidades
- **Perfiles de usuario** (`app/media-naranja/`)
  - Información personal (nombre, edad, profesión)
  - Fotos múltiples (hasta 6 fotos)
  - Preferencias (género, orientación sexual)
  - Hobbies e intereses
  - Signo zodiacal
  - Descripción personal

- **Sistema de swipe**
  - Like/Nope en perfiles
  - Detección automática de matches
  - Modal de match con animación
  - Límite diario de likes (configurable)

- **Matches**
  - Visualización de matches existentes
  - Chat directo desde matches
  - Gestión de matches

#### Componentes
- `Home`: Pantalla principal de swipe
- `ProfileCard`: Tarjeta de perfil
- `ProfileDetail`: Vista detallada del perfil
- `MatchModal`: Modal de notificación de match
- `MatchProfiles`: Listado de matches

#### Lógica de Negocio
- `matchLogic.ts`: Detección de matches bidireccionales
- `likeLimitLogic.ts`: Control de límites de likes diarios

---

### 5. Panel Administrativo

#### Roles y Permisos
- **CEO**: Acceso completo
- **Superadministrador**: Acceso completo
- **Administrador**: Gestión de empresas, categorías, usuarios
- **Operador**: Gestión de empresas y categorías

#### Funcionalidades por Rol

##### Dashboard (`app/dashboard/`)
- **Indicadores de gestión** (CEO, Superadmin)
  - Total de ingresos (clics en empresas)
  - Tiempo total en la aplicación
  - Ingresos por Socio Estratégico
  - Gráficos de barras con datos por fecha
  - Selector de rango de fechas

##### Gestión de Categorías (`app/category/`)
- CRUD completo de categorías
- Asignación de prioridad
- Disponible para: CEO, Superadmin, Admin, Operador

##### Gestión de Socios Estratégicos (`app/company/gestion-socios.tsx`)
- CRUD de empresas
- Carga de logos
- Asignación de categorías múltiples
- Gestión de enlaces sociales
- Sistema de prioridad
- Paginación (50 registros por página)
- Filtrado por categoría
- Disponible para: CEO, Superadmin, Admin, Operador

##### Asignación de Territorios (`app/company/gestion-territorios.tsx`)
- Asignación de departamentos/países a empresas
- Configuración de empresas globales
- Disponible para: CEO, Superadmin, Admin

##### Gestión de Usuarios (`app/user/`)
- Listado de usuarios
- Asignación de roles
- Gestión de permisos
- Disponible para: CEO, Superadmin, Admin

##### Mensajes Reportados (`app/reported-messages.tsx`)
- Visualización de mensajes reportados
- Moderación de contenido
- Disponible para: CEO, Superadmin, Admin

##### Gestión de Contactos (`app/link/`)
- CRUD de tipos de enlaces (WhatsApp, Facebook, etc.)
- Configuración de iconos y prefijos
- Disponible para: CEO, Superadmin, Admin, Operador

---

### 6. Gestión de Usuarios y Perfiles

#### Registro de Usuarios (`app/user/registerUser.tsx`)
- Formulario completo de registro
- Campos:
  - Nombre
  - Fecha de nacimiento
  - Número de teléfono
  - Email
  - Género
  - Preferencia sexual
  - Profesión
  - Descripción
  - Signo zodiacal
  - Hobbies
  - Foto de perfil
  - Fotos adicionales (hasta 6)
  - Opt-in para Media Naranja

#### Edición de Perfil (`app/user/editProfile.tsx`)
- Actualización de información personal
- Cambio de foto de perfil
- Gestión de fotos adicionales
- Actualización de preferencias

#### Visualización de Perfil (`app/user/userProfile.tsx`)
- Vista de perfil propio
- Acceso a edición

---

## 🗄️ Base de Datos

### Tablas Principales

#### Autenticación y Usuarios
- **auth.users**: Usuarios de Supabase Auth
- **profiles**: Perfiles extendidos de usuarios
  - Información personal
  - Preferencias de Media Naranja
  - Avatar y fotos
- **user_photos**: Fotos adicionales de usuarios (hasta 6)
- **user_roles**: Relación usuarios-roles
- **roles**: Roles del sistema (CEO, Admin, etc.)

#### Empresas y Categorías
- **companies**: Socios estratégicos
- **company_links**: Enlaces sociales de empresas
- **links**: Tipos de enlaces (WhatsApp, Facebook, etc.)
- **categories**: Categorías de empresas
- **counter**: Registro de clics en empresas
- **session_logs**: Registro de sesiones de usuario

#### Chat
- **rooms**: Salas de chat (grupales e individuales)
- **messages**: Mensajes de chat
- **room_participants**: Participantes de salas
- **message_reactions**: Reacciones a mensajes
- **message_reports**: Reportes de mensajes
- **user_aliases**: Aliases personalizados entre usuarios
- **group_invitations**: Invitaciones a grupos

#### Media Naranja
- **likes**: Likes entre usuarios
- **matches**: Matches confirmados
- **like_limits**: Control de límites de likes

### Funciones de Base de Datos
- `add_private_chat_participants()`: Agrega participantes automáticamente a chats privados
- `check_max_participants()`: Valida límite de participantes en grupos
- `handle_invitation_acceptance()`: Procesa aceptación de invitaciones
- `get_company_count4()`: Obtiene conteo de clics por empresa
- `get_all_groups()`: Obtiene todos los grupos disponibles

### Row Level Security (RLS)
Todas las tablas implementan políticas RLS para:
- Control de acceso basado en roles
- Privacidad de mensajes
- Protección de datos personales
- Gestión de permisos por grupo

---

## 🔐 Autenticación y Seguridad

### Sistema de Autenticación
- **Provider**: Supabase Auth
- **Método**: Email/Password
- **Gestión de sesión**: JWT con refresh tokens
- **Persistencia**: AsyncStorage

### Context de Autenticación (`app/context/AuthContext.tsx`)
```typescript
interface AuthContextType {
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}
```

### Funcionalidades de Seguridad
- **Login** (`app/auth/login.tsx`)
  - Validación de credenciales
  - Manejo de errores
  - Redirección post-login

- **Registro** (`app/auth/signup.tsx`)
  - Creación de cuenta
  - Validación de email

- **Recuperación de contraseña** (`app/reset-password/`)
  - Envío de email de recuperación
  - Reset de contraseña

### Protección de Rutas
- Verificación de sesión activa
- Redirección a login si no autenticado
- Modales de login para funcionalidades protegidas

---

## 🌍 Internacionalización

### Idiomas Soportados
- **Español** (es) - Por defecto
- **Inglés** (en)
- **Portugués** (pt)

### Implementación (`app/i18n/`)
- **Detector de idioma**: Automático según configuración del dispositivo
- **Persistencia**: AsyncStorage
- **Selector manual**: Componente `LanguageSelector`

### Archivos de Traducción
- `translations/es.json`
- `translations/en.json`
- `translations/pt.json`

### Uso
```typescript
const { t } = useTranslation();
<Text>{t('common.welcome')}</Text>
```

---

## 🛠️ Tecnologías Utilizadas

### Core
- **React Native**: 0.81.5
- **Expo**: 54.0.22
- **TypeScript**: 5.9.2
- **Expo Router**: 6.0.14

### UI/UX
- **React Native Paper**: 5.14.5
- **React Native Tab View**: 4.1.1
- **React Native Modal**: 14.0.0
- **React Native Chart Kit**: 6.12.0
- **React Native Bouncy Checkbox**: 4.1.2

### Backend/Database
- **Supabase**: 2.49.8
- **AsyncStorage**: 2.1.2

### Media
- **Expo Image Picker**: 17.0.8
- **Expo Image Manipulator**: 14.0.7
- **Expo AV**: 16.0.7 (audio/video)
- **Expo Video**: 3.0.13
- **Expo Document Picker**: 14.0.7
- **Expo Media Library**: 18.2.0

### Localización
- **Expo Location**: 19.0.7
- **Expo Localization**: 17.0.7
- **i18next**: 25.2.1
- **react-i18next**: 15.5.2

### Utilidades
- **Expo Device**: 8.0.9
- **Expo Application**: 7.0.7
- **Expo Web Browser**: 15.0.9

### Monitoreo
- **Firebase Crashlytics**: 23.5.0
- **Firebase App**: 23.5.0

### Desarrollo
- **Expo Dev Client**: 6.0.16
- **Metro Config**: Personalizado

---

## 📊 Flujo de Usuario

### Usuario No Autenticado
1. Selección de ubicación (continente/país/departamento)
2. Acceso al menú principal
3. Navegación al directorio de empresas
4. Visualización de categorías y empresas
5. Acceso a enlaces de empresas
6. Opción de registro para funcionalidades adicionales

### Usuario Autenticado
1. Login desde menú principal o pantalla oculta
2. Acceso completo a:
   - Directorio de empresas
   - Sistema de chat
   - Media Naranja
   - Perfil personal
3. Funcionalidades sociales completas

### Administrador
1. Login administrativo
2. Acceso al panel de control
3. Gestión según rol asignado
4. Visualización de reportes y estadísticas

---

## 🎨 Componentes Reutilizables

### UI Components
- **BackButton** (`app/components/BackButton.tsx`)
  - Botón de navegación hacia atrás
  - Personalizable (ruta, estilo, icono)

- **Select** (`app/components/select.tsx`)
  - Dropdown genérico
  - Soporte para objetos con id/name

- **ConfirmationModal** (`app/components/confirmation-modal.tsx`)
  - Modal de confirmación reutilizable
  - Acciones personalizables

- **LanguageSelector** (`app/components/LanguageSelector.tsx`)
  - Selector de idioma
  - Cambio en tiempo real

- **ErrorBoundary** (`app/components/ErrorBoundary.tsx`)
  - Captura de errores de React
  - Integración con Crashlytics

### Utilidades
- **PhotoPicker** (`app/utils/PhotoPicker.ts`)
  - Selección de imágenes
  - Permisos de galería/cámara

- **safeImagePicker** (`app/utils/safeImagePicker.ts`)
  - Wrapper seguro para image picker
  - Manejo de errores

- **crashlyticsHelper** (`app/utils/crashlyticsHelper.ts`)
  - Helpers para logging de errores
  - Configuración de contexto de usuario

---

## 📱 Configuración de la Aplicación

### App Config (`app.config.json`)
- **Nombre**: Mall Cybershop
- **Slug**: mallcybershop
- **Versión**: 1.0.0
- **Orientación**: Portrait
- **Splash Screen**: Configurado
- **Icon**: assets/icon.png
- **Adaptive Icon**: Android
- **Scheme**: mallcybershop

### Plataformas
- **iOS**: Configurado con bundle identifier
- **Android**: 
  - Package: com.julioc_m18.mallcybershop
  - Google Services configurado
  - Crashlytics habilitado

### EAS Build (`eas.json`)
- Configuración para builds de desarrollo y producción
- Perfiles de build personalizados

---

## 🔄 Estado de la Aplicación

### Global State
- **AuthContext**: Estado de autenticación
- **AsyncStorage**: Persistencia local
  - Ubicación seleccionada
  - Idioma preferido
  - Orden de iconos
  - Sesión de usuario

### Realtime Features
- **Supabase Realtime**: 
  - Mensajes de chat en tiempo real
  - Estado en línea de usuarios
  - Notificaciones de matches
  - Actualizaciones de grupos

---

## 📈 Analytics y Tracking

### Métricas Registradas
- **Clics en empresas**: Tabla `counter`
- **Sesiones de usuario**: Tabla `session_logs`
- **Tiempo en aplicación**: Calculado por sesión
- **Errores**: Firebase Crashlytics

### Dashboard de Reportes
- Total de ingresos por período
- Tiempo total en aplicación
- Ingresos por Socio Estratégico
- Gráficos visuales con Chart Kit

---

## 🚀 Características Destacadas

### Performance
- **Lazy Loading**: Pestañas de categorías cargadas bajo demanda
- **Paginación**: Listados administrativos paginados
- **Optimización de imágenes**: Manipulación y compresión
- **Caché**: AsyncStorage para datos frecuentes

### UX/UI
- **Diseño responsive**: Adaptable a diferentes tamaños
- **Animaciones**: Transiciones suaves
- **Feedback visual**: Indicadores de carga
- **Temas**: Paleta de colores consistente (#ff9f61, #fb8436)

### Seguridad
- **RLS en todas las tablas**
- **Validación de permisos por rol**
- **Sanitización de inputs**
- **Protección contra inyección SQL**
- **Manejo seguro de tokens**

---

## 📝 Notas de Desarrollo

### Convenciones de Código
- TypeScript estricto
- Interfaces para todos los modelos
- Componentes funcionales con hooks
- Evitar uso de `any`
- Documentación inline cuando necesario

### Estructura de Archivos
```
app/
├── auth/           # Autenticación
├── category/       # Categorías
├── chatroom/       # Sistema de chat
├── company/        # Empresas
├── components/     # Componentes reutilizables
├── config/         # Configuración
├── context/        # Contexts de React
├── dashboard/      # Panel de control
├── data/           # Datos estáticos
├── home/           # Pantalla principal
├── i18n/           # Internacionalización
├── link/           # Enlaces
├── media-naranja/  # Sistema de matchmaking
├── role/           # Roles
├── user/           # Usuarios
└── utils/          # Utilidades
```

### Migraciones de Base de Datos
Todas las migraciones SQL están en `supabase/migrations/` con nomenclatura:
- `YYYYMMDD_descripcion.sql`
- Ejecutadas en orden cronológico
- Incluyen rollback cuando es posible

---

## 🔮 Funcionalidades Futuras (Planificadas)

Según el código comentado y estructura:
- Sistema de juegos
- Wallet/Billetera digital
- Soporte técnico integrado
- Más tipos de contenido multimedia
- Sistema de notificaciones push
- Modo offline

---

## 📞 Soporte y Contacto

Para más información sobre la aplicación o reportar problemas:
- Revisar logs en Firebase Crashlytics
- Consultar panel administrativo
- Verificar documentación de Supabase

---

**Versión del documento**: 1.0  
**Última actualización**: Enero 2026  
**Desarrollado por**: Burbit Studio
