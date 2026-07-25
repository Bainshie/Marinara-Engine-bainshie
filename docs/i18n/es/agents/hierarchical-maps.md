# Mapas jerárquicos: configuración, creación y viajes

> **Compatibilidad actual:** esta guía corresponde a Hierarchical Maps **1.1.5** en
> Marinara Engine **2.3.3**. Maps 1.1.5 es compatible con Engine 2.3.2 hasta las
> versiones 2.x actuales. El paquete funciona en chats de Roleplay y Game.

Hierarchical Maps agrega un mapa de historia persistente a los chats de Roleplay y Game. En lugar de guardar una sola ubicación de texto libre, puede representar un mundo como lugares anidados:

```text
The Shattered Coast
└── Brinewatch
    ├── Harbor District
    │   ├── Tideglass Inn
    │   └── Customs House
    └── Old Sewers
```

Marinara mantiene una ubicación actual autoritativa dentro de esta jerarquía. La ruta actual, los detalles exactos de la ubicación, los destinos cercanos y el lore elegible vinculado a la ubicación actual exacta se pueden incluir en el contexto de la próxima respuesta. La IA no puede mover la historia con solo narrar que el grupo fue a algún sitio; tú eliges un destino y confirmas el movimiento con tu siguiente turno.

Hierarchical Maps funciona en **Roleplay** y **Game**. Cada chat tiene su propio mapa y su propia ubicación actual.

## Qué puede representar un mapa jerárquico

Cada ubicación puede tener:

- un padre y cualquier cantidad de hijos o hermanos;
- un tipo Region, Settlement, Place, Building, Floor o Room;
- una descripción pública y notas de ubicación privadas solo para la IA;
- entradas de lorebook vinculadas a esa ubicación exacta;
- enlaces directos de un solo sentido o de doble sentido con otras ubicaciones; y
- hijos mostrados como una lista, un mapa posicionado o capas ordenadas.

Los enlaces directos no se limitan a los hermanos. Pueden conectar cualquier lugar válido de la jerarquía: un transbordador entre pueblos, una escalera entre pisos, un portal entre mundos o un pasadizo secreto entre habitaciones distantes.

Algunos ejemplos prácticos:

- `World → Continent → Region → City → District → Building → Room`
- `City → Neighborhoods → Streets → Shops and landmarks`
- `House → Floors → Rooms → Closets or hidden chambers`
- `Dungeon tower → Floors 1–25 → Rooms, stairs, and boss arenas`
- `Star system → Planets → Settlements → Buildings`

Una torre de 25 pisos normalmente debería modelar los pisos como 25 hermanos bajo una torre, no como una cadena de padres de 25 niveles de profundidad. Los mapas admiten actualmente hasta 500 ubicaciones y 20 niveles de jerarquía.

## Inicio rápido

1. Abre el panel **Agents** (Agentes), haz clic en **Download Agents** (Descargar agentes) e instala **Hierarchical Maps**. Si el catálogo ofrece luego **Update** (Actualizar), instala eso también.
2. Reinicia Marinara cuando el catálogo lo pida.
3. Abre el chat de Roleplay o Game donde debe vivir el mapa.
4. Abre **Agents → Hierarchical Maps**, activa **Use in this chat** (Usar en este chat) y haz clic en **Create map** (Crear mapa). También puedes activarlo desde **Chat Settings → Agents → Tracker Agents** (Ajustes del chat → Agentes → Agentes de seguimiento) y abrir **Hierarchical map** ahí.
5. Elige **Draft with AI** (Borrador con IA), describe lo que quieres y haz clic en **Generate draft** (Generar borrador).
6. Busca y despliega la jerarquía completa generada en **Draft preview** (Vista previa del borrador). Selecciona lugares para revisar sus descripciones, la memoria privada del modelo y la procedencia del lore. Regenera o edita el prompt (las instrucciones enviadas a la IA) si hace falta.
7. Haz clic en **Continue to editor** (Continuar al editor), revisa el mapa de trabajo sin guardar y haz cualquier cambio manual.
8. Establece o confirma la ubicación inicial, cambia el mapa a **Enabled** (Activado) y haz clic en **Save** (Guardar).
9. En el chat, abre el **Story map** (Mapa de historia), selecciona un lugar alcanzable y haz clic en **Set destination** (Fijar destino). Envía tu siguiente mensaje para completar el movimiento.

