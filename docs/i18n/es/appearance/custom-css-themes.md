# Temas de CSS personalizado (Theme Library)

Esta guía explica cómo cambiar el aspecto completo de Marinara Engine con un tema de CSS personalizado. Aprenderás a crear, importar, exportar y activar temas. También verás qué variables de CSS puedes cambiar y cómo funcionan los temas junto con Card CSS.

## Qué es un tema personalizado

Un tema personalizado es un bloque de CSS que vuelve a pintar Marinara. CSS, abreviatura de Cascading Style Sheets, es el código que define los colores, los bordes y el espaciado en toda la app. Un tema puede cambiar el fondo de la página, el color de acento, las tarjetas, los bordes, el texto y más.

Los temas personalizados viven en la **Theme Library** (Biblioteca de temas). Se guardan en tu servidor de Marinara, así que se sincronizan con todos los dispositivos y navegadores que se conectan al mismo servidor. Esto es distinto de la mayoría de los demás ajustes de apariencia, que permanecen en un solo dispositivo. Para los ajustes por dispositivo, consulta la guía [Appearance Settings](appearance-settings.md).

Solo puede haber un tema personalizado activo a la vez. Puedes mantener tantos temas como quieras en tu biblioteca y alternar entre ellos.

## Dónde encontrar la Theme Library

1. Abre **Settings** (Configuración).
2. Abre la pestaña **Addons**.
3. Busca la sección **Theme Library**.

La sección se titula **Theme Library** y dice "Create, import, activate, edit, export, or remove custom CSS themes."

## Crear un tema

1. En la sección **Theme Library**, haz clic en **Create Theme**.
2. Escribe un nombre en el campo **Theme name**.
3. Escribe o pega tu CSS en el cuadro de texto grande.
4. Deja **Preview** activado para ver tus cambios en vivo en la app mientras escribes. Desactiva **Preview** para detener la vista previa en vivo.
5. Haz clic en **Save**.

Un tema nuevo parte de una plantilla. La plantilla enumera variables comunes como ejemplos comentados, así que puedes quitar las marcas de comentario y poner tus propios valores. Cuando guardas un tema completamente nuevo, Marinara lo activa de inmediato. También muestra una confirmación con el nombre del tema, como: Theme "My Theme" saved and activated.

Para cambiar un tema más adelante, búscalo en la lista **Installed Themes**. Haz clic en el icono de código (su tooltip dice **Edit theme CSS**), haz tus cambios y haz clic en **Save**. Editar un tema guardado lo actualiza, pero no cambia qué tema está activo.

## Importar y exportar temas

Puedes compartir temas como archivos. Esto es útil para mover un tema entre servidores o dárselo a un amigo.

Para importar un tema:

1. Haz clic en **Import File** en la sección **Theme Library**.
2. Elige un archivo `.css` o un archivo `.json`.
3. Lee el mensaje de aviso (toast). Informa cuántos temas se importaron, se omitieron o fallaron.

Un archivo `.css` se convierte en un tema, con el nombre del archivo. Un archivo `.json` puede contener uno o varios temas, y viene en dos tipos.

El primer tipo es un archivo exportado desde Marinara. Envuelve cada tema en campos adicionales que Marinara agrega al exportar. No necesitas leerlo ni editarlo. Importa el archivo tal cual.

El segundo tipo es un archivo pequeño que escribes tú mismo. Para un solo tema, esto es suficiente:

```
{ "name": "My Theme", "css": "..." }
```

Los temas importados se sincronizan con tu servidor, pero no se activan por sí solos. Un tema que ya existe en el servidor, con el mismo nombre y el mismo CSS, se omite en lugar de agregarse dos veces.

Para exportar un tema, búscalo en la lista **Installed Themes** y haz clic en el icono de subir (su tooltip dice **Export theme**). Marinara descarga un archivo `.json` que puedes importar en otro lugar.

## Activar un tema

La lista **Installed Themes** muestra todos los temas, más una entrada **Default Theme** en la parte superior.

1. Haz clic en el nombre de un tema para activarlo. Una marca de verificación muestra el tema activo.
2. Haz clic en **Default Theme** para desactivar la temática personalizada y volver al aspecto integrado de Marinara.

El botón **Reset Appearance** está en la parte superior de la sección **App Style**, en **Settings -> Appearance**. También desactiva el tema personalizado activo cuando lo usas.

