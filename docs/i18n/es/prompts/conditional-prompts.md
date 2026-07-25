# Prompts condicionales ({{#if}})

Esta guía explica cómo usar los bloques `{{#if}}` en Marinara Engine. Un bloque condicional te permite incluir cierto texto del prompt (las instrucciones enviadas a la IA) solo cuando un valor cumple una regla que tú defines. Los condicionales forman parte del sistema de macros, así que funcionan en todos los lugares donde funcionan las macros, incluidas las tarjetas de personaje, las personas, las entradas de lorebook y los presets de prompt.

## Qué hacen los prompts condicionales

Una macro es un marcador de posición con `{{doble-llave}}` que Marinara Engine reemplaza por un valor en vivo mientras arma tu prompt. Un bloque condicional va un paso más allá. Comprueba un valor y luego conserva una parte del texto y descarta el resto.

Escribes una condición, algo de texto para usar cuando la condición es verdadera y (opcionalmente) texto para usar cuando es falsa. Marinara lee la condición cada vez que arma un prompt. Esto significa que la misma tarjeta o preset puede comportarse de forma distinta para diferentes personajes, personas o chats.

Un uso común son las instrucciones específicas de un personaje dentro de un mismo preset compartido. Otro uso común es incluir un campo solo cuando tiene contenido, para no enviar una etiqueta vacía al modelo.

## La sintaxis básica

Un bloque condicional empieza con `{{#if condition}}` y termina con `{{/if}}`. Todo lo que hay entre ambos es el texto que se usa cuando la condición es verdadera.

```
{{#if condition}}
Text used when the condition is true.
{{/if}}
```

Puedes añadir una rama `{{else}}` para el caso falso:

```
{{#if condition}}
Text used when true.
{{else}}
Text used when false.
{{/if}}
```

También puedes encadenar condiciones adicionales con `{{else if}}`. Marinara comprueba cada rama en orden, de arriba hacia abajo. Conserva la primera rama cuya condición sea verdadera, resuelve las macros dentro de esa rama y descarta todas las demás. Si ninguna condición es verdadera y no hay `{{else}}`, todo el bloque se resuelve en nada.

```
{{#if length == "short"}}
Keep your reply to one or two sentences.
{{else if length == "long"}}
Write a detailed, multi-paragraph reply.
{{else}}
Write a reply of normal length.
{{/if}}
```

Puedes poner un bloque en varias líneas, como se muestra arriba, o en una sola línea. También puedes anidar un condicional dentro de otra rama de un condicional más grande.

## Operadores admitidos

La condición suele ser un valor a la izquierda, un operador y un valor a la derecha, como `char == "Alice"`. La tabla de abajo lista todos los operadores que puedes usar. Cada operador se muestra en estilo de código.

| Operador | Significado |
| --- | --- |
| `==`, `=`, `is` | Igual. |
| `!=`, `is not` | Distinto. |
| `>` | Mayor que (solo números). |
| `<` | Menor que (solo números). |
| `>=` | Mayor o igual que (solo números). |
| `<=` | Menor o igual que (solo números). |
| `contains`, `includes` | El valor de la izquierda contiene al de la derecha como texto. |
| `not contains`, `not includes` | El valor de la izquierda no contiene al de la derecha. |

Algunas reglas controlan cómo funciona la comparación:

1. Para `==`, `=`, `is`, `!=` e `is not`, si ambos lados parecen números, Marinara los compara como números. Así que `5` es igual a `5.0`. En caso contrario los compara como texto, ignorando mayúsculas y minúsculas. Así que `Mari` es igual a `mari`.
2. Para `>`, `<`, `>=` y `<=`, ambos lados deben ser números. Si alguno de los lados no es un número, la condición es falsa.
3. Para `contains`, `includes`, `not contains` y `not includes`, la coincidencia no distingue mayúsculas de minúsculas. Así que `contains "dr"` coincide con el texto `Dr Smith`.

## Combinar condiciones con OR y AND

Usa `||` cuando cualquiera de las condiciones pueda coincidir. Usa `&&` cuando todas las condiciones deban coincidir.

```
{{#if character == "Maukie" || character == "Pantalone"}}
Use the shared Maukie and Pantalone instructions.
{{/if}}

{{#if characters contains "Maukie" && characters contains "Pantalone"}}
Both characters are present in this chat.
{{/if}}
```

`&&` se evalúa antes que `||`. Añade paréntesis cuando quieras controlar el orden de forma explícita:

```
{{#if (character == "Maukie" || character == "Pantalone") && scenario contains "lake"}}
Use the lakeside instructions for either character.
{{/if}}
```

Para varias opciones de igualdad sobre el mismo valor, puedes omitir el lado izquierdo repetido después de `||`:

```
{{#if character == "Maukie" || "Pantalone"}}
Use the shared instructions.
{{/if}}
```

Este atajo significa `character == "Maukie" || character == "Pantalone"`. Aplica a los operadores de igualdad `==`, `=` e `is`. Escribe condiciones completas a ambos lados de `&&`, ya que un mismo valor normalmente no puede ser igual a dos opciones distintas a la vez.

