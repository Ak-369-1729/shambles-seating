"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Anchor, Shield, Menu, X, Users, LogIn, LogOut } from "lucide-react";

interface NavbarProps {
  user?: { email?: string; role?: string } | null;
  confirmedCount?: number;
  capacity?: number;
  waitlistCount?: number;
}

export function Navbar({
  user = null,
  confirmedCount = 47,
  capacity = 50,
  waitlistCount = 8,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { label: "Voyage Overview", href: "/" },
    { label: "Assemble Crew", href: "#rsvp" },
    { label: "Poneglyph Queue", href: "#queue" },
    { label: "Fleet Command Deck", href: "/admin", adminOnly: true },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-marine-950/85 backdrop-blur-md border-b border-tesoro-gold/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Tagline */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-tesoro-gold to-tesoro-bronze p-0.5 shadow-gold-glow flex items-center justify-center transition-transform group-hover:scale-105">
              <div className="w-full h-full bg-marine-950 rounded-[7px] flex items-center justify-center">
                <Compass className="w-6 h-6 text-tesoro-gold animate-spin-slow group-hover:rotate-45 transition-transform" />
              </div>
            </div>
            <div>
              <div className="font-serif font-bold text-lg md:text-xl tracking-wider gold-shimmer">
                SHAMBLES SEATING
              </div>
              <div className="text-[10px] tracking-widest text-tesoro-gold/70 font-mono uppercase">
                YOUR BERTH • YOUR CREW • YOUR VOYAGE
              </div>
            </div>
          </Link>

          {/* Center Telemetry Badges */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="flex items-center gap-2 bg-marine-900/90 border border-tesoro-gold/30 rounded-full px-3.5 py-1.5 text-xs font-mono shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-gray-300">Berths:</span>
              <span className="text-tesoro-gold font-bold">
                {confirmedCount} / {capacity}
              </span>
            </div>

            <div className="flex items-center gap-2 bg-marine-900/90 border border-reverie-crimson/40 rounded-full px-3.5 py-1.5 text-xs font-mono shadow-inner">
              <Users className="w-3.5 h-3.5 text-reverie-crimson" />
              <span className="text-gray-300">Waitlist:</span>
              <span className="text-reverie-crimson font-bold">
                {waitlistCount} Crews
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              if (link.adminOnly && user?.role !== "admin") return null;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`text-sm tracking-wide transition-colors ${
                    isActive
                      ? "text-tesoro-gold font-semibold underline underline-offset-8"
                      : "text-gray-300 hover:text-tesoro-gold"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {user ? (
              <div className="flex items-center gap-3 pl-4 border-l border-tesoro-gold/20">
                <span className="text-xs font-mono text-tesoro-gold/80 truncate max-w-[140px]">
                  {user.email}
                </span>
                <Link
                  href="/auth/signout"
                  className="p-2 rounded-md hover:bg-marine-800 text-gray-400 hover:text-reverie-crimson transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-xs uppercase tracking-wider font-semibold text-tesoro-gold hover:text-tesoro-amber transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 rounded border border-tesoro-gold bg-gradient-to-r from-tesoro-gold/20 to-tesoro-bronze/30 text-tesoro-gold hover:bg-tesoro-gold hover:text-marine-950 font-semibold text-xs tracking-wider uppercase transition-all shadow-gold-glow"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-marine-900 border border-tesoro-gold/30 text-tesoro-gold"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-marine-950/95 border-b border-tesoro-gold/30 px-4 pt-3 pb-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-marine-800">
            <div className="text-xs font-mono text-gray-400">
              Capacity: <span className="text-tesoro-gold font-bold">{confirmedCount}/{capacity}</span>
            </div>
            <div className="text-xs font-mono text-gray-400">
              Queue: <span className="text-reverie-crimson font-bold">{waitlistCount} Crews</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {navLinks.map((link) => {
              if (link.adminOnly && user?.role !== "admin") return null;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base text-gray-200 hover:text-tesoro-gold transition-colors py-1"
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="pt-4 border-t border-marine-800 flex flex-col gap-2">
            {user ? (
              <div className="flex items-center justify-between text-xs font-mono text-tesoro-gold">
                <span>{user.email}</span>
                <Link href="/auth/signout" className="text-reverie-crimson flex items-center gap-1">
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 text-center text-sm font-semibold text-tesoro-gold border border-tesoro-gold/40 rounded"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 text-center text-sm font-semibold bg-tesoro-gold text-marine-950 rounded font-bold"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
