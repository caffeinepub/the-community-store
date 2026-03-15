import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Settings, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <header className="sticky top-0 z-50 bg-[#1a1f4e]/95 backdrop-blur-sm border-b-0 shadow-md">
      <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center shrink-0">
          <img
            src="/assets/uploads/Logo-1.PNG"
            alt="The Community Store"
            className="h-9 w-auto"
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            to="/"
            data-ocid="nav.home.link"
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
              currentPath === "/"
                ? "bg-white/20 text-white"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            Home
          </Link>

          {/* Customer-facing — visually prominent */}
          <Link
            to="/books"
            data-ocid="nav.books.link"
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
              currentPath === "/books"
                ? "bg-amber-500 text-white"
                : "bg-amber-500/90 text-white hover:bg-amber-400"
            }`}
          >
            Browse Books
          </Link>

          {/* Admin — subtle, separated */}
          <Link
            to="/admin"
            data-ocid="nav.admin.link"
            className={`ml-3 flex items-center gap-1.5 px-3.5 py-2 rounded-md text-sm font-medium border transition-colors duration-150 ${
              currentPath === "/admin"
                ? "border-white/50 bg-white/20 text-white"
                : "border-white/30 text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            Admin / My Responses
          </Link>
        </nav>

        <button
          type="button"
          className="md:hidden p-2 rounded-md text-white/70 hover:text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#1a1f4e] px-4 py-3 flex flex-col gap-1">
          <Link
            to="/"
            data-ocid="nav.home.link"
            onClick={() => setMobileOpen(false)}
            className={`px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
              currentPath === "/"
                ? "bg-white/20 text-white"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            Home
          </Link>

          <Link
            to="/books"
            data-ocid="nav.books.link"
            onClick={() => setMobileOpen(false)}
            className={`px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
              currentPath === "/books"
                ? "bg-amber-500 text-white"
                : "bg-amber-500/90 text-white hover:bg-amber-400"
            }`}
          >
            Browse Books
          </Link>

          <Link
            to="/admin"
            data-ocid="nav.admin.link"
            onClick={() => setMobileOpen(false)}
            className={`mt-1 flex items-center gap-1.5 px-4 py-2.5 rounded-md text-sm font-medium border transition-colors ${
              currentPath === "/admin"
                ? "border-white/50 bg-white/20 text-white"
                : "border-white/30 text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            Admin / My Responses
          </Link>
        </div>
      )}
    </header>
  );
}
