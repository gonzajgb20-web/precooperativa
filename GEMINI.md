# Directrices de Diseño y Desarrollo Frontend — Precooperativa Escolar

Al diseñar, editar o refactorizar vistas, componentes, estilos y flujos de usuario en este proyecto, se deben aplicar de forma obligatoria los principios de la skill **`emil-design-eng`** (Filosofía de Ingeniería de Diseño de Emil Kowalski):

### 1. Claridad Visual y Despeje de la Interfaz
- **Eliminar texto innecesario:** No incluir párrafos explicativos redundantes, advertencias largas ni justificaciones teóricas en la interfaz. El software debe ser intuitivo sin manuales en pantalla.
- **Títulos cortos y descriptivos:** Usar títulos directos de 2 a 4 palabras que declaren la acción o el propósito de la pantalla (ej. *"Tablero de Taller"*, *"Nuevo Pedido"*, *"Roles y Permisos"*).
- **Prohibido incluir referencias de rúbricas:** Jamás colocar textos como *"Punto X"*, *"Pantalla X"* o numeración de consignas en los títulos, tarjetas ni badges de la interfaz.

### 2. Artesanía de Componentes y Microinteracciones
- **Feedback táctil y responsivo:** Los botones interactivos deben reaccionar inmediatamente (ej. `:active { transform: scale(0.97); }` o feedback sutil, bordes al hacer `:focus-visible`).
- **Estados vacíos orientados a la acción:** Si una lista o tabla está vacía, no dejarla desierta; mostrar un icono tenue, una frase breve de una línea y un botón de llamada a la acción primario.
- **Jerarquía y contrastes limpios:** Fondos suaves, tarjetas con bordes sutiles (`border: 1px solid var(--border-subtle)`), tipografía con peso bien contrastado y badges cromáticos legibles.

### 3. Criterio de Animaciones y Movimiento
- **Animaciones solo con propósito:** Aplicar animaciones únicamente en elementos transicionales (modales, drawers, alertas o toasts).
- **Curvas físicas:** Usar siempre `ease-out` para elementos que entran (comienzan rápido y frenan suavemente) y animar únicamente propiedades aceleradas por GPU (`transform`, `opacity`). Evitar transiciones genéricas como `transition: all`.
- **Nunca animar elementos de alta frecuencia:** Las listas filtradas o toggles rápidos no deben retrasar la interacción del usuario.

### 4. Activación de la Skill
- Ante cualquier tarea de diseño de pantalla, revisión de UI o creación de componentes visuales, consultar y activar los patrones detallados en `emil-design-eng`.

