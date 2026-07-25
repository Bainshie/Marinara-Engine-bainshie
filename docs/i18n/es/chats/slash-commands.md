# Referencia de comandos slash

Esta guía enumera los comandos slash que puedes escribir en un chat de Marinara Engine. Un comando slash es un atajo que escribes en el cuadro de mensaje, empezando con una barra diagonal, para hacer algo rápido. Algunos comandos actúan en tu pantalla al instante, y otros piden a la IA que escriba algo.

## Cómo funcionan los comandos slash

Ejecutas un comando slash escribiéndolo en el cuadro de mensaje al final de un chat y luego pulsando **Send** (Enviar). Pulsar Enter también lo envía si **Send on Enter** (Enviar con Enter) está activado para tu modo de chat en **Settings** (Configuración). De forma predeterminada, Enter envía en los chats de Conversation (conversación) pero empieza una línea nueva en los chats de Roleplay. El cuadro de mensaje da pistas sobre los comandos slash. En un chat de Roleplay, el texto de marcador de posición dice **Write your response, / for commands** (Escribe tu respuesta, / para comandos). En un chat de Conversation, el marcador de posición muestra el nombre del personaje, como "Message @Alice, / for commands". Una conversación con más de un personaje muestra el nombre del chat en su lugar.

En cuanto escribes una barra, aparece un pequeño menú de comandos coincidentes encima del cuadro. Cada fila muestra el nombre del comando y una descripción corta. Haz clic o toca una fila para rellenar ese comando en el cuadro, luego añade cualquier texto extra y envíalo.

Muchos comandos tienen alias más cortos. Por ejemplo, puedes escribir `/continue` o su alias `/cont`, y ambos hacen lo mismo. Para ver la lista completa dentro de la app en cualquier momento, ejecuta este comando:

```
/help
```

Algunos comandos se ejecutan en tu navegador y cambian el chat al instante, sin costo. Otros comandos piden a la IA que genere texto, lo que usa tu proveedor conectado y puede usar tokens. Un token (fragmento de texto) es la unidad que la mayoría de proveedores de IA usan para medir y facturar el texto. Las tablas de abajo indican qué hace cada comando.

Los comandos slash funcionan en los cuadros de mensaje de **Conversation** y **Roleplay**. En modo **Game** (Game Mode), solo `/illustrate` funciona como comando slash. Cualquier otra cosa que escribas empezando con una barra se envía como texto normal.

Varios comandos usan números de mensaje. Marinara cuenta los mensajes desde el primer mensaje del chat como número 1, luego 2, luego 3, y así sucesivamente. Comandos como `/goto`, `/hide` y `/unhide` usan estos números.

## Comandos de chat y mensajes

Estos comandos te ayudan a gestionar el chat y sus mensajes. Funcionan en los chats de **Conversation** y **Roleplay**.

| Comando | También funciona como | Qué hace |
|---|---|---|
| `/help` | | Enumera todos los comandos slash. |
| `/continue` | `/cont` | Añade más texto a la última respuesta de la IA, sin enviar un mensaje nuevo. |
| `/goto` | `/jump`, `/scroll` | Desplaza el chat hasta un mensaje según su número. |
| `/hide` | | Oculta uno o más mensajes a la IA en los turnos siguientes. |
| `/unhide` | | Devuelve los mensajes ocultos a la vista de la IA. |
| `/sys` | `/system` | Añade un mensaje de sistema. Esta nota aparece en el chat y guía a la IA, pero ningún personaje la dice. |
| `/macros` | `/macro` | Enumera los macros de prompt admitidos, como `{{user}}` y `{{char}}`. |
| `/remind` | `/reminder`, `/timer` | Configura un temporizador y luego publica un mensaje recordatorio en el chat. |

Para saltar al mensaje 27, escribe esto:

```
/goto 27
```

`/hide` y `/unhide` aceptan un solo número, un rango o una mezcla. Por ejemplo, esto oculta los mensajes del 3 al 8:

```
/hide 3-8
```

También puedes escribir `/hide 5` para un mensaje, o `/hide 2-5,9,12` para varios. Los mensajes ocultos permanecen en tu chat, pero la IA no los lee en el turno siguiente. Usa `/unhide` con el mismo tipo de lista de números para traerlos de vuelta.

