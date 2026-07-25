# Entradas de lorebook: palabras clave, posición y tiempos

Esta guía explica cómo construir las entradas dentro de un lorebook (libro de trasfondo). Cubre la pestaña **Entries** (Entradas), las palabras clave disparadoras y los tres tipos de entrada. También explica dónde va cada entrada en el prompt (las instrucciones enviadas a la IA) y los controles de tiempos que deciden cuándo se activa una entrada. Si eres nuevo con los lorebooks, lee primero la [Visión general de los lorebooks](overview.md).

Una entrada es un bloque de texto más las reglas que deciden cuándo Marinara Engine agrega ese texto al prompt de la IA. Cuando una entrada se activa, su contenido se inyecta para que la IA "recuerde" un dato que tú nunca escribiste en el chat.

## La pestaña Entries

Abre un lorebook desde el panel **Lorebooks** para llegar a su editor de página completa. El editor tiene dos pestañas laterales: **Overview** (Visión general) y **Entries**. Haz clic en **Entries** para ver la lista de entradas. La insignia de la pestaña muestra cuántas entradas tiene el lorebook.

La barra de herramientas en la parte superior de la pestaña **Entries** tiene estos controles:

- Cuadro **Search entries…** (Buscar entradas): filtra la lista por nombre de entrada, palabras clave o contenido.
- Un menú desplegable de orden con **Order**, **Entries**, **Name A→Z**, **Name Z→A**, **Tokens ↓**, **Keys ↓**, **Newest** y **Oldest**. Las opciones ↓ ordenan de mayor a menor.
- **Select** (Seleccionar): activa la selección múltiple para que puedas copiar, mover o eliminar varias entradas a la vez.
- **Add Folder** (Agregar carpeta): crea una carpeta para agrupar entradas (ver la sección Carpetas de entradas más abajo).
- **Add Entry** (Agregar entrada): crea una nueva entrada en blanco en la parte superior de la lista.

Debajo de la barra de herramientas, una línea de resumen muestra el número de entradas, el número de carpetas y el tamaño total estimado en tokens de todo el contenido de las entradas.

## Agregar y editar una entrada

Para crear una entrada, sigue estos pasos.

1. Abre tu lorebook y haz clic en la pestaña **Entries**.
2. Haz clic en **Add Entry**. Aparece una nueva fila en la lista.
3. Escribe un nombre en el campo de nombre de la fila. Cada entrada necesita un nombre.
4. Haz clic en la fila (o en su flecha en forma de chevron) para expandir el panel lateral del editor completo.
5. Rellena las palabras clave y el contenido, descritos en las secciones de abajo.

Tus cambios se guardan automáticamente. Mientras escribes, el panel lateral muestra **Autosaving…** (Guardando automáticamente), luego **Saving…** (Guardando) y luego **Saved automatically** (Guardado automáticamente). Si un guardado falla, tu texto se queda en su lugar y Marinara lo reintenta en tu siguiente edición. No necesitas un botón de guardar aparte para las entradas.

Cada entrada aparece como una fila compacta de una sola línea. La fila contiene los controles más usados. Expande la fila para llegar al resto.

Para duplicar una entrada, pasa el cursor sobre la fila y haz clic en el botón **Duplicate** (Duplicar). Para quitar una, haz clic en el botón **Delete** (Eliminar). Marinara te pide confirmar con el aviso **Delete this lorebook entry?** (¿Eliminar esta entrada del lorebook?).

## Contenido y palabras clave de la entrada

Expande una entrada para editar sus campos principales.

- **Primary Keys** (Palabras clave principales): las palabras clave que disparan esta entrada. Cuando cualquiera de estas palabras aparece en el chat reciente, la entrada se activa. Escribe una palabra clave y pulsa Enter para agregarla como un chip.
- **Content** (Contenido): el texto que se inyecta en el prompt de la IA cuando la entrada se activa. Escríbelo como un dato simple que quieres que la IA sepa. El contenido admite macros de prompt, y debajo del cuadro se muestra una estimación de tokens en vivo.
- **Secondary Keys** (Palabras clave secundarias): palabras clave adicionales que solo se usan cuando el tipo de entrada es **Selective**. Ver la sección de tipos de entrada más abajo.
- **Description** (Descripción): un resumen corto de la entrada. Solo el agente **Knowledge Router** la lee, para decidir si inyecta la entrada. Nunca se envía a la IA principal como contenido. Ver [Fuentes de conocimiento](../agents/knowledge-sources.md).

Aquí tienes un ejemplo simple.

