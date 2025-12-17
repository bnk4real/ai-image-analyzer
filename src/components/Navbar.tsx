"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const Navbar = () => {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    // Don't render the navbar on the login page
    if (pathname && pathname.startsWith("/login")) {
        return null;
    }

    const navItems = [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/image-analysis", label: "AI Image Analysis" },
        { href: "/reports", label: "Reports" },
        { href: "/users", label: "Users" },
        { href: "/settings", label: "Settings" },
        { href: "/login", label: "Logout" },
    ];

    return (
        <nav className="bg-gray-800 p-4">
            <div className="container mx-auto flex justify-between items-center flex-wrap">
                <Link href="/" className="text-white text-lg font-bold">
                    Report AI Analysis
                </Link>

                {/* Mobile menu button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-gray-300 hover:text-white md:hidden focus:outline-none"
                    aria-label="Toggle menu"
                >
                    <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        {isOpen ? (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        ) : (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        )}
                    </svg>
                </button>

                {/* Desktop Menu */}
                <ul className="hidden md:flex space-x-4">
                    {navItems.map((item) => (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                className={`text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium ${pathname === item.href ? "bg-gray-900 text-white" : ""
                                    }`}
                            >
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="w-full md:hidden mt-4">
                        <ul className="flex flex-col space-y-2">
                            {navItems.map((item) => (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        onClick={() => setIsOpen(false)}
                                        className={`block text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-base font-medium ${pathname === item.href ? "bg-gray-900 text-white" : ""
                                            }`}
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
