# Emojis personalizados, stickers y GIF

Esta guía cubre las imágenes extra que puedes agregar a un chat en Conversation Mode: emojis personalizados, stickers personalizados y GIF buscados. También explica cómo controlar qué emojis y stickers personalizados puede usar el personaje en sus respuestas.

Estas herramientas funcionan solo en Conversation Mode. Los modos Roleplay y Game usan el selector de emojis simple, sin emojis personalizados, sin stickers y sin búsqueda de GIF.

## Dónde encontrar estas herramientas

En un chat en Conversation Mode, mira la barra de entrada de mensajes. Hay un botón redondo con un icono de cara sonriente, con la etiqueta **Emoji, GIFs & stickers**. Haz clic en él para abrir un pequeño panel encima de la barra de entrada.

El panel tiene estas pestañas:

- **Emoji**: la cuadrícula de emojis estándar, más una pestaña de estrella con la etiqueta **Custom emojis** (Emojis personalizados) para tus imágenes subidas.
- **GIFs**: búsqueda de GIF en vivo.
- **Stickers**: tus stickers subidos.

También aparece una pestaña **Tools** (Herramientas) cuando otras herramientas de entrada están activadas. En el teléfono, las mismas pestañas se abren en un panel encima del teclado.

## Emojis personalizados

Un emoji personalizado es una imagen pequeña que subes una vez y reutilizas en cualquier chat de Conversation. En un mensaje lo escribes como un shortcode, que es el nombre del emoji envuelto entre dos puntos, como `:kekw:`.

Los emojis personalizados se comparten en todo tu perfil. Los subes una sola vez y luego los usas en todas partes.

### Subir un emoji personalizado

1. Abre el panel **Emoji, GIFs & stickers** y ve a la pestaña **Emoji**.
2. Haz clic en la pestaña de estrella con la etiqueta **Custom emojis**.
3. Haz clic en **Upload** (Subir) y elige uno o más archivos de imagen.
4. En la ventana **Name this emoji** (Nombra este emoji), escribe un nombre y haz clic en **Add** (Agregar).

Deberías ver aparecer el nuevo emoji en la cuadrícula **Custom emojis**.

Los nombres de emoji siguen reglas estrictas. Un nombre tiene de 1 a 32 caracteres. Solo puedes usar letras minúsculas, números y guiones bajos. Si escribes espacios o mayúsculas, la app limpia el nombre por ti. Por ejemplo, pasa las letras a minúsculas y convierte los demás caracteres en guiones bajos.

La imagen de un emoji personalizado no puede superar los 256 por 256 píxeles. La app lo verifica cuando subes. Los nombres deben ser únicos entre todos tus emojis personalizados. Si eliges un nombre que ya está en uso, ves un error como `An emoji named ":name:" already exists.`

Puedes subir un archivo GIF animado como emoji personalizado. Se reproduce animado en el chat. Esto es distinto de la pestaña **GIFs** que se describe más abajo.

### Usar un emoji personalizado

Haz clic en cualquier ficha de la cuadrícula **Custom emojis** para colocar su shortcode en tu mensaje. Esto no envía el mensaje, solo inserta el texto. También puedes escribir el shortcode a mano, por ejemplo `:kekw:`. Escribe el nombre en minúsculas, tal como lo guardaste.

### Renombrar, eliminar, exportar e importar

Haz clic en **Edit** (Editar) en la parte superior de la pestaña **Custom emojis** para activar el modo de edición.

En el modo de edición:

- Haz clic en una ficha para abrir la ventana **Rename emoji** (Renombrar emoji), luego haz clic en **Rename** (Renombrar).
- Haz clic en la pequeña insignia de papelera de una ficha para eliminar ese emoji. La ventana **Delete emoji** (Eliminar emoji) advierte que los mensajes que ya lo usaron mostrarán el texto simple en su lugar.
- Haz clic en **Export** (Exportar) para descargar todos tus emojis personalizados como un archivo llamado `marinara-custom-emojis.json`. Este archivo contiene las imágenes dentro de sí, así que es totalmente portátil.
- Haz clic en **Import** (Importar) para cargar un archivo exportado antes. La importación omite los emojis que no cumplen las reglas de nombre o tamaño, o que chocan con un nombre existente.

## Stickers personalizados

Un sticker personalizado funciona como un emoji personalizado, pero para imágenes más grandes. Escribes un sticker como `sticker:name:`, y siempre se muestra como una imagen grande en bloque en su propia línea.

Abre la pestaña **Stickers** en el mismo panel. Subir, nombrar, renombrar, eliminar, exportar e importar funcionan igual que con los emojis, con estas diferencias:

- La ventana de subida se titula **Name this sticker** (Nombra este sticker).
- La imagen de un sticker no puede superar los 512 por 512 píxeles.
- Los nombres de sticker son únicos entre todos tus stickers. Un duplicado muestra `A sticker named "sticker:name:" already exists.`
- Las exportaciones descargan un archivo llamado `marinara-custom-stickers.json`.

### Enviar un sticker

Haz clic en una ficha de sticker en la cuadrícula. Una ventana **Send sticker** (Enviar sticker) te pregunta cómo quieres usarlo, con dos opciones:

- **Send & reply** (Enviar y responder): publica el sticker como su propio mensaje de inmediato y deja que el personaje responda.
- **Add to message** (Agregar al mensaje): coloca el texto `sticker:name:` en tu mensaje para que puedas seguir escribiendo.

## Búsqueda de GIF (Giphy)

La pestaña **GIFs** busca en Giphy, una gran biblioteca de GIF en línea. Escribe en el cuadro de búsqueda para encontrar GIF, o explora la lista de tendencias. Haz clic en un GIF para enviarlo al chat.

