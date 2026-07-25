# Integración con Home Assistant

Esta guía te muestra cómo conectar Marinara Engine con Home Assistant. Una vez conectados, tus personajes de IA pueden controlar dispositivos reales de hogar inteligente directamente desde un chat. Pueden manejar luces, clima, persianas y reproductores de medios. La conexión también permite que las automatizaciones de Home Assistant envíen mensajes hacia Marinara.

Home Assistant es una plataforma gratuita y de código abierto para controlar dispositivos de hogar inteligente. Si no usas Home Assistant, no necesitas esta integración.

## Qué hace esta integración

La integración es una pequeña pieza de software que se instala dentro de Home Assistant. Conecta un Home Assistant en ejecución con un servidor de Marinara Engine en ejecución. Una vez instalada, hace tres cosas por ti automáticamente:

- Crea herramientas de hogar inteligente dentro de Marinara. Estas aparecen en la sección **Functions** del panel de Presets. Marinara las llama "custom tools" o "Functions". Consulta [Custom Tools](../extending/custom-tools.md) para saber cómo funcionan las Functions en general.
- Crea un agente de IA dentro de Marinara llamado **Home Assistant**. Un agente es un ayudante de IA que se ejecuta junto a tu chat. Consulta [Agents Overview](../agents/agents-overview.md).
- Crea varias entidades de Home Assistant para que puedas observar y controlar Marinara desde el lado de Home Assistant. Una entidad es un dispositivo, sensor o control en Home Assistant.

Nunca copias direcciones de herramientas ni configuras herramientas a mano. La integración conecta todo en la primera configuración.

## Requisitos previos

Antes de empezar, asegúrate de tener todo lo siguiente.

- Un Home Assistant en ejecución, versión 2024.1.0 o más reciente.
- HACS instalado en Home Assistant. HACS es la Home Assistant Community Store, una herramienta para instalar integraciones personalizadas que no vienen incluidas.
- Marinara Engine instalado y en ejecución, y accesible desde tu máquina de Home Assistant. La dirección predeterminada es `localhost:7860`. Si Home Assistant se ejecuta en un dispositivo diferente, lee la nota de abajo sobre contraseñas.
- La configuración `WEBHOOK_LOCAL_URLS_ENABLED=true` añadida al archivo `.env` de Marinara.

El archivo `.env` es el archivo de configuración en texto plano del servidor de Marinara. Consulta [Server Configuration](../CONFIGURATION.md) para saber dónde está y cómo editarlo.

Necesitas esa última configuración porque la integración usa un webhook. Un webhook es una dirección web que permite que una app envíe datos a otra automáticamente. La dirección del webhook de Home Assistant es una dirección `http` local y plana. Marinara bloquea por seguridad las llamadas a direcciones `http` locales de forma predeterminada. Configurar `WEBHOOK_LOCAL_URLS_ENABLED=true` las permite.

Añade esta línea a tu archivo `.env`:

```
WEBHOOK_LOCAL_URLS_ENABLED=true
```

Esta configuración surte efecto en un par de segundos. No necesitas reiniciar el servidor de Marinara.

### Si Home Assistant se ejecuta en un dispositivo diferente

La integración se conecta a Marinara sin usuario ni contraseña. No hay ningún lugar para introducirlos en el formulario de configuración. Por eso, importa dónde se ejecuta Home Assistant:

- Si Home Assistant y Marinara se ejecutan en la misma máquina, la conexión funciona sin más.
- Si Home Assistant se ejecuta en un dispositivo diferente, Marinara bloquea la conexión de forma predeterminada. Debes permitir que el dispositivo de Home Assistant se conecte sin contraseña. Una forma es añadir la dirección IP de ese dispositivo a `IP_ALLOWLIST` en el archivo `.env` de Marinara. Una dirección IP es la dirección numérica de un dispositivo en tu red. En una red doméstica de plena confianza, puedes configurar `ALLOW_UNAUTHENTICATED_PRIVATE_NETWORK=true` en su lugar.
- Si Marinara está protegido con `BASIC_AUTH_USER` y `BASIC_AUTH_PASS`, la integración no puede iniciar sesión. Entonces solo funciona desde la misma máquina, o desde un dispositivo que esté en `IP_ALLOWLIST`.

