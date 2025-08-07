import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, Users, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useToastNotifications } from '@/hooks/useToastNotifications';
import ToastContainer from '@/components/ToastContainer';
import LoadingSpinner from '@/components/LoadingSpinner';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    type: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const headerRef = useScrollReveal();
  const formRef = useScrollReveal();
  const infoRef = useScrollReveal();
  
  const { toasts, addToast } = useToastNotifications();

  const contactTypes = [
    'Support technique',
    'Question générale',
    'Demande de partenariat',
    'Inscription prestataire',
    'Signalement',
    'Autre'
  ];

  const contactInfo = [
    {
      icon: Phone,
      title: 'Téléphone',
      details: '+213 48 XX XX XX',
      description: 'Lun-Ven 8h-18h'
    },
    {
      icon: Mail,
      title: 'Email',
      details: 'contact@cityhealth-sba.dz',
      description: 'Réponse sous 24h'
    },
    {
      icon: MapPin,
      title: 'Adresse',
      details: 'Centre Ville, Sidi Bel Abbès',
      description: 'Algérie 22000'
    },
    {
      icon: Clock,
      title: 'Horaires',
      details: 'Lun-Ven: 8h-18h',
      description: 'Sam: 9h-13h'
    }
  ];

  const faqItems = [
    {
      question: 'Comment m\'inscrire en tant que prestataire ?',
      answer: 'Rendez-vous sur la page "Espace Prestataire" et remplissez le formulaire d\'inscription. Notre équipe vérifiera vos informations sous 48h.'
    },
    {
      question: 'Les consultations sont-elles gratuites ?',
      answer: 'CityHealth est une plateforme de mise en relation. Les tarifs des consultations dépendent de chaque prestataire.'
    },
    {
      question: 'Comment signaler un problème ?',
      answer: 'Utilisez le formulaire de contact en sélectionnant "Signalement" ou contactez-nous directement par téléphone.'
    },
    {
      question: 'Puis-je modifier mes informations ?',
      answer: 'Oui, connectez-vous à votre compte et accédez à la section "Profil" pour modifier vos informations.'
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      addToast({
        type: 'warning',
        title: 'Champs requis',
        message: 'Veuillez remplir tous les champs obligatoires'
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      addToast({
        type: 'success',
        title: 'Message envoyé',
        message: 'Votre message a été envoyé avec succès. Nous vous répondrons bientôt.'
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        type: ''
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <ToastContainer toasts={toasts} />
      
      {/* Header */}
      <section ref={headerRef} className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6 animate-float">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center animate-glow">
              <MessageSquare className="text-primary" size={24} />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Contactez-nous
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Notre équipe est là pour vous aider. N'hésitez pas à nous contacter pour toute question ou suggestion.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card ref={formRef} className="glass-card animate-scale-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="text-primary" size={24} />
                  Envoyez-nous un message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nom complet *</label>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Votre nom complet"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email *</label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="votre@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Type de demande</label>
                      <Select value={formData.type} onValueChange={(value) => handleSelectChange('type', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir le type" />
                        </SelectTrigger>
                        <SelectContent>
                          {contactTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Sujet</label>
                      <Input
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="Sujet de votre message"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Message *</label>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Décrivez votre demande en détail..."
                      rows={6}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full ripple-effect"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <Send className="mr-2" size={18} />
                        Envoyer le message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Info & FAQ */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card ref={infoRef} className="glass-card animate-scale-in">
              <CardHeader>
                <CardTitle>Informations de contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <info.icon className="text-primary" size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium">{info.title}</h4>
                      <p className="text-sm text-foreground">{info.details}</p>
                      <p className="text-xs text-muted-foreground">{info.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="glass-card animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <CardTitle>Questions fréquentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {faqItems.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <h4 className="font-medium text-sm">{item.question}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.answer}</p>
                    {index < faqItems.length - 1 && <hr className="border-border/50" />}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card className="glass-card animate-scale-in border-destructive/20" style={{ animationDelay: '0.4s' }}>
              <CardContent className="p-4 text-center">
                <Phone className="mx-auto mb-2 text-destructive animate-pulse-slow" size={24} />
                <h4 className="font-medium text-destructive mb-1">Urgence médicale</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  En cas d'urgence médicale, appelez directement les services d'urgence
                </p>
                <Button variant="destructive" className="w-full animate-glow">
                  <Phone className="mr-2" size={16} />
                  Appeler le 15
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Team Section */}
        <section className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Notre équipe</h2>
            <p className="text-muted-foreground">
              Des professionnels dédiés à améliorer l'accès aux soins de santé
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Dr. Sarah Benali', role: 'Directrice Médicale', icon: Heart },
              { name: 'Ahmed Kader', role: 'Responsable Technique', icon: Users },
              { name: 'Fatima Zehra', role: 'Support Client', icon: MessageSquare }
            ].map((member, index) => (
              <Card key={index} className="glass-card text-center hover-lift animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <member.icon className="text-primary" size={24} />
                  </div>
                  <h3 className="font-semibold mb-1">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ContactPage;