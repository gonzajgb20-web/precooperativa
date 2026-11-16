import { ref } from 'vue'
import { supabase, isSupabaseConfigured } from '../supabase'

// Estado reactivo global
const orders = ref([])
const inventory = ref([])
const ledger = ref([])
const minutes = ref([])
const associates = ref([])

const isLoading = ref(false)
const dataSource = ref('local') // 'supabase' | 'local'
const lastError = ref(null)

// Funciones de persistencia local (solo respaldo en caso de desconexión)
const loadFromStorage = () => {
  try {
    const savedOrders = localStorage.getItem('preco_orders')
    orders.value = savedOrders ? JSON.parse(savedOrders) : []

    const savedInventory = localStorage.getItem('preco_inventory')
    const rawInv = savedInventory ? JSON.parse(savedInventory) : []
    inventory.value = rawInv.map(i => {
      const precio = Number(i.precio_unitario_estimado ?? i.precio_estimado ?? 0)
      const actual = Number(i.stock_actual ?? 0)
      const minimo = Number(i.stock_minimo ?? 0)
      return {
        ...i,
        precio_estimado: precio,
        precio_unitario_estimado: precio,
        stock_actual: actual,
        stock_minimo: minimo,
        alerta_stock: actual <= minimo
      }
    })

    const savedLedger = localStorage.getItem('preco_ledger')
    ledger.value = savedLedger ? JSON.parse(savedLedger) : []

    const savedMinutes = localStorage.getItem('preco_minutes')
    minutes.value = savedMinutes ? JSON.parse(savedMinutes) : []

    const savedAssociates = localStorage.getItem('preco_associates')
    associates.value = savedAssociates ? JSON.parse(savedAssociates) : []

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

// Inicialización de datos desde Supabase
export const initDataService = async () => {
  isLoading.value = true
  lastError.value = null

  if (isSupabaseConfigured() && supabase) {
    try {
      dataSource.value = 'supabase'

      // 1. Consultar órdenes de trabajo con su historial de estados
      const { data: dbOrders, error: ordErr } = await supabase
        .from('ordenes_trabajo')
        .select(`
          *,
          historial_estados (
            id, estado_anterior, estado_nuevo, revisor_nombre, observacion, created_at
          )
        `)
        .order('fecha_solicitud', { ascending: false })

      // 2. Consultar inventario de repuestos
      const { data: dbInv, error: invErr } = await supabase
        .from('inventario_repuestos')
        .select('*')
        .order('nombre')

      // 3. Consultar libro diario de tesorería
      const { data: dbLedger, error: ledErr } = await supabase
        .from('libro_diario')
        .select('*')
        .order('fecha', { ascending: false })

      // 4. Consultar actas de asamblea
      const { data: dbMinutes, error: minErr } = await supabase
        .from('actas')
        .select('*')
        .order('fecha', { ascending: false })

      // 5. Consultar perfiles de asociados registrados
      const { data: dbProfiles, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .order('nombre_completo')

      // Mapeo independiente de perfiles
      if (!profErr && dbProfiles) {
        associates.value = dbProfiles.map(p => ({
          id: p.id,
          nombre_completo: p.nombre_completo,
          email: p.email,
          rol: p.rol,
          cargo: p.rol_descripcion || p.rol,
          comision: p.comision || 'Taller',
          curso: p.curso || 'General',
          activo: p.activo !== false
        }))
      }

      // Mapeo independiente de órdenes de trabajo
      if (!ordErr && dbOrders) {
        orders.value = dbOrders.map(o => {
          const mappedHistory = (o.historial_estados || [])
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
            .map(h => ({
              fecha: new Date(h.created_at).toLocaleString(),
              estado: h.estado_nuevo,
              responsable: h.revisor_nombre,
              nota: h.observacion || `Transición a ${h.estado_nuevo}`
            }))

          return {
            ...o,
            historial: mappedHistory.length > 0 ? mappedHistory : [
              {
                fecha: new Date(o.fecha_solicitud || o.created_at || Date.now()).toLocaleString(),
                estado: o.estado,
                responsable: o.solicitante_nombre,
                nota: 'Orden registrada en la base de datos'
              }
            ]
          }
        })
      } else if (ordErr) {
        console.warn('Error en carga de órdenes de Supabase:', ordErr)
        try {
          const savedOrders = localStorage.getItem('preco_orders')
          if (savedOrders) orders.value = JSON.parse(savedOrders)
        } catch (e) {
          console.error('Error leyendo orders de localStorage:', e)
        }
      }

      // Mapeo independiente de inventario
      if (!invErr && dbInv) {
        inventory.value = dbInv.map(i => {
          const precio = Number(i.precio_unitario_estimado ?? i.precio_estimado ?? 0)
          const actual = Number(i.stock_actual ?? 0)
          const minimo = Number(i.stock_minimo ?? 0)
          return {
            ...i,
            precio_estimado: precio,
            precio_unitario_estimado: precio,
            stock_actual: actual,
            stock_minimo: minimo,
            alerta_stock: actual <= minimo
          }
        })
      }

      // Mapeo independiente de libro diario
      if (!ledErr && dbLedger) {
        ledger.value = dbLedger.map(l => ({
          id: l.id,
          numero_asiento: l.numero_asiento,
          fecha: l.fecha,
          tipo: l.tipo_movimiento,
          concepto: l.concepto,
          categoria: l.categoria,
          monto: Number(l.monto),
          comprobante: l.comprobante_numero || '',
          registrado_por: l.registrado_por
        }))
      }

      // Mapeo independiente de actas
      if (!minErr && dbMinutes) {
        minutes.value = dbMinutes.map(m => ({
          id: m.id,
          numero: m.numero_acta,
          tipo: m.tipo_acta,
          titulo: m.titulo,
          fecha: m.fecha,
          lugar: m.lugar,
          resumen: m.resumen_acuerdos,
          firmantes: m.firmantes
        }))
      }

      saveToStorage()
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

// ------------------------------------------------------------------------------
// OPERACIONES CRUD: Órdenes de Trabajo
// ------------------------------------------------------------------------------

export const createOrder = async (orderInput, user) => {
  isLoading.value = true

  // 1. Calcular el siguiente código OT libre dinámicamente
  let maxNum = 0
  orders.value.forEach(o => {
    const match = (o.codigo_ot || '').match(/OT-(\d+)/)
    if (match) {
      const n = parseInt(match[1], 10)
      if (n > maxNum) maxNum = n
    }
  })

  // Chequear en Supabase si está disponible para evitar colisiones
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data: dbLatest } = await supabase
        .from('ordenes_trabajo')
        .select('codigo_ot')
        .order('created_at', { ascending: false })
        .limit(20)

      if (dbLatest && dbLatest.length > 0) {
        dbLatest.forEach(o => {
          const match = (o.codigo_ot || '').match(/OT-(\d+)/)
          if (match) {
            const n = parseInt(match[1], 10)
            if (n > maxNum) maxNum = n
          }
        })
      }
    } catch (e) {
      console.warn('Advertencia calculando código OT desde Supabase:', e)
    }
  }

  const newCode = `OT-${String(maxNum + 1).padStart(4, '0')}`
  const now = new Date()

  // 2. Blindar solicitante_id para respetar la foreign key hacia public.profiles
  let validSolicitanteId = null
  if (user?.id && user.id.length === 36) {
    const profileExists = associates.value.some(p => p.id === user.id)
    if (profileExists) {
      validSolicitanteId = user.id
    }
  }

  const newOrder = {
    id: `ot-${Date.now()}`,
    codigo_ot: newCode,
    equipo: orderInput.equipo.trim(),
    aula_laboratorio: orderInput.aula_laboratorio.trim(),
    descripcion_falla: orderInput.descripcion_falla.trim(),
    comision_responsable: orderInput.comision_responsable,
    prioridad: orderInput.prioridad || 'Media',
    estado: 'Recibido',
    solicitante_id: validSolicitanteId,
    solicitante_nombre: user?.nombre_completo || 'Docente Solicitante',
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
        responsable: user?.nombre_completo || 'Solicitante',
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
        solicitante_id: validSolicitanteId,
        solicitante_nombre: newOrder.solicitante_nombre,
        es_dato_prueba: false
      }]).select()

      if (error) {
        throw error
      }

      if (data && data.length > 0) {
        newOrder.id = data[0].id

        // Registrar estado inicial en el historial oficial de la base de datos
        await supabase.from('historial_estados').insert([{
          orden_id: newOrder.id,
          estado_anterior: null,
          estado_nuevo: 'Recibido',
          revisor_id: validSolicitanteId,
          revisor_nombre: newOrder.solicitante_nombre,
          observacion: 'Recepción inicial del pedido de reparación'
        }])
      }
    } catch (err) {
      console.error('Error al guardar orden en Supabase:', err)
      isLoading.value = false
      throw new Error(`Error al persistir en base de datos: ${err.message || 'Falló la inserción'}`)
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
  if (!order.tecnico_asignado_nombre && user?.rol === 'tecnico') {
    order.tecnico_asignado_id = user?.id || null
    order.tecnico_asignado_nombre = user?.nombre_completo || 'Técnico'
  }

  if (notes) {
    if (newStatus === 'Diagnóstico') order.diagnostico = notes
    if (newStatus === 'Reparar u optimizar') order.trabajo_realizado = notes
    if (newStatus === 'Probado') order.pruebas_control_calidad = notes
  }

  // Registrar consumo de piezas
  if (parts && parts.length > 0) {
    if (!order.insumos_usados) order.insumos_usados = []
    for (const part of parts) {
      order.insumos_usados.push(part)
      const invItem = inventory.value.find(i => i.id === part.id || (i.nombre || '').toLowerCase().includes((part.nombre || '').toLowerCase()))
      if (invItem) {
        invItem.stock_actual = Math.max(0, invItem.stock_actual - part.cantidad)
        invItem.alerta_stock = invItem.stock_actual <= invItem.stock_minimo

        // Sincronizar consumo e inventario en Supabase
        if (isSupabaseConfigured() && supabase) {
          try {
            await supabase.from('inventario_repuestos').update({
              stock_actual: invItem.stock_actual
            }).eq('id', invItem.id)

            if (order.id.length === 36 && invItem.id.length === 36) {
              await supabase.from('consumos_repuestos').insert([{
                orden_id: order.id,
                repuesto_id: invItem.id,
                cantidad: part.cantidad,
                registrado_por: user?.nombre_completo || 'Técnico'
              }])
            }
          } catch (e) {
            console.warn('Error descontando stock en Supabase:', e.message)
          }
        }
      }
    }
  }

  // Registro en historial
  if (!order.historial) order.historial = []
  order.historial.push({
    fecha: new Date().toLocaleString(),
    estado: newStatus,
    responsable: user?.nombre_completo || 'Técnico',
    nota: notes || `Transición de ${prevStatus} a ${newStatus}`
  })

  // Sincronizar en Supabase
  if (isSupabaseConfigured() && supabase) {
    try {
      const updatePayload = {
        estado: newStatus,
        diagnostico: order.diagnostico,
        trabajo_realizado: order.trabajo_realizado,
        pruebas_control_calidad: order.pruebas_control_calidad,
        tecnico_asignado_nombre: order.tecnico_asignado_nombre
      }

      let validUserId = null
      if (user?.id && user.id.length === 36) {
        if (associates.value.some(a => a.id === user.id)) {
          validUserId = user.id
        }
      }

      if (validUserId && user?.rol === 'tecnico') {
        updatePayload.tecnico_asignado_id = validUserId
      }

      const { error: updErr } = await supabase.from('ordenes_trabajo').update(updatePayload).eq('id', order.id)
      if (updErr) {
        throw updErr
      }

      if (order.id.length === 36) {
        await supabase.from('historial_estados').insert([{
          orden_id: order.id,
          estado_anterior: prevStatus,
          estado_nuevo: newStatus,
          revisor_id: validUserId,
          revisor_nombre: user?.nombre_completo || 'Técnico',
          observacion: notes || `Avanzado a ${newStatus}`
        }])
      }
    } catch (err) {
      console.error('Error sincronizando estado en Supabase:', err)
      isLoading.value = false
      throw new Error(`Error en base de datos al avanzar estado: ${err.message}`)
    }
  }

  saveToStorage()
  isLoading.value = false
  return order
}

export const assignTechnicianToOrder = async (orderId, technicianId, technicianName, assignedByUser) => {
  isLoading.value = true
  const order = orders.value.find(o => o.id === orderId)
  if (!order) {
    isLoading.value = false
    throw new Error('Orden no encontrada')
  }

  order.tecnico_asignado_id = technicianId || null
  order.tecnico_asignado_nombre = technicianName || null

  const note = technicianName
    ? `Técnico asignado: ${technicianName}`
    : 'Se desasignó el técnico del pedido'

  if (!order.historial) order.historial = []
  order.historial.push({
    fecha: new Date().toLocaleString(),
    estado: order.estado,
    responsable: assignedByUser?.nombre_completo || 'Administración',
    nota: note
  })

  if (isSupabaseConfigured() && supabase) {
    try {
      let validTechId = null
      if (technicianId && technicianId.length === 36 && associates.value.some(a => a.id === technicianId)) {
        validTechId = technicianId
      }

      let validAssignedById = null
      if (assignedByUser?.id && assignedByUser.id.length === 36 && associates.value.some(a => a.id === assignedByUser.id)) {
        validAssignedById = assignedByUser.id
      }

      const { error: updErr } = await supabase.from('ordenes_trabajo').update({
        tecnico_asignado_id: validTechId,
        tecnico_asignado_nombre: technicianName || null
      }).eq('id', order.id)

      if (updErr) throw updErr

      if (order.id.length === 36) {
        await supabase.from('historial_estados').insert([{
          orden_id: order.id,
          estado_anterior: order.estado,
          estado_nuevo: order.estado,
          revisor_id: validAssignedById,
          revisor_nombre: assignedByUser?.nombre_completo || 'Administración',
          observacion: note
        }])
      }
    } catch (err) {
      console.error('Error sincronizando asignación de técnico en Supabase:', err)
      isLoading.value = false
      throw new Error(`Error en base de datos al asignar técnico: ${err.message}`)
    }
  }

  saveToStorage()
  isLoading.value = false
  return order
}

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
    responsable: user?.nombre_completo || 'Usuario',
    nota: `Cancelación fundamentada (estaba en ${prevStatus}): ${reason}`
  })

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('ordenes_trabajo').update({
        estado: 'Cancelado'
      }).eq('id', order.id)

      if (order.id.length === 36) {
        await supabase.from('historial_estados').insert([{
          orden_id: order.id,
          estado_anterior: prevStatus,
          estado_nuevo: 'Cancelado',
          revisor_id: user?.id && user.id.length === 36 ? user.id : null,
          revisor_nombre: user?.nombre_completo || 'Usuario',
          observacion: `Cancelado: ${reason}`
        }])
      }
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
  const precio = Number(itemData.precio_estimado ?? itemData.precio_unitario_estimado) || 0
  const actual = Number(itemData.stock_actual) || 0
  const minimo = Number(itemData.stock_minimo) || 2
  const newItem = {
    id: `rep-${Date.now()}`,
    nombre: (itemData.nombre || '').trim(),
    categoria: itemData.categoria || 'Hardware',
    stock_actual: actual,
    stock_minimo: minimo,
    unidad_medida: itemData.unidad_medida || 'unidades',
    ubicacion: itemData.ubicacion || 'Taller de Hardware',
    precio_unitario_estimado: precio,
    precio_estimado: precio,
    alerta_stock: actual <= minimo
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('inventario_repuestos').insert([{
        nombre: newItem.nombre,
        categoria: newItem.categoria,
        stock_actual: newItem.stock_actual,
        stock_minimo: newItem.stock_minimo,
        unidad_medida: newItem.unidad_medida,
        ubicacion: newItem.ubicacion,
        precio_unitario_estimado: newItem.precio_unitario_estimado
      }]).select()

      if (!error && data && data.length > 0) {
        newItem.id = data[0].id
      }
    } catch (err) {
      console.warn('Error agregando repuesto a Supabase:', err)
    }
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
    comprobante: (entryData.comprobante || '').trim(),
    registrado_por: user?.nombre_completo || 'Tesorería'
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('libro_diario').insert([{
        fecha: newEntry.fecha,
        tipo_movimiento: newEntry.tipo,
        concepto: newEntry.concepto,
        categoria: newEntry.categoria,
        monto: newEntry.monto,
        comprobante_numero: newEntry.comprobante,
        registrado_por: newEntry.registrado_por
      }]).select()

      if (!error && data && data.length > 0) {
        newEntry.id = data[0].id
        newEntry.numero_asiento = data[0].numero_asiento || nextNum
      }
    } catch (err) {
      console.warn('Error registrando asiento en Supabase:', err)
    }
  }

  ledger.value.unshift(newEntry)
  saveToStorage()
  return newEntry
}

