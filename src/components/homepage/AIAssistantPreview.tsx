import { useState } from 'react';
import { Bot, MessageCircle, Sparkles, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/hooks/useLanguage';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export const AIAssistantPreview = () => {
  const { t } = useLanguage();
  const sectionRef = useScrollReveal();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPreview, setCurrentPreview] = useState(0);

  const previewMessages = [
    {
      question: t('ai.preview1'),
      answer: "I can help you find qualified cardiologists in your area. Based on your location, I recommend Dr. Ahmed Benali at Centre Médical Alger who has excellent reviews and availability this week."
    },
    {
      question: t('ai.preview2'),
      answer: "Common flu symptoms include fever, body aches, fatigue, cough, and congestion. If symptoms persist for more than 7 days or worsen, I recommend consulting with a general practitioner."
    },
    {
      question: t('ai.preview3'),
      answer: "For urgent appointments, I can help you find providers with same-day availability. You can also use our emergency booking feature for immediate care needs."
    }
  ];

  const handlePreviewClick = () => {
    setCurrentPreview((prev) => (prev + 1) % previewMessages.length);
  };

  return (
    <>
      <section ref={sectionRef} className="py-20 px-4 bg-gradient-to-br from-secondary/5 via-background to-primary/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content Side */}
            <div className="space-y-8 animate-slide-up">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center animate-glow">
                    <Bot className="text-primary" size={24} />
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {t('ai.title')}
                  </h2>
                </div>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  {t('ai.subtitle')}
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-4">
                {[
                  'Get instant answers to health questions',
                  'Find the right specialists for your needs',
                  'Book appointments with smart recommendations',
                  'Available 24/7 in Arabic, French, and English'
                ].map((feature, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-3 animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              <Button 
                size="lg" 
                onClick={() => setIsModalOpen(true)}
                className="hover-lift ripple-effect bg-primary hover:bg-primary/90"
              >
                <Sparkles className="mr-2" size={18} />
                {t('ai.try')}
                <ArrowRight className="ml-2" size={18} />
              </Button>
            </div>

            {/* Interactive Preview Side */}
            <div className="space-y-6 animate-scale-in" style={{ animationDelay: '0.3s' }}>
              {/* Floating Chat Bubble */}
              <div className="relative">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full animate-ping" />
                <Card 
                  className="glass-card border border-primary/30 hover:border-primary/50 transition-all duration-300 cursor-pointer hover-lift"
                  onClick={handlePreviewClick}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center animate-float">
                        <Bot className="text-primary" size={20} />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="bg-muted/50 rounded-lg p-3">
                          <p className="text-sm text-muted-foreground">You:</p>
                          <p className="font-medium">{previewMessages[currentPreview].question}</p>
                        </div>
                        <div className="bg-primary/10 rounded-lg p-3">
                          <p className="text-sm text-primary font-medium">AI Assistant:</p>
                          <p className="text-sm text-foreground leading-relaxed">
                            {previewMessages[currentPreview].answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Preview Indicators */}
              <div className="flex justify-center gap-2">
                {previewMessages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPreview(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentPreview ? 'bg-primary scale-125' : 'bg-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="glass-card p-4 text-center">
                  <div className="text-2xl font-bold text-primary">24/7</div>
                  <div className="text-sm text-muted-foreground">Available</div>
                </Card>
                <Card className="glass-card p-4 text-center">
                  <div className="text-2xl font-bold text-primary">3</div>
                  <div className="text-sm text-muted-foreground">Languages</div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Chat Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] glass-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <Bot className="text-primary" size={16} />
              </div>
              {t('ai.title')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="bg-primary/10 rounded-lg p-4">
              <p className="text-sm text-primary font-medium">AI Assistant:</p>
              <p className="text-foreground">
                Hello! I'm your healthcare AI assistant. I can help you find healthcare providers, 
                answer medical questions, and assist with appointment booking. How can I help you today?
              </p>
            </div>
            
            <div className="grid gap-3">
              {previewMessages.map((message, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="justify-start h-auto p-4 text-left"
                  onClick={() => {
                    // TODO: Start conversation with AI assistant
                  }}
                >
                  <MessageCircle className="mr-3" size={16} />
                  <span>{message.question}</span>
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex gap-3 pt-4 border-t">
            <Button 
              onClick={() => setIsModalOpen(false)}
              variant="outline" 
              className="flex-1"
            >
              Close
            </Button>
            <Button 
              onClick={() => {
                // In real implementation, this would open the full chat
                setIsModalOpen(false);
              }}
              className="flex-1"
            >
              Start Chat
              <ArrowRight className="ml-2" size={16} />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};