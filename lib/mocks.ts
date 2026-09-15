import type { RoomCardData } from '@/components/RoomCard'

export type HabitatRoom = RoomCardData & {
  university: string
  type: string
  amenities: string[]
  description: string
  host: string
}

export const universities = ['UNSA', 'UCSM', 'Universidad Católica San Pablo', 'UTP', 'Universidad La Salle']

export const mockRooms: HabitatRoom[] = [
  { id: 1, title: 'Habitación privada cerca de la UCSM', district: 'Yanahuara, Arequipa', price: 650, distance: '1.2 km de la UCSM', image: '/habitat-room.png', services: 'Amoblado · WiFi · Agua incluida', verified: true, university: 'UCSM', type: 'Habitación individual', amenities: ['WiFi', 'Agua incluida', 'Luz incluida', 'Cocina', 'Escritorio', 'Cama y armario'], description: 'Habitación iluminada y amoblada en una casa tranquila, a pocos minutos caminando de la universidad.', host: 'Carlos M.' },
  { id: 2, title: 'Mini departamento para estudiantes', district: 'Cayma, Arequipa', price: 950, distance: '1.8 km de la UCSM', image: '/habitat-hero.png', services: 'Cocina · Lavandería · Luz incluida', university: 'UCSM', type: 'Departamento', amenities: ['WiFi', 'Cocina', 'Lavandería', 'Luz incluida'], description: 'Mini departamento independiente con cocina y espacios pensados para estudiar.', host: 'María R.' },
  { id: 3, title: 'Habitación luminosa en el centro', district: 'Cercado, Arequipa', price: 480, distance: '0.8 km de la UNSA', image: '/habitat-room.png', services: 'Escritorio · WiFi · Baño privado', university: 'UNSA', type: 'Habitación individual', amenities: ['WiFi', 'Baño privado', 'Escritorio'], description: 'Un espacio práctico, seguro y cercano al campus de la UNSA.', host: 'Ana P.' },
  { id: 4, title: 'Casa compartida para universitarios', district: 'José Luis Bustamante, Arequipa', price: 420, distance: '1.5 km de la UNSA', image: '/habitat-hero.png', services: 'Cocina · Patio · Limpieza', university: 'UNSA', type: 'Habitación compartida', amenities: ['Cocina', 'Patio', 'Limpieza'], description: 'Comparte una casa amplia con otros estudiantes y todos los servicios básicos.', host: 'Luis G.' },
]

export const mockVisits = [
  { id: 1, room: mockRooms[0], date: 'Sábado 19 de octubre', shift: 'Mañana · 9:00 - 12:00', status: 'Pendiente' },
  { id: 2, room: mockRooms[2], date: 'Martes 22 de octubre', shift: 'Tarde · 14:00 - 18:00', status: 'Confirmada' },
]

export const mockRequests = [
  { id: 1, name: 'Valeria Quispe', initials: 'VQ', room: mockRooms[0], date: 'Sábado 19 de octubre', shift: 'Mañana · 9:00 - 12:00', status: 'Pendiente', message: 'Hola, me interesa conocer el cuarto. ¿Puedo visitarlo este sábado?' },
  { id: 2, name: 'Diego Ramos', initials: 'DR', room: mockRooms[1], date: 'Domingo 20 de octubre', shift: 'Tarde · 14:00 - 18:00', status: 'Pendiente', message: 'Estoy buscando mudarme el próximo mes.' },
]

export const mockConversations = [
  { id: 1, name: 'Carlos M.', initials: 'CM', room: mockRooms[0], preview: '¡Hola! Sí, todavía está disponible.', time: '10:42', messages: [{ from: 'them', text: '¡Hola! Sí, todavía está disponible.', time: '10:40' }, { from: 'me', text: 'Genial, me gustaría coordinar una visita.', time: '10:42' }] },
  { id: 2, name: 'María R.', initials: 'MR', room: mockRooms[1], preview: 'Te comparto los detalles del espacio.', time: 'Ayer', messages: [{ from: 'them', text: 'Te comparto los detalles del espacio.', time: 'Ayer' }] },
]
