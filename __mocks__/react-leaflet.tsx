import React from 'react'

export const MapContainer = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="map-container">{children}</div>
)
export const TileLayer = () => null
export const Polyline = () => null
export const useMap = () => ({
  setView: jest.fn(),
  addLayer: jest.fn(),
  removeLayer: jest.fn(),
})
export const CircleMarker = ({ children }: { children?: React.ReactNode }) => (
  <div data-testid="circle-marker">{children}</div>
)
export const Tooltip = ({ children }: { children?: React.ReactNode }) => (
  <div data-testid="tooltip">{children}</div>
)
export const useMapEvents = (handlers: Record<string, (e: unknown) => void>) => null
