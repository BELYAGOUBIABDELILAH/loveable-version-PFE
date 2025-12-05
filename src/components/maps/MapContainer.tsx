import { MapContainer as LeafletMapContainer, TileLayer, useMap } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import { useEffect, ReactNode } from 'react';

// Default center: Sidi Bel Abbès, Algeria
const DEFAULT_CENTER: LatLngExpression = [35.1833, -0.6333];
const DEFAULT_ZOOM = 13;

// OpenStreetMap tile configuration
const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

interface MapContainerProps {
  center?: LatLngExpression;
  zoom?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: ReactNode;
  onMapReady?: (map: L.Map) => void;
}

// Component to handle map ready callback
function MapReadyHandler({ onMapReady }: { onMapReady?: (map: L.Map) => void }) {
  const map = useMap();
  
  useEffect(() => {
    if (onMapReady) {
      onMapReady(map);
    }
  }, [map, onMapReady]);
  
  return null;
}

// Component to center map on user location
export function GeolocationControl() {
  const map = useMap();
  
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          map.setView([latitude, longitude], 14);
        },
        () => {
          // Keep default center if geolocation fails
        }
      );
    }
  }, [map]);
  
  return null;
}

export function MapContainerWrapper({
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  className = '',
  style,
  children,
  onMapReady,
}: MapContainerProps) {
  return (
    <LeafletMapContainer
      center={center}
      zoom={zoom}
      className={className}
      style={style || { height: '100%', width: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution={TILE_ATTRIBUTION}
        url={TILE_URL}
      />
      <MapReadyHandler onMapReady={onMapReady} />
      {children}
    </LeafletMapContainer>
  );
}

export default MapContainerWrapper;

// Export constants for use in other components
export const MAP_CONFIG = {
  defaultCenter: DEFAULT_CENTER,
  defaultZoom: DEFAULT_ZOOM,
  tileUrl: TILE_URL,
  tileAttribution: TILE_ATTRIBUTION,
};
