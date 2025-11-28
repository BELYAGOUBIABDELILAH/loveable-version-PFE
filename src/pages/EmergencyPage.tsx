import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Ambulance, MapPin, PhoneCall, Clock, Filter, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { OFFLINE_MODE } from "@/config/app";
import { getProviders } from "@/data/providers";

type Provider = Tables<"providers">;

interface EmergencyProvider extends Provider {
  distance?: number; // Will be calculated based on location
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
          const { data, error } = await supabase
            .from("providers")
            .select("*")
            .eq("is_emergency", true)
            .eq("verification_status", "verified")
            .order("business_name");

          if (error) throw error;

          // Calculate mock distances
          providersWithDistance = (data || []).map((provider, index) => ({
            ...provider,
            distance: Math.round((1 + index * 1.5) * 10) / 10,
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

    // Set up real-time subscription for updates (only if not offline)
    if (!OFFLINE_MODE) {
      const channel = supabase
        .channel("emergency-providers")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "providers",
            filter: "is_emergency=eq.true",
          },
          () => {
            fetchEmergencyProviders();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
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

        {/* Right: Map Placeholder */}
        <div className="lg:col-span-2">
          <Card className="glass-card h-[520px]">
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Emergency map (Google Maps coming soon)</CardTitle>
            </CardHeader>
            <CardContent className="h-full">
              <div className="w-full h-full rounded-lg bg-gradient-to-br from-muted/50 to-secondary/20 grid place-items-center text-muted-foreground">
                <div className="text-center">
                  <Ambulance className="mx-auto mb-2" />
                  <p>Interactive map placeholder</p>
                </div>
              </div>
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
