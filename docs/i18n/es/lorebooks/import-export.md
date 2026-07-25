# Importar y exportar lorebooks

Esta guía te muestra cómo traer lorebooks (libros de trasfondo) a Marinara Engine y cómo guardarlos como archivos. Cubre archivos individuales, muchos archivos a la vez y los dos formatos de exportación. Un lorebook es un conjunto de notas activadas por palabras clave que Marinara añade al prompt (las instrucciones enviadas a la IA) cuando aparece una palabra que coincide. Algunas otras herramientas de roleplay llaman a esta función **World Info**.

## Qué puedes importar

Marinara puede leer dos tipos de archivo de lorebook, y detecta automáticamente cuál le diste:

- Un lorebook exportado desde el propio Marinara. Este conserva todos los campos y todas las carpetas.
- Un archivo **World Info** de otra herramienta. Esto incluye los archivos de World Info de SillyTavern y el formato "character-book" de las tarjetas de personaje V2. Marinara asigna los campos de la otra herramienta a los suyos propios.

Ambos tipos son archivos `.json` sencillos. No necesitas una cuenta ni una API key (clave de API) para importar un lorebook.

## Importar un lorebook

Sigue estos pasos para importar un archivo de lorebook.

1. Abre el panel **Lorebooks** desde el lado izquierdo de la app.
2. Haz clic en el icono de flecha de descarga en la fila de acciones superior. Su tooltip (texto de ayuda) dice **Import**. Está entre el icono de más (**New**) y el icono de marca de verificación (**Select**). Estos tres botones muestran solo iconos, así que pasa el cursor sobre ellos para ver sus nombres.
3. Se abre la ventana **Import Lorebook**. Deberías ver una caja que dice **Drop one or more lorebook files here or click to browse** (Suelta uno o más archivos de lorebook aquí o haz clic para explorar).
4. Arrastra tu archivo `.json` a la caja, o haz clic en la caja para elegir un archivo.
5. Espera el resultado. Cada archivo muestra una marca de verificación verde con **Imported lorebook**, o una marca roja con un mensaje de error.
6. Haz clic en **Close**. Tu nuevo lorebook aparece ahora en la lista del panel **Lorebooks**.

Marinara conserva la fecha propia del archivo importado como fecha de creación del lorebook, no el momento en que lo importaste.

## Importar muchos lorebooks a la vez (importación masiva)

La ventana **Import Lorebook** acepta más de un archivo de una sola vez.

1. Abre el panel **Lorebooks** y haz clic en el icono de flecha de descarga. Su tooltip dice **Import**.
2. Arrastra varios archivos `.json` a la caja de soltar al mismo tiempo, o haz clic en la caja y selecciona varios archivos.
3. Marinara importa cada archivo por turno y muestra una fila de resultado por cada uno. Una línea de resumen indica cuántos tuvieron éxito y cuántos fallaron.

Puedes mezclar archivos de Marinara y archivos **World Info** en el mismo lote. Marinara comprueba cada archivo por su cuenta.

## Exportar un lorebook

Exportar guarda un lorebook en un archivo de tu dispositivo. Así es como compartes un lorebook o lo mueves a otra instalación.

1. En el panel **Lorebooks**, haz clic en un lorebook para abrir su editor.
2. Haz clic en el icono de exportar en el encabezado del editor. Su tooltip dice **Export lorebook**.
3. Se abre la ventana **Export Lorebook** con dos opciones. Elige una:
   - **Marinara Native** conserva las carpetas de Marinara y todos los campos de cada entrada. Usa esto para mover un lorebook a otra instalación de Marinara sin perder nada. El nombre del archivo termina en `.marinara.json`.
   - **Compatible JSON** guarda un archivo **World Info** sin carpetas para otras herramientas de roleplay. Se descartan algunos detalles exclusivos de Marinara. El nombre del archivo termina en `.json`.
4. Tu navegador descarga el archivo.

Elige **Marinara Native** cuando el archivo sea para Marinara. Elige **Compatible JSON** cuando el archivo sea para una herramienta diferente.

## Exportar muchos lorebooks a la vez (exportación masiva)

Puedes guardar varios lorebooks en un único archivo zip.

1. En el panel **Lorebooks**, haz clic en el icono de marca de verificación en la fila de acciones superior. Su tooltip dice **Select**.
2. Marca la casilla de cada lorebook que quieras exportar.
3. Haz clic en **Export** en la barra de selección de la parte inferior.
4. Tu navegador descarga un único zip llamado `marinara-lorebooks.zip`.

La exportación masiva siempre usa el formato **Marinara Native**, así que vuelve a entrar en Marinara sin perder nada.

## Importar una carpeta completa de SillyTavern

Los pasos anteriores importan archivos de lorebook que ya tienes. También puedes traer lorebooks directamente desde una carpeta de instalación completa de SillyTavern. Esa vía toma personajes, chats y presets al mismo tiempo. Usa un asistente de configuración de importación de carpetas aparte. Consulta [Importar desde SillyTavern](../data/importing-from-sillytavern.md).

## Después de importar

Un lorebook importado funciona de inmediato con los disparadores de palabras clave. Si usas la búsqueda semántica, que hace coincidir las entradas por significado, tienes que volver a construir sus vectores después de importar. Consulta [Búsqueda semántica para lorebooks](semantic-search.md).

## Guías relacionadas

- [Resumen de lorebooks](overview.md)
- [Vincular lorebooks a personajes y personas](linking-to-characters.md)
- [Búsqueda semántica para lorebooks](semantic-search.md)
- [Importar desde SillyTavern](../data/importing-from-sillytavern.md)