Consulta [Remote Access](../REMOTE_ACCESS.md) para saber cómo funcionan estas configuraciones y cuál elegir.

## Instalar la integración en Home Assistant

Instalas la integración en dos etapas. Primero la añades a HACS, luego la configuras.

### Añadirla a HACS

1. En Home Assistant, abre **HACS**.
2. Abre el menú de tres puntos y luego haz clic en **Custom repositories**.
3. En el cuadro del repositorio, introduce esta dirección:

```
https://github.com/Pasta-Devs/Marinara-Engine
```

4. Configura la categoría en **Integration** y luego haz clic en **Add**.
5. Busca **Marinara Engine** y luego instálalo.
6. Reinicia Home Assistant.

### Configurarla

1. Ve a **Settings** (Configuración), luego a **Devices & Services** y luego haz clic en **Add Integration**.
2. Busca **Marinara Engine**.
3. Introduce el **Host** y el **Port** donde se ejecuta Marinara. Los valores predeterminados son `localhost` y `7860`.
4. Haz clic en **Submit**.

Si no se puede llegar a Marinara en esa dirección, Home Assistant muestra un error y no termina. Consulta Solución de problemas más abajo.

## Qué crea Marinara Engine automáticamente

Cuando la configuración se completa con éxito, la integración construye todo por ti.

- Registra un webhook privado dentro de Home Assistant.
- Crea las herramientas de hogar inteligente en la sección **Functions** de Marinara, cada una ya apuntando a ese webhook.
- Crea el agente **Home Assistant** en Marinara, listando cada herramienta activada.
- Crea las entidades de Home Assistant descritas más adelante en esta guía.

## Añadir el agente Home Assistant a un chat

Crear el agente no lo asocia a todos los chats. Debes añadirlo a cada chat donde quieras control del hogar inteligente.

1. Abre el chat que quieras.
2. Abre **Chat Settings** (Ajustes del chat) y luego la sección **Agents**.
3. Añade el agente **Home Assistant** al chat.

El agente Home Assistant funciona en chats de Roleplay, Conversation y Game. Una vez añadido, las herramientas de hogar inteligente quedan disponibles para la IA en ese chat automáticamente. No necesitas activar nada más en el chat.

## Verificar que la configuración funciona

Prueba la conexión con una petición simple.

1. Añade el agente **Home Assistant** a un chat, como se mostró arriba.
2. En ese chat, escribe una petición sencilla, por ejemplo: `Turn on the office lights`.
3. Envía el mensaje.

La IA debería llamar a una herramienta de hogar inteligente, como `ha_turn_on`, y las luces correspondientes deberían encenderse. Luego la IA confirma lo que hizo. Si no pasa nada, comprueba que `WEBHOOK_LOCAL_URLS_ENABLED=true` esté configurado y consulta Solución de problemas.

## Categorías de herramientas expuestas

La integración agrupa sus herramientas de hogar inteligente en ocho categorías. Tú eliges qué categorías puede usar Marinara.

Para cambiar las categorías, abre **Settings**, luego **Devices & Services**, haz clic en **Marinara Engine** y luego en **Configure**. Verás dos opciones:

- **Primary Chat**: el chat predeterminado al que apuntan los servicios de Home Assistant. Esos servicios se describen más adelante en esta guía.
- **Exposed Tool Categories**: la lista de categorías de herramientas que Marinara tiene permitido usar.

Esta tabla lista cada categoría, su estado predeterminado y las herramientas que contiene.

