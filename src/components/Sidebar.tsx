
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Newspaper,
  Dribbble,
  Users,
  BarChart3,
  ImageIcon,
  Shield,
  Info,
  Mail,
  Megaphone,
  BookText,
  Palette,
  LogOut,
  LucideIcon,
  HelpCircle,
  Trophy,
  ChevronLeft,
  Dice5,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { Button } from './ui/button';
import type { Category } from '@/types';
import Logo from './Logo';
import { useSidebar, Sidebar as SidebarWrapper, SidebarTrigger, SidebarContent, SidebarHeader, SidebarFooter } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import Image from 'next/image';

const iconMap: Record<string, LucideIcon> = {
    'default': HelpCircle,
    'accueil': Home,
    'actualite': Newspaper,
    'sport': Dribbble,
    'navetane': Dribbble,
    'portraits': Users,
    'societe-culture': Palette,
    'articles': BookText,
    'statistiques': Trophy,
    'medias': ImageIcon,
};

const secondaryNavLinks = [
    { href: '/medias', label: 'Média', icon: ImageIcon },
    { href: '/statistiques', label: 'Statistiques', icon: Trophy },
    { href: '/publicite', label: 'Publicité', icon: Megaphone },
    { href: '/a-propos', label: 'À propos', icon: Info },
    { href: '/contact', label: 'Contact', icon: Mail },
]

const NavLink = ({ href, icon: Icon, children }: { href: string; icon: LucideIcon; children: React.ReactNode }) => {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isActive = pathname.startsWith(href) && (href !== '/' || pathname === '/');

  if (state === 'collapsed') {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                 <Link
                    href={href}
                    className={cn(
                        'flex items-center justify-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors h-10 w-10',
                        isActive ? 'bg-secondary text-primary' : 'text-muted-foreground hover:text-primary hover:bg-secondary/50',
                    )}
                    >
                    <Icon className="h-5 w-5" />
                    <span className="sr-only">{children}</span>
                </Link>
            </TooltipTrigger>
            <TooltipContent side="right">
                <p>{children}</p>
            </TooltipContent>
        </Tooltip>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        isActive ? 'bg-secondary text-primary' : 'text-muted-foreground hover:text-primary hover:bg-secondary/50',
      )}
    >
      <Icon className="h-4 w-4" />
      {children}
    </Link>
  );
};


export default function Sidebar({ categories }: { categories: Category[] }) {
  const { user, logout } = useAuth();
  const { state } = useSidebar();
  
  return (
    <SidebarWrapper className="hidden md:flex flex-col border-r bg-background p-2 transition-all duration-300 ease-in-out" 
        data-state={state}
    >
        <SidebarHeader className="p-2">
            <div className={cn("flex items-center", state === 'expanded' ? "justify-between" : "justify-center")}>
                 {state === 'expanded' && (
                    <Link href="/">
                        <Logo className="w-32" />
                    </Link>
                )}
                <div className="flex items-center gap-2">
                    <SidebarTrigger asChild>
                        <Button variant="ghost" size="icon" className="w-10 h-10">
                            <Menu className={cn("h-5 w-5")} />
                        </Button>
                    </SidebarTrigger>
                </div>
            </div>
        </SidebarHeader>
      
      <SidebarContent as="nav" className="flex flex-col gap-y-6 overflow-y-auto px-2 mt-6">
        <div>
            <h3 className={cn("px-3 text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2", state === 'collapsed' && 'text-center')}>
                {state === 'expanded' ? 'Menu' : 'M'}
            </h3>
            <ul className="space-y-1">
                <li>
                    <NavLink href="/" icon={Home}>
                        Accueil
                    </NavLink>
                </li>
                {categories.filter(l => l.slug !== 'accueil' && l.slug !== 'medias').map((link) => {
                    const Icon = iconMap[link.slug] || iconMap['default'];
                    const href = link.slug === 'portraits' ? `/${link.slug}` : `/${link.slug}`;
                    return (
                        <li key={link.id}>
                            <NavLink href={href} icon={Icon}>
                                {link.name}
                            </NavLink>
                        </li>
                    )
                })}
            </ul>
        </div>
        
         <div className="flex-1">
            <h3 className={cn("px-3 text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2", state === 'collapsed' && 'text-center')}>
                {state === 'expanded' ? 'Plus' : 'P'}
            </h3>
            <ul className="space-y-1">
                {secondaryNavLinks.map((link) => (
                    <li key={link.href}>
                        <NavLink href={link.href} icon={link.icon}>
                            {link.label}
                        </NavLink>
                    </li>
                ))}
            </ul>
        </div>
      </SidebarContent>
      <SidebarFooter className="mt-auto p-2">
         <ul className="space-y-1">
            {user ? (
              <>
                <li>
                  <NavLink href="/admin" icon={Shield}>
                      Admin
                  </NavLink>
                </li>
                <li>
                    <Button variant="ghost" className={cn("w-full justify-start flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-secondary/50", state === 'collapsed' && 'justify-center w-10 h-10 p-0')} onClick={logout}>
                        <LogOut className="h-4 w-4" />
                        <span className={cn(state === 'collapsed' && 'hidden')}>Déconnexion</span>
                    </Button>
                </li>
              </>
            ) : (
              <li>
                <NavLink href="/login" icon={Shield}>
                    Admin
                </NavLink>
              </li>
            )}
        </ul>
      </SidebarFooter>
    </SidebarWrapper>
  );
}
