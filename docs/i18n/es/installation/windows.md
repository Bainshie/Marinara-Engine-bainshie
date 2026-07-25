# Guía de instalación en Windows

Esta guía te muestra cómo instalar Marinara Engine en Windows. Puedes usar el instalador de un solo clic (el camino fácil) o configurarlo desde el código fuente. También cubre los requisitos del sistema, las funciones opcionales y cómo actualizar más adelante.

## Requisitos del sistema

Marinara Engine se ejecuta en tu propia computadora con Windows. Necesitas lo siguiente:

- Windows 10 o Windows 11 (64 bits).
- Unos cuantos gigabytes de espacio libre en disco para la app y sus dependencias.
- Una conexión a internet durante la instalación (para descargar el código y los paquetes).

Ambos métodos de instalación necesitan dos herramientas. El instalador puede conseguirlas por ti. Para el método desde el código fuente las instalas tú:

- **Node.js** versión 24, 25 o 26. Node.js ejecuta la app. La versión 24 es la versión LTS recomendada. LTS significa Long Term Support (soporte a largo plazo), una versión estable.
- **Git**. Git descarga el código y permite que la app se actualice sola más adelante.

pnpm es el gestor de paquetes que instala las partes de la app. Si usas el instalador o el lanzador **start.bat**, no necesitas instalar pnpm por tu cuenta. Ambos consiguen la versión correcta de pnpm a través de Corepack, un ayudante de pnpm incluido con Node.js, o mediante una descarga temporal. Solo la configuración manual sin el lanzador necesita el comando `pnpm` en tu sistema. Esa sección incluye el paso de instalación.

## Método 1: instalador de Windows (recomendado)

El instalador es la forma más fácil de empezar. Comprueba si tienes Node.js y Git, te ayuda a instalarlos si faltan, descarga la app, la compila y crea accesos directos.

Sigue estos pasos:

1. Abre la página de versiones (releases) de Marinara Engine en tu navegador.

```text
https://github.com/Pasta-Devs/Marinara-Engine/releases
```

2. Descarga el archivo del instalador de Windows más reciente desde esa página.
3. Ejecuta el instalador y sigue las indicaciones en pantalla. Si faltan Node.js o Git, deja que el instalador los instale.
4. Elige la carpeta de instalación cuando te lo pida, o acepta la predeterminada.
5. Espera a que el instalador descargue la app y la compile. Esto puede tardar unos minutos.
6. Cuando termine, haz doble clic en el nuevo acceso directo del escritorio para iniciar Marinara Engine.

Tu navegador debería abrirse en la app tras una breve espera. Si no se abre solo, abre tu navegador y ve a esta dirección:

```text
http://127.0.0.1:7860
```

El instalador configura una copia de la app basada en Git. Esto significa que puede actualizarse sola la próxima vez que la inicies. Consulta la sección de actualización más abajo.

Si tu antivirus te avisa sobre el instalador, es una falsa alarma conocida. El instalador descarga Node.js y Git, y algunas herramientas antivirus marcan ese comportamiento. Ejecuta el instalador solo si lo descargaste de la página oficial de versiones enlazada arriba.

## Método 2: instalar desde el código fuente

Usa este método si prefieres ejecutar los comandos tú mismo, o si quieres la versión de pruebas (staging).

### Paso 1: instalar Node.js y Git

1. Descarga el instalador de Node.js desde el sitio oficial y ejecútalo.

```text
https://nodejs.org/en/download
```

2. Descarga el instalador de Git desde el sitio oficial y ejecútalo.

```text
https://git-scm.com/download/win
```

3. Abre una nueva ventana del Símbolo del sistema (Command Prompt). Comprueba que Node.js sea la versión 24, 25 o 26:

```bat
node -v
```

4. Comprueba que Git esté instalado:

```bat
git --version
```

Deberías ver un número de versión por cada comando. Si un comando no se encuentra, cierra y vuelve a abrir el Símbolo del sistema, o reinstala la herramienta que falte.

### Paso 2: descargar el código e iniciar

