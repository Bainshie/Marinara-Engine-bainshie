# Memory Recall y resúmenes del chat

Esta guía explica cómo Marinara Engine ayuda a que un chat largo siga siendo coherente cuando crece más allá de lo que el modelo de IA puede leer de una sola vez. Cubre **Memory Recall** (búsqueda semántica sobre los mensajes pasados), **Chat Summary** (resumen del chat) para los chats de Roleplay y **Automatic Summarization** (resumen automático) para los chats de Conversation.

## Los dos sistemas de memoria

Cada modelo de IA solo puede leer una cantidad limitada de texto a la vez. Ese límite se llama ventana de contexto. Cuando un chat se hace largo, los mensajes más antiguos salen de esa ventana y la IA los olvida. Marinara Engine (llamado Marinara de aquí en adelante) tiene dos sistemas separados que resuelven esto.

- **Memory Recall** busca en tus mensajes más antiguos las partes más relacionadas con lo que acabas de decir y luego, de forma discreta, vuelve a agregar esas partes al prompt (las instrucciones enviadas a la IA). Funciona en todos los modos de chat.
- Los resúmenes comprimen los mensajes antiguos en recapitulaciones cortas que reemplazan a los mensajes originales en el prompt. Los chats de Roleplay usan **Chat Summary**. Los chats de Conversation usan **Automatic Summarization**.

Los chats de Game Mode (modo de juego) solo tienen **Memory Recall**. No cuentan con ninguna de las dos funciones de resumen.

Puedes usar ambos sistemas al mismo tiempo. Hacen tareas distintas y no entran en conflicto.

## Configuración de Memory Recall

**Memory Recall** encuentra fragmentos relevantes de partes anteriores de un chat y los inyecta en el prompt como memorias. Usa un embedding (una representación numérica del texto): una huella numérica del significado de un mensaje. Marinara compara la huella de tu mensaje nuevo con las huellas guardadas de los mensajes pasados y luego agrega las coincidencias más cercanas.

### Activar Memory Recall

1. Abre un chat y haz clic en el botón **Chat Settings** (Ajustes del chat) en el encabezado del chat.
2. Busca la sección **Memory Recall** (tiene un icono de cerebro).
3. Activa el interruptor **Enable Memory Recall**.

**Enable Memory Recall** es un ajuste por chat. Su valor predeterminado depende del modo:

- Activado de forma predeterminada en los chats de Conversation.
- Activado de forma predeterminada en los chats de Roleplay o Game que tienen una Scene (escena) activa.
- Desactivado de forma predeterminada en todos los demás chats.

Desactivar el interruptor detiene que las memorias recuperadas se agreguen al prompt. No borra nada de lo que ya hayas guardado.

### La fuente de embeddings

Memory Recall necesita una fuente de embeddings para construir esas huellas de significado. La configuras en una conexión, no en los ajustes del chat. Una conexión es un enlace guardado a un proveedor de IA.

1. Abre el panel **Connections** (Conexiones) y edita una conexión.
2. Busca la sección **Semantic Search (Embeddings)** (búsqueda semántica).
3. Escribe el nombre de un modelo de embeddings en el campo del modelo. Un valor de ejemplo es `text-embedding-3-small`.
4. Opcionalmente, define una **Embedding Endpoint URL** para sobrescribir la dirección.
5. Opcionalmente, usa el menú desplegable **Embedding Connection** para tomar prestada la clave y la dirección de otra conexión. Las opciones incluyen **Same as this connection** y **Local Model (sidecar)**.

Algunos proveedores no ofrecen embeddings. En ese caso, Marinara muestra una nota que te pide elegir una conexión de embeddings dedicada, como una compatible con OpenAI, Google o el Local Model.

Si no defines ninguna conexión de embeddings, Marinara recurre a un modelo de embeddings local integrado. Descarga este modelo una sola vez y lo ejecuta en tu propia computadora, sin necesidad de una API key (clave de API). Para saber más sobre el modelo integrado, consulta [Configuración del Local Model](../connections/local-model.md).

Este mismo ajuste de **Semantic Search (Embeddings)** también impulsa la búsqueda semántica del Lorebook, así que configurarlo una vez ayuda a ambas funciones.

### Memories for This Chat

Para ver qué ha recordado un chat, abre **Chat Settings**, ve a la sección **Memory Recall** y haz clic en **Access memories for this chat**. Esto abre la ventana **Memories for This Chat**.

La ventana muestra un recuento de los fragmentos de memoria guardados y una estimación aproximada de tokens (fragmentos de texto). Cada tarjeta de fragmento muestra el rango de fechas que cubre, el recuento de mensajes, un estado y cuándo se creó. El estado es uno de estos:

- **Vectorized**: la huella está construida y lista para buscar.
- **Waiting for vector**: la huella todavía se está creando.
- **Embedding unavailable**: ninguna fuente de embeddings pudo construirla.

