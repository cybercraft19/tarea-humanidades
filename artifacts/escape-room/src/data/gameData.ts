export const BASE_TEXT = `
EL GUARDIÁN DEL RÍO

En la aldea de Aguaverde, ubicada a orillas de un río llamado Cristalino, vivía un anciano llamado Don Heliodoro. Era conocido por todos como "El Guardián del Río", porque desde joven se había dedicado a proteger sus aguas y a enseñar a los aldeanos el valor del agua limpia.

El río Cristalino era la fuente de vida de la comunidad: de él bebían las personas y los animales, en él lavaban su ropa, y sus aguas regaban los campos de maíz, frijol y calabaza que alimentaban a todos. Durante generaciones, el agua había sido tratada con respeto y cuidado.

Sin embargo, cuando Don Heliodoro cumplió ochenta años, comenzó a notar algo inquietante: el agua del río había comenzado a cambiar de color, pasando de un azul transparente a un tono verdoso. Además, varios peces habían aparecido muertos en la orilla, y algunas personas de la aldea reportaban malestares estomacales después de beber el agua sin hervirla.

Don Heliodoro investigó durante semanas. Subió la corriente del río con la ayuda de su nieta Valentina, una joven estudiante de dieciséis años, apasionada por las ciencias. Juntos descubrieron que una empresa maderera ubicada río arriba estaba vertiendo sus desechos químicos directamente en el agua, sin ningún tratamiento previo.

Al regresar a la aldea, Don Heliodoro convocó una reunión comunitaria. Con calma pero con firmeza, expuso los hechos y las evidencias recogidas. Les dijo a sus vecinos: "El agua no es solo un recurso; es un derecho y una responsabilidad compartida. Si la perdemos, lo perdemos todo."

La comunidad decidió actuar. Con el apoyo de Valentina, redactaron una denuncia formal ante las autoridades ambientales, recolectaron firmas y organizaron marchas pacíficas. Después de varios meses de lucha, la empresa fue obligada a instalar un sistema de tratamiento de aguas residuales, y el río comenzó lentamente a recuperarse.

Don Heliodoro no vivió para ver el río completamente saneado, pues falleció tranquilamente un año después. Pero su ejemplo inspiró a Valentina y a muchos jóvenes a convertirse en defensores del medio ambiente. En la plaza de Aguaverde se colocó una placa que decía: "El que cuida el agua, cuida la vida."
`;

