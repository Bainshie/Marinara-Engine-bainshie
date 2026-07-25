# Descripción general de Chat Settings

Esta guía cubre el panel **Chat Settings** (Ajustes del chat), el lugar donde ajustas un chat por separado. Explica lo básico que configuras aquí: nombre del chat, conexión y paquetes de ajustes guardados. Luego te remite a las guías más detalladas para todo lo demás que contiene el panel.

Cada ajuste de este panel se aplica solo al chat actual. Cambiarlo no afecta a tus otros chats.

## Abrir el panel Chat Settings

Abres el panel desde dentro de un chat abierto.

1. Abre cualquier chat.
2. Haz clic en el botón de engranaje de ajustes del chat en la barra de herramientas del chat (su tooltip, o texto de ayuda, dice **Chat Settings**).
3. El panel **Chat Settings** se despliega.

Deberías ver un panel titulado **Chat Settings** con un icono de engranaje. Cuando creas un chat totalmente nuevo, este panel se abre automáticamente para que puedas configurarlo de inmediato.

## Chat Name

La sección **Chat Name** (Nombre del chat) contiene el nombre que se muestra en tu lista de chats. Este nombre solo es visible para ti. No se envía a la IA y no cambia la conversación de ningún modo.

1. En la sección **Chat Name**, haz clic en el nombre actual.
2. El nombre se convierte en un campo de texto.
3. Escribe un nombre nuevo.
4. Pulsa Enter, o haz clic en el botón de la marca de verificación para confirmar.

## Connection

La sección **Connection** (Conexión) elige qué proveedor de IA y qué modelo responden en este chat. Una conexión es un enlace guardado a un proveedor de IA, incluida su API key (clave de API) y el modelo elegido. Una API key es un código secreto que permite a Marinara Engine usar tu cuenta con ese proveedor.

Elige una conexión guardada del menú desplegable. También puedes elegir **Random** (Aleatorio). Elige una conexión distinta cada vez, entre las conexiones que marcaste para tu grupo aleatorio.

Para aprender a crear una conexión desde cero, consulta [Conectarse a un proveedor de IA](../connections/connecting-to-a-provider.md).

## Chat Settings Presets

En la parte superior del panel hay una barra **Chat Settings Presets**. Un Chat Settings Preset es un paquete guardado de los ajustes de un chat que puedes reutilizar en otros chats. Elige un preset (ajuste guardado) del menú desplegable para aplicarlo al chat actual.

Un preset agrupa la conexión de este chat, el preset de prompt, los agentes, las herramientas, la traducción, el Memory Recall, los parámetros avanzados y otros ajustes. Nunca toca tus personajes, tu persona, tus lorebooks (libros de trasfondo), tus sprites (imágenes del personaje), el resumen, las etiquetas ni el prompt de escena. Esos quedan ligados al chat en sí.

La barra tiene una fila de botones pequeños con iconos y sin texto. Cada botón muestra su nombre en un tooltip cuando pasas el cursor por encima:

- El icono de disco (**Save current chat settings into this preset**) escribe los ajustes del chat actual en el preset seleccionado.
- El icono de lápiz (**Rename preset**) cambia el nombre del preset seleccionado.
- El icono de archivo con signo más (**Save current chat settings as a new preset**) guarda los ajustes del chat actual como un preset totalmente nuevo.
- El icono de flecha hacia abajo (**Import preset (.json)**) carga un preset desde un archivo `.json`.
- El icono de flecha hacia arriba (**Export preset (.json)**) guarda el preset seleccionado en un archivo `.json`.
- El icono de papelera (**Delete preset**) elimina el preset seleccionado.

Junto al menú desplegable hay un botón de estrella. Haz clic en él para marcar un preset como predeterminado para los chats nuevos en este modo. Cuando creas un chat nuevo en ese modo, Marinara aplica por ti el preset marcado con estrella. Solo un preset por modo puede ser el predeterminado marcado con estrella a la vez.

Cada modo que admite esta función tiene un preset **Default** (Predeterminado) integrado. No puedes cambiar el nombre del preset **Default**, ni guardar en él, ni eliminarlo. Aplicarlo restablece los ajustes del chat controlados por presets a los valores predeterminados de la app.

La barra **Chat Settings Presets** no aparece en el modo Game.

Los Chat Settings Presets son un sistema distinto de los presets de prompt. Un preset de prompt da forma a la estructura del prompt del sistema y a los parámetros de generación. Un Chat Settings Preset solo agrupa los ajustes enumerados arriba. Para conocer todas las reglas, consulta [Chat Settings Presets](../prompts/chat-settings-presets.md).

## Otras secciones del panel

El panel **Chat Settings** también alberga muchas funciones por chat. Cada una tiene su propia guía:

- **Persona** elige a quién interpretas en este chat. Aparece en los chats Conversation y Roleplay. Consulta [Elegir tu persona en un chat](../characters/choosing-your-persona.md).
- **Characters** gestiona los personajes en los chats Conversation y Roleplay. Para los chats con dos o más personajes, consulta [Chats grupales y conversaciones grupales](group-chats.md).
- **Party** aparece solo en los chats Game. Reemplaza las secciones **Persona** y **Characters** y combina ambas en un solo lugar.
- **Lorebooks** adjunta información del mundo (World Info) a este chat. Consulta [Descripción general de los lorebooks](../lorebooks/overview.md).
- **Agents** activa ayudantes de IA para este chat. Consulta [Agentes: ayudantes de IA para tus chats](../agents/agents-overview.md).
- **Translation** configura la traducción automática de mensajes. Consulta [Traducción de mensajes](../integrations/message-translation.md).
- **Advanced Parameters** anula los ajustes de generación, como la temperatura y el máximo de tokens, para este chat. Consulta [Parámetros de generación](../prompts/generation-parameters.md).

Qué secciones ves depende del modo del chat. Algunas secciones aparecen solo en los chats Roleplay, Conversation o Game.

## Guías relacionadas

- [Gestionar tu lista de chats](managing-chats.md)
- [Elegir tu persona en un chat](../characters/choosing-your-persona.md)
- [Descripción general de los lorebooks](../lorebooks/overview.md)
- [Agentes: ayudantes de IA para tus chats](../agents/agents-overview.md)
- [Chat Settings Presets](../prompts/chat-settings-presets.md)
- [Parámetros de generación](../prompts/generation-parameters.md)
