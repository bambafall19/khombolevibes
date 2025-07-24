
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose, SheetFooter } from '@/components/ui/sheet';
import {
  Home,
  Newspaper,
  Dribbble,
  Users,
  Info,
  Mail,
  Megaphone,
  BookText,
  Palette,
  LogOut,
  LucideIcon,
  HelpCircle,
  Trophy,
  Menu,
  Dice5,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import type { Category } from '@/types';
import Logo from './Logo';
import { useSidebar } from './ui/sidebar';
import { ThemeToggle } from './ThemeToggle';
import { Separator } from './ui/separator';

const iconMap: Record<string, LucideIcon> = {
    'default': HelpCircle,
    'accueil': Home,
    'actualite': Newspaper,
    'sport': Dribbble,
    'navetane': Dribbble,
    'societe-culture': Palette,
    'portraits': Users,
    'articles': BookText,
    'publicite': Megaphone,
    'a-propos': Info,
    'contact': Mail,
    'statistiques': Trophy,
    'random': Dice5,
};

const secondaryNavLinks = [
    { href: '/medias', slug: 'medias', label: 'Média' },
    { href: '/portraits', slug: 'portraits', label: 'Portraits' },
    { href: '/random', slug: 'random', label: 'Article au hasard' },
    { href: '/publicite', slug: 'publicite', label: 'Publicité' },
    { href: '/a-propos', slug: 'a-propos', label: 'À propos' },
    { href: '/contact', slug: 'contact', label: 'Contact' },
]

const MobileNavLink = ({ href, children, onNavigate, isActive }: { href: string; children: React.ReactNode; onNavigate: () => void, isActive?: boolean }) => {
    return (
        <SheetClose asChild>
            <Link
                href={href}
                onClick={onNavigate}
                className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-base transition-all hover:bg-accent hover:text-accent-foreground",
                    isActive ? "bg-accent text-accent-foreground font-semibold" : "text-muted-foreground"
                )}
            >
                {children}
            </Link>
        </SheetClose>
    );
}

function HeaderContent({ categories }: { categories: Category[] }) {
    const { user, logout } = useAuth();
    const { openMobile, setOpenMobile } = useSidebar();
    const pathname = usePathname();
    
    return (
        <>
        <div className="flex items-center justify-end w-full">
            <div className="flex items-center gap-2">
                <ThemeToggle />
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpenMobile(true)}>
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Ouvrir le menu</span>
                </Button>
            </div>
        </div>

        <Sheet open={openMobile} onOpenChange={setOpenMobile}>
            <SheetContent side="left" className="w-full sm:w-80 p-0 flex flex-col">
               <SheetHeader className="p-4 border-b">
                    <SheetTitle asChild>
                         <Link href="/" className="flex items-center gap-2" onClick={() => setOpenMobile(false)}>
                            <Logo className="w-36" />
                        </Link>
                    </SheetTitle>
                    <SheetDescription>Navigation principale du site KhomboleVibes.</SheetDescription>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto">
                    <nav className="p-4 grid gap-1">
                        <p className="px-3 py-2 text-xs font-semibold uppercase text-muted-foreground tracking-wider">Menu</p>
                        <MobileNavLink href="/" onNavigate={() => setOpenMobile(false)} isActive={pathname === '/'}>
                            <Home className="h-5 w-5" />
                            Accueil
                        </MobileNavLink>
                        {categories.filter(l => l.slug !== 'accueil' && l.slug !== 'medias' && l.slug !== 'portraits').map((link) => {
                            const Icon = iconMap[link.slug] || iconMap.default;
                            const href = `/${link.slug}`;

                            return (
                                <MobileNavLink key={link.id} href={href} onNavigate={() => setOpenMobile(false)} isActive={pathname === href}>
                                    <Icon className="h-5 w-5" />
                                    {link.name}
                                </MobileNavLink>
                            )
                        })}
                    </nav>

                    <Separator className="my-2" />

                    <nav className="p-4 grid gap-1">
                        <p className="px-3 py-2 text-xs font-semibold uppercase text-muted-foreground tracking-wider">Plus</p>
                        {secondaryNavLinks.map(link => {
                            const Icon = iconMap[link.slug] || iconMap.default;
                            return (
                                <MobileNavLink key={link.href} href={link.href} onNavigate={() => setOpenMobile(false)} isActive={pathname === link.href}>
                                    <Icon className="h-5 w-5" />
                                    {link.label}
                                </MobileNavLink>
                            )
                        })}
                    </nav>
                </div>
                
                <SheetFooter className="p-4 border-t mt-auto">
                     <div className="flex items-center justify-between">
                         {user ? (
                          <div className="w-full">
                            <div className="mb-2">
                                 <p className="px-3 text-sm font-medium text-muted-foreground">{user.email}</p>
                                <MobileNavLink href="/admin" onNavigate={() => setOpenMobile(false)} isActive={pathname.startsWith('/admin')}>
                                    <Shield className="h-5 w-5" />
                                    Tableau de bord
                                </MobileNavLink>
                            </div>
                            <SheetClose asChild>
                                <Button
                                    variant="ghost"
                                    onClick={() => { logout(); setOpenMobile(false); }}
                                    className="w-full justify-start flex items-center gap-3 rounded-lg px-3 py-2 text-base text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground"
                                >
                                    <LogOut className="h-5 w-5" />
                                    Déconnexion
                                </Button>
                            </SheetClose>
                          </div>
                        ) : (
                          <MobileNavLink href="/login" onNavigate={() => setOpenMobile(false)} isActive={pathname === '/login'}>
                            <Shield className="h-5 w-5" />
                             Admin
                          </MobileNavLink>
                        )}
                        <ThemeToggle />
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
        </>
    );
}


export default function Header({ categories }: { categories: Category[] }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) return null;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between mx-auto px-4 sm:px-6 lg:px-8">
        <HeaderContent categories={categories} />
      </div>
    </header>
  );
}
