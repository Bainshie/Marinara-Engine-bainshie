# Perfiles del Conversation Mode (nombre visible, About Me, comportamiento)

Esta guía cubre el pequeño perfil que recibe cada personaje y cada persona en el Conversation Mode (modo de conversación). El perfil tiene tres partes: un nombre visible, una biografía de tipo "about me" (sobre mí) y una directiva de comportamiento. Estos campos funcionan como el perfil de una app de chat (piensa en Discord). Solo se aplican en el Conversation Mode y nunca se usan en Roleplay ni en el Game Mode.

El Conversation Mode es el chat estilo DM o mensajería. Si es nuevo para ti, lee primero [Conversation Mode: Getting Started](getting-started.md). Una persona es el perfil que te representa (el `{{user}}`) en un chat.

## Dónde están estos campos

Cada campo del perfil aparece en una pestaña llamada **Convo**. Tanto los personajes como las personas la tienen.

1. Para editar el perfil de un personaje, abre el personaje en el **Character Editor** (Editor de personajes) y haz clic en la pestaña **Convo**.
2. Para editar el perfil de tu persona, abre la persona en el **Persona Editor** (Editor de personas) y haz clic en la pestaña **Convo**.

La pestaña **Convo** contiene tres campos: **Convo Display Name**, **About Me** y **Convo Behavior**. Son iguales para personajes y personas, con una pequeña diferencia que se indica más abajo.

## Convo Display Name

**Convo Display Name** (nombre visible en Convo) es el nombre que se muestra para este personaje o persona en los chats del Conversation Mode. Déjalo en blanco para usar en su lugar el nombre de la tarjeta. Al cambiarlo, se actualiza de inmediato el nombre en los mensajes existentes. Solo afecta al Conversation Mode.

Los personajes (no las personas) también tienen una casilla: **Declare this name on the card in the prompt** (Declarar este nombre en la tarjeta, dentro del prompt). Cuando la activas, Marinara añade una línea corta al texto de la tarjeta del personaje. Esa línea le dice al modelo qué tarjeta se muestra bajo qué nombre visible. Esta casilla necesita que primero se haya definido un nombre visible.

El macro `{{convo_display}}` coloca el nombre visible del personaje que responde dentro de un prompt (instrucciones enviadas a la IA) personalizado. Un macro es un marcador de posición como `{{convo_display}}` que se reemplaza por texto real. Fuera del Conversation Mode se resuelve como nada. Consulta [Macros](../prompts/macros.md).

## About Me

**About Me** es una biografía corta que el propio personaje o persona escribe sobre sí mismo, y que se muestra en el Conversation Mode. Puede ser una línea o dos, un solo emoji, un chiste, o nada en absoluto. En la barra de herramientas del cuadro de texto hay un botón de emoji para que puedas insertar un emoji en la biografía.

La biografía no es solo decoración. De forma predeterminada, Marinara añade el **About Me** de cada personaje y persona presente al prompt en cada turno. Las biografías se incluyen como una lista corta de perfiles de participantes. Así, el modelo siempre sabe cómo se presenta cada persona. No necesitas hacer nada para que esto funcione.

### Escribir un About Me con Professor Mari

No tienes que escribir tú mismo la biografía. Abre Professor Mari desde la pantalla de inicio y pídele que escriba o revise el **About Me** de un personaje o persona con nombre. Ella lee primero el perfil guardado, escribe una biografía corta redactada en primera persona con la voz de esa persona, y la guarda directamente en el campo real de **About Me**.

Por ejemplo, pídele: `Write Luna's About Me as a cryptic one-line bio.` También puedes pedir una revisión, como hacer una biografía existente más divertida, más corta, más cálida o más fiel a la tarjeta.

Professor Mari usa su modelo configurado habitual. No hay ninguna conexión aparte para About Me, ni selector de fuente, ni botón de generación en los editores de personajes y personas. Su cambio guardado aparece en el flujo de revisión de siempre, donde puedes conservarlo o restaurarlo. Las ediciones manuales en el editor siguen mostrando **Revert** (Deshacer), que restaura el texto de antes de tu edición actual.

## Convo Behavior

**Convo Behavior** (comportamiento en Convo) es una instrucción de texto libre sobre cómo debe actuar el personaje o persona en el Conversation Mode. Por ejemplo: mantener las respuestas cortas y en minúsculas, y escribir como una persona real en lugar de como un narrador. Nunca se envía en Roleplay ni en el Game Mode.

### Insertion (dónde va la directiva)

Debajo del cuadro de **Convo Behavior** hay un menú desplegable **Insertion** (Inserción). Controla dónde se coloca tu directiva dentro del prompt. Las opciones son:

