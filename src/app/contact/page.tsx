import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ContactForm } from './ContactForm';
import { Mail, Phone, MapPin } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contactez l\'équipe de KhomboleVibes. Nous sommes à votre écoute pour toute question ou suggestion.',
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 fade-in">
      <header className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">Contactez-nous</h1>
        <p className="mt-4 text-lg max-w-2xl mx-auto text-muted-foreground">
          Une question, une suggestion ou une information à partager ? Nous sommes à votre écoute.
        </p>
      </header>

      <div className="grid lg:grid-cols-5 gap-12">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Envoyez-nous un message</CardTitle>
              <CardDescription>Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.</CardDescription>
            </CardHeader>
            <CardContent>
              <ContactForm />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
            <div className="space-y-6 bg-card p-8 rounded-lg shadow-md h-full">
                <h3 className="font-headline text-2xl font-bold">Nos Coordonnées</h3>
                <div className="flex items-start gap-4">
                    <div className="bg-primary/10 text-primary p-3 rounded-full mt-1">
                        <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-semibold">Adresse</h4>
                        <p className="text-muted-foreground">Khombole, Sénégal</p>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                     <div className="bg-primary/10 text-primary p-3 rounded-full mt-1">
                        <Phone className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-semibold">Téléphone</h4>
                        <a href="tel:+221776431760" className="text-muted-foreground hover:text-primary transition-colors">
                            +221 77 643 17 60
                        </a>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                     <div className="bg-primary/10 text-primary p-3 rounded-full mt-1">
                        <Mail className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-semibold">Email</h4>
                        <a href="mailto:khombolevibes@gmail.com" className="text-muted-foreground hover:text-primary transition-colors">
                            khombolevibes@gmail.com
                        </a>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
