
import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function Logo({ className }: { className?: string }) {
  return (
    <Image
      src="https://i.imgur.com/QWcnbtr.jpeg"
      alt="KhomboleVibes Logo"
      width={140}
      height={40}
      className={cn("object-contain", className)}
      priority
    />
  );
}
