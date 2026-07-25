# Guía del Storyboard Engine

Esta guía explica los storyboards (secuencias de viñetas) en Marinara Engine. Un storyboard convierte un turno terminado del Game Mode (modo juego) en una breve serie de imágenes de fotogramas clave. También puede añadir clips animados cortos, incluidos planos continuos al estilo anime. El turno se lee entonces como una minicinemática. Los storyboards son una función exclusiva del Game Mode. No existen en los chats de Roleplay ni de Conversation.

## Qué son los storyboards

El Game Mode es el modo de chat donde un Game Master (GM, director del juego) con IA narra una aventura por turnos. Cuando el GM termina un turno de narración, el Storyboard Engine puede ilustrar ese único turno.

Marinara lee la narración del GM y la divide en una breve serie de fotogramas clave ordenados. Cada fotograma clave es una imagen de un momento del turno. Un storyboard contiene de 1 a 6 fotogramas clave. El valor predeterminado es 3.

Cada fotograma clave está ligado a un rango del texto del turno. Estos rangos de texto se llaman secciones de lectura. A medida que lees el turno hacia abajo, un pequeño visor muestra el fotograma clave que coincide con tu posición actual en el texto.

Antes de planear las imágenes, Marinara elimina las etiquetas de comando del GM del turno. Las etiquetas de comando del GM son etiquetas de instrucción ocultas dentro de un mensaje del GM, como tiradas de dados o actualizaciones del estado del juego. Se eliminan para que no aparezcan en la imagen.

Las imágenes fijas de fotogramas clave se guardan en la **Gallery** (Galería), en la pestaña **Images**. Los clips de fotogramas clave se guardan como videos de escena, en la pestaña **Videos**. Como son elementos normales de la **Gallery**, puedes ver una vista previa, descargar, fijar o copiar el prompt (las instrucciones enviadas a la IA) de cualquier fotograma clave por separado.

## Antes de empezar

Necesitas configurar algunas cosas antes de que un storyboard pueda renderizarse.

1. Un chat en Game Mode. Esta función solo funciona en Game Mode.
2. Una conexión de imagen que funcione para el ilustrador del juego. Configúrala en cualquiera de los dos sitios. Solo necesitas uno:
   - Juego existente: abre **Chat Settings** (Ajustes del chat), ve a **Agents** y luego a la tarjeta **Illustrator**. Activa **Game Illustrator** y elige una **Image Connection**.
   - Juego nuevo: en el asistente de configuración, activa **Visual Generation** y elige una **Image Generation Connection**.
3. Se recomienda un modelo de imagen potente y reciente. La app sugiere un modelo de imagen de última generación, o algo equivalente a Google Nano Banana 2 Lite.

Para los clips animados, también necesitas una conexión de video. Consulta los pasos de animación más abajo.

Si no tienes ninguna conexión de imagen configurada, una solicitud de storyboard falla con este mensaje: "Choose an Illustrator image connection in Game Settings first."

Para lograr una apariencia constante de los personajes entre fotogramas clave, usa tarjetas de personaje con avatares y activa **Send Avatar References** en la tarjeta **Illustrator**. Esto envía el avatar de cada personaje como imagen de referencia.

## Inicio rápido

1. Abre o crea un chat en Game Mode.
2. Configura la conexión de imagen como se muestra en la sección anterior.
3. Juega hasta que el GM termine un turno de narración.
4. Abre el panel **Gallery**.
5. Haz clic en **Create storyboard**. El botón muestra **Creating...** con un indicador giratorio mientras se ejecuta.
   - Si **Expose image prompts before sending** está activado en **Settings > Generation**, revisa y edita el prompt compilado de cada fotograma clave y luego confirma la generación.
6. Sigue leyendo el turno. El visor flotante aparece y cambia de fotograma clave a medida que lees.

Si cierras el visor, vuelve a abrirlo. En el panel **Gallery**, haz clic en **View storyboard**.

Mientras se genera un storyboard, la **Gallery** muestra este aviso: "Storyboard generation is running. Keyframes will appear in the game storyboard viewer when ready."

## Storyboards automáticos y manuales

