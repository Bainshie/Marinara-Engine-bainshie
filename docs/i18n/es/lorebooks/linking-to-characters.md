# Vincular lorebooks a personajes y personas

Esta guía muestra cómo vincular lorebooks (libros de trasfondo) a un personaje o a una persona para que se activen automáticamente en los chats correctos. También cubre cómo incrustar un lorebook dentro de una tarjeta de personaje y los controles de **Lorebooks** de cada chat. Un lorebook es un conjunto de entradas de World Info que se disparan por palabras clave. Consulta [Resumen de lorebooks](overview.md) si son nuevos para ti.

## Dos formas de adjuntar un lorebook

Hay dos formas distintas de adjuntar un lorebook a un personaje. Se comportan de manera diferente, así que elige la que quieras.

- **Link (Assign)** (Vincular / Asignar): el lorebook se queda en tu biblioteca. El personaje o la persona apunta a él. El lorebook se activa por sí solo en los chats que incluyen ese personaje o que usan esa persona. Un lorebook vinculado NO viaja dentro de una tarjeta de personaje exportada.
- **Embed** (Incrustar): el lorebook se escribe dentro de la tarjeta de personaje misma. Viaja con la tarjeta cuando exportas o compartes el personaje. Incrustar está disponible solo para personajes, no para personas.

La mayoría de las veces quieres vincular un lorebook. Incrústalo solo cuando planeas compartir la tarjeta de personaje con el lorebook ya integrado.

## La pestaña Lorebook en el editor

Tanto el editor de personajes (Character editor) como el editor de personas (Persona editor) tienen una pestaña **Lorebook**.

1. Abre un personaje o una persona para editarlo.
2. Haz clic en la pestaña **Lorebook**.
3. Verás una sección **Lorebooks** con dos botones: **New** (Nuevo) y **Assign Lorebook** (Asignar lorebook).

**New** crea un lorebook nuevo que ya está vinculado al personaje o la persona que estás editando. Abre la ventana **Create Lorebook** (Crear lorebook) con la **Category** (Categoría) establecida en **Character** (Personaje).

**Assign Lorebook** vincula un lorebook existente de tu biblioteca. El selector solo muestra los lorebooks de la categoría **Character**. Esto se describe a continuación.

## Asignar un lorebook existente

El selector de **Assign Lorebook** solo muestra los lorebooks cuya **Category** es **Character**. Esto también es cierto al editar una persona. Un lorebook de otra categoría, como World o NPC, no aparecerá en el selector ni en la lista de asignados. Para que aparezca, abre el lorebook y establece su **Category** en **Character** en la pestaña **Overview** (Resumen). El botón **New** evita este problema, porque crea un lorebook de categoría Character por ti.

1. En la pestaña **Lorebook**, haz clic en **Assign Lorebook**.
2. En el cuadro de búsqueda, escribe parte del nombre del lorebook para encontrarlo.
3. Haz clic en el lorebook que quieres. Aparece una marca de verificación junto a él.
4. A la derecha, elige un **Scope** (Alcance) (consulta la siguiente sección).
5. Haz clic en **Assign**.

El lorebook ahora aparece en la lista de asignados. Cada fila de lorebook asignado tiene un botón **Scope** para cambiar su alcance más tarde y un icono de papelera para quitar el vínculo. Haz clic en el nombre del lorebook para abrirlo en el editor completo.

Un lorebook establecido como Global está activo en todos los chats. No puede vincularse además a un personaje o una persona. Global se explica en [Resumen de lorebooks](overview.md).

## Scope: qué chats pueden usar el lorebook vinculado

**Scope** controla dónde se permite que un lorebook vinculado se active. No significa todos los chats de Marinara. Significa los chats que incluyen este personaje, o que usan esta persona. Hay tres modos de alcance.

- **All chats with [name]** (Todos los chats con [nombre]): el predeterminado. El lorebook se activa en todos los chats que incluyen este personaje o usan esta persona.
- **Disabled for all chats** (Desactivado para todos los chats): el vínculo se mantiene, pero el lorebook nunca se activa. Usa esto para pausar un lorebook sin desvincularlo.
- **Specific chats** (Chats específicos): eliges chats exactos de una lista de verificación. Solo los chats que marcas pueden usar el lorebook. La lista muestra los chats que ya incluyen este personaje o usan esta persona.

Si eliges **Specific chats**, debes marcar al menos un chat antes de poder guardar.

Para cambiar el alcance más tarde, haz clic en el botón **Scope** de la fila del lorebook asignado, ajústalo y haz clic en **Assign** de nuevo.

## Incrustar un lorebook en una tarjeta de personaje

