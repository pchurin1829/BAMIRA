import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, User, Menu, X, Mouse, Keyboard, Gamepad2, Headphones } from 'lucide-react';
import { useCart } from './CartContext';

const categories = [
  { name: "Mouse", href: "/productos/mouse", icon: <Mouse className="w-5 h-5 mr-2 inline" /> },
  { name: "Teclados", href: "/productos/teclados", icon: <Keyboard className="w-5 h-5 mr-2 inline" /> },
  { name: "Mousepads", href: "/productos/mousepad", icon: <div className="w-5 h-5 mr-2 inline bg-current rounded" /> },
  { name: "Accesorios", href: "/productos/accesorios", icon: <Gamepad2 className="w-5 h-5 mr-2 inline" /> },
  { name: "Auriculares", href: "/productos/audio", icon: <Headphones className="w-5 h-5 mr-2 inline" /> }
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { items } = useCart();
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
  // Estado para saber si el usuario está autenticado
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isDropdownUserOpen, setIsDropdownUserOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(async res => {
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null));
  }, []);

  const handleAccountClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDropdownUserOpen((open) => !open);
  };

  const handleGoProfile = () => {
    window.location.href = '/cuenta/profile';
  };

  const handleLogout = async () => {
    document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setUser(null);
    window.location.href = '/';
  };

  // Para mantener el dropdown abierto más tiempo
  let dropdownTimeout: NodeJS.Timeout;

  const handleDropdownEnter = () => {
    clearTimeout(dropdownTimeout);
    setIsDropdownOpen(true);
  };
  const handleDropdownLeave = () => {
    dropdownTimeout = setTimeout(() => setIsDropdownOpen(false), 400); // 400ms delay
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    const res = await fetch(`/api/productos?search=${encodeURIComponent(searchTerm)}`);
    const data = await res.json();
    setSearchResults(data.productos || []);
    setIsSearchOpen(true);
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    setSearchTerm("");
    setSearchResults([]);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <a href="/">
              <img src="/logos/logoaimexchangehd.png" alt="Aim Exchange Logo" className="h-10 w-auto" />
            </a>
          </div>
          <nav className="hidden md:flex space-x-8">
            <div className="relative group" onMouseEnter={handleDropdownEnter} onMouseLeave={handleDropdownLeave}>
              <button className="text-gray-900 hover:text-red-600 transition-colors font-bold flex items-center focus:outline-none">
                Productos
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isDropdownOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg z-10">
                  <ul>
                    {categories.map((cat) => (
                      <li key={cat.name}>
                        <a href={cat.href} className="block px-4 py-2 text-gray-900 hover:bg-gray-100 hover:text-red-600 font-bold transition-colors flex items-center" style={{ textTransform: 'capitalize' }}>
                          {cat.icon}
                          {cat.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <a href="#" className="text-gray-900 hover:text-red-600 transition-colors font-medium" onClick={handleAccountClick} tabIndex={0} role="button">Cuenta</a>
            {user && user.rol === 'admin' && (
              <a href="/admin" className="text-red-600 font-bold ml-4">Panel Admin</a>
            )}
          </nav>
          <div className="flex items-center space-x-4 relative">
            <button type="button" className="text-gray-600 hover:text-red-600 transition-colors" onClick={handleAccountClick} tabIndex={0} aria-label="Cuenta">
              <User className="w-5 h-5" />
            </button>
            {isDropdownUserOpen && user && (
              <div className="absolute right-0 top-10 bg-white border rounded shadow-lg z-20 min-w-[160px]">
                <button className="block w-full text-left px-4 py-2 hover:bg-gray-100" onClick={handleGoProfile}>Perfil</button>
                <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600" onClick={handleLogout}>Cerrar Sesion</button>
              </div>
            )}
            {user && (
              <span className="font-bold text-gray-900 text-sm">{user.nombre}</span>
            )}
            <button className="text-gray-600 hover:text-red-600 transition-colors" onClick={() => setIsSearchOpen(true)}>
              <Search className="w-5 h-5" />
            </button>
            <button className="relative text-gray-600 hover:text-red-600 transition-colors" onClick={() => window.location.href = '/carrito'}>
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>
            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-2">
              <div className="relative">
                <button className="text-gray-900 hover:text-red-600 py-2 w-full text-left flex items-center" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                  Productos
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isDropdownOpen && (
                  <div className="mt-2 w-full bg-white border border-gray-200 rounded shadow-lg z-10">
                    <ul>
                      {categories.map((cat) => (
                        <li key={cat.name}>
                          <a href={cat.href} className="block px-4 py-2 text-gray-900 hover:bg-gray-100 hover:text-red-600 transition-colors">
                            {cat.icon}
                            {cat.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <a href="#" className="text-gray-900 hover:text-red-600 py-2" onClick={handleAccountClick} tabIndex={0} role="button">Cuenta</a>
            </div>
          </div>
        )}
      </div>
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-start justify-center pt-24" onClick={handleCloseSearch}>
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-2 right-2 text-gray-400 hover:text-red-600" onClick={handleCloseSearch}><X className="w-5 h-5" /></button>
            <form onSubmit={handleSearch} className="flex mb-4">
              <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar productos..." className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:border-red-500" />
              <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-r-lg transition-colors"><Search className="w-5 h-5" /></button>
            </form>
            {searchResults.length === 0 ? (
              <div className="text-gray-500 text-center">No se encontraron productos.</div>
            ) : (
              <ul>
                {searchResults.map(prod => (
                  <li key={prod.id} className="border-b last:border-b-0 py-2 flex items-center gap-3">
                    <img src={prod.imagenUrl} alt={prod.nombre} className="w-10 h-10 object-contain rounded" />
                    <div className="flex-1">
                      <a href={`/productos/${prod.categoriaId}`} className="font-bold text-gray-900 hover:text-red-600">{prod.nombre}</a>
                      <div className="text-xs text-gray-500">${prod.precio.toLocaleString()}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
