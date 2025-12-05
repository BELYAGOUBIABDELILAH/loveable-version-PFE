import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Star, ShieldCheck, Phone, Share2, Flag, Calendar, Languages, Award, Image as ImageIcon, Accessibility, Car, Building, Home, Eye, Hand, Loader2 } from "lucide-react";
import { FavoriteButton } from "@/components/FavoriteButton";
import { useToastNotifications } from "@/hooks/useToastNotifications";
import ToastContainer from "@/components/ToastContainer";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Provider = Tables<"providers">;
type Service = Tables<"services">;
type Schedule = Tables<"schedules">;
type Rating = Tables<"ratings">;
type Specialty = Tables<"specialties">;

interface ProviderWithRelations extends Provider {
  specialty?: Specialty | null;
  services?: Service[];
  schedules?: Schedule[];
  ratings?: Rating[];
  avgRating?: number;
  ratingCount?: number;
}

const getAccessibilityIcon = (feature: string) => {
  switch (feature) {
    case 'wheelchair':
      return <Accessibility className="h-4 w-4" />;
    case 'parking':
      return <Car className="h-4 w-4" />;
    case 'elevator':
      return <Building className="h-4 w-4" />;
    case 'ramp':
      return <Accessibility className="h-4 w-4" />;
    case 'accessible_restroom':
      return <ShieldCheck className="h-4 w-4" />;
    case 'braille':
      return <Eye className="h-4 w-4" />;
    case 'sign_language':
      return <Hand className="h-4 w-4" />;
    default:
      return <ShieldCheck className="h-4 w-4" />;
  }
};

const getAccessibilityLabel = (feature: string) => {
  switch (feature) {
    case 'wheelchair':
      return 'Wheelchair Accessible';
    case 'parking':
      return 'Accessible Parking';
    case 'elevator':
      return 'Elevator Access';
    case 'ramp':
      return 'Ramp Access';
    case 'accessible_restroom':
      return 'Accessible Restroom';
    case 'braille':
      return 'Braille Support';
    case 'sign_language':
      return 'Sign Language';
    default:
      return feature;
  }
};