La barra de herramientas tiene iconos para exportar memorias, importar memorias, reconstruir memorias y borrar todas las memorias. Cada fragmento también tiene su propio icono de papelera para olvidar solo ese fragmento.

- Al hacer clic en el icono de papelera de un fragmento se abre una ventana **Forget Memory**. Confirma con **Forget**.
- El icono de papelera de borrar todo abre una ventana **Clear Memories**. Confirma con **Clear**. Esto elimina las memorias de recall, pero no borra los mensajes de tu chat.
- El icono de actualizar reconstruye cada fragmento de memoria a partir de los mensajes actuales del chat. Úsalo después de cambiar el modelo de embeddings.
- Exportar guarda un archivo `.marinara.json`. Importar acepta archivos `.json` o `.marinara` y los fusiona con las memorias existentes.

### Cómo se comporta Memory Recall

Ten en cuenta estos puntos:

- Marinara guarda fragmentos de memoria en segundo plano siempre que hay una fuente de embeddings disponible, incluso si **Enable Memory Recall** está desactivado. El interruptor solo controla si las memorias guardadas se inyectan. Para dejar de guardar memorias, elimina la fuente de embeddings o borra las memorias de vez en cuando.
- Un fragmento necesita al menos 5 mensajes nuevos antes de crearse. Los lotes más pequeños esperan a la siguiente respuesta.
- Los fragmentos recuperados deben estar lo bastante relacionados como para pasar una comprobación de similitud. Las coincidencias débiles se omiten, así que recall puede no devolver nada aunque existan memorias.
- Solo se usa un pequeño presupuesto del prompt para las memorias recuperadas, así que solo se agregan las pocas más relevantes.
- Si cambias el modelo de embeddings cuando ya existen memorias, los fragmentos antiguos dejan de coincidir. Usa el icono de reconstruir para rehacerlos.
- Borrar los mensajes de un chat también borra sus fragmentos de memoria.

Algunas compilaciones en contenedor de Marinara, conocidas como Marinara Lite, desactivan Memory Recall por completo. En esas compilaciones, la sección **Memory Recall** no aparece en absoluto.

## Chat Summary (Roleplay)

**Chat Summary** comprime los mensajes antiguos en recapitulaciones narrativas cortas llamadas entradas de resumen. Cada entrada puede escribirla la IA o tú a mano, y cada una se puede activar o desactivar por separado. Esta función solo está en los chats de Roleplay.

Para abrirla, haz clic en el botón **Chat Summary** (un icono de pergamino) en el encabezado del chat de Roleplay. Esto abre el panel emergente **Chat Summary**.

### Crear una entrada de resumen

1. En **Summary Scope**, elige **Last** para resumir los mensajes más recientes, o **Range** para elegir un rango específico de mensajes.
2. Haz clic en **Generate** para que la IA escriba una entrada a partir de ese alcance.
3. O haz clic en **Write** para crear una entrada en blanco y escribir tú la recapitulación.

Cada entrada de la lista muestra un título, un rango de origen o un recuento de mensajes, y un tamaño estimado en tokens. Puedes activar o desactivar una entrada, expandirla, hacer clic en **Edit** para cambiarla, o en **Delete** para borrarla. Los botones en lote te permiten **Show Inactive** o **Hide Inactive** las entradas y **Activate All** o **Deactivate All** a la vez.

### Automatic Summaries

El panel **Automatic Summaries** mantiene los resúmenes actualizados a medida que sigues chateando. Aparece solo en los chats de Roleplay.

- Activa el interruptor **Enabled** dentro del panel **Automatic Summaries**.
- Define con qué frecuencia se ejecuta con el campo **Every**, medido en mensajes del usuario. El valor predeterminado es 5, y el rango va de 1 a 200.
- Haz clic en **Backfill Summary** para poner al día un chat antiguo que nunca tuvo resúmenes. Recorre el chat por lotes y aparece una barra de progreso mientras se ejecuta. Haz clic en **Stop** para terminarlo antes.

### Plantillas de Summary Prompt

El panel **Summary Prompt** controla las instrucciones que la IA usa para escribir un resumen. Haz clic en **Edit** para cambiar el prompt activo. Haz clic en **Templates** para abrir el administrador de plantillas. Allí, **New template** te permite guardar un prompt con nombre. Cada plantilla guardada tiene sus propios controles **Duplicate**, **Edit** y **Delete**.

Las plantillas guardadas son un ajuste global, para toda la app. Editar o elegir una plantilla desde un chat de Roleplay cambia el prompt de resumen que se usa en todos los chats de Roleplay.

### Summary Connection y tamaño de salida

El panel **Summary Connection** elige qué conexión escribe tus resúmenes. Su valor predeterminado está etiquetado como **Agent default (falls back to chat connection)**. Esto significa que usa primero tu conexión de agente predeterminada y, en segundo lugar, la propia conexión del chat.

El campo **Maximum output size** define cuánto puede durar un resumen generado. El valor predeterminado es 4096 tokens, y el rango va de 1 a 32768.

