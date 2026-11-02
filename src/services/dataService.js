import { ref, computed } from 'vue'
import { supabase, isSupabaseConfigured } from '../supabase'
import {
  MOCK_ORDERS,
  MOCK_INVENTORY,
  MOCK_LEDGER,
  MOCK_MINUTES,
  MOCK_ASSOCIATES
} from '../data/mockData'

// Estado reactivo global
const orders = ref([])
const inventory = ref([])
const ledger = ref([])
const minutes = ref([])
const associates = ref([])

const isLoading = ref(false)
const dataSource = ref('local') // 'supabase' | 'local'
const lastError = ref(null)

// Funciones de persistencia local (Offline / Demo mode)
const loadFromStorage = () => {
  try {
    const savedOrders = localStorage.getItem('preco_orders')
    orders.value = savedOrders ? JSON.parse(savedOrders) : JSON.parse(JSON.stringify(MOCK_ORDERS))

    const savedInventory = localStorage.getItem('preco_inventory')
    inventory.value = savedInventory ? JSON.parse(savedInventory) : JSON.parse(JSON.stringify(MOCK_INVENTORY))

    const savedLedger = localStorage.getItem('preco_ledger')
    ledger.value = savedLedger ? JSON.parse(savedLedger) : JSON.parse(JSON.stringify(MOCK_LEDGER))

    const savedMinutes = localStorage.getItem('preco_minutes')
    minutes.value = savedMinutes ? JSON.parse(savedMinutes) : JSON.parse(JSON.stringify(MOCK_MINUTES))

    const savedAssociates = localStorage.getItem('preco_associates')
    associates.value = savedAssociates ? JSON.parse(savedAssociates) : JSON.parse(JSON.stringify(MOCK_ASSOCIATES))

    dataSource.value = 'local'
  } catch (err) {
    console.error('Error cargando desde localStorage:', err)
  }
}

const saveToStorage = () => {
  localStorage.setItem('preco_orders', JSON.stringify(orders.value))
  localStorage.setItem('preco_inventory', JSON.stringify(inventory.value))
  localStorage.setItem('preco_ledger', JSON.stringify(ledger.value))
  localStorage.setItem('preco_minutes', JSON.stringify(minutes.value))
  localStorage.setItem('preco_associates', JSON.stringify(associates.value))
}

// Inicialización de datos
export const initDataService = async () => {
  isLoading.value = true
  lastError.value = null

  if (isSupabaseConfigured() && supabase) {
    try {
      dataSource.value = 'supabase'
      // Consultar órdenes de Supabase
      const { data: dbOrders, error: ordErr } = await supabase
        .from('ordenes_trabajo')
        .select('*')
        .order('fecha_solicitud', { ascending: false })

      const { data: dbInv, error: invErr } = await supabase
        .from('inventario_repuestos')
        .select('*')
        .order('nombre')

      const { data: dbLedger, error: ledErr } = await supabase
        .from('libro_diario')
        .select('*')
        .order('fecha', { ascending: false })

      const { data: dbMinutes, error: minErr } = await supabase
        .from('actas')
        .select('*')
        .order('fecha', { ascending: false })

      if (ordErr || invErr || ledErr || minErr) {
        console.warn('Tablas de Supabase aún no creadas o vacías, usando modo local con fallback.')
        loadFromStorage()
      } else if (dbOrders && dbOrders.length > 0) {
        orders.value = dbOrders.map(o => ({
          ...o,
          historial: o.historial || [
            { fecha: new Date(o.fecha_solicitud).toLocaleString(), estado: o.estado, responsable: o.solicitante_nombre, nota: 'Registrado en base de datos' }
          ]
        }))
        inventory.value = dbInv || []
        ledger.value = dbLedger || []
        minutes.value = dbMinutes || []
        associates.value = JSON.parse(JSON.stringify(MOCK_ASSOCIATES))
      } else {
        // Conexión exitosa pero sin tablas inicializadas
        loadFromStorage()
      }
    } catch (err) {
      console.error('Excepción al conectar con Supabase:', err)
      lastError.value = err.message
      loadFromStorage()
    }
  } else {
    loadFromStorage()
  }

  isLoading.value = false
}

// Reset a datos semilla
export const resetToMockData = () => {
  orders.value = JSON.parse(JSON.stringify(MOCK_ORDERS))
  inventory.value = JSON.parse(JSON.stringify(MOCK_INVENTORY))
  ledger.value = JSON.parse(JSON.stringify(MOCK_LEDGER))
  minutes.value = JSON.parse(JSON.stringify(MOCK_MINUTES))
  associates.value = JSON.parse(JSON.stringify(MOCK_ASSOCIATES))
  saveToStorage()
}

