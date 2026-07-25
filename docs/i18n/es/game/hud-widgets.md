# Game Mode: HUD Widgets

Esta guía explica los widgets de HUD (barra de estado en pantalla) en el Game Mode de Marinara Engine. HUD significa heads-up display: pequeños paneles de información que se colocan en los bordes izquierdo y derecho de la pantalla del juego. Esta guía cubre los tipos de widget, el paso de revisión previo al inicio de una partida, cómo mover y bloquear paneles, y cómo compartir distribuciones de widgets.

## Qué son los widgets de HUD

Los widgets de HUD son pequeños paneles personalizados que registran cosas durante una partida, como una barra de salud, un contador de oro o el nivel de confianza de un aliado. Cada partida puede tener sus propios widgets. Son distintos de los trackers del HUD de Roleplay. Para la tira de trackers que se usa en los chats de Roleplay, consulta las guías relacionadas más abajo.

Puedes tener hasta 4 widgets en total. Los repartes entre el lado izquierdo y el lado derecho de la pantalla como prefieras.

Los widgets solo se usan cuando la opción **Custom HUD Widgets** (Widgets de HUD personalizados) está activada para la partida. Esta opción está activada de forma predeterminada en el asistente de configuración. Cuando está activada, el AI Game Master (GM, director del juego) diseña un conjunto inicial de widgets mientras construye tu mundo.

## Los 8 tipos de widget

Hay ocho tipos de widget. El GM elige un tipo para cada widget que crea. Tú también puedes elegir los tipos cuando construyes widgets a mano.

| Tipo de widget | Qué muestra |
|---|---|
| **Progress Bar** | Una barra horizontal para un valor sobre un máximo, como salud o resistencia. |
| **Gauge** | Un dial de medio círculo para un valor sobre un máximo. |
| **Relationship Meter** | Una barra con marcadores de hitos y una etiqueta, ideal para la confianza de un NPC o un vínculo. |
| **Counter** | Un número grande, como oro, días transcurridos o bajas. |
| **Stat Block** | Una cuadrícula pequeña de campos con nombre y valores, como STR y DEX o una palabra de estado. |
| **List** | Una lista corta con viñetas de elementos de texto, como objetivos activos. |
| **Inventory Grid** | Una cuadrícula de ranuras de objetos, con pestañas de categoría opcionales y recuentos de objetos. |
| **Timer** | Un reloj de cuenta regresiva en minutos y segundos que puede descontar en vivo. |

## La ventana de revisión previa a la sesión

Cuando existen widgets personalizados, un paso de revisión previo a la sesión se ejecuta antes de tu primer turno. En el momento en que pulsas **Start Game** (Iniciar partida), se abre la ventana **Review Starting Widgets** (Revisar widgets iniciales). Enumera cada widget inicial para que puedas ajustarlos antes de que la partida los fije.

En esta ventana puedes:

- Pulsar **Edit** (Editar) en un widget para cambiar sus valores iniciales o renombrar los campos de **Stat Block**.
- Pulsar **Remove** (Quitar) para descartar un widget que no quieres.
- Pulsar **Back** (Atrás) para cerrar la ventana sin iniciar.
- Pulsar **Start Game** para comenzar a jugar con los widgets tal como se muestran.

Una ventana similar aparece cuando inicias una nueva sesión en una partida en curso. Se titula **Prepare Next Session Widgets** (Preparar widgets de la próxima sesión) y tiene un botón **Start Next Session** (Iniciar próxima sesión) en lugar de **Start Game**. Su botón de cierre se llama **Cancel** (Cancelar) en vez de **Back**.

## Editar un widget durante el juego

Durante la partida, el GM actualiza los valores de los widgets por ti a medida que avanza la historia. Si el GM omite una actualización, puedes corregir un widget a mano.

1. Encuentra el panel del widget en el borde izquierdo o derecho de la pantalla.
2. Haz clic en el botón del lápiz (**Edit**) en el encabezado del widget.
3. Cambia los valores en la ventana del editor. Por ejemplo, define un nuevo **Current value** (Valor actual) y **Maximum value** (Valor máximo) en una barra.
4. Haz clic en **Save Changes** (Guardar cambios).

El encabezado también tiene una pequeña marca de más o de menos. Haz clic en el encabezado del widget para plegar o desplegar su cuerpo.

## Mover y bloquear paneles

Los paneles de widgets están bloqueados en su sitio de forma predeterminada. Cada panel tiene un icono de candado en su encabezado.

1. Haz clic en el icono de candado para desbloquear el panel. Un contorno tenue muestra que ahora se puede mover.
2. Arrastra el panel a un nuevo lugar.
3. Haz clic en el icono de candado otra vez para volver a bloquearlo en su sitio.

Para devolver un panel a su lugar predeterminado, haz doble clic en su icono de candado o pulsa la tecla R mientras el icono está enfocado. Cada panel recuerda su posición y su estado de bloqueo por partida. Tu distribución no se traslada entre partidas distintas.

En un teléfono, los widgets se muestran como pequeñas píldoras en lugar de paneles completos. Toca una píldora para abrir ese widget, y toca la X para cerrarlo de nuevo.

## Construir tus propios widgets

Puedes diseñar los widgets tú mismo en lugar de dejar que el GM los cree. El editor manual de widgets se abre en dos lugares:

- En el asistente de configuración de la partida: activa **Custom HUD Widgets** y luego activa el interruptor **Build Widget Setup** (Construir configuración de widgets). El editor aparece debajo del interruptor.
- En una partida existente: abre **Chat Settings** (Ajustes del chat) y luego abre la sección **Widgets**.

En el editor, elige un tipo de widget del menú desplegable y pulsa **Add** (Añadir). Para cada widget puedes definir:

- **Icon** (Icono): un símbolo corto o emoji que se muestra en el encabezado.
- **Label** (Etiqueta): el nombre que se muestra en la parte superior del widget.
- **Type** (Tipo): uno de los ocho tipos de widget.
- **Side** (Lado): **Left HUD** o **Right HUD**.
- **Accent** (Color de acento): el color del widget.

Debajo de esos, cada tipo tiene sus propios campos. Una barra usa **Value** (Valor) y **Max** (Máximo). Un contador usa **Count** (Cuenta). Una cuadrícula de inventario usa **Slots** (Ranuras) y **Contents** (Contenido). Un temporizador usa **Seconds** (Segundos) y **Running** (En marcha). El editor muestra cuántos widgets has usado de los 4 que tienes permitidos.

En **Chat Settings**, pulsa **Save Widgets** (Guardar widgets) para aplicar tus cambios a la partida, o pulsa **Reset** (Restablecer) para deshacer las ediciones sin guardar.

## Compartir widgets con importar y exportar

Puedes guardar una distribución de widgets en un archivo y cargarla en otra partida. Tanto el asistente de configuración como la sección **Widgets** de **Chat Settings** tienen estos botones.

1. Pulsa **Export Widgets** (Exportar widgets) para descargar tus widgets actuales como un archivo JSON. JSON es un formato de datos de texto plano.
2. Pulsa **Import Widgets** (Importar widgets) en otra partida y elige ese archivo para cargar los mismos widgets.

En **Chat Settings**, recuerda pulsar **Save Widgets** después de una importación para que los widgets cargados se apliquen.

## Guías relacionadas

- [Game Mode: Getting Started](getting-started.md)
- [Roleplay HUD and Trackers](../roleplay/hud-and-trackers.md)
