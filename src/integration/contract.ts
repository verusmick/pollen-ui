// Mensajes que el HOST (Vue) puede enviar a Next
export type HostToAppEvent =
  | { type: 'SET_LOCALE'; locale: string }
  | { type: 'SET_LOCATION'; lat: number; lon: number };

// Mensajes que Next puede enviar al HOST
export type AppToHostEvent =
  | { type: 'LOCATION_SELECTED'; id: string }
  | { type: 'MAP_MOVED'; bbox: [number, number, number, number] }
  | { type: 'READY' };