Puedes hacer storyboards a mano, o dejar que Marinara los haga por ti.

El modo manual es el botón **Create storyboard** en la **Gallery**. Crea un storyboard para el último turno de narración del GM ya terminado, solo cuando tú lo pides. También puedes usarlo para refrescar o volver a ilustrar el turno actual, incluso cuando los storyboards automáticos están desactivados.

Los storyboards automáticos se configuran por chat. Encuentra los controles en cualquiera de los dos sitios:

- Juego nuevo: asistente de configuración, **Visual Generation** y luego la subsección **Storyboards**.
- Juego existente: **Chat Settings**, **Agents** y luego la tarjeta **Storyboards**.

**Automatic Storyboard Illustrations** crea imágenes fijas de fotogramas clave después de cada turno terminado del GM, sin que tengas que hacer clic. Esta es la opción de menor costo. Para un juego nuevo creado con el asistente, esto está activado de forma predeterminada una vez que **Visual Generation** está activado. No tiene efecto hasta que **Game Illustrator** esté configurado.

Los storyboards automáticos no pausan el pipeline de turno completado para revisar el prompt. Cuando **Expose image prompts before sending** está activado, usa la acción manual **Create storyboard** para ver y editar cada prompt final compilado de fotograma clave. Las ejecuciones automáticas continúan sin ventana emergente para que el juego no se detenga mientras el chat está desatendido.

**Automatic Storyboard Animations** también crea un clip MP4 para cada fotograma clave. Esto está desactivado de forma predeterminada. Necesita ilustraciones fijas más una conexión de video. Activar las animaciones también activa las ilustraciones. Desactivar las ilustraciones desactiva las animaciones.

Para configurar los clips:

1. Crea una conexión **Video Generation** en **Settings** y luego **Connections**.
2. Selecciónala en el campo **Video Generation Connection** del asistente, o en **Chat Settings**, **Agents**, **Scene Videos** y luego **Video Connection**.
3. Activa **Automatic Storyboard Animations**.

Si activas las animaciones sin una conexión de video, el asistente te advierte: "Choose a Video Generation connection below to save automatic storyboard animations."

Un storyboard suele crear 3 trabajos de imagen, uno por fotograma clave. Con las animaciones activadas, también crea hasta 3 trabajos de video. La cantidad sigue el valor de **Keyframes per Turn**, así que elegir 5 puede significar 5 trabajos de imagen y hasta 5 trabajos de video. Los trabajos de video son mucho más lentos y cuestan más. Empieza con ilustraciones fijas y añade animaciones solo en los chats donde la espera y el costo no sean un problema.

## Ajustes del storyboard

Todos estos se encuentran en la tarjeta **Storyboards**. Abre **Chat Settings**, ve a **Agents** y luego a **Storyboards**.

| Ajuste | Predeterminado | Qué hace |
| --- | --- | --- |
| **Automatic Storyboard Illustrations** | Activado para juegos nuevos del asistente con Visual Generation; en otros casos desactivado | Crea fotogramas clave fijos después de cada turno del GM |
| **Automatic Storyboard Animations** | Off | Añade un clip MP4 por fotograma clave; necesita una conexión de video |
| **Keyframes per Turn** | 3 (rango de 1 a 6) | Cuántos fotogramas clave planea cada turno |
| **Animation Clip Duration** | 6 segundos (rango de 1 a 15) | Duración de cada clip |
| **Viewer Display** | Floating | Panel flotante o fondo completo |
| **Illustration Planner** | Still Keyframes | Planea fotogramas clave fijos terminados y sus descripciones de imagen |
| **Animation Planner** | Comic Page Animation | Planea imágenes de origen listas para animar e indicaciones de movimiento |
| **Use Storyboard Template** | On | Formatea las escenas planeadas con el Storyboard Illustration Prompt seleccionado. Desactívalo para prompts de etiquetas NovelAI directos |
| **Storyboard Illustration Prompt** | Game Scene Illustration | Formatea cada fotograma clave planeado para el modelo de imagen |
| **Storyboard Video Prompt** | Same as Game Video Prompt | Prompt de movimiento usado solo para los clips de fotogramas clave del storyboard |

