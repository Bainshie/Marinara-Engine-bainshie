# Extensiones personales

Las extensiones personales son borradores de código privados que Professor Mari crea para ti. Abre **Settings** (Configuración) > **Addons** > **Personal Extensions**.

El mensaje predeterminado es:

> Ask Professor Mari to create an extension for you. Nothing runs until you enable it and approve the exact code hash.

No hay una acción de nuevo borrador ni controles de importación en esta sección. Pídele a Professor Mari que cree o modifique un borrador. Ella puede guardar código, pero no puede aprobarlo ni activarlo.

## Revisar y activar

Cada borrador empieza desactivado. Marinara toma la huella del código ejecutable exacto con SHA-256. Abre el borrador, inspecciona el código, compara el hash que se muestra y luego elige **Review and Run** (Revisar y ejecutar) solo si aceptas esa versión exacta. Cualquier edición ejecutable o revisión restaurada desactiva la extensión y exige una nueva aprobación.

El aislamiento en un sandbox reduce los permisos; no hace que un código arbitrario sea confiable. Una extensión maliciosa todavía puede malgastar CPU hasta que el watchdog la detenga, saturar su propio almacenamiento dentro de los límites impuestos o comportarse de forma engañosa a través de los registros. Revisa siempre el código antes de activarlo.

## Aislamiento en tiempo de ejecución

Una extensión de navegador (Browser Extension) se ejecuta en un Worker dedicado dentro de un iframe con sandbox de origen opaco. No puede acceder a la página de Marinara, ni al DOM, cookies, almacenamiento del navegador, APIs de origen o red. Sus capacidades son: almacenamiento privado de la extensión, registro, temporizadores gestionados, registro de limpieza, ventanas restringidas y espacios seguros de contribución al host.

Las extensiones pueden añadir acciones a la barra superior, elementos al menú Extensions y paneles persistentes en el lado derecho con `marinara.ui.registerContribution(...)`. Marinara representa estas superficies usando el tema activo y un conjunto fijo de controles: encabezados, texto, salida preformateada, botones, campos de texto, selectores, interruptores, controles deslizantes, controles de color y espaciadores. Una extensión aporta contenido y estado, nunca HTML, CSS, URLs, componentes de React ni manejadores de eventos del host.

Estas capacidades y reglas de interfaz son idénticas para toda extensión de navegador, sin importar su origen. Una extensión de terceros (External) importada obtiene la misma API de contribución una vez que supera las autorizaciones de `.env` y de la Danger Zone más la aprobación de hash exacto. Aun así no puede alcanzar el DOM ni las APIs de Marinara.

### Añadir un panel representado por Marinara

```js
const panel = marinara.ui.registerContribution({
  id: "weather-settings",
  kind: "panel",
  label: "Weather controls",
  description: "Tune a weather scene without leaving Marinara.",
  icon: "sparkles",
  elements: [
    { kind: "heading", text: "Atmosphere" },
    {
      kind: "select",
      id: "weather",
      label: "Weather",
      value: "rain",
      options: [
        { value: "rain", label: "Rain" },
        { value: "snow", label: "Snow" },
        { value: "aurora", label: "Aurora" },
      ],
    },
    { kind: "slider", id: "intensity", label: "Intensity", min: 0, max: 100, value: 60 },
    { kind: "toggle", id: "lightning", label: "Lightning", checked: false },
    { kind: "color", id: "tint", label: "Tint", value: "#6d8cff" },
    { kind: "button", id: "apply", label: "Apply" },
  ],
  onActivate: async () => {
    const settings = await marinara.storage.get();
    // Update the panel when stored state should be reflected in the controls.
  },
  onEvent: async ({ elementId, values }) => {
    if (elementId !== "apply") return;
    await marinara.storage.patch(values);
  },
});

marinara.onCleanup(() => panel.remove());
```

Usa `kind: "button"` para una acción compacta en la barra superior o el menú Extensions, y `kind: "menu-item"` para una acción solo de menú. Ambas invocan `onActivate`. Un `panel` invoca `onActivate` al abrirse; sus botones invocan `onEvent` con los valores actuales de cada control del panel. El identificador devuelto admite `update({ label?, description?, icon?, elements? })` y `remove()`. Los IDs pueden contener letras, números, `.`, `_` y `-`.

Las herramientas complejas pueden construir interfaces de varios pasos actualizando los elementos del panel después de un evento. Mantén el estado de la aplicación en `marinara.storage`; no lo codifiques en el marcado.

### Adaptación de extensiones antiguas

Los controladores de clima, los editores de prompt y otros flujos de trabajo sustanciales son casos de uso válidos de contribución. Sus adaptaciones seguras pueden usar un lanzador de menú o de barra superior más paneles que se actualizan de forma progresiva. Los paquetes existentes que inyectan superposiciones en el DOM, consultan selectores CSS de Marinara, recorren los internos de React o llaman a rutas `/api` del mismo origen no se pueden importar sin cambios al entorno de ejecución seguro.