Aplicar un borrador de IA o importar un archivo cambia solo la copia de trabajo del editor. El mapa no afecta las respuestas hasta que lo actives y lo guardes.

## Instala y activa el paquete

Abre el panel **Agents** desde la pestaña Sparkles en la barra lateral derecha. Haz clic en **Download Agents**, selecciona **Hierarchical Maps** y haz clic en **Install** (Instalar). Si la tarjeta instalada todavía ofrece **Update**, actualízala antes de continuar. El paquete incluye código de servidor, así que sigue el aviso de reinicio antes de intentar usarlo.

La instalación deja la función disponible, pero no la activa en todos los chats.

La función instalada también aparece como **Hierarchical Maps** en el panel principal **Agents**. Con un chat de Roleplay o Game abierto, esta página muestra la versión instalada del paquete, si está lista, si Maps está activo en el chat actual, el estado del mapa guardado y un botón **Open map** (Abrir mapa) o **Create map**. El contenido del mapa, la ubicación actual, los vínculos de lore, el historial y los borradores se quedan con ese chat en lugar de convertirse en ajustes globales del agente.

### Roleplay

1. Abre el chat de Roleplay.
2. Abre **Chat Settings** (Ajustes del chat) con el botón de engranaje.
3. Busca **Agents** y activa **Enable Agents** (Activar agentes).
4. En **Tracker Agents**, activa **Hierarchical Maps** para este chat.
5. Desplázate de nuevo hasta el ajuste **Hierarchical map** que esto agrega.
6. Haz clic en **Edit hierarchical map** (Editar mapa jerárquico) y luego en **Create map** si aparece el aviso de estado vacío.

### Game

Puedes seleccionar Hierarchical Maps mientras creas un juego, o agregarlo más tarde desde la sección **Chat Settings → Agents** de ese juego. Cuando lo seleccionas durante la configuración, Marinara puede preparar una jerarquía a partir del mundo de juego aceptado para que la revises antes de jugar.

Si te saltas el mapa generado durante la configuración, aún puedes construir uno más tarde desde Chat Settings.

## Comprende el editor de mapas

En una computadora de escritorio, el editor muestra tres paneles juntos. En una pantalla estrecha, usa las pestañas **Hierarchy** (Jerarquía), **Local** y **Details** (Detalles).

- **Hierarchy** muestra el árbol completo de ubicaciones. Selecciona una ubicación para editarla. **Enter** cambia qué parte de la jerarquía estás viendo; no mueve la historia.
- **Local** muestra los hijos inmediatos de la ubicación seleccionada como un mapa, capas ordenadas o una lista.
- **Details** edita la ubicación seleccionada, su lore, su padre, el estilo de presentación, los enlaces directos y el estado.

El encabezado del editor contiene **Build with AI** (Construir con IA) o **Expand with AI** (Expandir con IA), **Export** (Exportar), **Import** (Importar), el interruptor Enabled y **Save**. Los cambios sin guardar se marcan como **Unsaved** (Sin guardar). Salir del editor con trabajo sin guardar te pregunta si quieres descartarlo.

## Crea un borrador de mapa con IA

Desde un mapa vacío, haz clic en **Draft with AI**. Para un mapa existente, haz clic en **Expand with AI**.

### Elige lo que lee el constructor

En **Build from** (Construir a partir de), elige una de estas fuentes:

- **Game setup** (Configuración del juego) usa la configuración y los personajes actuales. En un chat de Roleplay, esto significa la configuración del chat y las tarjetas de personaje. En un chat de Game, también usa la descripción general del mundo y los personajes del grupo.
- **Selected lore** (Lore seleccionado) te deja elegir uno o más lorebooks (libros de trasfondo) disponibles. **Strict canon** (Canon estricto) crea solo lugares respaldados por lore. **Canon + expansion** (Canon + expansión) permite que la IA agregue lugares adecuados alrededor del lore seleccionado.

El constructor no lee el historial de turnos. Usa el campo opcional **What should this world include?** (¿Qué debería incluir este mundo?) o **What should be added?** (¿Qué se debería agregar?) para detalles que aún no están en la configuración ni en el lore seleccionado.

Elige un tamaño:

| Tamaño     | Resultado aproximado |
| ---------- | ------------------ |
| **Small**  | 8 lugares          |
| **Medium** | 16 lugares         |
| **Large**  | 28 lugares         |

Haz clic en **Generate draft** o **Generate expansion** (Generar expansión). La generación aún no guarda nada.

La **Draft preview** actual es una vista previa navegable y con búsqueda de la jerarquía completa generada. Informa la cantidad de ubicaciones y niveles de jerarquía, propone una ubicación inicial y te deja desplegar o contraer cada rama. Selecciona un lugar generado para inspeccionar su ruta completa, su descripción pública, la memoria privada del modelo y —cuando se usa el anclaje de lore— si vino directamente del lore, si se infirió del lore o si lo agregó la IA.

### Aplica y revisa el resultado

Haz clic en **Continue to editor** para un mapa nuevo o **Add to working map** (Agregar al mapa de trabajo) para una expansión. Esto carga el resultado en el editor de mapa sin guardar; no lo activa ni lo guarda. Despliega sus flechas de detalle y selecciona ubicaciones en el panel Hierarchy para inspeccionar sus hijos, descripciones, memoria privada, enlaces, capas y posiciones en el mapa.

Si no te gusta el resultado generado, usa **Edit prompt** (Editar prompt), **Regenerate** (Regenerar) o **Discard draft** (Descartar borrador) directamente desde la vista previa. Después de continuar al editor, el constructor de IA no puede generar sobre ediciones sin guardar no relacionadas; guarda o descarta los cambios de trabajo antes de abrirlo de nuevo.

Si existe un mapa pero la historia todavía no tiene historial de mapa confirmado, el constructor de IA también puede **Replace draft** (Reemplazar borrador). Después de que la campaña haya usado el mapa, el reemplazo está protegido: expande la jerarquía existente en su lugar para que los turnos guardados sigan refiriéndose a los mismos IDs de ubicación.

Para un mapa guardado que no se ha usado en un turno, abre **Expand with AI**, elige **Replace draft** y genera un reemplazo. Una vez que existe historial confirmado, Marinara permite la expansión pero no el reemplazo total. Exporta el mapa antes de una reestructuración importante.

## Construye o edita un mapa manualmente

Desde un mapa vacío, haz clic en **Build manually** (Construir manualmente). Marinara crea una ubicación inicial amplia. Selecciónala en la jerarquía y luego usa:

- **Add child** (Agregar hijo) para un lugar dentro de la ubicación seleccionada.
- **Add sibling** (Agregar hermano) para un lugar junto a ella bajo el mismo padre.
- **Duplicate** (Duplicar) para copiar un subárbol de ubicación y luego editarlo.
- **Archive** (Archivar) para retirar una ubicación sin borrar las referencias históricas.

Cada ubicación tiene estos campos principales:

- **Name** (Nombre) e **Icon** (Icono) la identifican en el editor y en el mapa del mundo.
- **Kind** (Tipo) puede ser Region, Settlement, Place, Building, Floor o Room.
- **Public description** (Descripción pública) describe el lugar activo en el contexto de la ubicación.
- **Private model memory** (Memoria privada del modelo) le da a la IA datos que solo deben estar activos en esta ubicación.
- **Awareness summary** (Resumen de orientación) es una pista breve de orientación.
- **Parent** (Padre) controla dónde se sitúa la ubicación dentro de la jerarquía.
- **Child presentation** (Presentación de hijos) muestra sus hijos inmediatos como List, Map o Layers.