**Keyframes per Turn** es un control deslizante. El motor intenta planear esta cantidad de fotogramas clave. Un turno corto puede recibir menos. Nunca planea más de 6.

**Animation Clip Duration** es un número de segundos. Está atenuado a menos que **Automatic Storyboard Animations** esté activado. Hasta que fijes un valor, usa el predeterminado de 6 segundos y muestra una etiqueta **Storyboard default**. Una vez que fijas tu propio valor, aparece un botón **Use storyboard default** para borrarlo. Algunos proveedores de video pueden recortar tu valor a un máximo menor, así que la duración exacta no está garantizada.

En el modo de visor **Background**, cada animación empieza una vez con sonido cuando su momento de la historia se vuelve activo. La narración puede mostrarse mientras se reproduce, pero la reproducción automática de la narración espera a que el clip termine. La animación luego queda en pausa en su fotograma final. La barra de herramientas del juego ofrece controles de repetir, reproducir/pausar y silenciar en computadora y teléfono. Los videos flotantes del storyboard también se reproducen una vez y pueden repetirse en lugar de reproducirse en bucle indefinidamente.

Los dos planificadores crean el plan visual. **Illustration Planner** se usa para storyboards fijos. **Animation Planner** se usa cuando se generan videos y produce tanto una descripción de imagen lista para animar como una indicación de movimiento compacta.

**Storyboard Illustration Prompt** formatea luego la descripción de imagen del planificador en la solicitud final enviada al modelo de imagen. Los chats existentes usan de forma predeterminada **Game Scene Illustration**. **Storyboard Illustration** mantiene el resultado del planificador como principal, mientras añade referencias de personaje, notas de apariencia, dirección artística de la campaña e instrucciones de imagen.

**Storyboard Video Prompt** es independiente del **Game Video Prompt** general de la tarjeta **Scene Videos**. Combina el fotograma clave generado, la indicación de movimiento del Animation Planner y el contexto de la escena actual en la solicitud final enviada al modelo de video. Déjalo en la opción heredada para reutilizar el prompt general, o selecciona **Anime Game Video** para los clips de fotogramas clave sin cambiar los videos manuales de la **Gallery** ni de **Game Assets**.

Selecciona **Comic Page Animation** para las páginas de origen de cómic que tienen en cuenta la duración, y luego elige **Comic Page Video** para interpretar esas viñetas como momentos de referencia visual ordenados para un clip. La opción original **Comic Page** sigue disponible para ilustraciones normales. La opción de video separada deja sin cambios el **Game Video Prompt** heredado más los videos manuales de la **Gallery** y de **Game Assets**.

Los juegos nuevos creados con la presentación **Storyboard Optimized** seleccionan el **Storyboard Game Prompt**, el planificador **Comic Page Animation**, **Storyboard Illustration** y **Comic Page Video**. Puedes cambiar ese chat a la combinación de un solo plano en cualquier momento seleccionando **Still Keyframe Animation** y **Anime Game Video**.

### LTX 2.3 imagen a video

Para un flujo de trabajo local de LTX 2.3 en ComfyUI, empieza con **LTX Simple Image-to-Video** como Animation Planner, **Storyboard First Frame** como Storyboard Illustration Prompt y **LTX Director Video** como Storyboard Video Prompt. El Animation Planner crea tanto el prompt de imagen en lenguaje natural de T=0 como el párrafo de movimiento completo. Storyboard First Frame pasa la escena de T=0 a un proveedor de imágenes de lenguaje natural con un envoltorio mínimo, mientras que LTX Director Video envía el párrafo de movimiento al campo `%prompt%` del flujo de trabajo. **LTX Director Storyboard** es la alternativa más detallada que tiene en cuenta la duración; usa el mismo prompt de video y contrato de flujo de trabajo.

Consulta [LTX 2.3 Storyboards in Game Mode](ltx-2-3-storyboards.md) para la selección de modelos, los marcadores de posición de ComfyUI, el perfil completo de ajustes del juego, los pasos de validación y la solución de problemas.

## Presets de estilo

Los presets de planificador dan forma a cómo se selecciona y se describe cada fotograma clave. Dos selectores los eligen:

- **Illustration Planner** se usa cuando los storyboards crean fotogramas clave fijos sin videos. Predeterminado: **Still Keyframes**.
- **Animation Planner** se usa cuando **Automatic Storyboard Animations** está activado. Predeterminado: **Comic Page Animation**.

Los dos selectores tienen listas de presets separadas. Los presets de ilustración describen imágenes fijas terminadas y pueden incluir rotulación de cómic o manga visible para el lector. Los presets de animación describen un primer fotograma estable más una indicación de movimiento que tiene en cuenta la duración. Un preset de ilustración nunca aparece en el menú del Animation Planner, y un preset de animación nunca aparece en el menú del Illustration Planner.

| Carril | Preset | Ideal para |
| --- | --- | --- |
| Ilustración | **Still Keyframes** | Lectura normal. Fotogramas clave de una sola escena sin viñetas de cómic, globos de diálogo, subtítulos ni texto de SFX. |
| Ilustración | **NovelAI Keyframes** | Prompts compactos de etiquetas para imagen fija, ajustados para NovelAI V4 y V4.5. Para un prompt de etiquetas directo, desactiva **Use Storyboard Template**. |
| Ilustración | **Comic Page** | Ilustraciones de página de cómic terminadas con 2 a 6 viñetas, globos de diálogo, subtítulos y rotulación. |
| Ilustración | **Colored Manga** | Puesta en escena de manga a color terminada con sombreado por celdas, tramas, globos de diálogo y SFX. |
| Ilustración | **B&W Manga** | Entintado de manga en blanco y negro terminado, tramas, negros intensos, globos de diálogo y SFX. |
| Animación | **Still Keyframe Animation** | Planos individuales ordenados con un primer fotograma exacto, un movimiento principal, comportamiento de cámara sencillo, movimiento ambiental y una pausa final. |
| Animación | **Anime Episode Director** | Planos individuales de anime de emisión con continuidad del primer fotograma, indicación de movimiento compacta y puesta en escena segura para el proveedor. |
| Animación | **NovelAI Keyframe Animation** | Primeros fotogramas basados en etiquetas de NovelAI con la sincronización y el movimiento en una indicación de animación separada. |
| Animación | **Comic Page Animation** | Páginas de origen de cómic que tienen en cuenta la duración, cuyas viñetas cronológicas actúan como referencias visuales ordenadas para un clip. |
| Animación | **Colored Manga Animation** | Primeros fotogramas de manga a color sin texto con movimiento que preserva el lineado y el sombreado por celdas. |
| Animación | **B&W Manga Animation** | Primeros fotogramas monocromáticos sin texto con movimiento que preserva el entintado y las tramas. |

El preset **Still Keyframe Animation** es la contraparte de movimiento neutra en estilo de **Still Keyframes**. **Anime Episode Director** es una opción especializada separada que se combina con **Anime Game Video** cuando quieres una planificación de planos de anime de emisión. Mantiene la violencia severa sin ser gráfica y la escenifica mediante anticipación, obstrucción, reacción o consecuencias cuando es posible, lo que puede reducir los rechazos de seguridad del proveedor sin cambiar la historia canónica del GM.

El preset **Comic Page Animation** usa la duración del clip de animación para controlar la densidad de la página. Usa de forma predeterminada 2 viñetas para un clip de 6 a 7 segundos, permitiendo una tercera solo para tres momentos simples de unos 2 segundos cada uno; usa de 2 a 3 viñetas para 8 a 10 segundos y no más de 4 para clips más largos. Las páginas de animación priorizan la sincronización visual sobre la rotulación de cómic, mantienen cada viñeta enfocada y reservan una breve pausa final. Las viñetas siguen la causa y el efecto en orden de lectura. **Comic Page Video** normalmente entra en la viñeta 1 de inmediato; solo permite un establecimiento de página completa muy breve cuando hacerlo no revela una consecuencia posterior antes de tiempo.

El preset **NovelAI Keyframes** escribe etiquetas Danbooru compactas. Las etiquetas Danbooru son etiquetas cortas de palabras clave separadas por comas que algunos modelos de imagen de anime esperan. Elegir un preset de animación, cómic o manga no activa las animaciones por sí solo. Aún necesitas **Automatic Storyboard Animations** y una conexión de video para los clips.