Las contribuciones de interfaz proporcionan la interfaz, no permisos ambientales. Las funciones que necesitan chats, presets, lorebooks, personajes, personas o efectos visuales de escena también necesitan una capacidad de intermediación (broker) dedicada que Marinara exponga y que el usuario apruebe explícitamente. Hasta que esa capacidad exista, una extensión no debe simularla mediante acceso al DOM del host ni peticiones de red sin restricciones.

La API más antigua `marinara.ui.showWindow(...)` sigue disponible para una ventana temporal dentro del iframe de origen opaco. Usa los mismos controles fijos y devuelve identificadores `update(...)` y `close()`. Prefiere las contribuciones cuando la herramienta deba ser accesible a través de la navegación normal de Marinara.

Una extensión de servidor (Server Extension) se ejecuta en un proceso de Node aparte, con permisos restringidos, dentro de macOS Seatbelt o Linux Bubblewrap. No puede acceder a los archivos de Marinara, a los archivos del usuario, a los secretos heredados del servidor, a la red, a procesos hijos, a workers ni a complementos nativos. Si Marinara no puede establecer un sandbox del sistema operativo compatible, las extensiones de servidor permanecen desactivadas.

### Compatibilidad de plataformas

Las extensiones de navegador las aísla el propio navegador en un sandbox, así que funcionan en todas partes. Las extensiones de servidor necesitan un sandbox del sistema operativo compatible; donde no existe, permanecen desactivadas y no se pueden activar; Marinara nunca recurre a ejecutarlas sin sandbox.

| Plataforma              | Extensiones de navegador | Extensiones de servidor               |
| ----------------------- | ------------------ | ------------------------------------- |
| macOS                   | ✅ En sandbox       | ✅ En sandbox (Seatbelt)               |
| Linux (con Bubblewrap) | ✅ En sandbox       | ✅ En sandbox (Bubblewrap)             |
| Linux (sin `bwrap`) | ✅ En sandbox       | ⛔ Desactivadas — instala `bwrap`         |
| Windows                 | ✅ En sandbox       | ⛔ Desactivadas — usa una extensión de navegador |
| Android                 | ✅ En sandbox       | ⛔ Desactivadas — usa una extensión de navegador |

En Windows y Android no hay un sandbox de procesos del sistema operativo compatible, así que las extensiones de servidor no están disponibles por diseño. Usa una extensión de navegador en su lugar, o ejecuta el servidor de Marinara en macOS o Linux (con `bwrap`) si necesitas una extensión de servidor.

## Extensiones externas

Las importaciones de terceros están bloqueadas y ocultas de forma predeterminada. Se requieren dos pasos:

1. En el host de Marinara, establece `ENABLE_EXTERNAL_EXTENSIONS=true` en `.env`.
2. Abre **Settings** > **Advanced** > **Danger Zone**, desplázate por debajo de los controles de eliminación de datos, lee la advertencia y activa **Allow third-party extension imports** (Permitir importaciones de extensiones de terceros).

Solo entonces **Settings** > **Addons** muestra **External Extensions** con controles de importación de archivos y carpetas. Los formatos compatibles siempre se muestran expandidos:

- paquetes `.personal-extension.zip` y `.zip` compatibles;
- manifiestos `.json`;
- `.css`;
- `.js`, `.mjs` y `.cjs`;
- `.server.js`, `.server.mjs` y `.server.cjs`.

Las importaciones nunca traen aprobación y no pueden activarse por sí mismas. Los registros antiguos, importados de un perfil, almacenados manualmente y de origen desconocido también se tratan como externos. Permanecen ocultos, no se pueden aprobar y quedan excluidos de ambos entornos de ejecución hasta que ambas puertas estén abiertas.

Desactivar cualquiera de las dos puertas detiene los procesos de servidor externos activos, elimina los workers del navegador y desactiva los registros externos almacenados. Volver a abrir las puertas no los ejecuta de nuevo automáticamente.

Las extensiones de terceros pueden contener código malicioso o peligroso. Inspecciona siempre cada línea antes de descargarla, importarla o activarla. Procedes por tu entera responsabilidad.

## Exportación, revisiones y recuperación

Usa la acción de exportar de una extensión para descargar un paquete portátil. Los paquetes exportados y restaurados permanecen desactivados. Restaurar una revisión también la devuelve a un borrador desactivado.

Si una extensión se comporta mal, elige **Disable** (Desactivar). Si la interfaz no está disponible, detén Marinara y establece el valor `enabled` del registro `installed_extensions` correspondiente en `"false"`. Nunca establezcas `approvedHash` a mano.

## Guías relacionadas

- [Professor Mari](../home/professor-mari.md)
- [Configuración del servidor](../CONFIGURATION.md)
- [Copia de seguridad y restauración](../data/backup-and-restore.md)
- [Acceso remoto](../REMOTE_ACCESS.md)