- La opción **Constant** (Constante) marcada como "after the card" (después de la tarjeta), la predeterminada: siempre se añade, justo después del texto de la tarjeta.
- La opción **Constant** marcada como "before the card" (antes de la tarjeta): siempre se añade, justo antes del texto de la tarjeta.
- **Append to post-history** (Añadir al final del post-history): se agrega al final de las instrucciones del post-history.
- **Prepend to post-history** (Anteponer al post-history): se agrega al inicio de las instrucciones del post-history.
- **Replace post-history** (Reemplazar el post-history): se usa en lugar de las instrucciones del post-history.
- **Only where `{{convo_behavior}}` is placed** (Solo donde se coloque `{{convo_behavior}}`): se inserta únicamente donde pongas el macro `{{convo_behavior}}` en un prompt personalizado.

Las instrucciones del post-history son texto del prompt que la app coloca después del historial reciente del chat. Si no escribes prompts personalizados, conserva la opción predeterminada.

## Anulaciones del About Me específicas de un chat

El **About Me** de la tarjeta es la biografía predeterminada que se usa en todas partes. También puedes definir una biografía distinta para un único chat. Esta es la anulación específica del chat, y se abre desde un panel emergente del perfil.

1. En un chat del Conversation Mode, haz clic en el avatar o el nombre de un personaje o persona.
2. Se abre una pequeña tarjeta de perfil junto al avatar. En el teléfono o la tableta se desliza hacia arriba desde abajo.
3. La tarjeta muestra el avatar ampliado, el nombre y el **About Me** actual.
4. Una insignia dice **Default** (Predeterminado) cuando se muestra la biografía de la tarjeta, o **Chat-specific** (Específico del chat) cuando se usa una anulación por chat. Los personajes también muestran aquí un estado: **Online** (En línea), **Away** (Ausente), **Busy** (Ocupado) u **Offline** (Desconectado).

Para definir una anulación:

1. Haz clic en **Edit** (Editar) en el panel emergente.
2. Escribe la biografía para este chat. Dispones de un selector de emojis, incluida una pestaña **Custom emojis** (Emojis personalizados).
3. Haz clic en **Save** (Guardar). Deberías ver una nota que indica que se guardó un about me específico del chat.

Mientras editas, un botón **Revert** deshace los cambios sin guardar, y **Cancel** (Cancelar) cierra el modo de edición sin guardar. Cuando existe una anulación, un botón **Clear** (Borrar) la elimina y vuelve al valor predeterminado de la tarjeta. Guardar una biografía vacía también elimina la anulación. Recuerda: el **About Me** predeterminado se edita en la tarjeta, y una anulación solo se aplica en ese único chat.

## Dejar que un personaje actualice su propio About Me a demanda

También hay una herramienta que un personaje puede invocar en el momento para cambiar su propia biografía. Se llama **update_about_me**. Está desactivada de forma predeterminada. Actívala en **Chat Settings** (Ajustes del chat), dentro de la sección **Function Calling** (Llamada a funciones): activa **Enable Tool Use** (Activar el uso de herramientas) y añade la herramienta **update_about_me**.

Cuando está activada, un personaje puede actualizar su propia biografía de una de dos maneras:

- El ámbito público (public scope) cambia la biografía real que se ve en todos los chats. Esto se te muestra primero para que lo apruebes.
- El ámbito de chat (chat scope) cambia una biografía que es privada de la conversación actual.

## Usar los perfiles en prompts personalizados

No necesitas macros para que los perfiles lleguen al modelo. Las biografías de **About Me** se añaden al prompt automáticamente, y **Convo Behavior** sigue su ajuste de **Insertion**. Los macros son para prompts personalizados, cuando quieres colocar tú mismo un valor en un lugar exacto.

Cuatro macros insertan estos valores del perfil en línea. Cada uno se resuelve como nada fuera del Conversation Mode:

- `{{convo_display}}`: el nombre visible del personaje que responde.
- `{{char_about}}`: el **About Me** efectivo del personaje.
- `{{persona_about}}`: el **About Me** efectivo de la persona.
- `{{convo_behavior}}`: la directiva de **Convo Behavior** del personaje.

Consulta [Macros](../prompts/macros.md) para ver la lista completa de macros.

## Guías relacionadas

- [Conversation Mode: Getting Started](getting-started.md)
- [Creating and Editing Characters](../characters/creating-and-editing-characters.md)
- [User Personas: Creating and Editing](../characters/personas.md)
- [Downloadable Agents Reference](../agents/built-in-agents.md)
- [Macros](../prompts/macros.md)
