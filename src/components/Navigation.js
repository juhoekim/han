'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
    const pathname = usePathname();

    const links = [
        { href: '/', label: '대시보드', icon: '🏠' },
        { href: '/transactions', label: '수입/지출 입력', icon: '📝' },
        { href: '/report', label: '월별 보고서', icon: '📊' },
        { href: '/report/yearly', label: '연간 보고서', icon: '📈' },
        { href: '/members', label: '멤버 관리', icon: '👥' },
    ];

    return (
        <nav className="nav">
            <div className="nav-inner">
                <Link href="/" className="nav-logo">
                    <span>📒</span> 한순례권사 총무활동
                </Link>
                <ul className="nav-links">
                    {links.map(link => (
                        <li key={link.href}>
                            <Link
                                href={link.href}
                                className={pathname === link.href ? 'active' : ''}
                            >
                                {link.icon} {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
}