El script lanzador llamado **start.bat** hace la configuración por ti. Elige la versión correcta de pnpm, instala las dependencias, compila la app y abre tu navegador.

1. Descarga el código con Git:

```bat
git clone https://github.com/Pasta-Devs/Marinara-Engine.git
```

2. Entra en la nueva carpeta:

```bat
cd Marinara-Engine
```

3. Opcional: cambia a la versión de pruebas. La descarga empieza en la versión estable. Si en su lugar quieres la versión de pruebas (staging), ejecuta este comando antes del primer inicio. Omite este paso si quieres la versión estable. Haz una copia de seguridad de tus datos antes de usar versiones de pruebas.

```bat
git checkout staging
```

Tras este cambio, el lanzador te mantiene en la versión de pruebas cuando actualiza.

4. Ejecuta el lanzador:

```bat
start.bat
```

El primer inicio tarda unos minutos porque instala y compila todo. Cuando esté listo, tu navegador se abre en la app en `http://127.0.0.1:7860`. Para volver a iniciar la app más adelante, ejecuta **start.bat** desde la misma carpeta.

El lanzador abre la app a tu red local de forma predeterminada, así que otros dispositivos de tu red pueden acceder a ella. Consulta Acceder desde otro dispositivo más abajo.

### Configuración manual sin el lanzador

Si quieres ejecutar cada comando tú mismo en lugar de usar **start.bat**, haz esto desde dentro de la carpeta `Marinara-Engine`.

1. Instala pnpm. Este camino no usa el lanzador, así que el comando `pnpm` debe existir en tu sistema. El comando `npm` viene con Node.js. Ejecuta esto una vez:

```bat
npm install -g pnpm
```

2. Instala las dependencias:

```bat
pnpm install --force
```

3. Compila la app:

```bat
pnpm build
```

4. Inicia el servidor:

```bat
pnpm start
```

5. Abre la app en tu navegador:

```text
http://127.0.0.1:7860
```

Todo se ejecuta en tu propia computadora. Con este método manual la app escucha en `127.0.0.1`, lo que significa que solo esta computadora puede acceder a ella. Para que otros dispositivos de tu red se conecten, crea un archivo llamado `.env` en la carpeta `Marinara-Engine`. Añade esta línea, y luego reinicia el servidor:

```env
HOST=0.0.0.0
```

## Opcional: eliminación del fondo del sprite con IA

Marinara Engine solicita transparencia nativa para los sprites (imágenes del personaje) fijos generados y tiene una limpieza adaptativa de máscara integrada para chroma plano y fondos blancos antiguos. También puedes instalar una herramienta opcional llamada `backgroundremover` como alternativa para paisajes detallados y otros fondos no planos. Es opcional porque descarga archivos grandes de aprendizaje automático.

Para usarla primero necesitas Python. Instala Python 3.11 desde el sitio oficial, luego ejecuta el comando de instalación desde la carpeta `Marinara-Engine`:

```text
https://www.python.org/downloads/windows/
```

Ejecuta el paso del instalador:

```bat
pnpm backgroundremover:install
```

Esto crea una carpeta privada de Python (un venv) dentro de tu carpeta de datos. Marinara Engine la usa entonces automáticamente para la limpieza de sprites. Un venv es una configuración de Python independiente que no afecta al resto de tu sistema.

También puedes dejar que **start.bat** instale la herramienta por ti en el próximo inicio. Añade esta línea a tu archivo `.env`:

```env
BACKGROUNDREMOVER_AUTO_INSTALL=true
```

## Acceder desde otro dispositivo

Puedes abrir Marinara Engine desde tu teléfono, tableta u otra computadora de la misma red. Para los pasos de configuración y las opciones de seguridad, consulta la guía de [Preguntas frecuentes](../FAQ.md).

## Actualizar Marinara Engine

Tus chats, personajes y ajustes se mantienen en su sitio cuando actualizas. Marinara Engine ofrece tres formas de actualizar en Windows.

### Actualizaciones automáticas con el lanzador