- Nombre: `Silverhaven`
- Primary Keys: `Silverhaven`, `the capital`
- Contenido: `Silverhaven is the mountain capital. Its people mine blue crystal and distrust outsiders.`

Cuando tú o la IA mencionan `Silverhaven` o `the capital` en el chat, la IA recibe ese dato automáticamente.

## Reglas de coincidencia de palabras clave

De forma predeterminada, una palabra clave principal coincide si la palabra aparece en cualquier parte del texto del chat reciente, sin distinguir mayúsculas ni minúsculas. Tres controles cambian cómo funciona la coincidencia. **Whole Words** (Palabras completas) y **Case Sensitive** (Distinguir mayúsculas) están en el panel lateral expandido. El interruptor **Regex** es el icono pequeño en la fila compacta, y se vuelve naranja cuando está activado.

| Control | Dónde | Predeterminado | Qué hace |
|---|---|---|---|
| **Whole Words** | Panel de la entrada | Off | La palabra clave debe coincidir con una palabra completa, no con parte de una palabra más larga. |
| **Case Sensitive** | Panel de la entrada | Off | Las mayúsculas y minúsculas deben coincidir exactamente. |
| **Regex** | Fila compacta | Off | Trata cada palabra clave como un patrón de expresión regular en lugar de texto simple. |

Una expresión regular (regex) es un lenguaje de coincidencia de patrones para texto. Úsalo solo si sabes regex. Marinara ejecuta cada palabra clave de regex con un tiempo de espera de seguridad corto. Un patrón que tarda demasiado no coincide en ese escaneo, así que mantén los patrones simples.

## Tipos de entrada: Normal, Constant, Selective

Cada entrada tiene un tipo. Haz clic en el pequeño punto de color de la fila de la entrada para abrir el menú de tipos y elegir uno.

- **Normal** (punto verde): se dispara cuando una palabra clave principal coincide con el texto escaneado. Este es el predeterminado.
- **Constant** (punto amarillo): se inyecta cada vez que el lorebook está activo, sin necesidad de palabra clave. Usa esto para datos que siempre deben estar presentes.
- **Selective** (punto rojo): las palabras clave principales deben coincidir, y la lógica de las palabras clave secundarias también debe cumplirse.

Una entrada **Constant** sigue obedeciendo los tiempos, la probabilidad y cualquier filtro que configures. Solo que no necesita una palabra clave.

Cuando una entrada es **Selective**, agrega una o más **Secondary Keys** y elige un botón de **Logic** (Lógica) en el panel lateral:

- **AND Any**: al menos una palabra clave secundaria también debe aparecer.
- **AND All**: cada palabra clave secundaria también debe aparecer.
- **NOT Any**: la entrada se bloquea si aparece cualquier palabra clave secundaria.
- **NOT All**: la entrada se bloquea solo si aparecen todas las palabras clave secundarias.

Por ejemplo, toma una entrada **Selective** con la palabra clave principal `king` y la palabra clave secundaria `Silverhaven`, configurada como **AND Any**. Solo se dispara cuando el chat menciona tanto al rey como a Silverhaven. Esto evita que una palabra compartida como `king` se dispare en la escena equivocada.

## Position, Depth y Order

Estos controles deciden dónde cae en el prompt una entrada activada. Se ubican en la fila compacta en una pantalla ancha. En una pantalla estrecha, toca el botón de controles rápidos de la fila para llegar a ellos.

- **Position** (Posición): elige **Before chat**, **After chat** o **@ Depth**. Before chat y After chat colocan la entrada alrededor del historial del chat. **@ Depth** inyecta la entrada dentro del historial del chat. En una pantalla ancha, la fila las muestra como las etiquetas cortas **↑Char**, **↓Char** y **@Depth**.
- **Depth** (Profundidad): aparece solo cuando **Position** es **@ Depth**. Establece cuántos mensajes hacia atrás desde el último mensaje se inserta la entrada. El predeterminado es 4.
- **Order** (Orden): el orden de inserción cuando varias entradas se activan a la vez. Un número más bajo va antes en el prompt. El predeterminado es 100.

## Probabilidad de disparo

Cada entrada tiene un valor de **Probability** (Probabilidad), mostrado como un porcentaje en la fila. El predeterminado es 100%, lo que significa que la entrada siempre se dispara cuando sus palabras clave coinciden. Bájalo para que una entrada se dispare solo algunas veces. Por ejemplo, 25% significa que la entrada tiene una probabilidad de uno entre cuatro de activarse cada vez que sus palabras clave coinciden.

## Tiempos: Sticky, Cooldown, Delay, Ephemeral

