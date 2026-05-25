const L = {
  circleMarker: jest.fn(() => ({
    on: jest.fn().mockReturnThis(),
    addTo: jest.fn().mockReturnThis(),
    bindTooltip: jest.fn().mockReturnThis(),
    remove: jest.fn(),
    setStyle: jest.fn(),
  })),
  polyline: jest.fn(() => ({
    addTo: jest.fn().mockReturnThis(),
    remove: jest.fn(),
  })),
  divIcon: jest.fn(() => ({ options: {} })),
}
export default L
module.exports = L
