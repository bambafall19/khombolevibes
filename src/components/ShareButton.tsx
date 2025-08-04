'use client';

import { Share2 } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';

type ShareButtonProps = {
  title: string;
  url: string;
};

export default function ShareButton({ title, url }: ShareButtonProps) {
  const { toast } = useToast();
  const [isShareSupported, setIsShareSupported] = useState(false);

  useEffect(() => {
    // navigator is only available in the browser, and we should check
    // if navigator.share is supported.
    if (typeof navigator !== 'undefined' && navigator.share) {
      setIsShareSupported(true);
    }
  }, []);

  const handleShare = async () => {
    try {
      await navigator.share({
        title: title,
        text: `Découvrez cet article sur KhomboleVibes : ${title}`,
        url: url,
      });
    } catch (error) {
      // It's better not to show an error toast if the user cancels the share action.
      console.error('Erreur lors du partage:', error);
    }
  };

  if (!isShareSupported) {
    return null; // Don't render the button if the Web Share API is not supported
  }

  return (
    <Button onClick={handleShare} variant="outline" size="icon">
      <Share2 className="h-5 w-5" />
      <span className="sr-only">Partager l'article</span>
    </Button>
  );
}