Incrustar escribe un lorebook dentro de la tarjeta de personaje para que se exporte con el personaje. Esto es solo para personajes. Úsalo cuando quieres compartir un personaje que ya lleva su World Info.

1. Abre el personaje en el Character editor.
2. Ve a la pestaña **Lorebook**.
3. Asegúrate de que el lorebook que quieres ya esté asignado (consulta lo anterior).
4. En la fila de ese lorebook, haz clic en **Embed into card** (Incrustar en la tarjeta).

Deberías ver aparecer una insignia **Embedded** (Incrustado) en la fila. A partir de ahora las entradas del lorebook viven dentro de la tarjeta y se exportan con ella.

Una tarjeta de personaje contiene un lorebook incrustado a la vez. Si una tarjeta ya tiene uno, el botón **Embed into card** está desactivado con la nota "Remove the current embedded lorebook first". Quita la copia incrustada existente antes de incrustar un lorebook diferente.

Si editas el lorebook vinculado después de incrustarlo, haz clic en **Refresh** (Actualizar) en su fila. Esto reescribe la copia incrustada a partir de las entradas actuales del lorebook, para que la copia integrada se mantenga al día.

## Gestionar un lorebook incrustado

Cuando una tarjeta de personaje ya tiene un lorebook incrustado, aparecen controles adicionales debajo de la lista de asignados. Allí también aparece una lista de solo lectura de las entradas incrustadas.

- **Import Embedded Lorebook** (Importar lorebook incrustado): convierte las entradas integradas de la tarjeta en un lorebook normal y editable en tu biblioteca. El nuevo lorebook queda vinculado de vuelta al personaje. El botón dice **Reimport Embedded Lorebook** (Reimportar lorebook incrustado) una vez que ya existe una copia vinculada.
- **Edit Embedded Lorebook** (Editar lorebook incrustado): abre ese lorebook vinculado en el editor completo. Tus ediciones allí se sincronizan de vuelta en la copia incrustada de la tarjeta automáticamente.
- **Remove from card** (Quitar de la tarjeta): elimina la copia incrustada de la tarjeta. Cualquier lorebook vinculado por separado en tu biblioteca queda intacto.

Esto es útil para tarjetas que importaste de otras herramientas. Muchas tarjetas importadas llegan con un lorebook incrustado. Haz clic en **Import Embedded Lorebook** para obtener una versión totalmente editable en Marinara.

## La sección Lorebooks de Chat Settings

Cada chat tiene sus propios controles de **Lorebooks**. Aquí es donde ves qué lorebooks están activos en el chat actual y los ajustas solo para ese chat.

1. Abre un chat.
2. Abre **Chat Settings** (Ajustes del chat).
3. Busca la sección **Lorebooks**. La insignia de conteo muestra cuántos lorebooks están activos.

Cada lorebook activo muestra una o más insignias que te dicen por qué está activado:

- **Chat**: lo fijaste a este chat a mano.
- **Global**: es un lorebook global.
- **Character**: está vinculado a un personaje de este chat.
- **Persona**: está vinculado a la persona de este chat.

Puedes cambiar lo que está activo solo para este chat.

- **Add Lorebook** (Añadir lorebook): fija un lorebook a este chat. Los lorebooks fijados muestran la insignia **Chat**.
- Icono de papelera (**Remove from chat** / Quitar del chat): quita un lorebook que añadiste a mano.
- Icono de ojo tachado (**Disable in this chat** / Desactivar en este chat): oculta temporalmente un lorebook activado automáticamente solo para este chat, sin desvincularlo. Los lorebooks desactivados muestran un nombre tachado y una insignia **Disabled** (Desactivado).
- Icono de ojo (**Enable in this chat** / Activar en este chat): vuelve a activar un lorebook desactivado para este chat.

### Lorebook Token Budget

**Lorebook Token Budget** (Presupuesto de tokens del lorebook) es un campo numérico de esta sección. Limita cuánto texto de lorebook se puede inyectar en este chat, medido en tokens (fragmentos de texto). El predeterminado es **8192**. Establécelo en **0** para no tener límite. Este presupuesto de todo el chat es independiente del presupuesto de tokens propio de cada lorebook. Ambos límites aplican. Consulta [Presupuestos de tokens y recursión de lorebooks](token-budgets.md) para saber cómo funcionan juntos los dos presupuestos.

## Guías relacionadas

- [Resumen de lorebooks](overview.md)
- [Presupuestos de tokens y recursión de lorebooks](token-budgets.md)
- [Importar y exportar lorebooks](import-export.md)
- [Crear y editar personajes](../characters/creating-and-editing-characters.md)
- [Resumen de Chat Settings](../chats/chat-settings.md)