El comando `/remind` toma un tiempo y luego un mensaje. El tiempo usa `h` para horas, `m` para minutos y `s` para segundos. Este ejemplo te recuerda dentro de 30 minutos:

```
/remind 30m check the oven
```

El recordatorio vive en la sesión de tu navegador, así que mantén la pestaña abierta hasta que se active.

## Comandos de historia y roleplay

Estos comandos te ayudan a guiar una historia, interpretar un personaje y añadir arte. La mayoría funcionan mejor en un chat de **Roleplay**. La excepción es `/scene`, que ejecutas desde un chat de **Conversation**.

| Comando | También funciona como | Qué hace |
|---|---|---|
| `/guided` | `/narrator`, `/narrate`, `/nar` | Guía la siguiente respuesta de la IA en la dirección que describas. |
| `/as` | `/respond` | Publica un mensaje como un personaje, o pide a un personaje que responda. |
| `/emote` | `/emotion`, `/sprite` | Enumera o cambia la expresión del sprite (imagen del personaje) de un personaje. |
| `/roll` | `/r`, `/dice` | Tira los dados y publica el resultado. |
| `/random` | `/rand`, `/event` | Pide a la IA que añada un evento sorpresa a la historia. |
| `/scene` | `/rp` | Se ejecuta desde un chat de Conversation. Inicia una nueva escena de Roleplay que se ramifica a partir de esa conversación. |
| `/illustrate` | `/ill` | Genera una imagen de galería para el chat actual. |
| `/impersonate` | `/imp` | Escribe una respuesta como tu persona. |
| `/impersonate_prompt` | `/imp_prompt` | Establece la instrucción que `/impersonate` usa en este chat. |

Para guiar la siguiente respuesta, añade tu dirección después de `/guided`:

```
/guided make him confess he is lying
```

El comando `/roll` lee la notación de dados. Esto tira dos dados de seis caras:

```
/roll 2d6
```

Puedes añadir un modificador, como `/roll 1d20+5`. Si escribes `/roll` sin nada después, Marinara tira `1d20`.

Un sprite es una pieza de arte del personaje que muestra una expresión. El comando `/emote` cambia cuál se muestra. Escribe `/emote` solo para ver las expresiones disponibles, o nombra una para cambiar a ella:

```
/emote joy
```

El cambio de sprite necesita un chat de Roleplay que tenga sprites subidos. Consulta [Sprites de personaje](../characters/sprites.md) para saber cómo añadirlos.

Tu persona es el personaje que te representa en un chat, escrito como `{{user}}` en los prompts. El comando `/impersonate` escribe una respuesta en tu lugar. Puedes añadir una dirección después:

```
/impersonate ask about the weather
```

`/impersonate` e `/impersonate_prompt` no están disponibles en los chats de **Conversation**. Para un recorrido completo de la generación guiada y la suplantación, consulta [Generación guiada e Impersonate](guided-and-impersonate.md).

## Comandos del modo Conversation

Estos comandos solo funcionan en un chat de **Conversation**.

| Comando | Qué hace |
|---|---|
| `/uno` | Inicia una partida de UNO con los personajes del chat. |
| `/chess` | Inicia una partida de ajedrez uno contra uno con un personaje. |
| `/poker` | Inicia una partida de póker Texas Hold'em con los personajes. |
| `/8ball` | Inicia una partida uno contra uno de billar bola 8 con un personaje. `/pool` hace lo mismo. |
| `/status` | Establece o borra el estado de presencia de un personaje. |

Los comandos `/uno`, `/chess`, `/poker` y `/8ball` abren la pantalla de configuración de ese juego. Puedes jugar una partida a la vez en un chat. Para las reglas y opciones, consulta [Juegos de mesa](../conversation/table-games.md).

El comando `/status` anula la presencia de un personaje. El estado puede ser `online`, `idle`, `dnd` (no molestar) u `offline`. Usa `clear` para quitar una anulación. Esto establece el personaje como inactivo:

```
/status idle
```

En un chat con más de un personaje, añade el nombre del personaje al final, como `/status online Alice`.

## Guías relacionadas

- [Acciones de mensaje](messages.md)
- [Generación guiada e Impersonate](guided-and-impersonate.md)
- [Juegos de mesa](../conversation/table-games.md)
- [Macros](../prompts/macros.md)