Para la presentación **Map**, cada hijo puede tener posiciones **Map X** y **Map Y** de 0 a 100. Para **Layers**, dale a cada hijo un orden de capa distinto.

## Comprende qué llega a la IA

Cuando un mapa guardado está activado, cada generación recibe un bloque autoritativo de contexto espacial que contiene:

- la ruta de migas de pan actual, incluidos los nombres de los padres;
- la descripción pública de la ubicación actual exacta;
- la memoria privada del modelo de la ubicación actual exacta, cuando existe; y
- los destinos válidos alcanzables en un movimiento.

Los nombres de los padres dan orientación, pero las descripciones de los padres, la memoria privada de los padres y el lore vinculado a los padres no se heredan. Si la ubicación actual es `Tower → Floor 7 → Alchemy Lab`, la descripción y la memoria privada del laboratorio están activas; la torre y el piso aportan sus nombres a la ruta.

**Private model memory** es una nota guardada solo para la IA, no una memoria que se aprende automáticamente ni que se actualiza sola. Úsala para secretos, ambiente, peligros persistentes, reglas locales o datos que el modelo solo debe conocer mientras ese lugar exacto sea el actual. Para datos que deben llegar al modelo, usa **Public description** o **Private model memory** en lugar de depender solo de **Awareness summary**.

### Agrega rutas de viaje

Una ubicación es alcanzable automáticamente desde su padre o sus hijos activos. Usa **Direct links** (Enlaces directos) para cualquier otra ruta, como un transbordador entre pueblos, escaleras entre pisos seleccionados o un pasadizo secreto entre habitaciones de edificios diferentes.

1. Selecciona la ubicación de origen.
2. En **Direct links**, elige otra ubicación y haz clic en **Link** (Enlazar).
3. Agrega una etiqueta de dirección opcional.
4. Elige **Available** (Disponible), **Hidden** (Oculto) o **Blocked** (Bloqueado).
5. Activa **Both ways** (Ambos sentidos) si el viaje debe funcionar en cualquier dirección.

Solo los enlaces disponibles aparecen como opciones de viaje. Un enlace de un solo sentido debe agregarse desde la ubicación donde comienza el viaje.

### Establece la ubicación inicial y guarda

Selecciona la ubicación donde empieza la historia y haz clic en **Set as starting location** (Fijar como ubicación inicial) en **Location status** (Estado de la ubicación). Un mapa necesita una ubicación inicial activa antes de poder activarse.

Cambia el control del encabezado a **Enabled** y luego haz clic en **Save**. Si el editor informa problemas, corrígelos antes de guardar.

## Vincula lore a las ubicaciones

Hierarchical Maps usa el lore de dos maneras diferentes:

1. El constructor de IA puede leer los lorebooks seleccionados mientras crea un borrador o expande la jerarquía.
2. Una ubicación guardada puede activar entradas de lore específicas mientras esa ubicación exacta sea la actual.

Para adjuntar lore en tiempo de ejecución:

1. Selecciona una ubicación y abre **Linked lore** (Lore vinculado) en el panel Details.
2. Busca entre las entradas disponibles.
3. Haz clic en una entrada para adjuntarla.
4. Guarda el mapa.

Las entradas vinculadas no pasan automáticamente de padre a hijo. El lore adjunto a Brinewatch no se activa mientras la ubicación actual sea el Tideglass Inn, a menos que adjuntes esa entrada también al mesón.

Una entrada vinculada elegible se selecciona como **current-location lore** (lore de la ubicación actual), así que no necesita coincidencia de palabra clave. Esto es más preciso que la activación normal por palabra clave, pero no es un salto incondicional de las reglas del lorebook: los libros y entradas desactivados o excluidos del chat siguen sin estar disponibles, y las condiciones, el tiempo, la probabilidad y los presupuestos de tokens de cada entrada siguen aplicándose.