### Comprobaciones de veracidad (sin operador)

Si escribes una condición sin operador, Marinara hace una comprobación de veracidad. Esto plantea una pregunta simple: ¿este valor tiene contenido real dentro?

```
{{#if scenario}}
Current scene: {{scenario}}
{{else}}
No specific scene is set.
{{/if}}
```

Una comprobación de veracidad es verdadera cuando el valor no está vacío y no es una de estas palabras: `false`, `0`, `no`, `off`, `null` o `undefined`. La comprobación de palabras ignora mayúsculas y minúsculas. Usa una comprobación de veracidad cuando solo quieras incluir texto si un campo está rellenado.

### Qué puedes comparar

El lado izquierdo o derecho de una condición puede ser cualquiera de estos:

1. Una palabra clave de campo o identidad, como `char`, `user`, `group`, `persona`, `description`, `personality`, `scenario`, `input` o `model`. Estas leen los mismos valores que las macros correspondientes. `group` lista los demás personajes activos del chat después de excluir al que responde en ese momento.
2. Un literal entre comillas, como `"Alice"`.
3. El nombre de una variable de preset, como `length`. Una variable de preset es un valor con nombre que tú defines en un Prompt Preset. Consulta [Variables de preset](preset-variables.md).
4. Una búsqueda explícita de variable escrita como `var:name` o `var.name`.
5. Otra macro, cuyo valor se resuelve primero y luego se compara.

Si escribes una palabra suelta que no es una palabra clave, Marinara la trata como el nombre de una variable. Si no existe ninguna variable con ese nombre, usa la palabra como su propio texto plano. Poner tus valores literales entre comillas evita esta confusión, así que ponlos entre comillas cuando tengas dudas.

## Reglas para las comillas

Cuando comparas contra un fragmento de texto fijo, ponlo entre comillas. Esto le dice a Marinara que lo trate como un literal exacto y no como una palabra clave o una variable.

```
{{#if char == "Dottore"}}
Speak in a cold, clinical tone.
{{/if}}
```

Puedes usar comillas dobles rectas o comillas simples rectas. Marinara también acepta comillas curvas (tipográficas), pero las comillas rectas son las más seguras y coinciden con todos los ejemplos de la app. Dentro de un valor entre comillas puedes escapar una comilla con una barra invertida, y puedes escribir `\n` para un salto de línea.

Pon siempre entre comillas un literal que tenga un espacio, como `"Dr Smith"`. Un valor de varias palabras sin comillas se lee como el nombre de una sola variable, que casi nunca es lo que quieres.

## Bloques de grupo para varios personajes

En un chat grupal con dos o más personajes, un bloque de grupo repite el mismo texto una vez por cada personaje. Esto te permite escribir un solo bloque que describa a todos los personajes de la escena.

Para hacer un bloque de grupo, pon un único `[` en su propia línea, luego tu texto, y después un único `]` en su propia línea. El bloque debe contener una macro de personaje, como `{{char}}` o `{{description}}`, o una condición basada en el personaje como `{{#if char == "Alice"}}`. Entonces Marinara repite el bloque una vez por personaje y resuelve las macros de personaje contra cada uno por turno.

```
[
{{char}}'s current attitude:
{{#if char == "Alice"}}cheerful and open{{else}}guarded and quiet{{/if}}
]
```

En un chat grupal con Alice y Bob, el bloque se ejecuta dos veces. La primera pasada rellena el nombre de Alice y elige su rama. La segunda pasada rellena el nombre de Bob y elige la suya. Fuera de un bloque de grupo, una macro de personaje se resuelve solo contra el personaje actual o principal.

Los bloques de grupo solo se expanden en un chat con dos o más personajes. En un chat individual, las líneas `[` y `]` se quedan como texto plano.

## Ejemplos resueltos (antes y después)

Aquí tienes tres ejemplos completos con el resultado que recibe el modelo.

Tono específico de un personaje dentro de un preset compartido:

```
{{#if char == "Dottore"}}
Speak in a cold, clinical tone.
{{else}}
Speak warmly and casually.
{{/if}}
```

Para un personaje llamado `Dottore`, el modelo recibe `Speak in a cold, clinical tone.` Para todos los demás personajes, recibe `Speak warmly and casually.`

Incluir un campo solo cuando está rellenado:

```
{{#if backstory}}
Backstory to remember: {{backstory}}
{{/if}}
```

Si el personaje tiene una **Backstory** (Historia de fondo), el modelo recibe esa línea con el texto de la historia de fondo. Si el campo **Backstory** está vacío, todo el bloque se resuelve en nada, así que no se envía ninguna etiqueta vacía.

Coincidir con parte del nombre de usuario:

```
{{#if user contains "Dr"}}
Address the user as Doctor.
{{/if}}
```

Si el nombre de tu persona contiene `Dr`, se le indica al modelo que te trate como Doctor. Si no, el bloque se resuelve en nada.

## Guías relacionadas

- [Macros de prompt](macros.md)
- [Variables de preset](preset-variables.md)
- [Chats grupales y conversaciones grupales](../chats/group-chats.md)