// Subir datos simulados a Supabase (para cumplir con punto 14)
export const seedSupabaseData = async () => {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Supabase no está configurado. Por favor ingresa tus credenciales en el modal.')
  }

  isLoading.value = true
  try {
    // 1. Insertar Inventario
    for (const item of MOCK_INVENTORY) {
      await supabase.from('inventario_repuestos').upsert({
        nombre: item.nombre,
        categoria: item.categoria,
        stock_actual: item.stock_actual,
        stock_minimo: item.stock_minimo,
        unidad_medida: item.unidad_medida,
        ubicacion: item.ubicacion,
        precio_unitario_estimado: item.precio_estimado
      }, { onConflict: 'nombre' })
    }

    // 2. Insertar Órdenes
    for (const ord of MOCK_ORDERS) {
      await supabase.from('ordenes_trabajo').upsert({
        codigo_ot: ord.codigo_ot,
        equipo: ord.equipo,
        aula_laboratorio: ord.aula_laboratorio,
        descripcion_falla: ord.descripcion_falla,
        comision_responsable: ord.comision_responsable,
        prioridad: ord.prioridad,
        estado: ord.estado,
        solicitante_nombre: ord.solicitante_nombre,
        tecnico_asignado_nombre: ord.tecnico_asignado_nombre,
        diagnostico: ord.diagnostico,
        trabajo_realizado: ord.trabajo_realizado,
        pruebas_control_calidad: ord.pruebas_control_calidad,
        es_dato_prueba: true
      }, { onConflict: 'codigo_ot' })
    }

    // 3. Recargar
    await initDataService()
    return true
  } catch (err) {
    lastError.value = err.message
    throw err
  } finally {
    isLoading.value = false
  }
}

// ------------------------------------------------------------------------------
// OPERACIONES CRUD: Órdenes de Trabajo
// ------------------------------------------------------------------------------

export const createOrder = async (orderInput, user) => {
  isLoading.value = true

  const now = new Date()
  const nextNum = orders.value.length + 22
  const newCode = `OT-${String(nextNum).padStart(4, '0')}`

  const newOrder = {
    id: `ot-${Date.now()}`,
    codigo_ot: newCode,
    equipo: orderInput.equipo.trim(),
    aula_laboratorio: orderInput.aula_laboratorio.trim(),
    descripcion_falla: orderInput.descripcion_falla.trim(),
    comision_responsable: orderInput.comision_responsable,
    prioridad: orderInput.prioridad || 'Media',
    estado: 'Recibido',
    solicitante_id: user.id,
    solicitante_nombre: user.nombre_completo,
    tecnico_asignado_id: null,
    tecnico_asignado_nombre: null,
    diagnostico: null,
    trabajo_realizado: null,
    pruebas_control_calidad: null,
    insumos_usados: [],
    es_dato_prueba: false,
    fecha_solicitud: now.toISOString(),
    historial: [
      {
        fecha: now.toLocaleString(),
        estado: 'Recibido',
        responsable: user.nombre_completo,
        nota: 'Pedido registrado en el sistema'
      }
    ]
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('ordenes_trabajo').insert([{
        codigo_ot: newOrder.codigo_ot,
        equipo: newOrder.equipo,
        aula_laboratorio: newOrder.aula_laboratorio,
        descripcion_falla: newOrder.descripcion_falla,
        comision_responsable: newOrder.comision_responsable,
        prioridad: newOrder.prioridad,
        estado: 'Recibido',
        solicitante_nombre: user.nombre_completo,
        es_dato_prueba: false
      }]).select()

      if (!error && data && data.length > 0) {
        newOrder.id = data[0].id
      }
    } catch (err) {
      console.warn('Fallback a almacenamiento local tras error en Supabase:', err)
    }
  }

  orders.value.unshift(newOrder)
  saveToStorage()
  isLoading.value = false
  return newOrder
}

export const advanceOrderStatus = async (orderId, newStatus, user, notes = '', parts = []) => {
  isLoading.value = true
  const order = orders.value.find(o => o.id === orderId)
  if (!order) {
    isLoading.value = false
    throw new Error('Orden no encontrada')
  }

  const prevStatus = order.estado
  order.estado = newStatus
  if (!order.tecnico_asignado_nombre && user.rol === 'tecnico') {
    order.tecnico_asignado_id = user.id
    order.tecnico_asignado_nombre = user.nombre_completo
  }

  if (notes) {
    if (newStatus === 'Diagnóstico') order.diagnostico = notes
    if (newStatus === 'Reparar u optimizar') order.trabajo_realizado = notes
    if (newStatus === 'Probado') order.pruebas_control_calidad = notes
  }

  // Registrar consumo de piezas si se especificaron
  if (parts && parts.length > 0) {
    if (!order.insumos_usados) order.insumos_usados = []
    parts.forEach(part => {
      order.insumos_usados.push(part)
      // Descontar del inventario reactivo
      const invItem = inventory.value.find(i => i.id === part.id || i.nombre.toLowerCase().includes(part.nombre.toLowerCase()))
      if (invItem) {
        invItem.stock_actual = Math.max(0, invItem.stock_actual - part.cantidad)
        invItem.alerta_stock = invItem.stock_actual <= invItem.stock_minimo
      }
    })
  }

  // Registro en historial (auditoría / trazabilidad para cumplir con punto 8)
  if (!order.historial) order.historial = []
  order.historial.push({
    fecha: new Date().toLocaleString(),
    estado: newStatus,
    responsable: user.nombre_completo,
    nota: notes || `Transición de ${prevStatus} a ${newStatus}`
  })

  // Sincronizar en Supabase si está disponible
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('ordenes_trabajo').update({
        estado: newStatus,
        diagnostico: order.diagnostico,
        trabajo_realizado: order.trabajo_realizado,
        pruebas_control_calidad: order.pruebas_control_calidad,
        tecnico_asignado_nombre: order.tecnico_asignado_nombre
      }).eq('id', order.id)
    } catch (err) {
      console.warn('Error sincronizando estado en Supabase:', err)
    }
  }

  saveToStorage()
  isLoading.value = false
  return order
}

