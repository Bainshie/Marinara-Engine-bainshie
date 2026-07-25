# Presets de Chat Settings

Esta guía explica los presets de **Chat Settings** (Ajustes del chat) en Marinara Engine. Un preset (ajuste guardado) es un paquete con nombre que reúne la conexión de un chat, su preset de prompt y otros ajustes propios de ese chat. Puedes reutilizar el paquete en varios chats. Esta guía muestra cómo guardar, aplicar, marcar como predeterminado, renombrar, importar y exportar presets.

## Qué es un Chat Settings Preset

Un Chat Settings Preset, a veces abreviado como chat preset, es un paquete guardado de los ajustes que eliges para un chat. Le das un nombre al paquete y luego lo aplicas a cualquier otro chat del mismo modo. Así te ahorras volver a configurar la misma conexión, el mismo preset de prompt y los mismos agentes cada vez.

Estos presets se gestionan desde la parte superior del panel **Chat Settings**. Abre un chat, abre **Chat Settings** (el engranaje) y la barra de presets queda justo arriba del todo.

Los Chat Settings Presets funcionan en el Conversation Mode y en el Roleplay Mode. El Game Mode no los usa. En un chat de Game, la barra de presets no aparece.

## Los Chat Settings Presets no son presets de prompt

Marinara tiene dos sistemas de "preset" distintos. No los confundas.

- Un **preset de prompt** es la plantilla de system prompt que construye el texto que se envía a la IA. Lo editas en el panel Presets. Consulta [Preset Editor and Prompt Manager](presets.md).
- Un **Chat Settings Preset** es un paquete más amplio. Incluye qué preset de prompt usa el chat, además de la conexión, los agentes y más.

En resumen, un preset de prompt es un elemento dentro de un Chat Settings Preset. Esta guía cubre solo el paquete Chat Settings Preset.

## Qué incluye y qué excluye un preset

Un Chat Settings Preset agrupa los ajustes de este chat. El texto de ayuda dentro de la app los enumera: la conexión, el preset de prompt (llamado prompt source en el Conversation Mode), los agentes, las herramientas, la traducción, el memory recall, los parámetros avanzados y otros ajustes.

Un preset nunca toca el contenido que pertenece al chat en sí. El texto de ayuda nombra estos elementos: tus personajes, tu persona, tus lorebooks, los sprites, el resumen, las etiquetas y el prompt de escena. Todo eso queda ligado al chat y no cambia cuando aplicas un preset.

Así que un preset lleva cómo habla el chat con la IA. No lleva quién está en el chat ni qué ha pasado hasta ahora.

## Aplicar un preset a un chat

La barra de presets tiene un menú desplegable en la parte de arriba. Su tooltip (texto de ayuda) dice **Apply a chat-settings preset to this chat**.

1. Abre el chat que quieres cambiar.
2. Abre **Chat Settings** (el icono del engranaje).
3. Abre el menú desplegable de presets en la parte superior del panel.
4. Elige un preset por su nombre.

Los ajustes del chat se actualizan de inmediato para coincidir con el preset. Si tu chat actual no coincide con ningún preset guardado, el menú desplegable muestra **Custom settings - choose a preset** (Ajustes personalizados: elige un preset). Si el chat apunta a un preset que ya no existe, muestra **Missing preset - choose a preset** (Falta el preset: elige un preset).

## Guardar tus ajustes como preset

La fila de botones con iconos que hay bajo el menú desplegable contiene las acciones de preset. Pasa el cursor sobre un botón para ver su etiqueta. Los botones son:

| Botón | Etiqueta del tooltip | Qué hace |
|---|---|---|
| Save (icono de disco) | **Save current chat settings into this preset** | Sobrescribe el preset seleccionado con los ajustes actuales del chat |
| Rename (icono de lápiz) | **Rename preset** | Renombra el preset seleccionado |
| Save As (icono de archivo con "+") | **Save current chat settings as a new preset** | Crea un preset nuevo a partir de los ajustes actuales del chat |
| Import (icono de flecha hacia abajo) | **Import preset (.json)** | Carga un preset desde un archivo `.json` |
| Export (icono de flecha hacia arriba) | **Export preset (.json)** | Guarda el preset seleccionado en un archivo `.json` |
| Delete (icono de papelera) | **Delete preset** | Elimina el preset seleccionado |

Para crear tu primer preset, configura un chat como te guste y luego usa **Save current chat settings as a new preset**. Escribe un nombre y confirma. Tu nuevo preset aparece ahora en el menú desplegable.

Para actualizar un preset más adelante, aplícalo, cambia los ajustes del chat y luego usa **Save current chat settings into this preset**. Esto sobrescribe el preset con los nuevos ajustes.

## Marcar un preset predeterminado con la estrella

Junto al menú desplegable hay un botón con forma de estrella. Su tooltip dice **Mark this preset as default for new chats in this mode**.

Marca un preset con la estrella para que sea el punto de partida de cada nuevo chat que crees en ese modo. Solo un preset por modo puede ser el predeterminado con estrella a la vez. Marcar uno nuevo quita la estrella del anterior.

Cuando un preset ya es el predeterminado, el tooltip de la estrella dice **This preset is the default for new chats in this mode**. Cuando no hay ningún preset seleccionado, dice **Select a preset to mark it as default**.

## Importar y exportar presets

Usa **Export preset (.json)** para guardar un preset como un archivo que puedas compartir o respaldar. El archivo se descarga con un nombre `.marinara-chat-preset.json`.

Usa **Import preset (.json)** para volver a cargar un archivo de preset. Marinara añade el preset importado como un preset nuevo y no predeterminado. No sobrescribe nada y no se convierte en el predeterminado hasta que lo marques con la estrella.

Los presets guardan ajustes, no secretos. Compartir un archivo de preset es una forma segura de pasarle tu configuración a otra persona.

## El preset Default

Cada modo que admite esta función tiene un preset integrado llamado **Default** (Predeterminado). El Conversation Mode y el Roleplay Mode tienen cada uno su propio **Default**.

El preset **Default** está vacío. Aplícalo para restablecer los ajustes del chat controlados por el preset a los valores predeterminados del sistema para ese modo. Es una forma rápida de empezar de cero con la configuración de un chat.

No puedes cambiar el preset **Default**. Los botones Save, Rename y Delete aparecen atenuados mientras está seleccionado, así que no puedes hacer clic en ellos. Sus tooltips lo explican: **Cannot save into the Default preset**, **Cannot rename the Default preset** y **Cannot delete the Default preset**.

## Guías relacionadas

- [Chat Settings Overview](../chats/chat-settings.md)
- [Preset Editor and Prompt Manager](presets.md)
- [Generation Parameters](generation-parameters.md)