Cuando inicias la app con el acceso directo del escritorio o con **start.bat** desde una copia basada en Git, el lanzador comprueba primero si hay actualizaciones. Si existe una versión más reciente, descarga los cambios, reinstala las dependencias, recompila la app y luego arranca. Esto funciona tanto para las instalaciones con instalador como para los clones manuales.

Ejecuta `start.bat --skip-update` para omitir una comprobación. Para mantener la versión instalada del Engine entre inicios, añade `AUTO_UPDATE_ENABLED=false` a `.env`. Las comprobaciones manuales, la aplicación dentro de la app y las actualizaciones manuales de Git siguen disponibles.

Si tienes cambios locales sin guardar en el código, el lanzador intenta apartarlos de forma segura. Los vuelve a poner después de actualizar. Si no puede, mantiene tu versión actual e imprime una nota.

### Actualizaciones dentro de la app

También puedes buscar actualizaciones dentro de la app.

1. Abre **Settings** (Configuración).
2. Ve a la pestaña **Advanced** (Avanzado).
3. Busca la sección **Updates** (Actualizaciones).
4. Elige un canal en **Release Channel** (Canal de versiones). Elige **Latest Stable** (Estable más reciente) para la versión normal, o **Staging/UAT** para las versiones de pruebas tempranas. Haz una copia de seguridad de tus datos antes de usar versiones de pruebas.
5. Haz clic en **Check for Updates** (Buscar actualizaciones). La app te dice si hay una versión más reciente disponible.

El botón **Apply Update** (Aplicar actualización) está desactivado de forma predeterminada por seguridad. Aplicar la actualización desde dentro de la app necesita configuración adicional. En tu archivo `.env`, define los siguientes valores:

```env
UPDATES_APPLY_ENABLED=true
ADMIN_SECRET=your-own-secret-value
```

Luego abre **Settings**, ve a la pestaña **Advanced**, busca **Admin Access** (Acceso de administrador) y pega ahí el mismo valor secreto. Después de eso, el botón **Apply Update** queda disponible.

Si abres la app desde un iPhone o iPad que se conecta a esta computadora con Windows, **Apply Update** actualiza este servidor de Windows. La aplicación remota también necesita un valor más en `.env`:

```env
UPDATES_ALLOW_REMOTE_APPLY=true
```

Si no activas la aplicación dentro de la app, solo reinicia la app con el acceso directo o **start.bat** para actualizar.

### Actualización manual

Si usas una copia de Git sin el lanzador, puedes actualizar a mano. Ejecuta estos comandos desde la carpeta `Marinara-Engine`.

1. Obtén el código estable más reciente:

```bat
git fetch origin +refs/heads/main:refs/remotes/origin/main
```

2. Muévete a la versión estable más reciente:

```bat
git merge --ff-only origin/main || git checkout --detach origin/main
```

3. Reinstala las dependencias:

```bat
pnpm install --force
```

4. Recompila la app:

```bat
pnpm build
```

5. Inicia el servidor de nuevo:

```bat
pnpm start
```

Para las versiones de pruebas, usa la rama staging en su lugar. Ejecuta estos dos comandos en lugar de los pasos 1 y 2 de arriba. Luego continúa con los pasos de instalación y compilación:

```bat
git fetch origin +refs/heads/staging:refs/remotes/origin/staging
```

```bat
git checkout -B staging origin/staging
```

## Si algo sale mal

Si la instalación o el inicio fallan, primero asegúrate de que Node.js sea la versión 24, 25 o 26 y de que Git esté instalado. Si tu antivirus bloquea el instalador o la descarga, es una falsa alarma conocida como se señaló arriba.

Para más soluciones, consulta la guía de [Solución de problemas de Marinara Engine](../TROUBLESHOOTING.md).

## Guías relacionadas

- [Instalación de Marinara Engine](../INSTALLATION.md): elige el método de instalación adecuado para tu dispositivo.
- [Actualizar Marinara Engine](../UPGRADING.md): más detalles sobre cómo mantener la app al día.
- [Solución de problemas de Marinara Engine](../TROUBLESHOOTING.md): soluciones para problemas comunes.
- [Preguntas frecuentes](../FAQ.md): respuestas rápidas, incluido el acceso a la red.