// Cancelación de orden (Conservando historial de auditoría)
export const cancelOrder = async (orderId, user, reason) => {
  isLoading.value = true
  const order = orders.value.find(o => o.id === orderId)
  if (!order) {
    isLoading.value = false
    throw new Error('Orden no encontrada')
  }

  const prevStatus = order.estado
  order.estado = 'Cancelado'
  if (!order.historial) order.historial = []
  order.historial.push({
    fecha: new Date().toLocaleString(),
    estado: 'Cancelado',
    responsable: user.nombre_completo,
    nota: `Cancelación fundamentada (estaba en ${prevStatus}): ${reason}`
  })

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('ordenes_trabajo').update({
        estado: 'Cancelado'
      }).eq('id', order.id)
    } catch (err) {
      console.warn('Error cancelando orden en Supabase:', err)
    }
  }

  saveToStorage()
  isLoading.value = false
  return order
}

// ------------------------------------------------------------------------------
// OPERACIONES CRUD: Inventario
// ------------------------------------------------------------------------------

export const updateInventoryStock = async (itemId, delta, user, reason = '') => {
  const item = inventory.value.find(i => i.id === itemId)
  if (!item) throw new Error('Repuesto no encontrado')

  item.stock_actual = Math.max(0, item.stock_actual + delta)
  item.alerta_stock = item.stock_actual <= item.stock_minimo

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('inventario_repuestos').update({
        stock_actual: item.stock_actual
      }).eq('id', item.id)
    } catch (err) {
      console.warn('Error actualizando stock en Supabase:', err)
    }
  }

  saveToStorage()
  return item
}

export const createInventoryItem = async (itemData, user) => {
  const newItem = {
    id: `rep-${Date.now()}`,
    nombre: itemData.nombre.trim(),
    categoria: itemData.categoria || 'Hardware',
    stock_actual: Number(itemData.stock_actual) || 0,
    stock_minimo: Number(itemData.stock_minimo) || 2,
    unidad_medida: itemData.unidad_medida || 'unidades',
    ubicacion: itemData.ubicacion || 'Taller de Hardware',
    precio_estimado: Number(itemData.precio_estimado) || 0,
    alerta_stock: (Number(itemData.stock_actual) || 0) <= (Number(itemData.stock_minimo) || 2)
  }

  inventory.value.push(newItem)
  saveToStorage()
  return newItem
}

// ------------------------------------------------------------------------------
// OPERACIONES CRUD: Libro Diario (Tesorería)
// ------------------------------------------------------------------------------

export const addLedgerEntry = async (entryData, user) => {
  const nextNum = ledger.value.length + 1
  const newEntry = {
    id: `asiento-${Date.now()}`,
    numero_asiento: nextNum,
    fecha: entryData.fecha || new Date().toISOString().split('T')[0],
    tipo: entryData.tipo,
    concepto: entryData.concepto.trim(),
    categoria: entryData.categoria,
    monto: Number(entryData.monto),
    comprobante: entryData.comprobante.trim(),
    registrado_por: user.nombre_completo
  }

  ledger.value.unshift(newEntry)
  saveToStorage()
  return newEntry
}

// ------------------------------------------------------------------------------
// OPERACIONES CRUD: Actas (Asamblea y Consejo)
// ------------------------------------------------------------------------------

export const addMinute = async (minuteData, user) => {
  const nextNum = minutes.value.length + 8
  const newMinute = {
    id: `acta-${Date.now()}`,
    numero: nextNum,
    tipo: minuteData.tipo,
    titulo: minuteData.titulo.trim(),
    fecha: minuteData.fecha || new Date().toISOString().split('T')[0],
    resumen: minuteData.resumen.trim(),
    firmantes: minuteData.firmantes || user.nombre_completo
  }

  minutes.value.unshift(newMinute)
  saveToStorage()
  return newMinute
}

export function useData() {
  return {
    orders,
    inventory,
    ledger,
    minutes,
    associates,
    isLoading,
    dataSource,
    lastError,
    initDataService,
    resetToMockData,
    seedSupabaseData,
    createOrder,
    advanceOrderStatus,
    cancelOrder,
    updateInventoryStock,
    createInventoryItem,
    addLedgerEntry,
    addMinute
  }
}