export const ROOMS = [
  {
    id: 1,
    name: "La Sala de los Hechos",
    subtitle: "Nivel Literal",
    icon: "🔍",
    color: "from-amber-900 to-amber-700",
    borderColor: "border-amber-500",
    accentColor: "text-amber-400",
    bgCard: "bg-amber-950/50",
    narrative: "Has entrado a la Sala de los Hechos. Las paredes están cubiertas de pergaminos con datos e información concreta. Una cerradura dorada bloquea la puerta hacia la siguiente sala. Para abrirla, debes demostrar que comprendiste lo que está escrito en el texto.",
    challenge: {
      name: "El Cofre de los Datos",
      level: "Comprensión Literal",
      levelCode: "LITERAL",
      objective: "Identificar información explícita presente en el texto.",
      instruction: "Lee el texto base con atención. El cofre contiene la clave para avanzar, pero solo se abre si respondes correctamente: ¿Cuál era el nombre de la nieta de Don Heliodoro y cuántos años tenía?",
      question: "¿Cuál es el nombre de la nieta de Don Heliodoro y cuántos años tenía ella?",
      type: "multiple",
      options: [
        "Se llamaba Valentina y tenía catorce años.",
        "Se llamaba Valentina y tenía dieciséis años.",
        "Se llamaba Verónica y tenía dieciséis años.",
        "Se llamaba Valentina y tenía dieciocho años."
      ],
      correctIndex: 1,
      keyUnlocked: "AGUA-VIVA",
      feedbackCorrect: "¡Excelente! El texto dice claramente: 'su nieta Valentina, una joven estudiante de dieciséis años'. Has demostrado que puedes recuperar información explícita del texto. La clave AGUA-VIVA se ha grabado en tu pergamino.",
      feedbackWrong: "No es correcto. Regresa al texto y busca la frase donde Don Heliodoro sube la corriente del río 'con la ayuda de su nieta'. El texto menciona su nombre y su edad de forma directa. Lee con cuidado cada detalle.",
      pedagogicalNote: "Este reto evalúa la comprensión literal al exigir la recuperación de información explícita y puntual que aparece textualmente en el texto, sin necesidad de interpretación."
    }
  },
  {
    id: 2,
    name: "El Laberinto de las Sombras",
    subtitle: "Nivel Inferencial",
    icon: "🧩",
    color: "from-indigo-900 to-indigo-700",
    borderColor: "border-indigo-500",
    accentColor: "text-indigo-400",
    bgCard: "bg-indigo-950/50",
    narrative: "Cruzaste la primera puerta. Ahora estás en el Laberinto de las Sombras. Aquí las respuestas no están escritas directamente: debes conectar ideas, deducir y razonar con lo que el texto te da. Solo quien piensa más allá de las palabras puede avanzar.",
    challenge: {
      name: "El Espejo Oscuro",
      level: "Comprensión Inferencial",
      levelCode: "INFERENCIAL",
      objective: "Deducir información implícita a partir de los datos del texto.",
      instruction: "El espejo solo refleja la verdad de quien razona. Observa las pistas del texto y responde: ¿Por qué es importante que Valentina sea 'estudiante de ciencias' para la historia?",
      question: "¿Por qué el texto destaca que Valentina era una 'joven estudiante apasionada por las ciencias'? ¿Qué rol cumple ese dato en la historia?",
      type: "multiple",
      options: [
        "Porque las ciencias son la materia más importante en la escuela.",
        "Porque su formación científica le permitió entender y documentar mejor el problema ambiental, dando credibilidad a la denuncia.",
        "Porque quería ser profesora cuando creciera.",
        "Porque el texto quiere mostrar que las niñas también pueden estudiar ciencias."
      ],
      correctIndex: 1,
      keyUnlocked: "RIO-CLARO",
      feedbackCorrect: "¡Brillante deducción! Aunque el texto no lo dice directamente, se infiere que el conocimiento científico de Valentina fue crucial: ayudó a identificar, documentar y presentar las evidencias de la contaminación. Eso le dio peso a la denuncia. La clave RIO-CLARO está en tus manos.",
      feedbackWrong: "Piensa más profundamente. El texto menciona que Valentina 'apoyó' en redactar la denuncia y recoger evidencias. ¿Qué tipo de habilidades necesitarías para hacer eso bien? El texto no lo dice de forma directa, pero lo sugiere. Conecta los datos.",
      pedagogicalNote: "Este reto evalúa la comprensión inferencial: el lector debe conectar la descripción de Valentina con su rol activo en la solución, deduciendo una relación de causa-efecto que el texto no explicita."
    }
  },
  {
    id: 3,
    name: "El Tribunal de las Ideas",
    subtitle: "Nivel Crítico",
    icon: "⚖️",
    color: "from-rose-900 to-rose-700",
    borderColor: "border-rose-500",
    accentColor: "text-rose-400",
    bgCard: "bg-rose-950/50",
    narrative: "Llegaste al Tribunal de las Ideas. Aquí no basta con entender el texto: debes evaluarlo, juzgarlo y defender tu postura con argumentos. Los jueces del tribunal esperan tu opinión razonada. Solo la reflexión honesta y fundamentada abre esta puerta.",
    challenge: {
      name: "La Balanza del Juicio",
      level: "Comprensión Crítica",
      levelCode: "CRITICO",
      objective: "Evaluar el mensaje del texto y formular una postura fundamentada.",
      instruction: "Ante la Balanza del Juicio debes escribir tu respuesta. El texto termina con la frase: 'El que cuida el agua, cuida la vida.' Escribe un argumento breve (mínimo 3 oraciones) donde expliques si estás de acuerdo o no con esta afirmación, usando al menos UN ejemplo del texto para sostener tu postura.",
      question: "¿Estás de acuerdo con la frase 'El que cuida el agua, cuida la vida'? Argumenta tu postura usando evidencia del texto.",
      type: "essay",
      minWords: 30,
      correctKeywords: ["agua", "vida", "aldea", "río", "contaminación", "salud", "peces", "enfermedad", "alimento", "campo", "comunidad"],
      keyUnlocked: "VERDE-VIVO",
      feedbackCorrect: "Tu argumentación demuestra pensamiento crítico. Has relacionado la frase con evidencias concretas del texto (los malestares de salud, los peces muertos, los campos de cultivo) y expresaste una postura propia. La clave VERDE-VIVO es tuya.",
      feedbackWrong: "Tu respuesta necesita más desarrollo. Recuerda que debes: 1) Expresar si estás de acuerdo o no, 2) Argumentar por qué, y 3) Usar al menos un ejemplo del texto (como los malestares estomacales, los campos de cultivo, los peces muertos). Intenta de nuevo.",
      pedagogicalNote: "Este reto desarrolla la comprensión crítica: el lector debe evaluar el mensaje central del texto, formular una postura personal y sustentarla con evidencia textual, ejerciendo juicio valorativo."
    }
  },
  {
    id: 4,
    name: "La Sala de la Creación",
    subtitle: "Nivel Aplicado",
    icon: "✨",
    color: "from-emerald-900 to-emerald-700",
    borderColor: "border-emerald-500",
    accentColor: "text-emerald-400",
    bgCard: "bg-emerald-950/50",
    narrative: "Última sala: La Sala de la Creación. Aquí el conocimiento se convierte en acción. No basta con entender la historia de Aguaverde: debes llevar su mensaje a tu propia realidad. Esta es la prueba final que demuestra que verdaderamente comprendiste.",
    challenge: {
      name: "El Portal del Conocimiento",
      level: "Comprensión Aplicada",
      levelCode: "APLICADO",
      objective: "Transferir el aprendizaje del texto a un contexto real y nuevo.",
      instruction: "Imagina que en tu propia comunidad existe un problema ambiental similar. Usando como modelo lo que hizo la comunidad de Aguaverde, describe en al menos 4 pasos concretos qué acciones tomarías para resolverlo. Debes mencionar al menos 2 acciones que aparecen en el texto.",
      question: "¿Qué pasos concretos tomarías para resolver un problema ambiental en tu comunidad, inspirándote en lo que hizo la gente de Aguaverde?",
      type: "essay",
      minWords: 50,
      correctKeywords: ["denuncia", "investigar", "comunidad", "autoridades", "marcha", "firmas", "organizar", "evidencia", "reunión", "ambiental", "problema", "acción", "pasos"],
      keyUnlocked: "GUARDIAN-LIBRE",
      feedbackCorrect: "¡Extraordinario! Has demostrado la comprensión más profunda: aplicar lo aprendido a una situación nueva. Tu respuesta muestra que el texto no quedó solo en palabras, sino que se convirtió en herramientas de acción. La clave final GUARDIAN-LIBRE es tuya. ¡Has completado el escape room!",
      feedbackWrong: "Tu respuesta necesita conectarse más con el texto. Recuerda que la comunidad de Aguaverde: investigó el problema, reunió evidencias, convocó una reunión comunitaria, presentó una denuncia formal y organizó marchas. ¿Cómo aplicarías esas ideas en tu contexto? Detalla al menos 4 pasos.",
      pedagogicalNote: "Este reto evalúa la comprensión aplicada: el máximo nivel cognitivo, donde el lector transfiere estrategias del texto a situaciones nuevas, demostrando comprensión funcional y transformadora."
    }
  }
];

export const GAME_INTRO = {
  title: "LA BIBLIOTECA DEL TIEMPO",
  subtitle: "Escape Room de Comprensión Lectora",
  description: "En la antigua Biblioteca del Tiempo, cuatro salas guardan secretos que solo puede descubrir quien lea con verdadera comprensión. Cada sala exige un nivel diferente de lectura: recordar, inferir, juzgar y aplicar. Las claves obtenidas en cada sala desbloquean la siguiente. Solo quien complete las cuatro pruebas liberará el conocimiento atrapado y se convertirá en Guardián del Tiempo.",
  objectives: [
    "Comprender información explícita del texto (Nivel Literal)",
    "Deducir información no dicha directamente (Nivel Inferencial)",
    "Evaluar y argumentar sobre el mensaje del texto (Nivel Crítico)",
    "Aplicar el aprendizaje a situaciones nuevas (Nivel Aplicado)"
  ]
};
