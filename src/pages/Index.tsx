
import { useState } from "react";
import { Search, MapPin, Phone, Clock, Users, Heart, Stethoscope, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AnimatedTransition from "@/components/AnimatedTransition";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import MobileAppSection from "@/components/MobileAppSection";
import MapSection from "@/components/MapSection";
import Footer from "@/components/Footer";
import ParticleBackground from "@/components/ParticleBackground";
import ScrollToTop from "@/components/ScrollToTop";
import LoadingSpinner from "@/components/LoadingSpinner";
import SkeletonCard from "@/components/SkeletonCard";
import CounterAnimation from "@/components/CounterAnimation";
import { FavoriteButton } from "@/components/FavoriteButton";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useToastNotifications } from "@/hooks/useToastNotifications";
import ToastContainer from "@/components/ToastContainer";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const heroRef = useScrollReveal();
  const statsRef = useScrollReveal();
  const providersRef = useScrollReveal();
  
  const { toasts, addToast } = useToastNotifications();

  const serviceTypes = [
    "Hospitals",
    "Clinics", 
    "Private Doctors",
    "Pharmacies",
    "Laboratories",
    "Dental Care",
    "Emergency Services"
  ];

  const locations = [
    "Centre Ville",
    "Hay El Badr",
    "Sidi Bel Abbès Est",
    "Sidi Bel Abbès Ouest",
    "Peripherie Nord",
    "Peripherie Sud"
  ];

  const featuredProviders = [
    {
      id: 1,
      name: "Hôpital Universitaire Dr. Hassani Abdelkader",
      type: "Hospital",
      location: "Centre Ville",
      rating: 4.8,
      isVerified: true,
      isEmergency: true,
      image: "/placeholder.svg"
    },
    {
      id: 2,
      name: "Cabinet Dr. Benali (Cardiologue)",
      type: "Private Doctor",
      location: "Hay El Badr", 
      rating: 4.9,
      isVerified: true,
      homeVisits: true,
      image: "/placeholder.svg"
    },
    {
      id: 3,
      name: "Pharmacie Centrale",
      type: "Pharmacy",
      location: "Centre Ville",
      rating: 4.7,
      isVerified: true,
      is24h: true,
      image: "/placeholder.svg"
    }
  ];

  const stats = [
    { label: "Verified Providers", value: "150+", icon: Heart },
    { label: "Happy Citizens", value: "5,000+", icon: Users },
    { label: "Emergency Services", value: "24/7", icon: Clock },
    { label: "Coverage Areas", value: "6", icon: MapPin }
  ];

  const handleSearch = () => {
    if (!searchQuery && !selectedService && !selectedLocation) {
      addToast({
        type: 'warning',
        title: 'Search Empty',
        message: 'Please enter a search term or select filters'
      });
      return;
    }
    
    setIsLoading(true);
    
    // Simulate search with loading
    setTimeout(() => {
      setIsLoading(false);
      addToast({
        type: 'success',
        title: 'Search Complete',
        message: `Found providers for: ${searchQuery || selectedService || selectedLocation}`
      });
      // Navigate to search results page
      console.log("Searching for:", { searchQuery, selectedService, selectedLocation });
    }, 1500);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticleBackground />
      <ToastContainer toasts={toasts} />
      {/* Hero Section */}
      <AnimatedTransition show={true} animation="fade">
        <section ref={heroRef} className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20 px-4 min-h-screen flex items-center">
          <div className="max-w-6xl mx-auto text-center w-full">
            <div className="mb-8 animate-slide-up">
              <div className="flex items-center justify-center gap-3 mb-6 animate-float">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center animate-glow">
                  <Stethoscope className="text-primary" size={24} />
                </div>
                <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-gradient">
                  CityHealth
                </h1>
              </div>
              <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-foreground animate-slide-up" style={{ animationDelay: '0.2s' }}>
                Sidi Bel Abbès Healthcare Directory
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.4s' }}>
                Find verified healthcare providers, access emergency services, and connect with trusted medical professionals in your area
              </p>
            </div>

            {/* Search Section */}
            <div className="max-w-4xl mx-auto glass-card rounded-2xl p-6 border shadow-lg animate-scale-in hover-lift" style={{ animationDelay: '0.6s' }}>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Service Type</label>
                  <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose service" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTypes.map((service) => (
                        <SelectItem key={service} value={service}>
                          {service}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose area" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      placeholder="Doctor name, specialty..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={handleSearch} 
                size="lg" 
                className="w-full md:w-auto ripple-effect disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Search className="mr-2" size={18} />
                    Find Healthcare Providers
                  </>
                )}
              </Button>
            </div>

            {/* Emergency Button */}
            <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center justify-center animate-slide-up" style={{ animationDelay: '0.8s' }}>
              <Button variant="destructive" size="lg" className="animate-pulse-slow hover:animate-bounce-soft ripple-effect">
                <Phone className="mr-2" size={18} />
                Emergency Services - Call 15
              </Button>
              <Button variant="outline" size="lg" className="hover-lift ripple-effect">
                <Activity className="mr-2" size={18} />
                24/7 Available Providers
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section ref={statsRef} className="py-16 px-4 bg-muted/5">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {stats.map((stat, index) => (
                <div key={index} className="space-y-3 animate-slide-up hover-lift" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto animate-float" style={{ animationDelay: `${index * 0.5}s` }}>
                    <stat.icon className="text-primary" size={24} />
                  </div>
                  <div>
                    <CounterAnimation end={parseInt(stat.value.replace(/\D/g, '') || '0')} className="text-3xl font-bold text-primary" suffix={stat.value.replace(/\d/g, '')} />
                    <div className="text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Providers */}
        <section ref={providersRef} className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 animate-slide-up">
              <h2 className="text-3xl font-bold mb-4">Featured Healthcare Providers</h2>
              <p className="text-muted-foreground">Verified and trusted by our community</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <SkeletonCard key={index} />
                ))
              ) : (
                featuredProviders.map((provider, index) => (
                  <Card key={provider.id} className="hover:shadow-lg transition-all duration-300 cursor-pointer glass-card hover-lift animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{provider.name}</h3>
                          {provider.isVerified && (
                            <Badge variant="secondary" className="text-xs">✓ Verified</Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground text-sm">{provider.type}</p>
                      </div>
                      <FavoriteButton
                        providerId={provider.id.toString()}
                        variant="ghost"
                        size="sm"
                      />
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-muted-foreground" />
                        <span>{provider.location}</span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Heart size={16} className="text-red-500 fill-red-500" />
                          <span>{provider.rating}</span>
                        </div>
                        
                        {provider.isEmergency && (
                          <Badge variant="destructive" className="text-xs">24/7 Emergency</Badge>
                        )}
                        
                        {provider.homeVisits && (
                          <Badge variant="outline" className="text-xs">🏠 Home Visits</Badge>
                        )}
                        
                        {provider.is24h && (
                          <Badge variant="secondary" className="text-xs">24/7</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                ))
              )}
            </div>
            
            
            <div className="text-center mt-8 animate-slide-up">
              <Button variant="outline" size="lg" className="hover-lift ripple-effect">
                View All Providers
              </Button>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="py-16 px-4 bg-muted/5">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8 animate-slide-up">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 glass-card hover-lift transition-all duration-300 cursor-pointer animate-scale-in">
                <CardContent className="space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Users className="text-primary" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold">Register as Provider</h3>
                  <p className="text-muted-foreground">
                    Join our verified healthcare provider network and connect with patients
                  </p>
                  <Button className="w-full ripple-effect">
                    Get Started
                  </Button>
                </CardContent>
              </Card>
              
              
              <Card className="p-6 glass-card hover-lift transition-all duration-300 cursor-pointer animate-scale-in" style={{ animationDelay: '0.2s' }}>
                <CardContent className="space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Search className="text-primary" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold">Find Nearby Care</h3>
                  <p className="text-muted-foreground">
                    Use our smart search to find healthcare providers near your location
                  </p>
                  <Button variant="outline" className="w-full ripple-effect">
                    Search Now
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <TestimonialsSection showTestimonials={true} />

        {/* Map Section */}
        <MapSection />

        {/* Mobile App Section */}
        <MobileAppSection />
      </AnimatedTransition>

      
      {/* Scroll to Top Button */}
      <ScrollToTop />
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