| Categoría | Predeterminado | Herramientas |
|---|---|---|
| Lights & Switches | On | ha_turn_on, ha_turn_off, ha_toggle, ha_set_brightness, ha_set_color, ha_set_color_temp |
| Climate | On | ha_set_temperature, ha_set_hvac_mode |
| Covers (Blinds & Garage) | On | ha_open_cover, ha_close_cover, ha_set_cover_position |
| Locks | Off | ha_lock, ha_unlock |
| Media Players | On | ha_media_play, ha_media_pause, ha_set_volume |
| Scenes & Scripts | On | ha_activate_scene, ha_run_script |
| Query | On | ha_get_state, ha_list_areas, ha_list_entities, ha_notify |
| Generic Service Calls (Advanced) | Off | ha_call_service |

Tanto **Locks** como **Generic Service Calls (Advanced)** están desactivados de forma predeterminada. Actívalos solo si los quieres. **Generic Service Calls (Advanced)** permite que la IA llame a cualquier servicio de Home Assistant, así que trátalo con cuidado.

La mayoría de las herramientas aceptan un dispositivo específico o el nombre de una habitación. Si das el nombre de una habitación, la herramienta actúa sobre cada dispositivo coincidente de esa habitación a la vez.

Los cambios en las categorías solo surten efecto después de que pulses **Marinara Sync HA Tools** o reinicies Home Assistant. Ese botón se describe en la siguiente sección.

## Entidades de Home Assistant

La integración crea estas entidades bajo un dispositivo de Home Assistant llamado **Marinara Engine**.

| Entidad | Tipo | Qué hace |
|---|---|---|
| Marinara Chat Count | Sensor | Muestra el número total de chats de Marinara |
| Marinara Active Agent Count | Sensor | Muestra cuántos agentes de Marinara están activados |
| Marinara Active Chat | Select | Elige a qué chat apuntan los servicios de Home Assistant |
| Marinara Agent: (name) | Switch | Activa o desactiva un agente de Marinara. Hay un interruptor por agente |
| Marinara Abort Generation | Button | Cancela cualquier respuesta de IA que se esté generando |
| Marinara Sync HA Tools | Button | Reenvía todas las herramientas y reconstruye el agente Home Assistant |

La integración consulta a Marinara en busca de nuevos chats y agentes cada 30 segundos. Un chat o agente que acabas de crear en Marinara puede tardar hasta 30 segundos en aparecer aquí.

## Controlar Marinara desde las automatizaciones de Home Assistant

La integración añade dos servicios de Home Assistant. Los usas dentro de las automatizaciones de Home Assistant, no dentro de Marinara. Ambos pueden apuntar a tu **Primary Chat** de forma predeterminada.

### Send Message (marinara_engine.send_message)

Esto envía un mensaje a un chat de Marinara.

- `message`: el texto del mensaje. Este campo es obligatorio.
- `chat_id`: a qué chat enviar. Si lo dejas en blanco, se usa el Primary Chat.
- `role`: de quién es el mensaje. Puede ser `user`, `assistant`, `system` o `narrator`. El valor predeterminado es `user`.
- `trigger_generation`: cuando es true, la IA también responde después de enviar el mensaje. El valor predeterminado es false.

Aquí tienes una automatización que le avisa a la IA cuando se abre la puerta principal:

```yaml
automation:
  trigger:
    platform: state
    entity_id: binary_sensor.front_door
    to: "on"
  action:
    service: marinara_engine.send_message
    data:
      message: "Someone just arrived at the front door."
      trigger_generation: true
```

### Trigger Generation (marinara_engine.trigger_generation)

Esto inicia una respuesta de IA en un chat sin que envíes un mensaje visible.

- `chat_id`: qué chat usar. Si lo dejas en blanco, se usa el Primary Chat.
- `user_message`: un mensaje opcional para incluir con el turno de respuesta.

## Volver a sincronizar después de cambiar configuraciones

Cuando cambies las categorías activadas, pulsa **Marinara Sync HA Tools** para aplicar el cambio. Puedes encontrar este botón en la página del dispositivo **Marinara Engine** en Home Assistant.

