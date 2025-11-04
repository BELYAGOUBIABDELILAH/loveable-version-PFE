import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Testimonial {
  id: string;
  name: string;
  initials: string;
  text: string;
  role: string;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Amira K.',
    initials: 'AK',
    text: "CityHealth m'a permis de trouver rapidement un excellent cardiologue près de chez moi. Interface simple et professionnels vérifiés !",
    role: 'Patiente'
  },
  {
    id: '2',
    name: 'Mohamed B.',
    initials: 'MB',
    text: "Grâce à cette plateforme, j'ai pu prendre rendez-vous en quelques clics avec un dentiste de qualité. Service exceptionnel !",
    role: 'Patient'
  },
  {
    id: '3',
    name: 'Sarah L.',
    initials: 'SL',
    text: "Application très utile pour trouver des pharmacies de garde. Les informations sont toujours à jour et fiables.",
    role: 'Patiente'
  }
];

export const TestimonialsSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        nextSlide();
      }, 5000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [currentIndex, isPaused]);

  return (
    <section className="py-20 px-4 bg-secondary/20">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12 animate-slide-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Ce que disent nos utilisateurs
          </h2>
          <p className="text-muted-foreground text-lg">
            Des milliers de patients satisfaits nous font confiance
          </p>
        </div>

        <Card 
          className="glass-card border-primary/20 shadow-xl max-w-4xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <CardContent className="p-12 relative" role="region" aria-label="Patient testimonials">
            <Quote className="h-12 w-12 text-primary/30 mb-6" />
            
            <p className="text-xl text-foreground leading-relaxed mb-8">
              "{testimonials[currentIndex].text}"
            </p>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary text-lg font-semibold">
                  {testimonials[currentIndex].initials}
                </span>
              </div>
              <div>
                <p className="font-semibold text-lg">{testimonials[currentIndex].name}</p>
                <p className="text-muted-foreground">{testimonials[currentIndex].role}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-center items-center gap-4 mt-8">
          <Button
            variant="outline"
            size="icon"
            onClick={prevSlide}
            className="h-10 w-10 rounded-full hover:bg-primary/10"
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={20} />
          </Button>
          
          <div className="flex gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'bg-primary w-8' 
                    : 'bg-primary/30 w-2 hover:bg-primary/50'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={nextSlide}
            className="h-10 w-10 rounded-full hover:bg-primary/10"
            aria-label="Next testimonial"
          >
            <ChevronRight size={20} />
          </Button>
        </div>
      </div>
    </section>
  );
};