Para eliminar un tema de forma definitiva, haz clic en el icono de papelera en su fila (su tooltip dice **Remove theme**) y luego confirma en la ventana **Delete Theme**. Esto elimina permanentemente el CSS del tema del servidor.

## La referencia de variables de CSS

El editor de temas tiene una sección plegable **CSS Variable Reference**. Haz clic en ella para ver las variables más útiles que puedes sobrescribir. Un tema cambia la app al definir estas variables en un bloque `:root`. La referencia enumera estas variables:

| Variable | Qué controla |
| --- | --- |
| `--background` | Fondo de la página |
| `--foreground` | Texto principal |
| `--primary` | Acento y botones |
| `--primary-foreground` | Texto sobre el color primario |
| `--secondary` | Tarjetas y campos de entrada |
| `--card` | Fondo de las tarjetas |
| `--border` | Bordes |
| `--muted-foreground` | Texto atenuado |
| `--sidebar` | Fondo de la barra lateral |
| `--sidebar-border` | Borde de la barra lateral |
| `--marinara-shell-edge-border` | Borde del margen izquierdo y derecho |
| `--destructive` | Error y eliminación |
| `--popover` | Fondo del menú desplegable |
| `--accent` | Resaltados al pasar el cursor |

No te limitas a esta lista. Un tema puede definir cualquier variable de CSS que use Marinara, y también puede agregar otros estilos personalizados.

Algunos efectos visuales tienen sus propias variables. Por ejemplo, un tema puede solicitar la animación de pulso del acento definiendo `--marinara-theme-accent-pulse: enabled`.

El CSS de un tema personalizado se limpia antes de ejecutarse, por seguridad. Los estilos que cargan un archivo desde otro sitio web no funcionan. Para usar una imagen o una fuente dentro de un tema, incrústala como una URI `data:` en lugar de un enlace web. Una URI `data:` contiene el contenido del archivo directamente dentro del CSS.

## Límites de tamaño y nombre

El nombre de un tema puede tener hasta 200 caracteres. El contenido de CSS puede tener hasta 256 KiB, medido en bytes UTF-8 en lugar de caracteres. Un tema más grande que eso se rechaza cuando lo guardas o lo importas.

## Acceso de administrador para instalaciones remotas

Crear, editar, importar, activar y eliminar un tema son acciones protegidas. Esto importa solo cuando abres Marinara a través de una red.

Si abres Marinara en la misma computadora que ejecuta el servidor, usando loopback (también llamado localhost), estas acciones simplemente funcionan. Si abres Marinara desde otro dispositivo, como un teléfono o una computadora de tu red, el servidor necesita primero un secreto de administrador.

Para gestionar temas a través de una red:

1. En el servidor, define `ADMIN_SECRET` en el archivo `.env`.
2. En la app, abre **Settings -> Advanced -> Admin Access** e ingresa el mismo valor.

Sin esto, los cambios de tema a través de una red fallan. Para la configuración completa, consulta la [Server Configuration Reference](../CONFIGURATION.md) y la [guía de Remote Access](../REMOTE_ACCESS.md).

## Cómo funcionan juntos los temas y Card CSS

Marinara tiene dos formas de agregar CSS personalizado. Son funciones separadas y ambas pueden estar activas a la vez.

Un tema personalizado vuelve a pintar toda la app. Tiene permiso para sobrescribir las variables base de Marinara, usar `!important` y usar `position: fixed`. Ese es el propósito de un tema.

Card CSS es diferente. Quien crea un personaje o una persona puede incrustar CSS en una tarjeta, y tú lo activas por chat. Card CSS se limpia de forma más estricta. No puede sobrescribir las variables base de la app, se elimina `!important` y `position: fixed` se convierte en `position: absolute`. Da estilo a los mensajes del chat, no a toda la app. Consulta la [Card CSS Theming Guide](card-css-theming.md).

Si la app se ve mal, vale la pena revisar tanto un tema activo como Card CSS. Cualquiera de los dos podría ser la causa.

## Guías relacionadas

- [Card CSS Theming Guide](card-css-theming.md)
- [Appearance Settings](appearance-settings.md)
- [Server Configuration Reference](../CONFIGURATION.md)
- [Remote Access: Basic Auth and IP Allowlist](../REMOTE_ACCESS.md)
