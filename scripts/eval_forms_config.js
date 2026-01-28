const LEGEND_L_LD_NL = "L = Logrado | LD = Logrado con Dificultad | NL = No Logrado";
const LEGEND_A_IP_NH = "A = Accomplished | IP = In Process | NH = Needs Help";
const LEGEND_L_EP_NA = "L = Logrado | EP = En Proceso | NA = Necesita Ayuda";
const LEGEND_L_E_N = "L = Logrado | E = En Proceso | N = Necesita Ayuda";

module.exports = [
    // -------------------------------------------------------------------------
    // K2 a K3
    // -------------------------------------------------------------------------
    {
        id: 'eval_k2_k3',
        title: 'Evaluación K2 a K3',
        grade_field: false,
        sections: [
            {
                id: 'spanish',
                title: 'Indicadores Español',
                legend: LEGEND_L_LD_NL,
                headers: ['L', 'LD', 'NL'],
                items: [
                    "Comprende y responde preguntas sobre textos simples",
                    "Resuelve problemas a través del conteo y con acciones sobre las colecciones",
                    "Comunica de manera oral y escrita los números del 1 al 10",
                    "Cuenta colecciones no mayores a 20 elementos",
                    "Compara, iguala y clasifica colecciones con base en la cantidad de elementos",
                    "Relaciona el número de elementos de una colección con la sucesión numérica escrita",
                    "Ubica objetos y lugares cuya ubicación desconoce, a través de la interpretación de relaciones espaciales",
                    "Reconoce figuras y cuerpos geométricos",
                    "Identifica colores primarios, secundarios y terciarios",
                    "Identifica varios eventos de su vida cotidiana y dice el orden en que ocurren",
                    "Escribe su nombre",
                    "Sigue instrucciones con fluidez"
                ],
                observation: false
            },
            {
                id: 'english',
                title: 'Indicadores Inglés',
                headers: ['L', 'LD', 'NL'],
                items: [
                    "Identifica figuras básicas",
                    "Identifica colores primarios, secundarios y terciarios",
                    "Domina vocabulario simple partes del cuerpo",
                    "Domina vocabulario simple familia",
                    "Domina vocabulario simple clima",
                    "Domina vocabulario simple objetos dentro del aula",
                    "Cuenta del 1 al 10 en inglés",
                    "Conoce el nombre de las letras",
                    "Identifica conceptos espaciales simples",
                    "Escucha y contesta frases sencillas",
                    "Sigue instrucciones simples como señalar"
                ],
                observation: true
            },
            {
                id: 'psycho',
                title: 'Indicadores Psico',
                legend: LEGEND_L_EP_NA,
                headers: ['L', 'EP', 'NA'], // EP = En Proceso, NA = Necesita Ayuda
                items: [
                    "Identifica y reconoce las emociones básicas en él y los demás",
                    "Mantiene seguimiento de instrucciones cortas de forma auditiva y verbal",
                    "Sus periodos de atención son los esperados a la etapa de desarrollo (5-15 min)",
                    "Tiene control y autorregulación corporal durante el tiempo de trabajo",
                    "Mantiene la rutina y ritmo de trabajo conforme a la media del grupo",
                    "Tiene un lenguaje espontáneo y una articulación regular de fonemas",
                    "Toma adecuadamente el lápiz/crayola para iniciar una actividad",
                    "Solicita apoyo a los adultos cuando tiene una necesidad",
                    "Se relaciona positivamente con su entorno (compañeros y docentes)",
                    "Coordina movimientos de extremidades y mantiene un propiocepción adecuada"
                ],
                observation: true,
                extra_fields: [
                    { name: 'nivel_desarrollo', label: 'Nivel de Desarrollo' },
                    { name: 'indicadores_madurez', label: 'Indicadores Madurez Visomotora' },
                    { name: 'indicadores_emocionales', label: 'Indicadores Emocionales' }
                ]
            }
        ]
    },

    // -------------------------------------------------------------------------
    // K3 a PF o 1° 
    // -------------------------------------------------------------------------
    {
        id: 'eval_k3_pf',
        title: 'Evaluación K3 a Pre-First / 1°',
        grade_field: false,
        sections: [
            {
                id: 'spanish',
                title: 'Indicadores Español',
                headers: ['L', 'LD', 'NL'],
                items: [
                    "Escucha con atención una lectura y responde a preguntas de comprensión",
                    "Lee frases cortas",
                    "Reconoce patrones de lectura",
                    "Toma dictado de palabras simples con sonidos del primer grupo y del segundo grupo",
                    "Copia palabras",
                    "Completa series numéricas hasta el 20",
                    "Identifica longitud en comparación directa",
                    "Reconoce figuras geométricas básicas",
                    "Discrimina figuras geométricas",
                    "Realiza cálculo mental de hasta 10 elementos",
                    "Realiza sumas y restas simples con ejemplos cotidianos",
                    "Discriminación visual",
                    "Seguimiento de instrucciones",
                    "Escribe su nombre"
                ],
                observation: false
            },
            {
                id: 'english',
                title: 'Indicadores Inglés',
                headers: ['L', 'LD', 'NL'],
                items: [
                    "Sigue instrucciones simples en inglés",
                    "Identifica y nombra al menos 10 colores",
                    "Reconoce letras mayúsculas por su nombre",
                    "Lee palabras cortas en inglés",
                    "Deletrea palabras cortas en inglés",
                    "Identifica y nombra estados de ánimo",
                    "Cuenta objetos del 1 al 20",
                    "Dictado (Letras / Números)", // Combined based on doc
                    "Domina vocabulario simple (objetos)",
                    "Identifica por nombre y forma las figuras geométricas",
                    "Comprende oraciones simples",
                    "Dibuja vocabulario que reconoce auditivamente",
                    "Relaciona conceptos del clima con objetos cotidianos",
                    "Responde preguntas simples con respecto a si mismo y su entorno"
                ],
                observation: true
            },
            {
                id: 'psycho',
                title: 'Indicadores Psico',
                headers: ['L', 'EP', 'NA'],
                items: [
                    "Identifica y reconoce las emociones básicas en él y los demás",
                    "Mantiene un buen seguimiento de instrucciones de forma auditiva",
                    "Lleva a cabo instrucciones de forma escrita",
                    "Sus periodos de atención son los esperados a la etapa de desarrollo (10-25 min)",
                    "Tiene control y regulación de su propio cuerpo durante el tiempo de trabajo",
                    "Mantiene la rutina y ritmo de trabajo conforme a la media del grupo",
                    "Logra producir un lenguaje fluido, entonado y con la correcta pronunciación",
                    "Tiene facilidad para iniciar y/o seguir una conversación",
                    "Logra recortar figuras sencillas con precisión y facilidad",
                    "Toma adecuadamente el lápiz para realizar actividades de trazo",
                    "Intenta resolver conflictos o logra pedir apoyo a algún adulto",
                    "Se relaciona positivamente con los demás (maestras y compañeros)",
                    "Coordina sus movimientos de brazos y piernas al ejecutar una coreografía"
                ],
                observation: true,
                extra_fields: [
                    { name: 'nivel_desarrollo', label: 'Nivel de Desarrollo/Percepción visual' },
                    { name: 'nivel_madurez', label: 'Nivel de Madurez' },
                    { name: 'pronostico', label: 'Pronóstico' },
                    { name: 'emocionales', label: 'Emocionales' }
                ]
            }
        ]
    },

    // -------------------------------------------------------------------------
    // PF a 1°
    // -------------------------------------------------------------------------
    {
        id: 'eval_pf_1',
        title: 'Evaluación PF a 1°',
        grade_field: true,
        sections: [
            {
                id: 'spanish',
                title: 'Indicadores Español',
                headers: ['L', 'LD', 'NL'],
                items: [
                    "Tiene un trazo claro y legible",
                    "Reconoce y distingue números de letras",
                    "Identifica las letras del abecedario",
                    "Escribe palabras cortas con sonidos compuestos",
                    "Reconoce y escribe su nombre completo",
                    "Lee y contesta preguntas relacionadas a la lectura según el perfil de ingreso",
                    "Relaciona número- cantidad",
                    "Reconoce y relaciona figuras geométricas",
                    "Identifica seres vivos y no vivos",
                    "Identifica y clasifica animales terrestres, aéreos y acuáticos",
                    "Reconoce los colores de su bandera y el orden",
                    "Lee instrucciones y las lleva a cabo",
                    "Centra su atención en un tema o actividad",
                    "Permanece sentado el tiempo que se requiere"
                ],
                observation: true
            },
            {
                id: 'english',
                title: 'Indicadores Inglés',
                headers: ['L', 'LD', 'NL'],
                items: [
                    "Sigue instrucciones simples en inglés",
                    "Identifica y nombra al menos 10 colores",
                    "Reconoce letras mayúsculas por su nombre",
                    "Lee palabras cortas en inglés",
                    "Deletrea palabras cortas en inglés",
                    "Identifica y nombra estados de ánimo",
                    "Cuenta objetos del 1 al 20",
                    "Dictado (Letras / Números)",
                    "Domina vocabulario simple (objetos)",
                    "Identifica por nombre y forma las figuras geométricas",
                    "Comprende oraciones simples",
                    "Dibuja vocabulario que reconoce auditivamente",
                    "Relaciona conceptos del clima con objetos cotidianos",
                    "Responde preguntas simples con respecto a si mismo y su entorno"
                ],
                observation: true
            },
            {
                id: 'psycho',
                title: 'Indicadores Psico',
                headers: ['L', 'EP', 'NA'],
                items: [
                    "Identifica y reconoce las emociones básicas en él y los demás",
                    "Mantiene un buen seguimiento de instrucciones de forma auditiva",
                    "Lleva a cabo instrucciones de forma escrita",
                    "Sus periodos de atención son los esperados a la etapa de desarrollo (10-25 min)",
                    "Tiene control y regulación de su propio cuerpo durante el tiempo de trabajo",
                    "Mantiene la rutina y ritmo de trabajo conforme a la media del grupo",
                    "Logra producir un lenguaje fluido, entonado y correcta pronunciación",
                    "Tiene facilidad para iniciar y/o seguir una conversación",
                    "Logra recortar figuras sencillas con precisión y facilidad",
                    "Toma adecuadamente el lápiz para realizar actividades de trazo",
                    "Intenta resolver conflictos o logra pedir apoyo a algún adulto",
                    "Se relaciona positivamente con los demás (maestras y compañeros)",
                    "Coordina sus movimientos de brazos y piernas al ejecutar una coreografía"
                ],
                observation: true,
                extra_fields: [
                    { name: 'nivel_desarrollo', label: 'Nivel de Desarrollo/Percepción visual' },
                    { name: 'nivel_madurez', label: 'Nivel de Madurez' },
                    { name: 'pronostico', label: 'Pronóstico' },
                    { name: 'emocionales', label: 'Emocionales' }
                ]
            }
        ]
    },

    // -------------------------------------------------------------------------
    // 3° a 4°
    // -------------------------------------------------------------------------
    {
        id: 'eval_3_4',
        title: 'Evaluación 3° a 4°',
        grade_field: true,
        sections: [
            {
                id: 'spanish',
                title: 'Español - Lengua Materna',
                legend: LEGEND_L_LD_NL,
                headers: ['L', 'LD', 'NL'],
                items: [
                    "Reconoce, identifica y conjuga verbos de acuerdo a las formas verbales",
                    "Reconoce y elabora su árbol genealógico",
                    "Usa mayúsculas al inicio de las oraciones y de los nombres propios",
                    "Identifica adverbios y adjetivos",
                    "Reconoce y aplica signos de puntuación",
                    "Identifica las características de un poema",
                    "Identifica datos en el acta de nacimiento",
                    "Lee instrucciones y las lleva a cabo",
                    "Centra su atención en un tema o actividad"
                ],
                observation: false
            },
            {
                id: 'math',
                title: 'Pensamiento Matemático',
                headers: ['L', 'LD', 'NL'],
                items: [
                    "Lee, escribe y ordena números naturales hasta 10000",
                    "Recolecta, registra y lee datos en tablas",
                    "Lee el reloj análogo",
                    "Resuelve problemas de suma y resta con números naturales hasta 10000",
                    "Usa fracciones con denominador 2, 4 y 8",
                    "Resuelve problemas de multiplicación con producto hasta de tres cifras",
                    "Compara y ordena la duración de diferentes sucesos (hora, minutos)"
                ],
                observation: false
            },
            {
                id: 'science',
                title: 'Exploración del Mundo Natural y Social',
                legend: LEGEND_L_LD_NL,
                headers: ['L', 'LD', 'NL'],
                items: [
                    "Cuantifica propiedades de masa y longitud con instrumentos",
                    "Reconoce función del sistema locomotor y su cuidado",
                    "Reconoce los nombres que conforman el aparato digestivo",
                    "Reconoce alimentos saludables y la importancia de ingerirlos"
                ],
                observation: true
            },
            {
                id: 'english_reception',
                title: 'Inglés - Habilidades de Recepción',
                headers: ['A', 'IP', 'NH'],
                items: [
                    "Escucha y entiende instrucciones de más de una oración",
                    "Escucha y entiende conversaciones simples",
                    "Responde la actividad de acuerdo a lo que escucha",
                    "Entiende textos cortos a pesar de no conocer todas las palabras",
                    "Entiende las instrucciones que lee",
                    "Responde preguntas sobre textos cortos"
                ],
                observation: false
            },
            {
                id: 'english_production',
                title: 'Inglés - Habilidades de Producción',
                headers: ['A', 'IP', 'NH'],
                items: [
                    "Utiliza el idioma de forma escrita con pocos o ningún error",
                    "Escribe oraciones completas con 'linking words'",
                    "Responde a preguntas sobre información básica",
                    "Responde a preguntas sobre actividades que realizó"
                ],
                observation: true,
                extra_fields: [
                    { name: 'english_percent_reception', label: '% Habilidades de Recepción' },
                    { name: 'english_percent_production', label: '% Habilidades de Producción' }
                ]
            },
            {
                id: 'psycho',
                title: 'Indicadores Psico',
                headers: ['L', 'E', 'N'],
                items: [
                    "Escucha a los demás y tiene el gusto por ayudar a otros",
                    "Reconoce acciones que benefician o dañan a otros",
                    "Reconoce y asume las consecuencias de sus acciones",
                    "Participa con actitud positiva en las actividades planteadas",
                    "Distingue y sugiere reglas de convivencia",
                    "Toma el uso de la palabra respetando turnos (expone ideas)",
                    "Expresa emociones y reconoce las de los demás",
                    "Utiliza técnicas de atención y regulación",
                    "Se adapta a los cambios y afronta problemas con actitud positiva",
                    "Mantiene un autocontrol de su cuerpo durante la clase",
                    "Sus periodos de atención son de 30-35 minutos"
                ],
                observation: true,
                extra_fields: [
                    { name: 'nivel_desarrollo', label: 'Nivel de Desarrollo Figura Humana' },
                    { name: 'indicadores_emocionales', label: 'Indicadores Emocionales' },
                    { name: 'nivel_bender', label: 'Nivel perceptivo motor (BENDER)' }
                ]
            }
        ]
    },

    // -------------------------------------------------------------------------
    // 4° a 5°
    // -------------------------------------------------------------------------
    {
        id: 'eval_4_5',
        title: 'Evaluación 4° a 5°',
        grade_field: true,
        sections: [
            {
                id: 'spanish',
                title: 'Lengua Materna (Español)',
                headers: ['L', 'LD', 'NL'],
                items: [
                    "Identifica el uso de la voz narrativa en primera persona",
                    "Resume información de diversas fuentes, conservando datos esenciales",
                    "Emplea verbos y tiempos verbales para narrar acciones",
                    "Escribe cuentos/narraciones empleando conectores",
                    "Redacta un texto en párrafos con cohesión y ortografía",
                    "Usa palabras de orden temporal, numerales y viñetas",
                    "Elabora instructivos empleando modos y tiempos verbales",
                    "Usa signos de interrogación y exclamación",
                    "Identifica características de cuentos (estructura, estilo, etc.)",
                    "Infiere características/sentimientos de personajes",
                    "Contesta correctamente preguntas relacionadas con un texto",
                    "Identifica diferencias entre opinión y hecho",
                    "Expresa por escrito su opinión",
                    "Adapta el lenguaje escrito para un destinatario",
                    "Jerarquiza información de un texto",
                    "Identifica diferencia entre tipos de textos",
                    "Interpreta lenguaje figurado en poemas",
                    "Lee instrucciones y las lleva a cabo",
                    "Centra su atención y concluye actividad"
                ],
                observation: true
            },
            {
                id: 'math',
                title: 'Matemáticas',
                legend: LEGEND_L_LD_NL,
                headers: ['L', 'LD', 'NL'],
                items: [
                    "Resuelve problemas (leer, escribir, comparar números naturales/fracc/dec)",
                    "Resuelve problemas aditivos con naturales, decimales y fraccionarios",
                    "Resuelve problemas de multiplicar/dividir fraccionarios/decimales con naturales",
                    "Resuelve problemas de sucesiones (aritmética, geométrica)",
                    "Explica características de cuerpos geométricos",
                    "Calcula porcentajes e identifica representaciones",
                    "Utiliza coordenadas cartesianas (primer cuadrante)",
                    "Realiza conversiones de fracciones a decimales",
                    "Resuelve retos matemáticos con operaciones básicas"
                ],
                observation: true
            },
            {
                id: 'english_reception',
                title: 'Inglés - Habilidades de Recepción',
                headers: ['A', 'IP', 'NH'],
                items: [
                    "Escucha y entiende instrucciones de más de una oración",
                    "Escucha y entiende conversaciones simples",
                    "Responde la actividad de acuerdo a lo que escucha",
                    "Entiende textos cortos a pesar de no conocer todas las palabras",
                    "Entiende las instrucciones que lee",
                    "Responde preguntas sobre textos cortos"
                ],
                observation: false
            },
            {
                id: 'english_production',
                title: 'Inglés - Habilidades de Producción',
                headers: ['A', 'IP', 'NH'],
                items: [
                    "Utiliza el idioma de forma escrita con pocos o ningún error",
                    "Escribe oraciones completas con 'linking words'",
                    "Responde a preguntas sobre información básica",
                    "Responde a preguntas sobre actividades que realizó"
                ],
                observation: true,
                extra_fields: [
                    { name: 'english_percent_reception', label: '% Habilidades de Recepción' },
                    { name: 'english_percent_production', label: '% Habilidades de Producción' }
                ]
            },
            {
                id: 'psycho',
                title: 'Indicadores Psico',
                headers: ['L', 'E', 'N'],
                items: [
                    "Escucha a los demás y tiene el gusto por ayudar a otros",
                    "Contribuye a solucionar problemas grupales",
                    "Identifica herramientas de colaboración (email, foros)",
                    "Reconoce importancia de hacer tareas en tiempo y forma",
                    "Comprende acciones y consecuencias (clima positivo)",
                    "Identifica tipos de faltas y lineamientos",
                    "Reconoce y legitima emociones de otros",
                    "Reconoce su carácter, fortalezas, debilidades",
                    "Valora expresar emociones de forma auténtica",
                    "Mantiene una consciencia corporal adecuada",
                    "Identifica fuentes de tensión y estrés",
                    "Toma postura flexible y pacífica para evitar conflicto",
                    "Escucha con atención puntos de vista"
                ],
                observation: true,
                extra_fields: [
                    { name: 'nivel_desarrollo', label: 'Nivel de Desarrollo Figura Humana' },
                    { name: 'indicadores_emocionales', label: 'Indicadores Emocionales' },
                    { name: 'nivel_bender', label: 'Nivel perceptivo motor (BENDER)' }
                ]
            }
        ]
    },

    // -------------------------------------------------------------------------
    // 5° a 6°
    // -------------------------------------------------------------------------
    {
        id: 'eval_5_6',
        title: 'Evaluación 5° a 6°',
        grade_field: true,
        sections: [
            {
                id: 'spanish',
                title: 'Lengua Materna (Español)',
                headers: ['L', 'LD', 'NL'],
                items: [
                    "Lee y contesta preguntas relacionadas a la lectura (perfil ingreso)",
                    "Identifica características palabras según acentuación",
                    "Identifica y aplica función de un croquis",
                    "Reconoce características de familias léxicas",
                    "Identifica juegos de palabras en lenguaje",
                    "Lee instrucciones y las lleva a cabo",
                    "Centra su atención en un tema o actividad"
                ],
                observation: false
            },
            {
                id: 'math',
                title: 'Pensamiento Matemático',
                headers: ['L', 'LD', 'NL'],
                items: [
                    "Lee, escribe y ordena números naturales hasta 5 cifras",
                    "Usa fracciones con denominadores hasta 12",
                    "Resuelve problemas de suma y resta de fracciones (mismo denom)",
                    "Identifica y calcula área de cuadrados y rectángulos",
                    "Identifica y representa tipos de ángulos",
                    "Realiza notación desarrollada hasta 6 dígitos",
                    "Resuelve retos con lectura del reloj análogo",
                    "Compara y ordena duración de sucesos"
                ],
                observation: false
            },
            {
                id: 'science',
                title: 'Exploración Mundo Natural y Social',
                headers: ['L', 'LD', 'NL'],
                items: [
                    "Conoce y ejemplifica cambios de estado de agregación",
                    "Reconoce causas/efectos contaminación agua, aire, suelo",
                    "Describe características de seres vivos y clasificación",
                    "Reconoce extensión territorial de México y colindancias",
                    "Distingue espacios rurales y urbanos en México",
                    "Explica distribución de recursos naturales de México"
                ],
                observation: true
            },
            {
                id: 'english_reception',
                title: 'Inglés - Habilidades de Recepción',
                headers: ['A', 'IP', 'NH'],
                items: [
                    "Escucha y entiende instrucciones de más de una oración",
                    "Escucha y entiende conversaciones simples",
                    "Responde la actividad de acuerdo a lo que escucha",
                    "Entiende textos cortos a pesar de no conocer todas las palabras",
                    "Entiende las instrucciones que lee",
                    "Responde preguntas sobre textos cortos"
                ],
                observation: false
            },
            {
                id: 'english_production',
                title: 'Inglés - Habilidades de Producción',
                headers: ['A', 'IP', 'NH'],
                items: [
                    "Utiliza el idioma de forma escrita con pocos o ningún error",
                    "Escribe oraciones completas con 'linking words'",
                    "Responde a preguntas sobre información básica",
                    "Responde a preguntas sobre actividades que realizó"
                ],
                observation: true,
                extra_fields: [
                    { name: 'english_percent_reception', label: '% Habilidades de Recepción' },
                    { name: 'english_percent_production', label: '% Habilidades de Producción' }
                ]
            },
            {
                id: 'psycho',
                title: 'Indicadores Psico',
                headers: ['L', 'E', 'N'],
                items: [
                    "Escucha a los demás y tiene el gusto por ayudar a otros",
                    "Contribuye a solucionar problemas grupales",
                    "Identifica herramientas de colaboración",
                    "Reconoce importancia de tareas en tiempo y forma",
                    "Comprende acciones y consecuencias",
                    "Identifica tipos de faltas y lineamientos",
                    "Reconoce y legitima emociones de otros",
                    "Reconoce su carácter, fortalezas, actitudes",
                    "Valora expresar emociones de forma auténtica",
                    "Mantiene consciencia corporal adecuada",
                    "Identifica fuentes de tensión y estrés",
                    "Contribuye a solucionar problemas grupales",
                    "Toma postura flexible y pacífica",
                    "Escucha con atención puntos de vista"
                ],
                observation: true,
                extra_fields: [
                    { name: 'nivel_desarrollo', label: 'Nivel de Desarrollo Figura Humana' },
                    { name: 'indicadores_emocionales', label: 'Indicadores Emocionales' },
                    { name: 'nivel_bender', label: 'Nivel perceptivo motor (BENDER)' }
                ]
            }
        ]
    },

    // -------------------------------------------------------------------------
    // 6° a Secundaria
    // -------------------------------------------------------------------------
    {
        id: 'eval_6_secu',
        title: 'Evaluación 6° a Secundaria',
        grade_field: true,
        sections: [
            {
                id: 'spanish',
                title: 'Lengua Materna (Español)',
                headers: ['L', 'LD', 'NL'],
                items: [
                    "Lee y contesta preguntas relacionadas a la lectura",
                    "Identifica características de distintos juegos de palabras",
                    "Identifica distintos medios informativos",
                    "Revisa puntuación con ayuda de otros (diálogos/narración)",
                    "Identifica adverbios y adjetivos",
                    "Reconoce características de familias léxicas",
                    "Reconoce características de la leyenda",
                    "Lee instrucciones y las lleva a cabo",
                    "Centra su atención en un tema o actividad"
                ],
                observation: false
            },
            {
                id: 'math',
                title: 'Pensamiento Matemático',
                headers: ['L', 'LD', 'NL'],
                items: [
                    "Resuelve problemas de suma y resta con decimales/fracciones",
                    "Resuelve problemas de multiplicación con fracciones/decimales",
                    "Identifica los distintos ángulos",
                    "Reconoce prismas rectos rectangulares (desarrollo plano)",
                    "Realiza conversiones de fracciones a decimales",
                    "Resuelve retos calculando porcentajes",
                    "Identifica vértices, caras, aristas en prismas",
                    "Identifica líneas paralelas y perpendiculares"
                ],
                observation: false
            },
            {
                id: 'science',
                title: 'Exploración Mundo Natural y Social',
                headers: ['L', 'LD', 'NL'],
                items: [
                    "Identifica características de proteínas, vitaminas, carbohidratos, lípidos",
                    "Describe características de un ecosistema y transformaciones",
                    "Conoce el ciclo del agua",
                    "Distingue distribución/características continentes",
                    "Conoce conceptos de geografía (latitud, placas, etc.)"
                ],
                observation: true
            },
            {
                id: 'english_reception',
                title: 'Inglés - Habilidades de Recepción',
                headers: ['A', 'IP', 'NH'],
                items: [
                    "Grammar and Vocabulary: Understands main points of clear standard input",
                    "Grammar and Vocabulary: Connects phrases to describe experiences"
                ],
                observation: false
            },
            {
                id: 'english_production',
                title: 'Inglés - Habilidades de Producción',
                headers: ['A', 'IP', 'NH'],
                items: [
                    "Writing: Employs main ideas addressing topic clearly",
                    "Writing: Grammar errors are minor",
                    "Writing: Uses vocabulary in effective way",
                    "Writing: Employs spelling/punctuation accurately",
                    "Speaking: Uses appropriate vocabulary on familiar topics",
                    "Speaking: Produces extended language despite hesitation",
                    "Speaking: Used intonation generally appropriate",
                    "Speaking: Maintains and develops interaction"
                ],
                observation: true,
                extra_fields: [
                    { name: 'cambridge_score', label: 'Cambridge Evaluation Score (out of 25)' }
                ]
            },
            {
                id: 'psycho',
                title: 'Aspectos Psico',
                headers: ['L', 'EP', 'NA'], // EP = En Proceso, NA = Necesita Ayuda
                items: [
                    "Se adapta al medio familiar y relaciones",
                    "Se identifica de manera positiva con la imagen real de sí mismo",
                    "El desarrollo emocional corresponde a la etapa",
                    "Manifiesta sentimientos/actitudes acordes a desarrollo",
                    "Se adapta a los cambios y afronta problemas"
                ],
                observation: false,
                extra_fields: [
                    { name: 'sacks_comments', label: 'Frases Incompletas Sacks (Indicadores/Comentarios)', type: 'textarea' },
                    { name: 'corman_comments', label: 'Familia de Corman (Planos)', type: 'textarea' },
                    { name: 'case_studies', label: 'Estudios de Caso (Comentarios)', type: 'textarea' },
                    { name: 'general_observations', label: 'Observaciones Generales', type: 'textarea' }
                ]
            }
        ]
    }
];
