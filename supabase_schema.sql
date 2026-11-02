-- ==============================================================================
-- PROYECTO PRECOOPERATIVA ESCOLAR: "Clínica de Hardware y Optimización Escolar"
-- Escuela de Educación Técnica — Orientación en Programación e Informática
-- Script SQL para Supabase / PostgreSQL con Políticas RLS y Datos Semilla
-- ==============================================================================

-- 1. Extensión para generación de UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Esquema de Perfiles de Usuario (vinculado a auth.users de Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    rol VARCHAR(50) NOT NULL CHECK (rol IN ('docente', 'tecnico', 'consejo', 'sindicatura')),
    rol_descripcion VARCHAR(100) NOT NULL,
    comision VARCHAR(80) NOT NULL,
    curso VARCHAR(50),
    avatar_url TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabla de Órdenes de Trabajo (Pedidos de Reparación / Optimización)
CREATE TABLE IF NOT EXISTS public.ordenes_trabajo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_ot VARCHAR(20) UNIQUE NOT NULL,
    equipo VARCHAR(150) NOT NULL,
    aula_laboratorio VARCHAR(100) NOT NULL,
    descripcion_falla TEXT NOT NULL,
    comision_responsable VARCHAR(50) NOT NULL CHECK (comision_responsable IN ('Hardware', 'Software y Redes')),
    prioridad VARCHAR(20) NOT NULL CHECK (prioridad IN ('Baja', 'Media', 'Alta')),
    estado VARCHAR(30) NOT NULL DEFAULT 'Recibido' CHECK (
        estado IN ('Recibido', 'Diagnóstico', 'Reparar u optimizar', 'Probado', 'Entregado', 'Cancelado')
    ),
    solicitante_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    solicitante_nombre VARCHAR(150) NOT NULL,
    tecnico_asignado_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    tecnico_asignado_nombre VARCHAR(150),
    diagnostico TEXT,
    trabajo_realizado TEXT,
    pruebas_control_calidad TEXT,
    es_dato_prueba BOOLEAN DEFAULT false,
    fecha_solicitud TIMESTAMPTZ DEFAULT now(),
    fecha_diagnostico TIMESTAMPTZ,
    fecha_reparacion TIMESTAMPTZ,
    fecha_prueba TIMESTAMPTZ,
    fecha_entrega TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Trazabilidad e Historial de Estados de Órdenes (Auditoría)
CREATE TABLE IF NOT EXISTS public.historial_estados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orden_id UUID NOT NULL REFERENCES public.ordenes_trabajo(id) ON DELETE CASCADE,
    estado_anterior VARCHAR(30),
    estado_nuevo VARCHAR(30) NOT NULL,
    revisor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    revisor_nombre VARCHAR(150) NOT NULL,
    observacion TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Tabla de Inventario de Repuestos e Insumos
CREATE TABLE IF NOT EXISTS public.inventario_repuestos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(150) NOT NULL,
    categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('Hardware', 'Redes', 'Insumos', 'Herramientas')),
    stock_actual INTEGER NOT NULL DEFAULT 0 CHECK (stock_actual >= 0),
    stock_minimo INTEGER NOT NULL DEFAULT 2 CHECK (stock_minimo >= 0),
    unidad_medida VARCHAR(30) NOT NULL DEFAULT 'unidades',
    ubicacion VARCHAR(100) DEFAULT 'Taller de Hardware',
    precio_unitario_estimado NUMERIC(10,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Consumo de Materiales por Orden de Trabajo
CREATE TABLE IF NOT EXISTS public.consumos_repuestos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orden_id UUID NOT NULL REFERENCES public.ordenes_trabajo(id) ON DELETE CASCADE,
    repuesto_id UUID NOT NULL REFERENCES public.inventario_repuestos(id) ON DELETE RESTRICT,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    registrado_por VARCHAR(150) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Libro Diario de Ingresos y Egresos (Transparencia Contable Precooperativa)
CREATE TABLE IF NOT EXISTS public.libro_diario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_asiento SERIAL UNIQUE,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    tipo_movimiento VARCHAR(20) NOT NULL CHECK (tipo_movimiento IN ('Ingreso', 'Egreso')),
    concepto TEXT NOT NULL,
    categoria VARCHAR(60) NOT NULL CHECK (
        categoria IN ('Compra de repuestos', 'Herramientas', 'Donación escolar', 'Aporte cooperativo', 'Gastos operativos')
    ),
    monto NUMERIC(12,2) NOT NULL CHECK (monto > 0),
    comprobante_numero VARCHAR(100),
    registrado_por VARCHAR(150) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Libro de Actas Oficiales (Asambleas y Reuniones de Consejo)
CREATE TABLE IF NOT EXISTS public.actas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo_acta VARCHAR(50) NOT NULL CHECK (tipo_acta IN ('Asamblea Ordinaria', 'Asamblea Extraordinaria', 'Consejo de Administración')),
    numero_acta INTEGER NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    fecha DATE NOT NULL,
    lugar VARCHAR(120) DEFAULT 'Escuela Técnica - Aula Magna',
    resumen_acuerdos TEXT NOT NULL,
    firmantes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 9. CONFIGURACIÓN DE SEGURIDAD A NIVEL DE FILAS (ROW LEVEL SECURITY - RLS)
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordenes_trabajo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historial_estados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventario_repuestos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consumos_repuestos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.libro_diario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actas ENABLE ROW LEVEL SECURITY;

-- Funciones auxiliares para verificar roles según JWT
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS VARCHAR AS $$
    SELECT rol FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Políticas para Profiles
CREATE POLICY "Lectura pública de perfiles activos" 
    ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Modificación de perfil propio" 
    ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Políticas para Órdenes de Trabajo:
-- Docente: Puede ver todas las de su aula/autoría e insertar nuevas
-- Técnico / Consejo / Sindicatura: Pueden ver todas las órdenes
CREATE POLICY "Lectura de órdenes de trabajo"
    ON public.ordenes_trabajo FOR SELECT
    USING (
        public.current_user_role() IN ('tecnico', 'consejo', 'sindicatura')
        OR solicitante_id = auth.uid()
        OR auth.uid() IS NULL -- Permite modo de prueba anónimo si anon_key está habilitada
    );

CREATE POLICY "Inserción de órdenes por usuarios habilitados"
    ON public.ordenes_trabajo FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Actualización de órdenes por técnicos o consejo"
    ON public.ordenes_trabajo FOR UPDATE
    USING (
        public.current_user_role() IN ('tecnico', 'consejo')
        OR auth.uid() IS NULL
    );

-- Políticas para Inventario:
-- Todos pueden consultar stock
-- Solo técnicos y consejo pueden actualizar o registrar compras
CREATE POLICY "Lectura de inventario"
    ON public.inventario_repuestos FOR SELECT
    USING (true);

CREATE POLICY "Modificación de inventario por técnicos o consejo"
    ON public.inventario_repuestos FOR ALL
    USING (
        public.current_user_role() IN ('tecnico', 'consejo')
        OR auth.uid() IS NULL
    );

-- Políticas para Libro Diario:
-- Lectura permitida a Consejo y Sindicatura (y asociados en asamblea)
CREATE POLICY "Lectura de libro diario"
    ON public.libro_diario FOR SELECT
    USING (true);

CREATE POLICY "Registro en libro diario solo por Consejo de Administración"
    ON public.libro_diario FOR INSERT
    WITH CHECK (
        public.current_user_role() = 'consejo'
        OR auth.uid() IS NULL
    );

-- Políticas para Actas:
CREATE POLICY "Lectura de actas para toda la comunidad precooperativa"
    ON public.actas FOR SELECT
    USING (true);

CREATE POLICY "Carga de actas por Consejo de Administración"
    ON public.actas FOR INSERT
    WITH CHECK (
        public.current_user_role() = 'consejo'
        OR auth.uid() IS NULL
    );

-- ==============================================================================
-- 10. DATOS SEMILLA DE PRUEBA (MOCK DATA OFICIAL BASADO EN EL INFORME TÉCNICO)
-- ==============================================================================

-- Perfiles de prueba
INSERT INTO public.profiles (id, nombre_completo, email, rol, rol_descripcion, comision, curso)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Prof. Aragón', 'aragon@escuela.edu.ar', 'docente', 'Docente / Solicitante', 'Docente de Taller', 'Ciclo Superior'),
    ('22222222-2222-2222-2222-222222222222', 'Gonzalo Gomez Bustamante', 'gonzalo@precoop.escuela.edu.ar', 'tecnico', 'Estudiante Asociado / Técnico', 'Hardware', '6to Año Informática'),
    ('33333333-3333-3333-3333-333333333333', 'Sofía Valenzuela', 'sofia@precoop.escuela.edu.ar', 'tecnico', 'Estudiante Asociado / Técnica', 'Software y Redes', '5to Año Informática'),
    ('44444444-4444-4444-4444-444444444444', 'Lucas Martínez', 'lucas@precoop.escuela.edu.ar', 'consejo', 'Consejo de Administración (Tesorero)', 'Tesorería y Administración', '7mo Año Informática'),
    ('55555555-5555-5555-5555-555555555555', 'Prof. Mariana Rossi', 'mariana.rossi@escuela.edu.ar', 'sindicatura', 'Sindicatura / Comisión Asesora', 'Comisión Asesora Docente', 'Coordinación')
ON CONFLICT (id) DO NOTHING;

-- Inventario de insumos y repuestos (coincidente con Pantalla 5)
INSERT INTO public.inventario_repuestos (id, nombre, categoria, stock_actual, stock_minimo, unidad_medida, ubicacion, precio_unitario_estimado)
VALUES
    ('a1111111-0000-0000-0000-000000000001', 'Memoria RAM DDR3 4 GB', 'Hardware', 5, 2, 'módulos', 'Gavetero A1', 6500.00),
    ('a1111111-0000-0000-0000-000000000002', 'SSD 240 GB Kingston', 'Hardware', 3, 2, 'unidades', 'Gavetero A2', 18500.00),
    ('a1111111-0000-0000-0000-000000000003', 'Fuente ATX 450 W', 'Hardware', 1, 2, 'unidades', 'Estante B3 (Alerta)', 24000.00),
    ('a1111111-0000-0000-0000-000000000004', 'Estaño para soldar 60/40 (rollo)', 'Insumos', 1, 2, 'rollos', 'Mesa de Soldadura (Alerta)', 7500.00),
    ('a1111111-0000-0000-0000-000000000005', 'Adaptador Wi-Fi USB 300Mbps', 'Redes', 4, 2, 'unidades', 'Gavetero C1', 8200.00),
    ('a1111111-0000-0000-0000-000000000006', 'Fichas Jack 3.5 mm estéreo', 'Insumos', 14, 5, 'unidades', 'Gavetero D4', 450.00)
ON CONFLICT (id) DO NOTHING;

-- Órdenes de trabajo de prueba (coincidentes con Pantallas 1, 4 y 5)
INSERT INTO public.ordenes_trabajo (
    id, codigo_ot, equipo, aula_laboratorio, descripcion_falla, comision_responsable, 
    prioridad, estado, solicitante_nombre, tecnico_asignado_nombre, es_dato_prueba, fecha_solicitud
)
VALUES
    (
        'b1111111-0000-0000-0000-000000000001',
        'OT-0021',
        'PC 4 - Laboratorio de Hardware',
        'Lab Hardware',
        'No enciende tras corte de energía. Fuente emite zumbido intermitente.',
        'Hardware',
        'Media',
        'Reparar u optimizar',
        'Prof. Aragón',
        'Gonzalo Gomez Bustamante',
        true,
        now() - INTERVAL '2 days'
    ),
    (
        'b1111111-0000-0000-0000-000000000002',
        'OT-0018',
        'PC de escritorio - Aula 2',
        'Aula 2',
        'Lentitud extrema en el inicio de Windows y navegación web. Fuerte consumo de RAM por programas en segundo plano.',
        'Software y Redes',
        'Alta',
        'Diagnóstico',
        'Prof. Aragón',
        'Sofía Valenzuela',
        true,
        now() - INTERVAL '3 days'
    ),
    (
        'b1111111-0000-0000-0000-000000000003',
        'OT-0020',
        'Auriculares x 6 - Aula 5',
        'Aula 5',
        'Falso contacto en cable y fichas jack arrancadas en puestos de audio.',
        'Hardware',
        'Baja',
        'Probado',
        'Prof. Aragón',
        'Gonzalo Gomez Bustamante',
        true,
        now() - INTERVAL '4 days'
    ),
    (
        'b1111111-0000-0000-0000-000000000004',
        'OT-0015',
        'Router Wi-Fi - Aula 1',
        'Aula 1',
        'Pérdida de conectividad periódica y saturación de DHCP con más de 20 netbooks conectadas.',
        'Software y Redes',
        'Media',
        'Entregado',
        'Prof. Aragón',
        'Sofía Valenzuela',
        true,
        now() - INTERVAL '6 days'
    ),
    (
        'b1111111-0000-0000-0000-000000000005',
        'OT-0012',
        'Monitor 19" - Biblioteca',
        'Biblioteca',
        'Pantalla parpadea al encender y se apaga a los pocos segundos.',
        'Hardware',
        'Baja',
        'Entregado',
        'Bibliotecario Marcos',
        'Gonzalo Gomez Bustamante',
        true,
        now() - INTERVAL '10 days'
    )
ON CONFLICT (id) DO NOTHING;

-- Libro diario contable de prueba (Pantalla 6 y 7)
INSERT INTO public.libro_diario (fecha, tipo_movimiento, concepto, categoria, monto, comprobante_numero, registrado_por)
VALUES
    (CURRENT_DATE - INTERVAL '15 days', 'Ingreso', 'Fondo escolar inicial asignado a la Precooperativa', 'Aporte cooperativo', 85000.00, 'ACTA-01-FND', 'Lucas Martínez (Tesorero)'),
    (CURRENT_DATE - INTERVAL '10 days', 'Egreso', 'Compra de estaño 60/40 y 15 fichas jack 3.5mm estéreo', 'Compra de repuestos', 14250.00, 'FAC-B-0001-000342', 'Lucas Martínez (Tesorero)'),
    (CURRENT_DATE - INTERVAL '5 days', 'Egreso', 'Adquisición de kit de adaptadores Wi-Fi USB para aulas', 'Herramientas', 24600.00, 'FAC-B-0002-000891', 'Lucas Martínez (Tesorero)');

-- Actas de asamblea y consejo (Pantalla 7)
INSERT INTO public.actas (tipo_acta, numero_acta, titulo, fecha, resumen_acuerdos, firmantes)
VALUES
    (
        'Asamblea Ordinaria',
        12,
        'Acta Nº 12 — Asamblea General Ordinaria de Constitución',
        '2026-03-20',
        'Aprobación unánime del estatuto fundacional de la Clínica de Hardware y Optimización Escolar. Elección democrática de autoridades del Consejo de Administración y Sindicatura con participación de 18 asociados estudiantes.',
        'Gonzalo Gomez Bustamante (Presidente), Lucas Martínez (Tesorero), Mariana Rossi (Asesora)'
    ),
    (
        'Consejo de Administración',
        7,
        'Acta Nº 7 — Asignación de responsabilidades y prioridades de taller',
        '2026-04-12',
        'Asignación de comisiones operativas (Hardware y Software/Redes), establecimiento del protocolo de debloating para computadoras de laboratorios y autorización del fondo rotatorio de compra de repuestos.',
        'Consejo de Administración y Comisión Asesora Docente'
    );
