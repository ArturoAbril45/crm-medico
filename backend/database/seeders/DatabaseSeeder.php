<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\{Paciente, Procedimiento, Cita, Conversacion, Flujo, Bloque, Automatizacion, Pago};
use Carbon\Carbon;

class DatabaseSeeder extends Seeder {
    public function run(): void {
        // Procedimientos de la clínica estética
        $procs = [
            ['nombre' => 'Blefaroplastia', 'categoria' => 'Cirugía Facial', 'descripcion' => 'Eliminación de bolsas en los párpados', 'precio_consulta' => 250, 'precio_procedimiento' => 2800, 'duracion_min' => 120],
            ['nombre' => 'Rinoplastia Ultrasónica', 'categoria' => 'Cirugía Facial', 'descripcion' => 'Corrección nasal con tecnología ultrasónica', 'precio_consulta' => 250, 'precio_procedimiento' => 4500, 'duracion_min' => 180],
            ['nombre' => 'Liposucción', 'categoria' => 'Cirugía Corporal', 'descripcion' => 'Eliminación de grasa localizada', 'precio_consulta' => 250, 'precio_procedimiento' => 3500, 'duracion_min' => 150],
            ['nombre' => 'Aumento de Busto', 'categoria' => 'Cirugía Corporal', 'descripcion' => 'Implantes mamarios', 'precio_consulta' => 250, 'precio_procedimiento' => 5000, 'duracion_min' => 180],
            ['nombre' => 'Reducción de Párpados', 'categoria' => 'Cirugía Facial', 'descripcion' => 'Reducción y rejuvenecimiento de párpados', 'precio_consulta' => 250, 'precio_procedimiento' => 2500, 'duracion_min' => 90],
            ['nombre' => 'Consulta General', 'categoria' => 'Consulta', 'descripcion' => 'Evaluación inicial', 'precio_consulta' => 250, 'precio_procedimiento' => 0, 'duracion_min' => 30],
        ];
        foreach ($procs as $p) Procedimiento::create($p);

        // Pacientes de demostración (datos ficticios)
        $pacientes = [
            ['nombre' => 'Paciente', 'apellido' => 'Demo 1', 'telefono' => '+59160000001', 'whatsapp' => '+59160000001', 'ciudad' => 'Tarija', 'estado' => 'activo', 'fuente' => 'whatsapp', 'total_gastado' => 250],
            ['nombre' => 'Paciente', 'apellido' => 'Demo 2', 'telefono' => '+59160000002', 'whatsapp' => '+59160000002', 'ciudad' => 'Tarija', 'estado' => 'potencial', 'fuente' => 'whatsapp', 'total_gastado' => 0],
            ['nombre' => 'Paciente', 'apellido' => 'Demo 3', 'telefono' => '+59160000003', 'whatsapp' => '+59160000003', 'ciudad' => 'Tarija', 'estado' => 'activo', 'fuente' => 'whatsapp', 'total_gastado' => 500],
            ['nombre' => 'Paciente', 'apellido' => 'Demo 4', 'telefono' => '+59160000004', 'whatsapp' => '+59160000004', 'ciudad' => 'Tarija', 'estado' => 'potencial', 'fuente' => 'whatsapp', 'total_gastado' => 0],
            ['nombre' => 'Paciente', 'apellido' => 'Demo 5', 'telefono' => '+59160000005', 'whatsapp' => '+59160000005', 'ciudad' => 'Tarija', 'estado' => 'activo', 'fuente' => 'whatsapp', 'total_gastado' => 2800],
            ['nombre' => 'Paciente', 'apellido' => 'Demo 6', 'telefono' => '+59160000006', 'whatsapp' => '+59160000006', 'ciudad' => 'Tarija', 'estado' => 'potencial', 'fuente' => 'whatsapp', 'total_gastado' => 0],
            ['nombre' => 'Paciente', 'apellido' => 'Demo 7', 'telefono' => '+59160000007', 'whatsapp' => '+59160000007', 'ciudad' => 'Tarija', 'estado' => 'activo', 'fuente' => 'whatsapp', 'total_gastado' => 250],
            ['nombre' => 'Paciente', 'apellido' => 'Demo 8', 'telefono' => '+59160000008', 'whatsapp' => '+59160000008', 'ciudad' => 'Tarija', 'estado' => 'activo', 'fuente' => 'referido', 'total_gastado' => 4500],
            ['nombre' => 'Paciente', 'apellido' => 'Demo 9', 'telefono' => '+59160000009', 'whatsapp' => '+59160000009', 'ciudad' => 'Tarija', 'estado' => 'inactivo', 'fuente' => 'whatsapp', 'total_gastado' => 0],
            ['nombre' => 'Paciente', 'apellido' => 'Demo 10', 'telefono' => '+59160000010', 'whatsapp' => '+59160000010', 'ciudad' => 'Tarija', 'estado' => 'potencial', 'fuente' => 'whatsapp', 'total_gastado' => 0],
        ];

        foreach ($pacientes as $p) Paciente::create($p);

        // Flujos del sistema
        $flujo1 = Flujo::create(['nombre' => 'BIENVENIDA A LA CLINICA SAO PAULO', 'descripcion' => 'Flujo de bienvenida con campaña Blefaroplastia', 'activo' => true, 'total_ejecuciones' => 305, 'total_conversiones' => 116]);
        Bloque::create(['flujo_id' => $flujo1->id, 'tipo' => 'inicio', 'pos_x' => 20, 'pos_y' => 300, 'config' => ['titulo' => 'Inicio']]);
        Bloque::create(['flujo_id' => $flujo1->id, 'tipo' => 'contenido', 'pos_x' => 300, 'pos_y' => 130, 'config' => ['mensajes' => ["¡Hola! 👋 Bienvenida a Clínica São Paulo 💖", "Gracias por escribirnos. Con un 10% de descuento en Blefaroplastia.\n🔶Costo consulta: Bs.250\n📍Barrio el Molino, Tarija"]]]);
        Bloque::create(['flujo_id' => $flujo1->id, 'tipo' => 'menu', 'pos_x' => 600, 'pos_y' => 150, 'config' => ['pregunta' => 'Para brindarte información personalizada, cuéntame qué tratamiento te interesa 👇', 'boton' => 'Ver Opciones', 'opciones' => ['Reduccion de Parpados 10% descuento', 'Otro procedimiento', 'Consulta al Doctor']]]);

        $flujo2 = Flujo::create(['nombre' => 'MES DE JUNIO RINOPLASTIA', 'descripcion' => 'Campaña Rinoplastia Ultrasónica 20% descuento', 'activo' => true, 'total_ejecuciones' => 293, 'total_conversiones' => 120]);
        Bloque::create(['flujo_id' => $flujo2->id, 'tipo' => 'inicio', 'pos_x' => 20, 'pos_y' => 350, 'config' => ['titulo' => 'Inicio']]);
        Bloque::create(['flujo_id' => $flujo2->id, 'tipo' => 'contenido', 'pos_x' => 290, 'pos_y' => 100, 'config' => ['mensajes' => ["¡Hola! 👋 Bienvenida a Clínica São Paulo 💖", "Solo por Junio: Rinoplastia Ultrasónica con 20% de descuento.\n✅ Mayor precisión\n✅ Menos inflamación\n🔸 Consulta: Bs.250"]]]);
        Bloque::create(['flujo_id' => $flujo2->id, 'tipo' => 'menu', 'pos_x' => 610, 'pos_y' => 170, 'config' => ['pregunta' => 'Selecciona la opción que te interesa', 'boton' => 'Ver Opciones', 'opciones' => ['VER PDF ANTES Y DESPUES', 'QUIERO AGENDAR MI CONSULTA', 'TENGO UNA DUDA']]]);

        // Automatizaciones
        Automatizacion::create(['nombre' => 'MES DE JUNIO RINOPLASTIA', 'flujo_id' => $flujo2->id, 'tipo' => 'palabra_clave', 'palabra_clave' => 'Promo Rino Junio! info porfa', 'condicion' => 'es_igual', 'ejecuciones' => 298, 'activo' => true]);

        // Citas para hoy y esta semana
        $hoy = Carbon::today();
        $paciente1 = Paciente::first();
        $proc1 = Procedimiento::first();

        Cita::create(['paciente_id' => 1, 'procedimiento_id' => 1, 'doctor' => 'Dr. Ramón Rojas', 'fecha_hora' => $hoy->copy()->setTime(9, 0), 'duracion_min' => 30, 'estado' => 'confirmada', 'monto' => 250]);
        Cita::create(['paciente_id' => 2, 'procedimiento_id' => 2, 'doctor' => 'Dr. Ramón Rojas', 'fecha_hora' => $hoy->copy()->setTime(10, 30), 'duracion_min' => 30, 'estado' => 'pendiente', 'monto' => 250]);
        Cita::create(['paciente_id' => 3, 'procedimiento_id' => 5, 'doctor' => 'Dr. Ramón Rojas', 'fecha_hora' => $hoy->copy()->setTime(14, 0), 'duracion_min' => 180, 'estado' => 'confirmada', 'monto' => 2500]);
        Cita::create(['paciente_id' => 5, 'procedimiento_id' => 1, 'doctor' => 'Dr. Ramón Rojas', 'fecha_hora' => Carbon::tomorrow()->setTime(9, 0), 'duracion_min' => 120, 'estado' => 'pendiente', 'monto' => 2800]);
        Cita::create(['paciente_id' => 8, 'procedimiento_id' => 2, 'doctor' => 'Dr. Ramón Rojas', 'fecha_hora' => Carbon::now()->subDays(3)->setTime(10, 0), 'duracion_min' => 180, 'estado' => 'realizada', 'monto' => 4500]);

        // Pagos
        Pago::create(['paciente_id' => 5, 'cita_id' => null, 'monto' => 2800, 'metodo_pago' => 'efectivo', 'estado' => 'completado', 'fecha' => Carbon::now()->subMonths(2)->toDateString(), 'notas' => 'Blefaroplastia completa']);
        Pago::create(['paciente_id' => 8, 'cita_id' => 5, 'monto' => 4500, 'metodo_pago' => 'transferencia', 'estado' => 'completado', 'fecha' => Carbon::now()->subDays(3)->toDateString(), 'notas' => 'Rinoplastia']);
        Pago::create(['paciente_id' => 1, 'cita_id' => 1, 'monto' => 250, 'metodo_pago' => 'efectivo', 'estado' => 'completado', 'fecha' => $hoy->toDateString()]);
        Pago::create(['paciente_id' => 3, 'cita_id' => 3, 'monto' => 2500, 'metodo_pago' => 'qr', 'estado' => 'pendiente', 'fecha' => $hoy->toDateString()]);
    }
}