### La búsqueda de GIF necesita una key

La búsqueda de GIF necesita una API key gratuita de Giphy. Una API key (clave de API) es un código secreto que permite a Marinara Engine comunicarse con el servicio de Giphy en tu nombre. Sin una key, la pestaña **GIFs** muestra una tarjeta de configuración en lugar de resultados.

Para configurar la búsqueda de GIF:

1. Abre el Giphy Developer Dashboard en `https://developers.giphy.com/dashboard/`.
2. Crea una API key gratuita para una app web.
3. Agrega la key a tu archivo `.env`. Este es el archivo de configuración del servidor de Marinara.

Agrega una línea como esta a `.env`:

```
GIPHY_API_KEY=your_key_here
```

Después de agregar la key, reinicia Marinara. Para una explicación completa del archivo `.env`, consulta la guía de configuración del servidor enlazada más abajo.

### Clasificación de contenido de los GIF

Los resultados de GIF usan la clasificación de contenido para adultos de Giphy. Esto es fijo y no se puede cambiar en la app. Los resultados pueden incluir GIF sugerentes o para adultos, así que busca teniendo eso en cuenta. No hay una fuente de GIF sin conexión ni de solo contenido seguro.

## Etiquetar una imagen de la galería como emoji o sticker

Puedes etiquetar cualquier imagen ya guardada en una Character Gallery (galería del personaje) o Persona Gallery (galería de la persona) como emoji o sticker personalizado. Una imagen de galería etiquetada queda limitada a ese único personaje o persona. Funciona solo en chats que los incluyen.

Para etiquetar una imagen de la galería:

1. Abre el **Character Editor** (Editor del personaje) o el **Persona Editor** (Editor de la persona).
2. Ve a la pestaña **Gallery** (Galería) y abre la subpestaña **Images** (Imágenes).
3. Pasa el cursor sobre una imagen y haz clic en el pequeño botón de etiqueta en su esquina superior izquierda.
4. Elige **Make emoji** (Convertir en emoji) o **Make sticker** (Convertir en sticker).
5. En la ventana **Custom Emoji** o **Custom Sticker**, escribe un nombre.

Deberías ver que el botón de etiqueta cambia para mostrar el nombre asignado.

Aquí aplican los mismos límites de tamaño. **Make emoji** tiene un tope de 256 por 256 píxeles y **Make sticker** tiene un tope de 512 por 512 píxeles. Si una imagen es demasiado grande para el tipo que elegiste, ves un aviso de error rojo.

Para cambiar una imagen etiquetada más tarde, haz clic de nuevo en su botón de etiqueta. El menú ofrece **Rename** (Renombrar), una opción de cambio como **Switch to sticker** (Cambiar a sticker) y una opción de quitar como **Remove emoji** (Quitar emoji). Etiquetar no mueve ni copia la imagen, también sigue siendo una imagen normal de la galería.

## Preferencias de selección

Marinara puede indicarle al personaje que responde cuáles de tus emojis y stickers personalizados puede usar en su respuesta. Esto lo controlas con **Selection preferences** (Preferencias de selección).

Para abrir el panel, haz clic en el icono de engranaje con la etiqueta **Selection preferences**. Se encuentra en la parte superior de la pestaña **Custom emojis** y de la pestaña **Stickers**. Ambos abren el mismo ajuste. Este ajuste se guarda por chat, así que cada chat puede diferir.

El panel tiene una fila de modo con tres opciones:

- **Semantic** (Semántico, el predeterminado): ofrece los emojis y stickers que mejor encajan con la conversación reciente. El modo Semantic usa un embedder local, que es un pequeño modelo de IA que se ejecuta en tu propia máquina. Si no está disponible, este modo recurre al modo aleatorio.
- **Random** (Aleatorio): ofrece un conjunto aleatorio en cada respuesta.
- **Tool-call**: una llamada al modelo elige los que encajan en cada respuesta. Debes elegir una conexión en el menú desplegable que aparece. Si la conexión no está definida o falla, recurre al modo semantic. En un turno de chat grupal donde responde más de un personaje, Tool-call se omite en ese turno y la selección recurre al modo semantic.

Debajo de los modos está **Max offered (each)** (Máximo ofrecido por tipo). Esto es cuántos nombres de emoji personalizado y cuántos nombres de sticker se ofrecen al personaje en cada turno. El valor predeterminado es 20. Puedes ajustarlo de 1 a 100.

## Cómo aparecen los emojis y stickers personalizados

En un chat de Conversation, un shortcode de emoji como `:kekw:` se muestra como una pequeña imagen en línea dentro de la línea de texto. Si un mensaje contiene solo shortcodes de emoji y nada más, se muestran más grandes.

Un sticker como `sticker:wave:` siempre se muestra como una imagen grande en bloque en su propia línea.

Si no se encuentra un nombre, por ejemplo después de que elimines ese emoji, el mensaje muestra el texto simple del shortcode en su lugar, como `:kekw:`.

## Las reacciones usan solo el conjunto global de emojis

Puedes reaccionar a un mensaje con un emoji personalizado. Las reacciones pueden usar solo tus emojis personalizados principales, el conjunto global. Los emojis etiquetados desde la galería, los stickers y los GIF no están disponibles como reacciones. Las reacciones a mensajes se cubren en la guía de introducción de Conversation Mode.

## Guías relacionadas

- [Conversation Mode: Getting Started](getting-started.md)
- [Character and Persona Galleries](../characters/galleries.md)
- [Server Configuration Reference](../CONFIGURATION.md)
