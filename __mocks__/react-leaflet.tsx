import React from 'react'

export const MapContainer = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="map-container">{children}</div>
)
export const TileLayer = () => null
export const Polyline = () => null
export const Marker = ({ children, eventHandlers }: { children?: React.ReactNode; eventHandlers?: Record<string, () => void> }) => (
  <div data-testid="marker" onClick={eventHandlers?.click}>{children}</div>
)
export const CircleMarker = ({ children }: { children?: React.ReactNode }) => (
  <div data-testid="circle-marker">{children}</div>
)
export const Tooltip = ({ children }: { children?: React.ReactNode }) => (
  <div data-testid="tooltip">{children}</div>
)
export const useMap = () => ({
  setView: jest.fn(),
  addLayer: jest.fn(),
  removeLayer: jest.fn(),
  fire: jest.fn(),
})
export const useMapEvents = (_handlers: Record<string, (_e: unknown) => void>) => null
