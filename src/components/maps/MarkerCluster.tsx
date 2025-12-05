import MarkerClusterGroup from 'react-leaflet-cluster';
import { ProviderMarker, ProviderMarkerProps } from './ProviderMarker';
import L from 'leaflet';

// Type for marker cluster (react-leaflet-cluster doesn't export this)
interface MarkerClusterType {
  getChildCount(): number;
}

// Google Blue accent color for clusters
const CLUSTER_COLOR = '#4285F4';

// Create custom cluster icon matching design system
const createClusterCustomIcon = (cluster: MarkerClusterType) => {
  const count = cluster.getChildCount();
  
  // Determine size based on count
  let size = 40;
  let fontSize = 14;
  if (count >= 100) {
    size = 50;
    fontSize = 16;
  } else if (count >= 10) {
    size = 45;
    fontSize = 15;
  }
  
  return L.divIcon({
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${CLUSTER_COLOR};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 4px 12px rgba(66, 133, 244, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 600;
        font-size: ${fontSize}px;
        font-family: 'Google Sans', 'DM Sans', sans-serif;
      ">
        ${count}
      </div>
    `,
    className: 'custom-cluster-icon',
    iconSize: L.point(size, size),
  });
};

// Cluster configuration options
const CLUSTER_OPTIONS = {
  maxClusterRadius: 50,
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true,
  disableClusteringAtZoom: 18,
  iconCreateFunction: createClusterCustomIcon,
};

export interface MarkerClusterProps {
  providers: ProviderMarkerProps[];
  onMarkerClick?: (providerId: string) => void;
}

export function MarkerCluster({ providers, onMarkerClick }: MarkerClusterProps) {
  return (
    <MarkerClusterGroup {...CLUSTER_OPTIONS}>
      {providers.map((provider) => (
        <ProviderMarker
          key={provider.id}
          {...provider}
          onClick={() => onMarkerClick?.(provider.id)}
        />
      ))}
    </MarkerClusterGroup>
  );
}

export default MarkerCluster;

// Export cluster options for testing
export const clusterOptions = CLUSTER_OPTIONS;