Los lorebooks desactivados, las entradas desactivadas y los lorebooks excluidos del chat no están disponibles para el mapa. El editor mantiene visibles las referencias no disponibles o faltantes para que puedas repararlas o desvincularlas, pero no se envían al modelo.

## Muévete durante una historia

Seleccionar un destino pone un movimiento en cola; no cambia la ubicación actual de inmediato. El movimiento se confirma junto con el siguiente mensaje que envías. Esto mantiene la ubicación y el turno sincronizados cuando ramificas, regeneras o cambias de swipe (respuesta alternativa).

Los destinos válidos son:

- el padre de la ubicación actual;
- los hijos activos de la ubicación actual; y
- los destinos conectados por un enlace directo disponible.

Solo se puede confirmar un movimiento jerárquico con un turno.

### Límite actual de un movimiento

**Set destination ya está disponible en Maps 1.1.5**, pero solo acepta un lugar alcanzable en un movimiento. Explorar el mapa del mundo puede mostrar ubicaciones más lejanas sin que sean seleccionables de inmediato.

Por ejemplo, si Floor 1 y Floor 25 son hermanos bajo una torre, el flujo actual es:

1. deja Floor 1 hacia la torre y envía un turno;
2. entra a Floor 25 y envía otro turno.

Puedes agregar un enlace directo disponible para que un salto específico sea alcanzable en un movimiento. El comportamiento automático de varios saltos **Set target** (Fijar objetivo) o **Plan route** (Planear ruta) —que recordaría una meta lejana y recorrería el grafo de padre/hijo/enlace un paso válido a la vez— aún no está implementado.

### Viajes en Roleplay

El panel **Story location** (Ubicación de la historia) aparece encima del cuadro de mensaje.

1. Abre **Story location** para ver **Leave** (Salir), **Enter** (Entrar) y **Routes** (Rutas).
2. Elige un destino.
3. Confirma que su estado diga **Moves with your next turn** (Se mueve con tu siguiente turno).
4. Escribe y envía tu mensaje.

Usa la X en el destino pendiente para cancelarlo antes de enviar. Si el mapa o la ubicación actual cambiaron después de que seleccionaste el destino, el estado pasa a **Needs review** (Necesita revisión). Abre el selector y elige de nuevo.

### Viajes en Game

Game Mode agrega un **Hierarchical world map** (Mapa del mundo jerárquico). **You are here** (Estás aquí) marca la ubicación actual de la historia.

- Selecciona un lugar para leer su descripción.
- Usa **Explore** (Explorar) para navegar dentro de una ubicación. Navegar no mueve al grupo.
- Usa **Browse up** (Subir un nivel) o las migas de pan para ver otra parte de la jerarquía.
- Usa **Center current story location** (Centrar la ubicación actual de la historia) para volver a la posición del grupo.
- Haz clic en **Set destination** cuando el lugar seleccionado sea alcanzable, y luego envía el siguiente turno.

Si un lugar dice **Browse only from here** (Solo navegación desde aquí), no es alcanzable en un movimiento desde la ubicación actual. Navega hacia atrás y elige un padre, un hijo o una ruta directa disponible.

## Mapa del mundo jerárquico frente al mapa de Game

Game Mode puede mostrar dos sistemas de mapa:

- **Hierarchical Maps** rastrea la ubicación autoritativa de la historia o del mundo, como `The Shattered Coast → Brinewatch → Tideglass Inn`.
- La cuadrícula o el mapa de nodos normal de Game rastrea el movimiento local y táctico dentro de esa ubicación de la historia, y también participa en el tiempo y el clima de Game.

Una llegada escrita por la IA o un marcador normal del mapa de Game no pueden cambiar por sí solos la ubicación jerárquica.

Para configuraciones avanzadas de Game, una ubicación jerárquica guardada tiene una sección **Game map binding** (Vínculo con el mapa de Game). Puedes vincular un mapa de Game entero, una celda de cuadrícula o un nodo a esa ubicación de la historia. Seleccionar una posición de Game vinculada prepara un movimiento jerárquico; las posiciones no vinculadas mantienen el movimiento táctico normal.

