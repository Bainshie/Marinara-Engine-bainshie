# Crear agentes personalizados

Esta guía te muestra cómo construir tu propio agente en Marinara Engine. Un agente es un pequeño ayudante de IA que se ejecuta automáticamente junto a tu chat. Aprenderás a configurar su fase, poderes, tipo de salida, palabras clave de activación, herramientas y prompt (las instrucciones enviadas a la IA), con un ejemplo completo trabajado.

¿Eres nuevo con los agentes? Lee primero [Agentes: ayudantes de IA para tus chats](agents-overview.md) para conocer lo básico y luego vuelve aquí.

## Cuándo construir un agente personalizado

Marinara Engine ofrece muchos agentes oficiales descargables. Consulta la [Referencia de agentes descargables](built-in-agents.md) y el repositorio público del paquete [Pasta-Devs/Marinara-Agents](https://github.com/Pasta-Devs/Marinara-Agents) antes de construir el tuyo. Puede que un agente del catálogo ya haga lo que quieres, y los manifiestos oficiales proporcionan ejemplos de paquetes que funcionan.

Construye un agente personalizado cuando necesites algo que los integrados no cubren. Algunas buenas razones son:

- Quieres un ayudante con tus propias instrucciones y voz.
- Quieres inyectar una nota específica en cada prompt.
- Quieres reescribir cada respuesta con un cierto estilo.
- Quieres que un agente llame a tu propia herramienta personalizada.

Si un agente oficial ya instalado se acerca a lo que buscas, cópialo en su lugar. En el panel **Agents** (Agentes), pasa el cursor sobre su tarjeta y haz clic en **Copy agent**. Esto crea una copia personalizada editable.

## Antes de empezar

Dos cosas importan antes de construir:

1. Los agentes se configuran por chat, no por personaje. Construir un agente en la biblioteca no lo ejecuta. Debes añadirlo a un chat y activar **Enable Agents** en **Chat Settings** (Ajustes del chat).
2. Los agentes personalizados funcionan en todos los modos de chat: Roleplay, Game Mode y Conversation. Los paquetes oficiales aparecen solo en sus modos compatibles, mientras que tus propios agentes personalizados quedan disponibles en todas partes.

## Crear un agente personalizado

Sigue estos pasos para crear un nuevo agente personalizado desde cero.

1. Abre el panel **Agents**.
2. Haz clic en el botón **New** (Nuevo), el icono del signo más, cerca de la parte superior.
3. Se abre el editor de agentes a página completa con un agente personalizado en blanco.
4. Escribe un nombre en el campo de título en la parte superior, por ejemplo `Weather Reporter`.
5. Rellena los campos **Description** (Descripción) y **Author** (Autor) para que recuerdes qué hace.
6. Elige una **Pipeline Phase** (Fase del pipeline) (ver más abajo).
7. Activa los poderes que necesites en **Custom Agent Abilities** (Habilidades del agente personalizado).
8. Elige un **Result Type** (Tipo de resultado) que coincida con lo que el agente debe producir.
9. Escribe las instrucciones del agente en **Prompt Template** (Plantilla de prompt).
10. Haz clic en **Save** (Guardar) en la barra superior. Deberías ver una insignia verde **Saved**.

Tu nuevo agente aparece ahora en la sección **Custom Agents** (Agentes personalizados) del panel **Agents**. Para usarlo, abre un chat, ve a **Chat Settings**, activa **Enable Agents** y añade tu agente desde la sección **Custom Agents** que hay allí.

## Pipeline Phase

La **Pipeline Phase** establece cuándo se ejecuta tu agente. Elige uno de tres botones:

- **Pre-Generation**: se ejecuta antes de que la IA responda. Puede añadir contexto o cambiar el prompt.
- **Parallel**: se ejecuta al mismo tiempo que la respuesta. No puede ver la respuesta terminada.
- **Post-Processing**: se ejecuta después de que la respuesta esté completa. Puede leer y, para algunos tipos de resultado, editar la respuesta.

Algunos tipos de resultado obligan a una fase. Si eliges **Text Rewrite**, la fase cambia a **Post-Processing**. Si eliges **Prompt Patch**, la fase cambia a **Pre-Generation**. Esto ocurre porque esos trabajos solo tienen sentido en esa fase.

Los agentes personalizados de Post-Processing también obtienen una sección **Turn Data Access** (Acceso a datos del turno). Tiene dos interruptores opcionales: **Pre-generation injections** y **Parallel agent results**. Actívalos para que tu agente pueda leer lo que otros agentes produjeron durante el mismo turno. Déjalos desactivados para mantener tu agente aislado.

## Custom Agent Abilities

Las **Custom Agent Abilities** son poderes que se activan de forma opcional. Un poder permanece bloqueado hasta que activas su interruptor. Esto mantiene un agente personalizado seguro de forma predeterminada. Hay ocho interruptores:

| Habilidad | Lo que permite hacer al agente |
|---|---|
| **Create lorebooks** | Crear un nuevo lorebook (libro de trasfondo) hecho por el agente cuando su salida de lore no tiene destino. |
| **Edit lorebooks** | Escribir entradas de lorebook o generar resultados de actualización de lorebook. |
| **Edit messages** | Reemplazar el texto del mensaje generado por texto reescrito. |
| **Edit trackers** | Actualizar el estado del tracker (agente de seguimiento) del juego, del personaje, de la persona o personalizado. |
| **Frontend styling** | Aplicar un efecto de estilo visual temporal durante la generación. |
| **Image generation** | Activar el generador de imágenes con un prompt de imagen. |
| **Vectors/embeddings** | Usar contexto de vectores o embeddings (representaciones numéricas del texto). Los vectores son una forma de buscar texto por su significado. |
| **Main prompt edits** | Editar el prompt enviado al modelo de IA principal. |

Un lorebook es un conjunto de notas de trasfondo que la IA puede incorporar a una escena. Un tracker es un panel en vivo que almacena datos como estadísticas, estado de ánimo o ubicación.

Si activas **Edit lorebooks**, aparece una sección **Lorebook Writer**. Activa **Allow lorebook entry writes** y elige un lorebook en el menú desplegable **Target lorebook**. El agente solo puede escribir en ese único lorebook.

## Result Type

El **Result Type** le dice a Marinara cómo leer la salida de tu agente. La mayoría de los tipos de resultado esperan que el agente devuelva JSON. JSON es un formato de texto simple escrito con llaves y comillas. Cada tipo de resultado necesita la habilidad correspondiente de la tabla anterior.

| Result Type | Lo que hace | Habilidad necesaria |
|---|---|---|
| **Context Injection** | Añade texto antes de la generación o registra una nota después de la generación. | Ninguna |
| **Text Rewrite** | Se ejecuta después de la respuesta y reemplaza el texto del mensaje. | Edit messages |
| **Lorebook Update** | Crea o actualiza entradas de lorebook. | Edit lorebooks |
| **Character Tracker** | Actualiza el tracker del personaje (personajes presentes). | Edit trackers |
| **Persona Stats** | Actualiza las estadísticas, el estado y el inventario de la persona. | Edit trackers |
| **Custom Tracker** | Reemplaza los campos de tu propio tracker personalizado. | Edit trackers |
| **Game State** | Actualiza datos de juego al estilo del estado del mundo. | Edit trackers |
| **Image Prompt** | Pide al generador de imágenes que dibuje una escena. | Image generation |
| **Prompt Patch** | Añade, antepone o reemplaza secciones del prompt. | Main prompt edits |
| **Frontend Style** | Aplica un efecto de estilo temporal. | Frontend styling |

**Context Injection** es el punto de partida más amigable. No necesita ningún interruptor de habilidad ni un formato de salida estricto. Úsalo cuando solo quieras que el agente añada una nota corta al prompt o registre un resumen.

Si un tipo de resultado aparece atenuado, es que aún no has activado su habilidad. Activa el interruptor correspondiente en **Custom Agent Abilities** y entonces el tipo de resultado se vuelve seleccionable.

## Activation Keywords

De forma predeterminada, un agente personalizado se ejecuta con su cadencia normal. Las **Activation Keywords** (Palabras clave de activación) te permiten omitir el agente a menos que la escena sea relevante. Esto ahorra tokens (fragmentos de texto) y costo. Un token es un pequeño fragmento de texto que la IA cuenta.

Para configurar esto:

1. En la sección **Activation Keywords**, escribe una palabra clave o frase por línea. Por ejemplo:

```
tavern
secret door
moonlit ritual
```

2. Configura **Scan Depth** con el número de mensajes recientes a buscar. El valor predeterminado es 5. El máximo es 200.
3. El agente ahora se ejecuta solo cuando al menos una palabra clave aparece en esa cantidad de mensajes recientes.

Deja la casilla de palabras clave vacía para ejecutar el agente cada vez con su cadencia normal.

## Adjuntar herramientas (Function Calling)

Tu agente puede llamar a herramientas. Una herramienta es una función que la IA puede ejecutar para obtener o cambiar algo y luego leer el resultado. Esto también se llama function calling.

Para adjuntar herramientas, abre la sección **Tools / Function Calling** y activa o desactiva cada herramienta. La lista incluye herramientas integradas y cualquier herramienta personalizada que hayas creado. Para aprender a construir la tuya, lee [Herramientas personalizadas](../extending/custom-tools.md).

Las herramientas solo funcionan si el propio chat las permite. En **Chat Settings**, abre la sección **Function Calling** y activa **Enable Tool Use**. Sin ese ajuste del chat, las herramientas del agente permanecen desactivadas incluso cuando las activas aquí.

Los archivos de agente importados no otorgan acceso a herramientas. Después de importar un agente, inspecciona su prompt y sus ajustes, y luego selecciona tú mismo las herramientas que quieras que use.

## Named prompt options

Un solo agente puede contener varias variantes de prompt. Esta es la función **Named prompt options** (Opciones de prompt con nombre). Un chat puede entonces elegir una variante sin que tengas que editar el agente de forma global.

Para añadir una variante:

1. En **Prompt Template**, busca **Named prompt options**.
2. Haz clic en **Add option**.
3. Dale a la opción un nombre y una descripción corta.
4. Escribe el cuerpo completo del prompt para esa opción.

Cuando alguien añade tu agente a un chat, ve un menú desplegable **Prompt Mode** que lista tus opciones con nombre. Si no añades ninguna, el menú del chat muestra solo el prompt predeterminado.

## Otros ajustes que puedes cambiar

Los agentes personalizados comparten algunos ajustes con los agentes integrados:

- **Connection Override**: elige una conexión de IA distinta para este agente. Por ejemplo, usa un modelo más barato para el trabajo en segundo plano. Déjalo vacío para usar la conexión del chat.
- **Agent Budget**: configura **Context Size** (cuántos mensajes recientes lee el agente, predeterminado 5). Configura también **Max Output Tokens** (el espacio de salida reservado, predeterminado 4096, de 128 a 32768).
- **Add as Prompt Section**: activa esto para exponer la salida más reciente del agente como una sección que puedes inyectar en un preset de prompt.

Los macros como `{{user}}` y `{{char}}` funcionan dentro de la **Prompt Template**. Consulta [Macros](../prompts/macros.md) para ver la lista completa.

## Un ejemplo trabajado

Aquí tienes un agente personalizado completo que reescribe cada respuesta en inglés británico.

Configuración en el editor:

1. Ponle el nombre `British English Editor`.
2. En **Custom Agent Abilities**, activa **Edit messages**.
3. En **Result Type**, elige **Text Rewrite**. La fase cambia a **Post-Processing** por sí sola.
4. Pega esto en la **Prompt Template**:

```
You are a copy editor. Rewrite the latest reply into British English.
Change spelling and vocabulary only. Do not change the meaning, tone, or events.
Return JSON with an "editedText" field holding the full rewritten reply,
and a "changes" array of short notes describing what you changed.
```

5. Haz clic en **Save**.
6. Abre un chat de Roleplay, ve a **Chat Settings**, activa **Enable Agents** y añade `British English Editor` desde la sección **Custom Agents**.

El agente devuelve JSON como este después de cada respuesta:

```
{"editedText":"The colour of the harbour caught her eye.","changes":[{"description":"color to colour, harbor to harbour"}]}
```

Marinara lee `editedText` y lo intercambia en la respuesta. Ves el mensaje en inglés británico. Las notas de `changes` aparecen como un breve resumen de lo que el agente ajustó.

## Importar y exportar agentes

Puedes compartir un agente personalizado como archivo.

Para exportar desde el editor, haz clic en el botón **Export agent** (el icono de subir) en la barra superior. Esto guarda el prompt y la configuración del agente como un paquete. Los paquetes de agente nunca incluyen definiciones de herramientas personalizadas.

Para exportar varios agentes a la vez, usa **Select agents** en el panel **Agents**, elige los agentes que quieras y exporta el grupo.

Para importar, abre el panel **Agents** y haz clic en **Import agents** para un solo archivo, o en **Import agent folder** para elegir una carpeta entera. Cada archivo importado se convierte en un nuevo agente personalizado, por lo que no puede reemplazar a un agente curado con el mismo tipo interno. Por seguridad, Marinara también ignora las funciones incluidas y borra las selecciones de herramientas de los ajustes del agente importado. Importa funciones de confianza por separado desde **Function Calls**, revísalas y adjúntalas al agente de forma explícita después.

## Guías relacionadas

- [Agentes: ayudantes de IA para tus chats](agents-overview.md)
- [Referencia de agentes descargables](built-in-agents.md)
- [Herramientas personalizadas](../extending/custom-tools.md)
- [Macros](../prompts/macros.md)