const ProviderProfilePage = () => {
  const { id } = useParams();
  const { toasts } = useToastNotifications();
  const [provider, setProvider] = useState<ProviderWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProvider = async () => {
      if (!id) {
        setError("Provider ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch provider with related data
        const { data: providerData, error: providerError } = await supabase
          .from("providers")
          .select(`
            *,
            specialty:specialties(*),
            services(*),
            schedules(*),
            ratings(*)
          `)
          .eq("id", id)
          .single();

        if (providerError) throw providerError;

        if (!providerData) {
          setError("Provider not found");
          setLoading(false);
          return;
        }

        // Calculate average rating
        const ratings = providerData.ratings || [];
        const avgRating = ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
          : 0;

        setProvider({
          ...providerData,
          avgRating: Math.round(avgRating * 10) / 10,
          ratingCount: ratings.length,
        });
      } catch (err) {
        console.error("Error fetching provider:", err);
        setError(err instanceof Error ? err.message : "Failed to load provider");
      } finally {
        setLoading(false);
      }
    };

    fetchProvider();
  }, [id]);

  useEffect(() => {
    if (provider) {
      document.title = `${provider.business_name} – CityHealth Profile`;
    }
  }, [provider]);

  if (loading) {
    return (
      <main className="pt-24 pb-16 px-4 max-w-6xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </main>
    );
  }

  if (error || !provider) {
    return (
      <main className="pt-24 pb-16 px-4 max-w-6xl mx-auto">
        <Card className="glass-card">
          <CardContent className="p-8 text-center">
            <p className="text-lg text-muted-foreground">{error || "Provider not found"}</p>
            <Button className="mt-4" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  // Get specialty name (default to French)
  const specialtyName = provider.specialty?.name_fr || provider.provider_type;
  
  // Format schedules for display
  const todaySchedule = provider.schedules?.find(s => s.day_of_week === new Date().getDay() && s.is_active);
  const scheduleText = todaySchedule 
    ? `Today ${todaySchedule.start_time}–${todaySchedule.end_time}`
    : "Check availability";

  return (
    <main className="pt-24 pb-16 px-4 max-w-6xl mx-auto">
      <ToastContainer toasts={toasts} />
      {/* Header */}
      <section className="glass-card rounded-2xl p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-28 h-28 rounded-xl bg-primary/10 grid place-items-center text-primary overflow-hidden">
            {provider.avatar_url ? (
              <img src={provider.avatar_url} alt={provider.business_name} className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="h-10 w-10" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">{provider.business_name}</h1>
              {provider.verification_status === 'verified' && (
                <Badge className="verified-badge">Verified</Badge>
              )}
              {provider.is_emergency && (
                <Badge variant="destructive">24/7 Emergency</Badge>
              )}
            </div>
            <p className="text-muted-foreground">{specialtyName}</p>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className="inline-flex items-center gap-1 rating-stars">
                <Star className="h-4 w-4" /> {provider.avgRating?.toFixed(1) || 'N/A'}
              </span>
              <span className="text-muted-foreground">{provider.ratingCount || 0} reviews</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button>Book Appointment</Button>
            <FavoriteButton 
              providerId={provider.id} 
              variant="outline"
              size="md"
            />
            <Button variant="ghost"><Share2 className="h-4 w-4" /></Button>
            <Button variant="ghost"><Flag className="h-4 w-4" /></Button>
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          {/* About */}
          <Card className="glass-card">
            <CardHeader className="py-4"><CardTitle>About</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>{provider.description || "No description available."}</p>
              {provider.specialty && (
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{provider.specialty.name_fr}</Badge>
                </div>
              )}
              {provider.services && provider.services.length > 0 && (
                <div className="pt-3 border-t">
                  <h4 className="font-medium mb-2">Services Offered</h4>
                  <div className="flex flex-wrap gap-2">
                    {provider.services.map((service) => (
                      <Badge key={service.id} variant="outline">
                        {service.name_fr}
                        {service.price && ` - ${service.price} DZD`}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Accessibility Features */}
              {(provider.accessibility_features?.length > 0 || provider.home_visit_available) && (
                <div className="pt-3 border-t">
                  <h4 className="font-medium mb-2">Accessibility & Services</h4>
                  <div className="space-y-2">
                    {provider.accessibility_features?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {provider.accessibility_features.map((feature) => (
                          <Badge key={feature} variant="secondary" className="flex items-center gap-1">
                            {getAccessibilityIcon(feature)}
                            {getAccessibilityLabel(feature)}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {provider.home_visit_available && (
                      <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                        <Home className="h-4 w-4" />
                        Home Visits Available
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gallery */}
          <Card className="glass-card">
            <CardHeader className="py-4"><CardTitle>Gallery</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-video rounded-lg bg-muted/50" />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card className="glass-card">
            <CardHeader className="py-4"><CardTitle>Recent Reviews</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {provider.ratings && provider.ratings.length > 0 ? (
                <>
                  {provider.ratings.slice(0, 3).map((rating) => (
                    <div key={rating.id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">User</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(rating.created_at || '').toLocaleDateString()}
                        </span>
                        <span className="ml-auto inline-flex items-center gap-1 rating-stars">
                          <Star className="h-4 w-4" /> {rating.rating.toFixed(1)}
                        </span>
                      </div>
                      {rating.comment && <p className="text-sm">{rating.comment}</p>}
                    </div>
                  ))}
                  {provider.ratings.length > 3 && (
                    <div className="flex justify-end">
                      <Button variant="outline">View all {provider.ratings.length} reviews</Button>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No reviews yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Contact */}
          <Card className="glass-card">
            <CardHeader className="py-4"><CardTitle>Contact</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{provider.address}{provider.city && `, ${provider.city}`}</span>
              </div>
              <div className="space-y-1">
                <a href={`tel:${provider.phone}`} className="flex items-center gap-2 underline">
                  <Phone className="h-4 w-4" /> {provider.phone}
                </a>
                {provider.email && (
                  <a href={`mailto:${provider.email}`} className="flex items-center gap-2 underline text-xs">
                    {provider.email}
                  </a>
                )}
                {provider.website && (
                  <a href={provider.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 underline text-xs">
                    Visit website
                  </a>
                )}
              </div>
              <div className="text-xs text-muted-foreground">Opening hours: {scheduleText}</div>
              <Button variant="outline" className="w-full mt-2">
                <Calendar className="h-4 w-4 mr-2" /> Check availability
              </Button>
            </CardContent>
          </Card>

          {/* Map */}
          <Card className="glass-card">
            <CardHeader className="py-4"><CardTitle>Location</CardTitle></CardHeader>
            <CardContent>
              <div className="rounded-lg h-56 bg-gradient-to-br from-muted/50 to-secondary/20 grid place-items-center text-muted-foreground">
                Google Maps placeholder
              </div>
              <Button variant="outline" className="w-full mt-3">Open in Maps</Button>
            </CardContent>
          </Card>

          {/* Offers */}
          <Card className="glass-card">
            <CardHeader className="py-4"><CardTitle>Announcements</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="p-3 rounded-lg bg-primary/10">New echocardiography service this month.</div>
              <div className="p-3 rounded-lg bg-secondary/10">Extended hours on Saturday.</div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
};

export default ProviderProfilePage;
