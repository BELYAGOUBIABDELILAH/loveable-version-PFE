import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Phone, Building2, Accessibility } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

// Google Blue accent color for markers
const MARKER_COLOR = '#4285F4';

// Create custom marker icon matching design system
const createCustomIcon = (isVerified: boolean = false, isEmergency: boolean = false) => {
  const color = isEmergency ? '#DC2626' : isVerified ? MARKER_COLOR : '#6B7280';
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Default marker icon
export const defaultMarkerIcon = createCustomIcon(false, false);
export const verifiedMarkerIcon = createCustomIcon(true, false);
export const emergencyMarkerIcon = createCustomIcon(false, true);

export interface ProviderMarkerProps {
  id: string;
  business_name: string;
  provider_type: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  verification_status?: string;
  is_emergency?: boolean;
  accessibility_features?: string[];
  home_visit_available?: boolean;
  onClick?: () => void;
}

export function ProviderMarker({
  id,
  business_name,
  provider_type,
  address,
  phone,
  latitude,
  longitude,
  verification_status,
  is_emergency = false,
  accessibility_features = [],
  home_visit_available = false,
  onClick,
}: ProviderMarkerProps) {
  const isVerified = verification_status === 'verified';
  const icon = is_emergency 
    ? emergencyMarkerIcon 
    : isVerified 
      ? verifiedMarkerIcon 
      : defaultMarkerIcon;

  return (
    <Marker
      position={[latitude, longitude]}
      icon={icon}
      eventHandlers={{
        click: onClick,
      }}
    >
      <Popup>
        <div className="min-w-[200px] p-1">
          {/* Provider Name */}
          <h3 className="font-semibold text-base mb-1 flex items-center gap-2">
            {business_name}
            {isVerified && (
              <Badge variant="secondary" className="text-xs">
                ✓ Vérifié
              </Badge>
            )}
          </h3>
          
          {/* Provider Type */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Building2 size={14} />
            <span>{provider_type}</span>
          </div>
          
          {/* Address */}
          <div className="flex items-start gap-2 text-sm mb-2">
            <MapPin size={14} className="mt-0.5 flex-shrink-0" />
            <span>{address}</span>
          </div>
          
          {/* Phone */}
          <div className="flex items-center gap-2 text-sm mb-2">
            <Phone size={14} />
            <a 
              href={`tel:${phone}`} 
              className="text-primary hover:underline"
            >
              {phone}
            </a>
          </div>
          
          {/* Accessibility Features */}
          {accessibility_features.length > 0 && (
            <div className="flex items-center gap-2 text-sm mb-2">
              <Accessibility size={14} />
              <span className="text-xs text-muted-foreground">
                {accessibility_features.join(', ')}
              </span>
            </div>
          )}
          
          {/* Badges */}
          <div className="flex flex-wrap gap-1 mb-3">
            {is_emergency && (
              <Badge variant="destructive" className="text-xs">
                Urgences 24/7
              </Badge>
            )}
            {home_visit_available && (
              <Badge variant="outline" className="text-xs">
                Visite à domicile
              </Badge>
            )}
          </div>
          
          {/* Action Button */}
          <Link to={`/provider/${id}`}>
            <Button size="sm" className="w-full">
              Voir le profil
            </Button>
          </Link>
        </div>
      </Popup>
    </Marker>
  );
}

export default ProviderMarker;
