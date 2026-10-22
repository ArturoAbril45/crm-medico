<?php

namespace Database\Seeders;

use App\Models\PublicacionAcademy;
use Illuminate\Database\Seeder;

class PublicacionesAcademySeeder extends Seeder
{
    public function run(): void
    {
        $articulos = [
            [
                'titulo' => 'Qué hace el módulo de Oncología y cómo se recorre un tratamiento',
                'resumen' => 'De la sospecha al ciclo: por qué el software gira alrededor del ciclo y no de la consulta.',
                'modulo' => 'Oncología',
                'minutos_lectura' => 6,
                'contenido' => <<<MD
## En una frase

Una unidad de quimioterapia ambulatoria se parece más a un taller con turnos que a una guardia: el paciente llega, se sienta en un sillón, recibe una infusión y vuelve en tres semanas. Ese ritmo —tratamiento, pausa, tratamiento— es la estructura de todo. El sistema no gira alrededor de "la consulta": gira alrededor del ciclo.

## El recorrido (siempre la misma forma)

1. **Sospecha** — un bulto, un análisis raro, una imagen.
2. **Diagnóstico** — la pieza de tejido al microscopio. Sin eso no hay cáncer en el sistema.
3. **Estadificación** — cuán extendido está (TNM, ECOG, biomarcadores). Define si el objetivo es curar o acompañar.
4. **Plan** — protocolo: qué drogas, en qué dosis, cada cuántos días, cuántas veces.
5. **Ciclos** — se ejecuta el plan midiendo antes de cada vuelta si el cuerpo aguanta.
6. **Evaluación** — imágenes cada 2-3 ciclos: ¿achicó, igual, creció?

Casi todas las pantallas del módulo mapean uno de esos seis momentos.

## Por qué existen los ciclos

La quimioterapia ataca células que se dividen rápido. También la médula ósea. El tejido sano se recupera y el tumor no lo hace tan bien: se golpea, se espera (~21 días), se vuelve a golpear.

Antes de cada ciclo hay labs. Si los blancos no recuperaron, dar la dosis a fecha puede matar. El motor de reglas compara labs contra el protocolo y decide: autorizar, reducir o postergar.

## Objetivos con nombre propio

- **Neoadyuvante** — quimio antes de la cirugía.
- **Adyuvante** — después de la cirugía.
- **Paliativo** — controlar enfermedad y síntomas cuando la curación no está en la mesa.

En pediatría (leucemias) hay fases con nombre propio durante años: inducción, consolidación, mantenimiento. El modelo multifase del sistema existe por eso.

## Qué vas a hacer en la práctica

- Abrir o crear la ficha oncológica del paciente.
- Elegir un régimen del catálogo (o uno de la clínica).
- Activar el plan (en menores: tutor + consentimiento).
- Antes de cada ciclo: vitals + labs → evaluate / clear.
- Firmar la orden (médico) → verificar (farmacéutico distinto) → preparar → administrar con doble chequeo.

Si algo de ese circuito te parece burocracia, leé el artículo sobre por qué el sistema frena ciertos pasos.
MD,
            ],
            [
                'titulo' => 'Carboplatino y función renal: adultos y chicos',
                'resumen' => 'Calvert, Cockcroft-Gault vs Schwartz, desnormalización, y el caso de +35 % de sobredosis.',
                'modulo' => 'Oncología',
                'minutos_lectura' => 7,
                'contenido' => <<<MD
## Por qué el carboplatino se dosifica distinto

A diferencia de la mayoría de las drogas oncológicas, el carboplatino no se dosifica por superficie corporal sino por **AUC** (área bajo la curva) mediante la fórmula de Calvert, que depende directamente del clearance de creatinina estimado.

## Adultos vs pediatría

- **Adultos**: Cockcroft-Gault estima el clearance a partir de creatinina, edad, peso y sexo.
- **Pediatría**: Schwartz usa talla y una constante según edad — Cockcroft-Gault subestima sistemáticamente en chicos.

Usar la fórmula equivocada en el grupo equivocado es la causa documentada de sobredosis de carboplatino en más de un tercio de los casos reportados en la literatura. El sistema bloquea el cálculo si detecta edad pediátrica con fórmula de adulto seleccionada.

## Desnormalización deliberada

El resultado del cálculo (dosis final en mg) se guarda de forma desnormalizada junto al régimen, en vez de recalcularse cada vez que se lee. Esto es intencional: la dosis administrada a un paciente no debe cambiar retroactivamente si la fórmula del sistema se actualiza después.
MD,
            ],
            [
                'titulo' => 'Dosis acumulada de por vida',
                'resumen' => 'Doxorrubicina y el corazón: por qué el sistema recuerda todo lo que el paciente recibió alguna vez.',
                'modulo' => 'Oncología',
                'minutos_lectura' => 4,
                'contenido' => <<<MD
## El límite que no se resetea

Las antraciclinas (doxorrubicina, epirrubicina, daunorrubicina) son cardiotóxicas de forma acumulativa e irreversible. A diferencia de otros efectos adversos, el daño no depende de la dosis del ciclo actual sino de **todo lo que el paciente recibió alguna vez**, incluso en otra institución o años atrás.

## Por qué esto es distinto en el sistema

El sistema mantiene un contador de dosis acumulada de por vida por paciente y por familia de droga, no por episodio de tratamiento. Al cargar un nuevo ciclo de antraciclina, el motor de reglas suma la dosis propuesta al histórico y compara contra el techo (típicamente 450-550 mg/m² equivalentes de doxorrubicina).

Si el paciente se acerca al límite, el sistema exige una evaluación cardiológica reciente (ecocardiograma o MUGA) antes de habilitar la firma de la orden.

## Consecuencia práctica

Al migrar un paciente de otra clínica, es indispensable cargar su historial oncológico previo — de lo contrario el contador arranca en cero y el sistema no puede protegerlo de una sobredosis acumulada real.
MD,
            ],
            [
                'titulo' => 'Superficie corporal: por qué no se dosifica por peso',
                'resumen' => 'Mosteller, DuBois y Haycock. Un ejemplo numérico y el simulador onco.bsa.',
                'modulo' => 'Oncología',
                'minutos_lectura' => 4,
                'contenido' => <<<MD
## Por qué BSA y no kilogramos

La mayoría de las drogas citotóxicas se dosifican en mg/m² de superficie corporal (BSA), no en mg/kg. La razón histórica es que el BSA correlaciona mejor con el volumen de distribución, el gasto cardíaco y el clearance metabólico que el peso solo — dos pacientes del mismo peso pero distinta altura pueden tener BSA muy diferente.

## Fórmulas disponibles

- **Mosteller** — la más usada por su simplicidad: raíz cuadrada de (altura × peso / 3600).
- **DuBois** — la fórmula clásica, algo más compleja.
- **Haycock** — preferida en pediatría, especialmente en neonatos.

El sistema permite elegir la fórmula por protocolo, porque algunos ensayos clínicos especifican explícitamente cuál usar.

## El simulador onco.bsa

La herramienta interna `onco.bsa` recalcula la dosis final en vivo a medida que se cargan peso y altura, mostrando lado a lado el resultado de las tres fórmulas para que el médico vea la variación antes de firmar.
MD,
            ],
            [
                'titulo' => 'Por qué el sistema te frena: bloqueos y qué significa cada uno',
                'resumen' => 'Margen terapéutico estrecho, separación de personas, y el bloqueo absoluto de vía IT.',
                'modulo' => 'Oncología',
                'minutos_lectura' => 5,
                'contenido' => <<<MD
## Tres niveles de bloqueo

El motor de reglas de quimioterapia no trata todos los frenos igual:

1. **Advertencia (soft)** — se puede continuar dejando constancia del motivo. Ej: dosis levemente fuera de rango por redondeo.
2. **Bloqueo con override** — requiere una segunda firma de un profesional distinto al que originó la orden. Ej: labs límite antes de un ciclo.
3. **Bloqueo absoluto** — no tiene override posible desde la interfaz clínica. Ej: administración de vincristina por vía intratecal (IT), que es sistemáticamente fatal y está prohibida sin excepción en el diseño del sistema.

## Por qué existe la separación de personas

Para cualquier bloqueo de nivel 2, quien verifica no puede ser la misma persona que prescribió, y quien prepara no puede ser la misma que administra. Esto replica el circuito de doble chequeo estándar en farmacia oncológica y el sistema lo fuerza a nivel de base de datos, no solo de interfaz.

## Qué hacer si un bloqueo parece un error

Todo bloqueo queda registrado con el motivo exacto de la regla que lo disparó. Si el equipo clínico considera que el bloqueo es incorrecto para ese caso, el camino es reportarlo a soporte con el ID del evento — nunca sortear el flujo por fuera del sistema.
MD,
            ],
        ];

        foreach ($articulos as $a) {
            PublicacionAcademy::updateOrCreate(
                ['slug' => \Illuminate\Support\Str::slug($a['modulo'] . '-' . $a['titulo'])],
                [
                    'titulo' => $a['titulo'],
                    'resumen' => $a['resumen'],
                    'contenido' => $a['contenido'],
                    'tipo' => 'oficial',
                    'modulo' => $a['modulo'],
                    'minutos_lectura' => $a['minutos_lectura'],
                    'autor_nombre' => 'Plataforma Med-Advance',
                    'estado' => 'publicado',
                ]
            );
        }
    }
}
