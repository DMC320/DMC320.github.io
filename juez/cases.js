const casos = [

    {
        id: 1,
        expediente: "EXP-001/2026",
        tribunal: "JUZGADO No. 7",
        nivel: "PRIMERA INSTANCIA",
        dificultad: "NOVATO",
        titulo: "Incumplimiento de contrato",
        materia: "DERECHO CIVIL",
        areaJuridica: "CIVIL",
        demandante: "María Elena Torres",
        demandado: "Servicios Delta S.A. de C.V.",
        fecha: "08/08/2026",

        descripcion:
            "La parte demandante sostiene que celebró un contrato de prestación de servicios con la empresa demandada. Afirma que realizó el pago acordado, pero el servicio contratado no fue entregado en los términos establecidos.",

        pruebas: [
            "Contrato firmado por ambas partes.",
            "Comprobante de pago.",
            "Correos electrónicos entre las partes.",
            "Testimonio de una persona relacionada con la contratación."
        ],

        opciones: [
            "Declarar procedente la acción porque existe contrato y comprobante de pago.",
            "Desechar la demanda porque los correos electrónicos carecen de valor.",
            "Declarar improcedente la acción sin analizar las pruebas."
        ],

        respuestaCorrecta: 1
    },


    {
        id: 2,
        expediente: "EXP-002/2026",
        tribunal: "JUZGADO No. 7",
        nivel: "PRIMERA INSTANCIA",
        dificultad: "INTERMEDIO",
        titulo: "Despido controvertido",
        materia: "DERECHO LABORAL",
        areaJuridica: "LABORAL",
        demandante: "Carlos Ramírez López",
        demandado: "Grupo Industrial del Centro S.A. de C.V.",
        fecha: "08/08/2026",

        descripcion:
            "El trabajador afirma haber sido despedido sin que se le informara una causa justificada. La empresa sostiene que la terminación de la relación laboral obedeció a un incumplimiento atribuible al trabajador.",

        pruebas: [
            "Contrato individual de trabajo.",
            "Recibos de nómina.",
            "Registro de asistencia.",
            "Comunicaciones internas de la empresa.",
            "Declaraciones de compañeros de trabajo."
        ],

        opciones: [
            "Dar por acreditado el despido sin analizar las demás pruebas.",
            "Analizar integralmente las pruebas para determinar si existió causa justificada.",
            "Considerar únicamente la versión de la empresa."
        ],

        respuestaCorrecta: 2
    },


    {
        id: 3,
        expediente: "EXP-003/2026",
        tribunal: "JUZGADO No. 7",
        nivel: "PRIMERA INSTANCIA",
        dificultad: "AVANZADO",
        titulo: "La evidencia cuestionada",
        materia: "DERECHO PENAL",
        areaJuridica: "PENAL",
        demandante: "Ministerio Público",
        demandado: "Jorge Alberto Méndez",
        fecha: "08/08/2026",

        descripcion:
            "El Ministerio Público presenta una evidencia obtenida durante una investigación penal. La defensa cuestiona la legalidad de la obtención de dicha evidencia y solicita que sea excluida del proceso.",

        pruebas: [
            "Informe de investigación.",
            "Registro de la diligencia.",
            "Cadena de custodia.",
            "Declaración del agente investigador.",
            "Argumentos de la defensa."
        ],

        opciones: [
            "Admitir automáticamente la evidencia porque fue presentada por el Ministerio Público.",
            "Analizar la legalidad de la obtención y los requisitos de incorporación de la evidencia.",
            "Excluir toda la evidencia presentada durante la investigación."
        ],

        respuestaCorrecta: 2
    },


    {
        id: 4,
        expediente: "EXP-004/2026",
        tribunal: "JUZGADO No. 7",
        nivel: "CONTROL CONSTITUCIONAL",
        dificultad: "EXPERTO",
        titulo: "Libertad de expresión",
        materia: "DERECHO CONSTITUCIONAL",
        areaJuridica: "CONSTITUCIONAL",
        demandante: "Ana Lucía Herrera",
        demandado: "Autoridad Administrativa Municipal",
        fecha: "08/08/2026",

        descripcion:
            "Una ciudadana sostiene que una autoridad municipal restringió una expresión pública realizada en un espacio abierto. La autoridad argumenta que la medida fue necesaria para preservar el orden público.",

        pruebas: [
            "Acta administrativa.",
            "Grabación del acontecimiento.",
            "Testimonios de personas presentes.",
            "Reglamento municipal aplicable.",
            "Escrito de la autoridad."
        ],

        opciones: [
            "Validar automáticamente la restricción por tratarse de una decisión administrativa.",
            "Analizar si la restricción persigue una finalidad legítima y si resulta necesaria y proporcional.",
            "Considerar que toda expresión pública está prohibida."
        ],

        respuestaCorrecta: 2
    },


    {
        id: 5,
        expediente: "EXP-005/2026",
        tribunal: "JUZGADO No. 7",
        nivel: "SEGUNDA REVISIÓN",
        dificultad: "EXPERTO",
        titulo: "La decisión administrativa",
        materia: "DERECHO ADMINISTRATIVO",
        areaJuridica: "ADMINISTRATIVO",
        demandante: "Constructora Horizonte S.A. de C.V.",
        demandado: "Dirección Municipal de Desarrollo Urbano",
        fecha: "08/08/2026",

        descripcion:
            "Una empresa impugna una resolución administrativa mediante la cual se negó una autorización para realizar un proyecto. La autoridad sostiene que actuó conforme a sus facultades legales.",

        pruebas: [
            "Resolución administrativa.",
            "Solicitud presentada por la empresa.",
            "Documentación técnica del proyecto.",
            "Normativa aplicable.",
            "Informe de la autoridad responsable."
        ],

        opciones: [
            "Confirmar la resolución únicamente porque proviene de una autoridad.",
            "Analizar la competencia de la autoridad, la fundamentación y motivación de la resolución.",
            "Anular automáticamente toda resolución administrativa."
        ],

        respuestaCorrecta: 2
    }

];
