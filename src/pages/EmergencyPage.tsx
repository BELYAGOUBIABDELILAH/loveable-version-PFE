import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Ambulance, MapPin, PhoneCall, Filter, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { getEmergencyProviders } from "@/integrations/firebase/services/providerService";
import { OFFLINE_MODE } from "@/config/app";
import { getProviders } from "@/data/providers";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Custom emergency marker icon (red)
const emergencyIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface EmergencyProvider {
  id: string;
  user_id: string | null;
  business_name: string;
  provider_type: string;
  specialty_id: string | null;
  phone: string;
  email: string | null;
  address: string;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  avatar_url: string | null;
  cover_image_url: string | null;
  website: string | null;
  verification_status: string;
  is_emergency: boolean;
  is_preloaded: boolean;
  is_claimed: boolean;
  accessibility_features: string[];
  home_visit_available: boolean;
  created_at: string;
  updated_at: string;
  distance?: number;
}

const EmergencyPage = () => {
  const [providers, setProviders] = useState<EmergencyProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<string>("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    document.title = "CityHealth – Emergency Services";
  }, []);

  // Fetch emergency providers
  useEffect(() => {
    const fetchEmergencyProviders = async () => {
      try {
        setLoading(true);
        
        let providersWithDistance: EmergencyProvider[] = [];

        if (OFFLINE_MODE) {
          // Mode offline: utiliser les données mock
          const mockProviders = getProviders();
          providersWithDistance = mockProviders
            .filter(p => p.emergency && p.verified)
            .map((p, index) => ({
              id: p.id,
              user_id: null,
              business_name: p.name,
              provider_type: p.type as any,
              specialty_id: null,
              phone: p.phone,
              email: null,
              address: p.address,
              city: p.city,
              latitude: p.lat,
              longitude: p.lng,
              description: p.description,
              avatar_url: p.image,
              cover_image_url: null,
              website: null,
              verification_status: 'verified' as const,
              is_emergency: true,
              is_preloaded: p.is_preloaded,
              is_claimed: p.is_claimed,
              accessibility_features: p.accessibility_features,
              home_visit_available: p.home_visit_available,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              distance: Math.round((1 + index * 1.5) * 10) / 10,
            }));
        } else {
          // Fetch from Firebase
          const firebaseProviders = await getEmergencyProviders();

          // Map to component format and calculate mock distances
          providersWithDistance = firebaseProviders.map((p, index) => ({
            id: p.id,
            user_id: p.userId,
            business_name: p.businessName,
            provider_type: p.providerType,
            specialty_id: p.specialtyId || null,
            phone: p.phone,
            email: p.email || null,
            address: p.address,
            city: p.city || null,
            latitude: p.latitude || null,
            longitude: p.longitude || null,
            description: p.description || null,
            avatar_url: p.avatarUrl || null,
            cover_image_url: p.coverImageUrl || null,
            website: p.website || null,
            verification_status: p.verificationStatus,
            is_emergency: p.isEmergency,
            is_preloaded: p.isPreloaded,
            is_claimed: p.isClaimed,
            accessibility_features: p.accessibilityFeatures || [],
            home_visit_available: p.homeVisitAvailable,
            created_at: p.createdAt?.toDate?.() 
              ? p.createdAt.toDate().toISOString() 
              : String(p.createdAt),
            updated_at: p.updatedAt?.toDate?.() 
              ? p.updatedAt.toDate().toISOString() 
              : String(p.updatedAt),            distance: Math.round((1 + index * 1.5) * 10) / 10,
          }));
        }

        setProviders(providersWithDistance);
      } catch (error) {
        console.error("Error fetching emergency providers:", error);
        // Fallback vers les données mock
        const mockProviders = getProviders();
        const fallback = mockProviders
          .filter(p => p.emergency)
          .map((p, index) => ({
            id: p.id,
            user_id: null,
            business_name: p.name,
            provider_type: p.type as any,
            specialty_id: null,
            phone: p.phone,
            email: null,
            address: p.address,
            city: p.city,
            latitude: p.lat,
            longitude: p.lng,
            description: p.description,
            avatar_url: p.image,
            cover_image_url: null,
            website: null,
            verification_status: 'verified' as const,
            is_emergency: true,
            is_preloaded: p.is_preloaded,
            is_claimed: p.is_claimed,
            accessibility_features: p.accessibility_features,
            home_visit_available: p.home_visit_available,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            distance: Math.round((1 + index * 1.5) * 10) / 10,
          }));
        setProviders(fallback);
      } finally {
        setLoading(false);
      }
    };

    fetchEmergencyProviders();

    // Note: Real-time subscriptions would need to be implemented with Firebase onSnapshot
    // For now, we just fetch on mount
  }, []);

  const filtered = useMemo(() => {
    return providers.filter(
      (p) =>
        (type === "all" || p.provider_type === type) &&
        p.business_name.toLowerCase().includes(q.toLowerCase())
    );
  }, [providers, type, q]);

  return (
    <main className="pt-24 pb-16 px-4 max-w-6xl mx-auto">
      <header className="emergency-alert flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-semibold">EMERGENCY • Open services near you</span>
        </div>
        <a href="tel:14" className="inline-flex items-center gap-2 underline">
          <PhoneCall className="h-4 w-4" /> Call 14
        </a>
      </header>

      <section className="mt-6 grid lg:grid-cols-3 gap-6">
        {/* Left: Filters + List */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <CardTitle className="text-lg">Filters</CardTitle>
              <Filter className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="hospital">Hospitals</SelectItem>
                  <SelectItem value="clinic">Clinics</SelectItem>
                  <SelectItem value="pharmacy">On-duty Pharmacies</SelectItem>
                  <SelectItem value="doctor">Doctors</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Search service…" value={q} onChange={(e) => setQ(e.target.value)} />
            </CardContent>
          </Card>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                No emergency services found
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filtered.map((provider) => (
                <Card key={provider.id} className="glass-card hover-lift cursor-pointer" onClick={() => window.location.href = `/provider/${provider.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{provider.business_name}</span>
                          <span className="verified-badge">24/7</span>
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                          <Ambulance className="h-4 w-4" /> {provider.provider_type}
                          {provider.distance && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-4 w-4" /> {provider.distance} km
                            </span>
                          )}
                        </div>
                        {provider.address && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {provider.address}
                          </div>
                        )}
                      </div>
                      <a 
                        className="text-sm underline" 
                        href={`tel:${provider.phone}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {provider.phone}
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right: Emergency Services Map */}
        <div className="lg:col-span-2">
          <Card className="glass-card h-[520px]">
            <CardHeader className="py-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Ambulance className="h-5 w-5 text-red-500" />
                Emergency Services Map
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[calc(100%-60px)] p-2">
              <MapContainer
                center={[35.1833, -0.6333]} // Sidi Bel Abbès center
                zoom={13}
                className="w-full h-full rounded-lg z-0"
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MarkerClusterGroup
                  chunkedLoading
                  maxClusterRadius={50}
                  spiderfyOnMaxZoom={true}
                  showCoverageOnHover={false}
                >
                  {filtered
                    .filter((p) => p.latitude && p.longitude)
                    .map((provider) => (
                      <Marker
                        key={provider.id}
                        position={[provider.latitude!, provider.longitude!]}
                        icon={emergencyIcon}
                      >
                        <Popup>
                          <div className="min-w-[200px]">
                            <h3 className="font-bold text-red-600">{provider.business_name}</h3>
                            <p className="text-sm text-gray-600 capitalize">{provider.provider_type}</p>
                            <p className="text-sm mt-1">{provider.address}</p>
                            <a
                              href={`tel:${provider.phone}`}
                              className="inline-flex items-center gap-1 mt-2 text-red-600 font-semibold hover:underline"
                            >
                              <PhoneCall className="h-4 w-4" />
                              {provider.phone}
                            </a>
                            <div className="mt-2">
                              <span className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                                24/7 Emergency
                              </span>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                </MarkerClusterGroup>
              </MapContainer>
            </CardContent>
          </Card>

          {/* First aid guide */}
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            {[
              { title: "Bleeding", tip: "Apply pressure with a clean cloth and call 14 if severe." },
              { title: "Fracture", tip: "Immobilize the limb; avoid moving the patient unnecessarily." },
              { title: "Burn", tip: "Cool under running water for 10 minutes; do not apply creams." },
            ].map((g) => (
              <Card key={g.title} className="glass-card">
                <CardHeader className="py-4"><CardTitle className="text-base">{g.title}</CardTitle></CardHeader>
                <CardContent className="text-sm text-muted-foreground">{g.tip}</CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default EmergencyPage;