Pulsar **Marinara Sync HA Tools** hace lo siguiente:

- Actualiza las herramientas existentes en el sitio, para que cualquier cambio llegue a Marinara.
- Reconstruye el agente **Home Assistant** si lo eliminaste en Marinara.
- Desactiva cualquier herramienta cuya categoría hayas desactivado. No elimina esas herramientas.

No edites a mano las herramientas de Home Assistant dentro de Marinara. La siguiente sincronización sobrescribe tus ediciones y vuelve a activar las herramientas.

## Solución de problemas

### El formulario de configuración dice que no se puede conectar

Asegúrate de que Marinara Engine esté en ejecución. Comprueba que el **Host** y el **Port** que introdujiste coincidan con donde está escuchando. El valor predeterminado es `localhost` y `7860`.

Si Home Assistant se ejecuta en un dispositivo diferente al de Marinara, Marinara lo bloquea de forma predeterminada. La integración no puede enviar una contraseña, así que Marinara debe aceptar ese dispositivo sin una. Añade la dirección IP del dispositivo de Home Assistant a `IP_ALLOWLIST` en el archivo `.env` de Marinara. Consulta [Remote Access](../REMOTE_ACCESS.md) para esto y otras opciones. Un Marinara protegido con `BASIC_AUTH_USER` y `BASIC_AUTH_PASS` también rechaza la integración, a menos que el dispositivo esté en `IP_ALLOWLIST`.

Estas reglas siguen aplicándose después de la configuración. Si Marinara más adelante bloquea el dispositivo de Home Assistant, los sensores y la lista de chats dejan de actualizarse silenciosamente.

### La IA intenta usar una herramienta de dispositivo pero no pasa nada

Lo más probable es que la llamada al webhook esté bloqueada. Añade `WEBHOOK_LOCAL_URLS_ENABLED=true` al archivo `.env` de Marinara y guárdalo. Esto surte efecto en un par de segundos. Sin ello, las llamadas a herramientas pueden fallar con un mensaje sobre que `http` no está permitido, o sobre que se rechaza una dirección privada.

Si Marinara y Home Assistant se ejecutan en la misma máquina, la integración usa la dirección interna para el webhook automáticamente. Si Marinara se ejecuta en un dispositivo diferente, asegúrate de que la dirección de red local de Home Assistant sea accesible desde ese dispositivo.

### Las herramientas no aparecen en la lista de Functions

Pulsa **Marinara Sync HA Tools** o reinicia Home Assistant. Luego comprueba la sección **Functions** del panel de Presets en Marinara.

### El agente Home Assistant no está en mi chat

Primero confirma que el agente **Home Assistant** existe en Marinara bajo Agents. Si falta, pulsa **Marinara Sync HA Tools** para reconstruirlo. Luego abre **Chat Settings**, abre la sección **Agents** y añade el agente **Home Assistant** a ese chat.

### Encontrar la dirección del webhook a mano

Rara vez necesitas esto, ya que cada herramienta ya tiene la dirección configurada. Para encontrarla, abre **Settings**, luego **Devices & Services** y luego **Marinara Engine** en Home Assistant. El webhook usa este patrón, donde 8123 es el puerto predeterminado de Home Assistant:

```
http://<homeassistant-ip>:8123/api/webhook/<webhook-id>
```

## Desinstalación

Para eliminar la integración, bórrala desde **Settings**, luego **Devices & Services** y luego **Marinara Engine** en Home Assistant. Esto elimina las entidades de Home Assistant. Las herramientas que creó en la sección **Functions** de Marinara permanecen en Marinara. También lo hace el agente **Home Assistant**. Elimina ambos a mano en Marinara si ya no los quieres.

## Guías relacionadas

- [Custom Tools](../extending/custom-tools.md)
- [Agents Overview](../agents/agents-overview.md)
- [Server Configuration](../CONFIGURATION.md)
- [Remote Access](../REMOTE_ACCESS.md)
