
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

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

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
    // Navigate to search results page
    console.log("Searching for:", { searchQuery, selectedService, selectedLocation });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <AnimatedTransition show={true} animation="fade">
        <section className="relative bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-20 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="mb-8">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <Stethoscope className="text-primary" size={24} />
                </div>
                <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  CityHealth
                </h1>
              </div>
              <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-foreground">
                Sidi Bel Abbès Healthcare Directory
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Find verified healthcare providers, access emergency services, and connect with trusted medical professionals in your area
              </p>
            </div>

            {/* Search Section */}
            <div className="max-w-4xl mx-auto bg-card/80 backdrop-blur-sm rounded-2xl p-6 border shadow-lg">
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
              
              <Button onClick={handleSearch} size="lg" className="w-full md:w-auto">
                <Search className="mr-2" size={18} />
                Find Healthcare Providers
              </Button>
            </div>

            {/* Emergency Button */}
            <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center justify-center">
              <Button variant="destructive" size="lg" className="animate-pulse">
                <Phone className="mr-2" size={18} />
                Emergency Services - Call 15
              </Button>
              <Button variant="outline" size="lg">
                <Activity className="mr-2" size={18} />
                24/7 Available Providers
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-4 bg-muted/5">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              {stats.map((stat, index) => (
                <div key={index} className="space-y-3">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <stat.icon className="text-primary" size={24} />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary">{stat.value}</div>
                    <div className="text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Providers */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Featured Healthcare Providers</h2>
              <p className="text-muted-foreground">Verified and trusted by our community</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {featuredProviders.map((provider) => (
                <Card key={provider.id} className="hover:shadow-lg transition-shadow cursor-pointer">
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
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Button variant="outline" size="lg">
                View All Providers
              </Button>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="py-16 px-4 bg-muted/5">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">Quick Actions</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Users className="text-primary" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold">Register as Provider</h3>
                  <p className="text-muted-foreground">
                    Join our verified healthcare provider network and connect with patients
                  </p>
                  <Button className="w-full">
                    Get Started
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Search className="text-primary" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold">Find Nearby Care</h3>
                  <p className="text-muted-foreground">
                    Use our smart search to find healthcare providers near your location
                  </p>
                  <Button variant="outline" className="w-full">
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

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
