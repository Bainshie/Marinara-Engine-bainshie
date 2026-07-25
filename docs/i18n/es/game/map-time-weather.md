# Game Mode: Mapa, tiempo y clima

Esta guía cubre el panel de mapa de Game Mode (modo de juego) y los sistemas que registran el mundo alrededor de tu grupo. Esos sistemas son el día y la hora, el clima y la moral del grupo. Explica las vistas del mapa, cómo moverte y hacer zoom, y cómo fijar el día y la hora a mano.

## El panel de mapa

Game Mode muestra un panel de mapa pequeño en la pantalla de juego. El panel lista el nombre del mapa actual, el día de juego y un icono de cielo según la hora del día.

En una computadora, el mapa es un panel integrado que puedes leer de un vistazo. En un teléfono, toca el icono de mapa en la esquina superior izquierda. La etiqueta del botón es **Open map** (Abrir mapa), y abre el mapa en un panel emergente.

Puedes arrastrar el panel y fijarlo en su lugar. Para saber cómo funcionan los paneles arrastrables, consulta la guía de widgets del HUD (barra de estado en pantalla) enlazada más abajo.

## Vista de cuadrícula y vista de nodos

El mapa tiene dos vistas. Marinara Engine elige la vista por ti según el tipo de lugar que representa el mapa. No cambias de vista a mano.

- La vista **grid** (cuadrícula) es para áreas abiertas como un mundo exterior, una región o una ciudad. Muestra cuadros de colores según el terreno, como pasto, bosque, agua, montaña, desierto, nieve, pueblo, camino y cueva.
- La vista **node** (nodos) es para áreas cerradas como mazmorras e interiores. Muestra las ubicaciones como círculos unidos por líneas. Una ubicación que aún no has descubierto muestra un icono de signo de interrogación. Una línea discontinua indica un camino que no has recorrido. Una línea continua indica un camino que ya has usado.

## Mover a tu grupo

Para viajar, elige un lugar en el mapa. Solo puedes elegir ciertos lugares. En un mapa de cuadrícula, un cuadro debe estar junto a tu grupo y ya descubierto. En un mapa de nodos, un nodo debe estar unido a tu ubicación actual, o ya descubierto. Los demás cuadros y nodos no hacen nada cuando haces clic en ellos.

1. Haz clic en un cuadro de la cuadrícula, o haz clic en un nodo en un mapa de nodos.
2. Aparece un chip **Destination:** (Destino:) encima del cuadro de mensaje con el nombre del lugar.
3. Escribe tu mensaje y envíalo. Marinara añade una línea corta como `*moves to <place>*` al comienzo de tu mensaje.

Para cancelar, haz clic en el pequeño botón de borrar (la X) del chip **Destination:**.

En un teléfono el flujo es un poco distinto. Toca un nodo una vez para seleccionarlo, luego toca **Set destination** (Fijar destino) en el pie de página. Un nodo marcado como **You are here** (Estás aquí) es tu ubicación actual.

## Hacer zoom en el mapa

Cada mapa tiene un control de zoom en la esquina superior derecha.

- Haz clic en **Zoom in** (Acercar) (el botón de más) para acercarte.
- Haz clic en **Zoom out** (Alejar) (el botón de menos) para ver más.

El zoom va del 75% al 180%, en pasos de 25%.

## Cambiar entre mapas

Algunos juegos tienen más de un mapa o región. Cuando existe más de un mapa, aparece un menú desplegable pequeño en la parte superior del panel de mapa. Úsalo para ver un mapa diferente. El mapa en el que realmente estás se marca como **(Current)** (Actual).

## Generar un mapa nuevo

El panel de mapa tiene un botón de varita en la esquina superior izquierda con la etiqueta **Generate another map** (Generar otro mapa). Haz clic en él para reemplazar el mapa actual por uno nuevo.

Si un juego aún no tiene mapa, el panel muestra **No map yet** (Aún no hay mapa) con un botón **Generate** (Generar) que hace lo mismo.

## Fijar el día y la hora a mano

El control de día y hora está en la parte superior del panel de mapa. Muestra **Day** (Día) y un número, más un pequeño icono de cielo según la hora del día.

1. Haz clic en el control **Day**.
2. Escribe un nuevo número de día en el cuadro. El día puede ir de 1 a 9999.
3. Elige una hora del día en el menú desplegable. Las opciones son **Dawn** (Amanecer), **Morning** (Mañana), **Afternoon** (Tarde), **Evening** (Anochecer), **Night** (Noche) y **Midnight** (Medianoche).
4. Haz clic fuera o pulsa Enter para guardar.

Esto es una anulación manual. Fijas el día y la hora tú mismo, aparte del reloj automático que se describe a continuación. El reloj también puede mostrar **Noon** (Mediodía) por su cuenta, pero Noon no es una de las opciones manuales.

## Cómo pasa el tiempo automáticamente

El reloj del juego avanza por su cuenta. Usa cálculos fijos, no la IA, así que siempre es consistente. Cada partida nueva empieza en el Día 1, a las 08:00 de la mañana. Cada acción que realizas mueve el reloj hacia adelante una cantidad fija.

| Acción | Tiempo añadido |
|---|---|
| Hablar | 15 minutos |
| Explorar | 30 minutos |
| Una ronda de combate | 5 minutos |
| Un descanso corto | 1 hora |
| Un descanso largo | 8 horas |
| Viajar | 2 horas |

Cuando el reloj pasa la medianoche, el número de día sube en uno.

## Clima

El juego también registra el clima por su cuenta, con cálculos fijos y sin IA. El clima depende del bioma y la estación. Un bioma es el tipo de lugar en el que está tu grupo, como desierto, ártico, costero o montaña. Ejemplos de clima incluyen despejado, nublado, lluvia, tormenta, nieve, ventisca, niebla y tormenta de arena.

El clima puede cambiar cuando actúas. Cambia con más frecuencia cuando viajas o tomas un descanso largo, a veces cuando exploras, y rara vez en otros casos. El clima da matiz a cómo el Game Master (director del juego) describe cada escena.

Para ver el clima en pantalla, activa la opción con la etiqueta **Dynamic weather effects (rain, snow, fog, etc.)** (Efectos de clima dinámico (lluvia, nieve, niebla, etc.)) en la configuración de apariencia de la app. Está activada de forma predeterminada. Cuando está activada, aparecen partículas animadas como lluvia, nieve y niebla sobre el juego. Coinciden con el clima y la hora del día actuales. Para más opciones de visualización, consulta la guía de configuración de apariencia enlazada más abajo.

## Moral del grupo

El juego mantiene una puntuación oculta de moral del grupo de 0 a 100. Tiene cinco niveles, del más bajo al más alto: Broken (Quebrada), Low (Baja), Steady (Estable), High (Alta) e Inspired (Inspirada).

La moral cambia con lo que ocurre en la historia. Ganar una pelea, completar una misión o encontrar un tesoro la sube. Perder una pelea, una misión fallida o perder a un aliado la baja. Con el tiempo, la moral vuelve poco a poco hacia el punto medio.

La moral no se muestra como un número en el juego. En cambio, funciona en segundo plano. Cambia tus tiradas de dados, desde más 2 en Inspired hasta menos 2 en Broken. También da color a cómo el Game Master describe el ánimo de tu grupo.

## Guías relacionadas

- [Game Mode: Primeros pasos](getting-started.md)
- [Game Mode: Widgets del HUD](hud-widgets.md)
- [Configuración de apariencia](../appearance/appearance-settings.md)
