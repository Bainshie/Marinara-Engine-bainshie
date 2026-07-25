# Generación de video de escena

Esta guía explica cómo Marinara Engine convierte la ilustración de una escena en un breve clip de video MP4. Cubre los proveedores de video, cómo generar un clip desde la **Gallery** (Galería), los controles de **Game Mode** (modo de juego) y los ajustes de video. Un video de escena es un clip animado corto hecho a partir de una sola imagen fija.

## Qué hace el video de escena

Un video de escena toma una imagen que ya está en la galería y la anima en un clip MP4 corto. La imagen fija se convierte en el primer fotograma, y la IA añade movimiento. Los videos de escena funcionan en chats de **Roleplay** y **Game Mode**.

Siempre necesitas una imagen primero. La generación de video de escena no puede partir solo de texto. Debes generar o subir una imagen de galería antes de poder animarla.

Los videos de escena usan un tipo de conexión aparte llamado **Video Generation** (Generación de video). No son lo mismo que la generación de imágenes normal. Los clips terminados se guardan con el chat y se muestran en la **Gallery**, donde puedes fijarlos, descargarlos o verlos.

## Conexiones de Video Generation

Para hacer videos de escena, primero añades una conexión capaz de generar video. Esto usa el mismo panel **Connections** (Conexiones) que tus conexiones de chat e imagen.

1. Abre **Settings** (Configuración) y luego abre **Connections**.
2. Haz clic en **Add Connection** (Añadir conexión).
3. Fija el tipo de proveedor en **Video Generation**.
4. En **Video Service** (Servicio de video), elige uno de los seis servicios de abajo.
5. Escribe la API key (clave de API) para un servicio en la nube. La versión local de ComfyUI no necesita ninguna.
6. Para servicios en la nube, elige un modelo o deja el predeterminado del proveedor. Para ComfyUI, deja el modelo sin fijar salvo que el flujo de trabajo use `%model%`.
7. Guarda la conexión.

El selector **Video Service** ofrece seis opciones. Cada una rellena una dirección web predeterminada y, cuando corresponde, un modelo predeterminado:

| Video Service        | Modelo predeterminado             | Notas                                                                        |
| -------------------- | --------------------------------- | ---------------------------------------------------------------------------- |
| **Google AI Studio** | `gemini-omni-flash-preview`       | Ejecuta los modelos de video Gemini Omni y Veo a través de la API de Gemini. |
| **xAI Imagine**      | `grok-imagine-video-1.5`          | Video de Grok Imagine a través de la API de Videos de xAI.                   |
| **OpenRouter Video** | `google/veo-3.1`                  | Modelos de video a través de OpenRouter. Puedes escribir cualquier ID de modelo de video de OpenRouter. |
| **Atlas Cloud**      | `google/veo3.1/text-to-video`     | Modelos alojados de texto a video e imagen a video a través de Atlas Cloud.  |
| **Seedance 2.0**     | `seedance-2-0`                    | Modos de video de texto, primer fotograma, y primer y último fotograma.      |
| **ComfyUI**          | Definido por el flujo de trabajo  | Flujos de trabajo de video WAN y otros, locales, exportados en formato API.  |

**Google AI Studio** cubre dos familias de modelos. **Gemini Omni** usa `gemini-omni-flash-preview`. **Google Veo** usa `veo-3.1-generate-preview`. Cuál se ejecuta depende del modelo que elijas en la conexión.