// ------------------------------------------------------------------------------
// OPERACIONES CRUD: Actas (Asamblea y Consejo)
// ------------------------------------------------------------------------------

export const addMinute = async (minuteData, user) => {
  const nextNum = minutes.value.length + 1
  const newMinute = {
    id: `acta-${Date.now()}`,
    numero: nextNum,
    tipo: minuteData.tipo,
    titulo: minuteData.titulo.trim(),
    fecha: minuteData.fecha || new Date().toISOString().split('T')[0],
    resumen: minuteData.resumen.trim(),
    firmantes: minuteData.firmantes || user?.nombre_completo || 'Consejo'
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('actas').insert([{
        tipo_acta: newMinute.tipo,
        numero_acta: nextNum,
        titulo: newMinute.titulo,
        fecha: newMinute.fecha,
        resumen_acuerdos: newMinute.resumen,
        firmantes: newMinute.firmantes
      }]).select()

      if (!error && data && data.length > 0) {
        newMinute.id = data[0].id
      }
    } catch (err) {
      console.warn('Error registrando acta en Supabase:', err)
    }
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
    createOrder,
    advanceOrderStatus,
    assignTechnicianToOrder,
    cancelOrder,
    updateInventoryStock,
    createInventoryItem,
    addLedgerEntry,
    addMinute
  }
}