Los campos de **Timing** (Tiempos) del panel lateral controlan el comportamiento de una entrada a lo largo de varios mensajes. **Sticky**, **Cooldown** y **Delay** se cuentan en mensajes. **Ephemeral** cuenta activaciones. Los cuatro empiezan sin configurar (0, que significa desactivado).

- **Sticky** (Persistente): después de que la entrada se dispara, permanece activa durante esta cantidad de mensajes más, incluso sin una nueva coincidencia de palabra clave.
- **Cooldown** (Enfriamiento): después de que la entrada se dispara, espera esta cantidad de mensajes antes de poder dispararse de nuevo.
- **Delay** (Retraso): la entrada espera esta cantidad de mensajes dentro del chat antes de poder activarse por primera vez.
- **Ephemeral** (Efímero): la entrada se desactiva a sí misma después de esta cantidad de activaciones. Un valor de 0 significa ilimitado.

Por ejemplo, configura **Sticky** en 3 para mantener un dato en el prompt durante algunos turnos después de que surge. Así la IA no lo olvida a mitad de la escena.

## Más opciones de entrada

El panel lateral expandido contiene algunos campos más.

- **Role** (Rol): establece si el texto inyectado se etiqueta como **System**, **User** o **Assistant**. Esto solo importa cuando **Position** es **@ Depth**. El predeterminado es **System**.
- **Group** y **Tag**: pon entradas en el mismo **Group** (Grupo) para que solo una de ellas se active a la vez. La **Tag** (Etiqueta) es una etiqueta de texto libre para tu propia clasificación.
- **Locked** (Bloqueado): impide que el agente **Lorebook Keeper** cambie esta entrada. Ver [Referencia de agentes descargables](../agents/built-in-agents.md).
- **No Vector** y la insignia de estado del vector se relacionan con la búsqueda semántica. Ver [Búsqueda semántica para lorebooks](semantic-search.md).

El panel lateral también tiene una sección **Context filters & matching sources** (Filtros de contexto y fuentes de coincidencia). Allí puedes limitar una entrada a ciertos personajes, etiquetas de personaje o tipos de generación. También puedes escanear campos adicionales de la tarjeta (como la descripción del personaje) en busca de las palabras clave de la entrada.

## La herramienta Keyword test

El panel **Keyword test** (Prueba de palabras clave) en la parte superior de la pestaña **Entries** te permite comprobar tus palabras clave sin iniciar un chat. Expándelo y pega un párrafo de muestra o unos cuantos mensajes en el cuadro.

Las entradas cuyas palabras clave coincidirían obtienen un acento verde y un chip **Would activate** (Se activaría). Las entradas **Constant** obtienen un chip **Always active** (Siempre activa), porque se disparan sin importar lo que diga el texto. Una línea de conteo muestra cuántas de tus entradas habilitadas se activarían.

Esta prueba comprueba solo las reglas de palabras clave. Ignora los tiempos, la probabilidad, los filtros de personaje y la coincidencia semántica, así que un chat en vivo aún puede diferir de la vista previa.

## Carpetas de entradas

Las carpetas agrupan entradas dentro de un mismo lorebook. Son distintas de las carpetas de biblioteca en el panel principal **Lorebooks**.

- Haz clic en **Add Folder** para crear una, luego cámbiale el nombre en línea.
- Arrastra una entrada sobre una carpeta para archivarla, o usa el selector **Folder** de la entrada.
- Arrastra una carpeta sobre otra carpeta para anidarla, o arrástrala a la franja superior para desanidarla.
- Cada carpeta tiene un interruptor **Enabled** (Activada). Cuando desactivas una carpeta, cada entrada dentro de ella deja de activarse, incluso si el interruptor propio de esa entrada está encendido.
- El encabezado de una carpeta también tiene **Clone** (Clonar) y **Delete**. **Clone** hace una copia profunda de la carpeta con todas sus entradas y subcarpetas. **Delete** quita solo la carpeta en sí. Sus entradas y subcarpetas suben al nivel superior.

Las carpetas solo se muestran como grupos cuando ordenas por **Order** sin una búsqueda activa. Cualquier otro orden, o una búsqueda, cambia a una lista plana y muestra la nota **Folder view paused (clear search and sort by Order)** (Vista de carpetas en pausa; borra la búsqueda y ordena por Order).

## Guías relacionadas

- [Visión general de los lorebooks](overview.md)
- [Presupuestos de tokens y recursión de los lorebooks](token-budgets.md)
- [Búsqueda semántica para lorebooks](semantic-search.md)
- [Fuentes de conocimiento: agentes de recuperación y de enrutamiento](../agents/knowledge-sources.md)