## Estilo artístico de la campaña y perfiles de estilo de imagen

La configuración del juego genera un estilo artístico a nivel de campaña para lograr consistencia visual. Para un juego existente, abre **Chat Settings > Agents > Illustrator** para verlo en **Campaign art style**. Puedes editarlo, borrarlo, restaurar el texto original generado en la configuración, o desactivar **Use Campaign Art Style**.

El estilo artístico de la campaña y el perfil **Image Style** son capas de prompt separadas. Cuando ambas están activadas, Marinara incluye las dos. Desactivar o borrar el estilo de la campaña deja en su lugar el perfil de Image Style seleccionado. Este ajuste se aplica a los fotogramas clave del storyboard y a los demás recursos visuales generados del juego.

Con **Expose image prompts before sending** activado en **Settings > Generation**, las solicitudes manuales de **Create storyboard** muestran primero los prompts positivos y negativos compilados exactos para todos los fotogramas clave planeados. Los cambios en esa revisión son anulaciones puntuales solo para ese storyboard; no reemplazan los ajustes del estilo de la campaña ni del perfil de Image Style.

## Editar presets del storyboard

Los presets integrados son de solo lectura. Para crear los tuyos, abre **Edit Illustration Planner Presets**, **Edit Animation Planner Presets**, **Edit Illustration Prompt Presets** o **Edit Video Prompt Presets** dentro de la tarjeta **Storyboards**. Cada sección muestra solo los integrados y las copias personalizadas de esa etapa.

Copia un integrado en una plantilla editable solo para ese chat y luego elige esa copia en el selector correspondiente. Las copias del Illustration Planner no pueden seleccionarse como Animation Planners, y las copias del Animation Planner no pueden seleccionarse como Illustration Planners. Las copias del Storyboard Illustration Prompt afectan solo a las imágenes del storyboard. Las copias del prompt de video siguen compartidas con el Game Video Prompt general, así que cualquiera de los dos selectores de video puede usarlas.

Cada copia personalizada tiene un nombre, una descripción corta y el cuerpo del prompt que editas. Un botón de papelera elimina una copia después de un cuadro de diálogo de confirmación. Estas copias se guardan en ese único chat, no en toda tu app.

## El visor del storyboard

El visor sigue tu posición de lectura. Muestra el fotograma clave cuya sección de lectura coincide con dónde estás en el texto del turno. No es simplemente "la imagen más nueva de la Gallery". Hay dos estilos de visualización, fijados con **Viewer Display**.

**Floating** es el predeterminado. Un pequeño panel arrastrable se coloca sobre el juego. Su encabezado dice **Storyboard**. Reproduce el video del fotograma clave cuando está listo, y recurre a la imagen mientras un clip está pendiente o falló.

El visor flotante tiene estos controles:

- **Close storyboard viewer** oculta el panel solo durante el turno actual. Reaparece cuando termina el siguiente turno del GM. Actualizar la página también borra la ocultación.
- **Drag storyboard viewer** es el asa del encabezado. Arrastra el panel a cualquier parte de la pantalla.
- **Play storyboard video** y **Pause storyboard video** controlan la reproducción del clip. Los clips empiezan silenciados.
- **Mute storyboard video** y **Unmute storyboard video** solo aparecen cuando el fotograma clave tiene un clip renderizado.
- **Change storyboard viewer size** alterna tres anchos: pequeño, mediano (el predeterminado) y grande.
- Un asa en la esquina redimensiona el panel libremente y anula el tamaño preestablecido.

**Background** llena toda la superficie del juego con el fotograma clave activo en lugar de una tarjeta flotante. La imagen o el clip se sitúa detrás de los controles del juego. Usa la misma lógica de posición de lectura que el visor flotante.

El modo Background tiene una contrapartida. Desactiva el fondo de ubicación de escena generado normal de Marinara. Mientras está activado, el botón **Generate background** del panel emergente del ilustrador está desactivado. El botón muestra esta nota: "Storyboard background display is active, so scene background generation is disabled."

## Obtener mejores resultados