Para **ComfyUI**, usa la dirección local habitual `http://127.0.0.1:8188` y pega un flujo de trabajo de video en formato API en **ComfyUI Workflow** (Flujo de trabajo de ComfyUI). El flujo de trabajo es obligatorio. Consulta [Configuración del flujo de trabajo de ComfyUI](comfyui.md#comfyui-video-workflows) para ver los marcadores de posición y los requisitos del nodo de salida.

### Convertirla en la conexión de video predeterminada

El editor de conexión para una conexión de Video Generation muestra un grupo **Default for Videos** (Predeterminada para videos). Activa **Use as default video connection** (Usar como conexión de video predeterminada) para que Marinara pueda usar esta conexión cuando un chat no tenga una conexión de video propia. Marca solo una conexión como la conexión de video predeterminada.

### Valores predeterminados de video de la conexión

Una conexión de Video Generation tiene su propio panel **Video Generation Defaults** (Valores predeterminados de generación de video) en el editor de conexión. Aquí fijas la duración de clip, la relación de aspecto y la resolución predeterminadas para esa conexión. Estos valores predeterminados por conexión tienen prioridad sobre la duración de reserva de toda la app.

| Servicio         | Duración predet. | Rango de duración | Relación de aspecto | Resolución            |
| ---------------- | ---------------- | ----------------- | ------------------- | --------------------- |
| Gemini Omni      | 10s              | 1 a 60s           | 16:9                | Predet. del proveedor |
| Google Veo       | 8s               | 4, 6 u 8s         | 16:9                | 720p                  |
| xAI Imagine      | 10s              | 1 a 15s           | 16:9                | 720p                  |
| OpenRouter Video | 10s              | 1 a 60s           | 16:9                | 720p                  |
| Atlas Cloud      | 8s               | 1 a 60s           | 16:9                | 720p                  |
| Seedance 2.0     | 5s               | 4 a 15s           | 16:9                | 720p                  |
| ComfyUI          | 5s               | 1 a 60s           | 16:9                | 720p                  |

Gemini Omni no tiene campo de resolución, y su duración se escribe dentro del texto del prompt (instrucciones enviadas a la IA) en vez de en un ajuste aparte. Google Veo fuerza 8 segundos siempre que anima una imagen de referencia, porque necesita 8 segundos para fusionar el primer y el último fotograma.

### Fotogramas de referencia de Seedance

Seedance debe obtener tu imagen de referencia a través de un enlace web público antes de poder animarla. Un servidor local de Marinara no tiene enlace público, así que las instalaciones locales simples necesitan un paso extra.

Abre la conexión de Seedance y activa **Upload Seedance reference frames temporarily** (Subir temporalmente los fotogramas de referencia de Seedance). Esto sube el fotograma de referencia a un enlace público temporal para que Seedance pueda leerlo. Puedes elegir cuánto dura ese enlace en **Temporary link lifetime** (Duración del enlace temporal), que de forma predeterminada es 12 horas.

Si tu servidor de Marinara ya tiene una dirección web pública, puedes fijar una variable de entorno en lugar de usar subidas temporales. Consulta la [Referencia de configuración del servidor](../CONFIGURATION.md) para ver el ajuste de referencia de video.

## Elegir un proveedor

Los seis servicios hacen clips cortos a partir de tu imagen. Se diferencian en velocidad, duración del clip y cómo manejan las imágenes de referencia.

- **Google AI Studio (Gemini Omni)**: duración flexible hasta 60 segundos. La duración va incrustada en el prompt, no es un control aparte.
- **Google AI Studio (Veo)**: gran calidad, pero fija en 4, 6 u 8 segundos. Usa 8 segundos cuando anima una imagen.
- **xAI Imagine**: clips de 1 a 15 segundos. Usa un límite de prompt más corto que los demás servicios.
- **OpenRouter Video**: de 1 a 60 segundos, y te deja escribir cualquier modelo de video que admita tu cuenta de OpenRouter.
- **Atlas Cloud**: de 1 a 60 segundos con modelos iniciales seleccionados de Veo 3.1 y Seedance 2.0. Puedes escribir otro ID de modelo de video exacto de Atlas Cloud; aún se aplican los límites de duración, resolución e imagen de referencia específicos del modelo.
- **Seedance 2.0**: clips de 4 a 15 segundos con modos de primer fotograma, y de primer y último fotograma. Necesita un enlace público a tu imagen de referencia.
- **ComfyUI**: generación local a través de tu propio flujo de trabajo en formato API. Marinara sube la imagen de referencia directamente a ComfyUI cuando el flujo de trabajo usa `%reference_image_name%`.

Cuenta con que los trabajos de video tarden un rato. El proveedor inicia el trabajo, y luego Marinara espera y comprueba hasta que el clip está listo. Esto puede tardar varios minutos por clip, más que una imagen fija. Los modelos locales grandes de WAN pueden necesitar más de los 30 minutos predeterminados; sube `VIDEO_GEN_TIMEOUT_MS` y reinicia Marinara cuando haga falta.

## Generar un video desde la Gallery

Tanto los chats de **Roleplay** como los de **Game Mode** pueden hacer videos de escena desde el panel **Gallery**. Ábrelo con el icono de imagen o galería del chat. Los chats de Game Mode también tienen un segundo lugar para hacerlo, el panel **Game Assets** (Recursos del juego), que se cubre más adelante en esta guía.

La **Gallery** tiene una pestaña **Images** (Imágenes) y una pestaña **Videos** (Videos), cada una con un contador. Las imágenes fijas están en **Images**. Los clips terminados están en **Videos**.

Para animar la imagen más reciente:

1. Asegúrate de que exista al menos una imagen en la pestaña **Images**. Usa **Illustrate** (Ilustrar) o sube una imagen primero.
2. Haz clic en **Video** en la fila de acciones de la parte superior de la **Gallery**.
3. Si **Expose media prompts before sending** (Mostrar los prompts de medios antes de enviar) está activado en **Settings**, **Generations** (Generaciones), **Image Generation** (Generación de imágenes), revisa o edita el prompt de animación compilado y haz clic en **Generate** (Generar). Cancelar esta ventana no inicia una solicitud al proveedor.
4. El botón cambia a **Generating...** (Generando...), y un aviso te dice que la generación de video está en curso.
5. Cuando termina, el clip aparece en la pestaña **Videos**.

Para animar una imagen específica en vez de la más reciente:

1. Abre la pestaña **Images**.
2. Pasa el cursor sobre la imagen que quieras.
3. Haz clic en el botón **Animate illustration** (Animar ilustración) (el icono de película) en los controles que aparecen al pasar el cursor.

La misma ventana **Review Video Prompt** (Revisar el prompt de video) aparece para **Animate illustration** cuando la revisión de prompts está activada. Muestra el prompt exacto compilado por el servidor, la duración, la relación de aspecto y la resolución que se usarán para esa imagen seleccionada. Tu edición se aplica solo a esa generación y no reemplaza la plantilla reutilizable Game Video Prompt.

En la pestaña **Videos**, cada clip se reproduce en línea y muestra su duración y el nombre del modelo. Puedes fijar un clip con **Pin video to chat** (Fijar video al chat), o guardarlo con **Download scene video** (Descargar video de escena). Si aún no hay clips, la pestaña dice **No videos yet** (Aún no hay videos).

Si intentas hacer un video sin ninguna imagen en el chat, Marinara muestra este mensaje: **Add or generate a gallery image before generating a scene video** (Añade o genera una imagen de galería antes de generar un video de escena). Genera o sube una imagen primero, y luego vuelve a intentarlo.

## Video de escena en Game Mode

Game Mode tiene un segundo lugar para hacer un video de escena: el panel **Game Assets**. Ábrelo con el botón **Game Assets** en los controles del juego.

1. Abre el panel **Game Assets**.
2. Haz clic en **Generate video** (Generar video). Su tooltip (texto de ayuda) dice **Generate a scene video from the latest illustration** (Generar un video de escena a partir de la última ilustración).
3. El clip más reciente se reproduce en el panel cuando está listo.

El botón **Generate video** permanece inactivo hasta que el juego tenga tanto una conexión de video como una ilustración de escena. Si haces clic demasiado pronto, puedes ver uno de estos mensajes:

- **Choose a Video Generation connection in Game Settings first** (Elige primero una conexión de Video Generation en Game Settings). Fija una conexión de video para el juego.
- **Generate a scene illustration before generating a scene video** (Genera una ilustración de escena antes de generar un video de escena). Haz una imagen primero.

Si un clip falla, el panel muestra **Scene video generation failed** (La generación del video de escena falló). Vuelve a intentarlo, y comprueba tu conexión y tu API key si sigue fallando.

## Elegir una conexión de video para un chat

Cada chat elige su propia conexión de video. Esto se fija en **Chat Settings** (Ajustes del chat), luego **Agents** (Agentes), luego **Scene Videos** (Videos de escena).

Los chats de **Roleplay** muestran una tarjeta **Scene Videos** descrita como **Generate manual MP4 scene videos from gallery images** (Generar manualmente videos de escena MP4 a partir de imágenes de galería). Tiene un control, el menú desplegable **Video Connection** (Conexión de video). Elige aquí tu conexión de Video Generation.

Los chats de **Game Mode** muestran una tarjeta **Scene Videos** descrita como **Generate MP4 scene videos from game illustrations** (Generar videos de escena MP4 a partir de ilustraciones del juego). Tiene más controles:

- **Video Connection**: la conexión de Video Generation que usa este juego.
- **Game Video Prompt**: la plantilla de prompt que decide cómo se anima la imagen. El valor predeterminado incorporado es **Cinematic Scene Video**.
- **Edit Video Presets** (Editar presets de video): añade y edita tus propias copias de la plantilla de prompt de video para este chat.

El **Game Video Prompt** sigue controlando los videos manuales de la **Gallery** y de **Game Assets**. Los clips de fotograma clave del storyboard (secuencia de viñetas) pueden elegir un **Storyboard Video Prompt** distinto en **Chat Settings**, **Agents**, luego **Storyboards**. Si no se fija una elección de storyboard aparte, heredan el Game Video Prompt.

Cuando creas por primera vez un chat de Game Mode, el asistente de configuración también tiene un selector **Video Generation Connection** (Conexión de generación de video). Está en el paso **Features** (Funciones), y aparece después de que actives **Visual Generation** (Generación visual).

Si un chat no tiene conexión de video propia, Marinara recurre a la conexión que marcaste como **Use as default video connection**. Si no hay conexión de chat ni predeterminada, las acciones de video muestran un aviso que te dice que elijas una.

## Ajustes de generación de video

Algunos valores predeterminados de video están en los ajustes de la app, no en una conexión. Abre **Settings**, luego **Generations**, luego la sección **Video Generation**. Se describe como **Set default clip lengths and edit reusable video prompts for Game, Gallery, and Calls** (Fija las duraciones de clip predeterminadas y edita los prompts de video reutilizables para Game, Gallery y Calls).

El ajuste principal de video de escena aquí es **Scene video fallback length** (Duración de reserva del video de escena), que de forma predeterminada es 10 segundos. Se usa solo cuando la conexión de video seleccionada no tiene duración propia. Puedes fijarlo de 1 a 60 segundos.

Esta sección también contiene **Video Generation Prompt Overrides** (Anulaciones del prompt de generación de video), donde puedes editar las plantillas de prompt de video reutilizables. Esta es la forma avanzada de cambiar cómo se mueven los clips sin editar código.

La misma sección tiene un ajuste **Animated expression length** (Duración de la expresión animada). Ese pertenece a una función aparte, los sprites (imágenes del personaje) de retrato animado. Consulta [Expresiones animadas](animated-expressions.md) para esa función.

## Storyboards

Game Mode también puede construir un storyboard, que es un conjunto ordenado de imágenes de fotograma clave para un turno del juego. Cuando las animaciones de storyboard están activadas, Marinara anima cada fotograma clave en un clip usando tu conexión de video y el **Storyboard Video Prompt**. Hereda el **Game Video Prompt** salvo que elijas una plantilla aparte. Un fotograma clave es un fotograma fijo dentro de ese conjunto ordenado.

Los storyboards tienen sus propios controles y su propia guía. Consulta [Storyboards en Game Mode](../game/storyboard.md) para ver la configuración y el flujo de trabajo completos.

## Solución de problemas

### "Choose a Video Generation connection"

Tu chat no tiene ninguna conexión de video seleccionada. Abre **Chat Settings**, luego **Agents**, luego **Scene Videos**, y elige una conexión. Si el menú desplegable está vacío, añade una en **Settings**, luego **Connections**.

### "Add or generate a gallery image before generating a scene video"

El video de escena siempre anima una imagen existente. Usa **Illustrate**, sube una imagen, o haz clic en **Animate illustration** en una imagen que ya tengas.

### El video tarda mucho

Esto es normal. El proveedor inicia el trabajo, y Marinara espera y comprueba hasta que el clip está listo. Veo, xAI, OpenRouter, Atlas Cloud y Seedance funcionan todos así, y un clip puede tardar varios minutos.

### Seedance no logra leer la imagen de referencia

Seedance necesita un enlace público a tu imagen. En un servidor local, abre la conexión de Seedance y activa **Upload Seedance reference frames temporarily**. Consulta la sección de Seedance más arriba.

### Una solicitud de video sigue fallando

Comprueba que la conexión tenga una API key válida y que tu cuenta tenga acceso a video. Abre la conexión en **Settings**, luego **Connections**, y confirma la clave y el modelo. Los tiempos de espera del lado del servidor para video se cubren en la [Referencia de configuración del servidor](../CONFIGURATION.md).

## Guías relacionadas

- [Expresiones animadas](animated-expressions.md)
- [Storyboards en Game Mode](../game/storyboard.md)
- [Storyboards con LTX 2.3 en Game Mode](../game/ltx-2-3-storyboards.md)
- [Proveedores de IA admitidos](../connections/providers-reference.md)
- [Referencia de configuración del servidor](../CONFIGURATION.md)
