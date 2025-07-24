
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Dribbble, ImageIcon, Menu, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebar } from './ui/sidebar';
import type { Category } from '@/types';

type NavLinkProps = {
    href: string;
    icon: LucideIcon;
    label: string;
    isActive: boolean;
    onClick?: () => void;
};

const NavLink = ({ href, icon: Icon, label, isActive, onClick }: NavLinkProps) => (
    <Link href={href} onClick={onClick} className={cn(
        "flex flex-col items-center justify-center gap-1 w-full h-full text-xs transition-colors",
        isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'
    )}>
        <Icon className="w-6 h-6" />
        <span>{label}</span>
    </Link>
);

const NavButton = ({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick: () => void }) => (
     <button onClick={onClick} className="flex flex-col items-center justify-center gap-1 w-full h-full text-xs text-muted-foreground transition-colors hover:text-primary">
        <Icon className="w-6 h-6" />
        <span>{label}</span>
    </button>
)

export default function BottomNavBar({ categories }: { categories: Category[] }) {
    const pathname = usePathname();
    const { setOpenMobile } = useSidebar();

    const mainNavLinks = [
        { href: '/', label: 'Accueil', icon: Home },
        { href: '/navetane', label: 'Navétane', icon: Dribbble },
        { href: '/medias', label: 'Média', icon: ImageIcon },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t">
            <div className="grid h-full grid-cols-4 mx-auto font-medium">
                {mainNavLinks.map(link => (
                    <NavLink
                        key={link.href}
                        href={link.href}
                        icon={link.icon}
                        label={link.label}
                        isActive={pathname === link.href}
                    />
                ))}
                <NavButton
                    icon={Menu}
                    label="Menu"
                    onClick={() => setOpenMobile(true)}
                />
            </div>
        </div>
    );
}