Un storyboard es solo tan claro como el turno que lee. Los mejores turnos nombran quién se mueve, qué cambia y dónde está el momento clave. Un turno vago como "la pelea continúa" le da al motor menos para dibujar que un turno con acción concreta y detalles de ubicación.

Para resultados más constantes:

- Mantén específicos la ambientación, el tono y el estilo artístico del juego durante la configuración.
- Usa tarjetas de personaje con avatares detallados, y activa **Send Avatar References**.
- Mantén claros en la narración los atuendos, heridas, objetos y ubicaciones importantes.
- Usa perfiles de estilo de imagen para el acabado que quieres.
- Usa **Still Keyframes** para lectura normal, y un preset de cómic o manga cuando los clips estén activados.

## Opciones de NovelAI

Para una solicitud compacta de NovelAI, elige **NovelAI Keyframes** y desactiva **Use Storyboard Template** en la tarjeta **Storyboards**. Esto envía el prompt de escena planeado directamente, mientras mantiene disponibles los ajustes separados de apariencia, imagen de referencia, instrucciones de imagen y estilo.

**Use NovelAI Character Prompts** envía cada personaje visible a través de las leyendas y posiciones nativas de Add Character de NovelAI. Esto está activado de forma predeterminada. Importante: solo surte efecto para una conexión oficial de NovelAI que use un modelo V4 o V4.5 en novelai.net. Para cualquier otro proveedor o modelo, el interruptor no hace nada, y Marinara usa en su lugar el prompt heredado compartido.

## Solución de problemas

**"Choose an Illustrator image connection in Game Settings first."** Abre **Chat Settings**, **Agents** y luego la tarjeta **Illustrator**. Activa **Game Illustrator** y elige una **Image Connection**. Para un juego nuevo, activa **Visual Generation** y elige una **Image Generation Connection** en el asistente de configuración.

**"Storyboards can only be generated from GM narration turns."** **Create storyboard** solo funciona en un turno de narración del GM ya terminado. No funciona en tus propios mensajes de jugador. Espera a que la respuesta del GM termine, y luego inténtalo de nuevo.

**"This GM turn has no narration to storyboard."** El turno no tiene texto de historia para dibujar. Esto pasa cuando un turno del GM contiene solo etiquetas de comando ocultas y ninguna narración. Sigue jugando hasta que el GM escriba un turno con texto de historia, y haz el storyboard de ese.

**Aparecen imágenes, pero no videos.** Los videos necesitan tanto **Automatic Storyboard Animations** activado como una conexión **Video Generation** seleccionada. Con las animaciones desactivadas, los storyboards crean solo fotogramas clave fijos.

**Los storyboards automáticos no se ejecutan.** Comprueba que **Automatic Storyboard Illustrations** o **Automatic Storyboard Animations** esté activado. Comprueba que la conexión de imagen esté configurada y que el turno del GM haya terminado de transmitirse por streaming. Marinara no creará un segundo storyboard para un turno que ya tiene uno. Aún puedes rehacerlo a mano con **Create storyboard** en la **Gallery**.

**El storyboard está incompleto o atascado.** Esto suele significar que uno o más trabajos de imagen o video fallaron, agotaron el tiempo de espera o alcanzaron un límite de tasa del proveedor. El contenido prohibido también puede bloquear un trabajo. Si un proveedor es lento, aumenta los tiempos de espera de generación de imagen y video en tu archivo `.env` y luego reinicia Marinara. Consulta la [guía de configuración](../CONFIGURATION.md) para los nombres exactos de las variables.

Para un diagnóstico más profundo, fija tu nivel de registro en debug y observa el registro del servidor. Las líneas de registro del storyboard están etiquetadas como `[debug/game/storyboard-illustrator]`, `[debug/game/storyboard-image-preview]`, `[debug/game/storyboard-image-assets]` y `[debug/game/storyboard-video]`.

## Guías relacionadas

- [Scene Video Generation](../media/scene-video.md)
- [Image Generation Providers](../media/image-providers.md)
- [Game Mode: Getting Started](getting-started.md)
- [LTX 2.3 Storyboards in Game Mode](ltx-2-3-storyboards.md)