### Opciones de visualización

Los controles de **Display** en el panel emergente deciden cómo aparecen en pantalla los mensajes resumidos:

- **Hide summarised messages**: oculta los mensajes originales una vez que un resumen los cubre. Desactivado de forma predeterminada.
- **Recent message tail**: mantiene esta cantidad de los mensajes más nuevos totalmente visibles incluso cuando la ocultación está activada. El valor predeterminado es 10, y se acepta cualquier número entero no negativo. Poner 0 oculta todo el lote resumido. Los valores más altos aumentan el tamaño del prompt y el costo del modelo.
- **Collapse hidden messages**: controla cómo se ven los mensajes ocultos en el historial del chat.

Si tu chat requiere aprobación de escritura de agentes (un ajuste aparte de Agents), los resúmenes generados por IA esperan tu revisión antes de surtir efecto.

## Automatic Summarization (Conversation)

Los chats de Conversation usan un sistema distinto llamado **Automatic Summarization**. Cierra cada día del calendario en un resumen de día y luego combina las semanas completas de resúmenes de día en un resumen de semana. El prompt entonces envía solo los resúmenes de semana, los resúmenes de día de la semana actual y los mensajes de hoy. Esto mantiene cada solicitud pequeña.

Esta función se ejecuta por su cuenta y no se puede desactivar en los chats de Conversation.

### Abrir el editor

1. Abre un chat de Conversation y haz clic en **Chat Settings**.
2. Busca la sección **Automatic Summarization** (tiene un icono de calendario).
3. Haz clic en **Edit Summaries** para abrir la ventana **Automatic Summarization**.

La ventana lista primero las entradas de semana y luego los días que aún no se han incluido en una semana. Expande una entrada para editar su texto de **Summary** y su lista de **Key Details**, donde puedes agregar o quitar filas.

### Day Rollover Hour y Recent Message Tail

Dos ajustes en la sección **Automatic Summarization** definen cómo se dividen los días:

- **Day Rollover Hour**: la hora en que empieza un nuevo día para los resúmenes. El valor predeterminado es 4 AM, y puedes elegir cualquier hora desde las 12 AM (medianoche) hasta las 11 AM. Los mensajes enviados antes de esta hora cuentan como parte del día anterior. Elige una hora en la que nunca estés chateando para que una sesión nocturna no quede partida por la mitad.
- **Recent Message Tail**: cuántos de los mensajes más nuevos de hoy se mantienen palabra por palabra incluso después de resumirse. El valor predeterminado es 10, y se acepta cualquier número entero no negativo. Los valores más altos aumentan el tamaño del prompt y el costo del modelo.

Si cambias **Day Rollover Hour** cuando ya existen resúmenes, Marinara te advierte que los resúmenes antiguos usaron el ajuste anterior.

### Rellenar los días que faltan

A veces un día no consigue un resumen, por ejemplo después de importar un chat antiguo. El panel **Missing Summaries** de la ventana tiene un botón **Backfill** que reintenta los días recientes que no tienen resumen. Revisa hasta 14 días atrás a la vez.

Cambiar la conexión o el modelo usado para los resúmenes no reescribe las entradas de día o de semana que ya existen.

## Solución de problemas

### Memory Recall no recupera nada

- Comprueba que haya una fuente de embeddings configurada. Si los fragmentos en **Memories for This Chat** muestran **Embedding unavailable**, configura la sección **Semantic Search (Embeddings)** de una conexión o apóyate en el modelo local integrado. Consulta [Configuración del Local Model](../connections/local-model.md).
- Si los fragmentos muestran **Waiting for vector**, dales tiempo. Las huellas se construyen después de las respuestas.
- Recall solo agrega memorias que están muy relacionadas con tu último mensaje. Si nada parece relacionado, no agrega nada. Esto es normal.
- Si cambiaste el modelo de embeddings hace poco, usa el icono de reconstruir en **Memories for This Chat** para que los fragmentos antiguos coincidan con el nuevo modelo.

### Los resúmenes no se generan

- Asegúrate de que el chat tenga una conexión de texto que funcione. Chat Summary usa la **Summary Connection**, y Automatic Summarization usa la conexión de resumen resuelta. Si ninguna funciona, se omite la generación.
- Si tu chat requiere aprobación de escritura de agentes, los resúmenes de IA esperan a que los apruebes primero.
- Un resumen que falla se reintenta automáticamente tras un retardo. Si sigue atascado, ejecuta **Backfill Summary** (Roleplay) o **Backfill** (Conversation) para intentarlo a mano.

## Guías relacionadas

- [Configuración del Local Model](../connections/local-model.md)
- [Conectarse a un proveedor de IA](../connections/connecting-to-a-provider.md)
- [Conversation Mode: primeros pasos](../conversation/getting-started.md)
- [Roleplay Mode: primeros pasos](../roleplay/getting-started.md)
- [Solución de problemas de Marinara Engine](../TROUBLESHOOTING.md)