Guarda la jerarquía antes de cambiar los vínculos. Un vínculo se puede borrar más tarde sin eliminar ninguno de los dos mapas.

## Importa, exporta y archiva de forma segura

Usa **Export** para descargar la jerarquía de trabajo como un archivo `.hierarchical-map.json`. Exporta antes de una edición importante si quieres una copia de seguridad pequeña, solo del mapa.

Usa **Import** para cargar una jerarquía en la copia de trabajo. Revísala y haz clic en **Save** para hacerla autoritativa. Importar no guarda de inmediato.

Una vez que el historial de la campaña se refiere a un mapa, un mapa importado debe conservar todos los IDs de ubicación existentes. Agrega o actualiza ubicaciones en lugar de reemplazar la jerarquía con IDs no relacionados.

Archivar preserva las referencias antiguas. Antes de archivar:

- mueve o archiva sus hijos activos;
- elige otra ubicación inicial activa si hace falta; y
- elige un reemplazo activo si es la ubicación actual en tiempo de ejecución.

Las ubicaciones archivadas se pueden restaurar desde el panel Details.

## Solución de problemas

### Hierarchical Maps no aparece en Chat Settings

Comprueba que el paquete esté instalado, que Marinara se haya reiniciado después de la instalación y que el chat sea de Roleplay o Game. En el chat, activa el interruptor principal **Enable Agents**, abre **Tracker Agents** y activa **Hierarchical Maps**. Luego desplázate de nuevo hasta el ajuste **Hierarchical map** que aparece.

### El mapa no se puede activar

Crea al menos una ubicación activa y establece una ubicación inicial activa. Resuelve cada problema que se muestre en la parte superior del editor, y luego activa y guarda de nuevo.

### La generación con IA no está disponible

Asegúrate de que el chat tenga una conexión de modelo de lenguaje que funcione. Guarda o descarta los cambios existentes del editor antes de abrir el constructor de IA. Para una expansión, elige una ubicación activa en **Expand beneath** (Expandir debajo de). Para la generación anclada al lore, selecciona al menos un lorebook activado y no excluido.

### Revisa un borrador de IA antes de usarlo

Usa la búsqueda de la vista previa y los controles **Expand all** (Desplegar todo) y **Collapse all** (Contraer todo) para inspeccionar la jerarquía completa generada. Selecciona una ubicación para revisar su descripción y la memoria privada del modelo. Usa **Edit prompt**, **Regenerate** o **Discard draft** antes de continuar al editor.

### No se puede seleccionar un destino

El lugar debe ser el padre de la ubicación actual, un hijo activo o el destino de un enlace directo disponible. **Explore**, **Browse up** y el **Enter** del editor solo navegan por el mapa. No saltan las reglas de viaje ni calculan una ruta de varios saltos.

### Un destino en cola dice Needs review

La definición o la ubicación actual cambiaron después de que se eligió el destino. Abre el selector de destino, revisa la ruta actual y selecciona el destino de nuevo.

### La IA ignora el mapa

Confirma que Hierarchical Maps esté activo para el chat, que la jerarquía esté **Enabled** y que los últimos cambios se hayan guardado. Confirma también que aparezca una ubicación actual en el panel **Story location**.

### El lore vinculado no se activa

Confirma que la entrada esté adjunta a la ubicación actual exacta. Comprueba que la entrada y su lorebook estén activados y que el lorebook no esté excluido del chat.

## Guías relacionadas

- [Agentes: ayudantes de IA para tus chats](agents-overview.md)
- [Referencia de agentes descargables](built-in-agents.md)
- [Lorebooks](../lorebooks/overview.md)
- [Modo Roleplay: primeros pasos](../roleplay/getting-started.md)
- [Modo Game: primeros pasos](../game/getting-started.md)
- [Modo Game: mapa, tiempo y clima](../game/map-time-weather.md)
