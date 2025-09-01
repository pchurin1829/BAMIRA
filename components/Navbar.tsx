import React, { useState, useEffect, useRef } from 'react';
import { signOut } from 'next-auth/react';
import { ShoppingCart, Search, User, Menu, X, Mouse, Keyboard, Gamepad2, Headphones } from 'lucide-react';
import { useCart } from './CartContext';
import { useRouter } from 'next/router';

const categories = [
    {
        name: 'Mouse',
        href: '/productos/mouse',
        icon: <Mouse className="w-5 h-5 mr-2 inline" />,
    },
    {
        name: 'Teclados',
        href: '/productos/teclados',
        icon: <Keyboard className="w-5 h-5 mr-2 inline" />,
    },
    {
        name: 'Mousepads',
        href: '/productos/mousepad',
		icon: (
			<svg
				className="w-5 h-5 mr-2 inline"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth={2}
				strokeLinecap="round"
				strokeLinejoin="round"
				aria-hidden="true"
			>
				<rect x="3" y="6" width="18" height="12" rx="2" ry="2" />
			</svg>
		),
    },
    {
        name: 'Accesorios',
        href: '/productos/accesorios',
        icon: <Gamepad2 className="w-5 h-5 mr-2 inline" />,
    },
    {
        name: 'Audio',
        href: '/productos/audio',
        icon: <Headphones className="w-5 h-5 mr-2 inline" />,
    },
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
	const [searchTerm, setSearchTerm] = useState('');
	const [isSearchModalOpen, setSearchModalOpen] = useState(false);
	const [modalTerm, setModalTerm] = useState('');
	const [modalResults, setModalResults] = useState([]);
	const [modalLoading, setModalLoading] = useState(false);
	const [modalError, setModalError] = useState('');
	const router = useRouter();

	// Detect current route to mark active link (Inicio / Productos)
	const currentPath = router.asPath || router.pathname || '';
	const isHome = currentPath === '/' || currentPath === '';
	const isProductos = currentPath.startsWith('/productos');

	useEffect(() => {
		fetch('/api/auth/me', { credentials: 'include' })
			.then(async (res) => {
				if (res.ok) {
					const data = await res.json();
					setUser(data.user);
				} else {
					setUser(null);
				}
			})
			.catch(() => setUser(null));
	}, []);

	useEffect(() => {
		const fetchModal = async () => {
			if (!modalTerm.trim()) { setModalResults([]); return; }
			setModalLoading(true);
			try {
				const res = await fetch(`/api/productos?search=${encodeURIComponent(modalTerm.trim())}`);
				if (res.ok) {
					const data = await res.json();
					setModalResults(data);
				} else {
					setModalError('Error en búsqueda');
					setModalResults([]);
				}
			} catch (err) {
				setModalError('Error de conexión');
				setModalResults([]);
			} finally { setModalLoading(false); }
		};
		const timeout = setTimeout(fetchModal, 300);
		return () => clearTimeout(timeout);
	}, [modalTerm]);

	const handleAccountClick = (e: React.MouseEvent) => {
		e.preventDefault();
		
		// Si el usuario no está autenticado, redirigir a la página de login
		if (!user) {
			window.location.href = '/cuenta/login';
			return;
		}
		
		// Si está autenticado, mostrar/ocultar el dropdown
		setIsDropdownUserOpen((open) => !open);
	};

	const handleGoProfile = () => {
		window.location.href = '/cuenta/profile';
	};

		 const handleLogout = () => {
			// Use NextAuth signOut for session invalidation
			signOut({ callbackUrl: '/' });
		};

	// Mantener dropdown abierto por un tiempo tras salir el hover
	const dropdownTimeout = useRef<NodeJS.Timeout | null>(null);
	const DROPDOWN_CLOSE_DELAY = 500; // milisegundos (5s). Cámbialo si quieres otro valor.

	const clearDropdownTimer = () => {
		if (dropdownTimeout.current) {
			clearTimeout(dropdownTimeout.current);
			dropdownTimeout.current = null;
		}
	};

	const handleDropdownEnter = () => {
		clearDropdownTimer();
		setIsDropdownOpen(true);
	};

	const handleDropdownLeave = () => {
		clearDropdownTimer();
		dropdownTimeout.current = setTimeout(() => {
			setIsDropdownOpen(false);
			dropdownTimeout.current = null;
		}, DROPDOWN_CLOSE_DELAY);
	};

	// limpiar timer al desmontar
	useEffect(() => {
		return () => clearDropdownTimer();
	}, []);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		if (searchTerm.trim()) {
			router.push({
				pathname: '/productos/search',
				query: { q: searchTerm.trim() }
			});
		} else {
			router.push('/productos/search');
		}
	};

	return (
		<header className="bg-black border-b border-gray-800 sticky top-0 z-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-20">
					<div className="flex items-center space-x-2">
						<a href="/" className="flex items-center">
							<img
								src="/logos/logonavbar.jpg"
								alt="Aim Exchange Logo"
								className="h-12 w-auto"
							/>
						</a>
					</div>
					<nav className="hidden md:flex space-x-8">
						<a
							href="/"
							className={`text-white transition-colors relative after:absolute after:left-0 after:right-0 after:bottom-[-6px] after:h-[3px] after:rounded-full after:transition-all after:duration-200 ${isHome ? 'after:opacity-100 after:bg-red-600' : 'after:opacity-0 hover:after:opacity-100 hover:after:bg-white'}`}
						>
							Inicio
						</a>
						<div
							className="relative group"
							onMouseEnter={handleDropdownEnter}
							onMouseLeave={handleDropdownLeave}
						>
							<div className="flex items-center">
								{/* Texto lleva a la página de búsqueda */}
								<a
									href="/productos/search"
									className={`text-white transition-colors flex items-center focus:outline-none relative after:absolute after:left-0 after:right-0 after:bottom-[-6px] after:h-[3px] after:rounded-full after:transition-all after:duration-200 ${isProductos ? 'after:opacity-100 after:bg-red-600' : 'after:opacity-0 hover:after:opacity-100 hover:after:bg-white'}`}
								>
									Productos
								</a>
								{/* Caret como botón para abrir/cerrar dropdown */}
								<button
									type="button"
									onClick={(e) => {
										e.preventDefault();
										// si hay un timer, lo borramos para que no se cierre automáticamente
										clearDropdownTimer();
										setIsDropdownOpen((s) => !s);
									}}
									className="ml-1 text-white hover:text-red-600 focus:outline-none"
									aria-label="Abrir productos"
									aria-expanded={isDropdownOpen}
							>
								<ArrowIcon open={isDropdownOpen} />
							</button>
							</div>
                            {isDropdownOpen && (
                                <div className="absolute left-0 mt-2 w-56 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-10 overflow-hidden">
                                    <ul>
                                        {categories.map((cat) => (
                                            <li key={cat.name}>
                                                <a
                                                    href={cat.href}
                                                    className="flex items-center px-4 py-2 text-gray-200 hover:bg-red-600 hover:text-white transition-colors"
                                                    style={{ textTransform: 'capitalize' }}
                                                >
                                                    <span className="mr-3">{cat.icon}</span>
                                                    <span>{cat.name}</span>
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
						</div>
						{user && user.rol === 'admin' && (
							<a href="/admin" className="text-red-600 font-bold ml-4">
								Panel Admin
							</a>
						)}
					</nav>
					<div className="flex items-center space-x-4 relative">
						{user && (
							<button
								onClick={handleAccountClick}
								className="font-bold text-white text-sm hover:text-red-600 transition-colors mr-2"
								tabIndex={0}
								aria-label="Mi cuenta"
							>
								{user.name}
							</button>
						)}
						<button
							type="button"
							className="text-white hover:text-red-600 transition-colors"
							onClick={handleAccountClick}
							tabIndex={0}
							aria-label={user ? "Mi cuenta" : "Iniciar sesión"}
						>
							<User className="w-5 h-5" />
						</button>
						{isDropdownUserOpen && user && (
							<div className="absolute right-0 top-10 bg-white border border-red-600 rounded shadow-lg z-20 min-w-[160px]">
								<button
									className="block w-full text-left px-4 py-2 hover:bg-red-600 hover:text-white text-black"
									onClick={handleGoProfile}
								>
									Perfil
								</button>
								<button
									className="block w-full text-left px-4 py-2 hover:bg-red-600 hover:text-white text-red-600"
									onClick={handleLogout}
								>
									Cerrar Sesión
								</button>
							</div>
						)}
						<button className="text-white hover:text-red-600" onClick={() => setSearchModalOpen(true)}>
							<Search className="w-5 h-5" />
						</button>
						<button
							className="relative text-white hover:text-red-600 transition-colors"
							onClick={() => (window.location.href = '/carrito')}
						>
							<ShoppingCart className="w-5 h-5" />
							{cartCount > 0 && (
								<span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
									{cartCount}
								</span>
							)}
						</button>
						<button
							className="md:hidden"
							onClick={() => setIsMenuOpen(!isMenuOpen)}
						>
							{isMenuOpen ? (
								<X className="w-6 h-6 text-white" />
							) : (
								<Menu className="w-6 h-6 text-white" />
							)}
						</button>
					</div>
				</div>
				{isMenuOpen && (
					<div className="md:hidden py-4 border-t border-red-600 bg-gray-900">
						<div className="flex flex-col space-y-2">
							<div className="relative">
								<button
									className={`text-white py-2 w-full flex justify-center items-center relative after:absolute after:left-0 after:right-0 after:bottom-0 after:h-[3px] after:rounded-full after:transition-all after:duration-200 ${isProductos ? 'after:opacity-100 after:bg-red-600' : 'after:opacity-0 hover:after:opacity-100 hover:after:bg-white'}`}
									onClick={() => setIsDropdownOpen(!isDropdownOpen)}
								>
									Productos
									<svg
										className="w-4 h-4 ml-1"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M19 9l-7 7-7-7"
										/>
									</svg>
								</button>
								{isDropdownOpen && (
									<div className="mt-2 w-full bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-10 overflow-hidden">
										<ul>
											{categories.map((cat) => (
												<li key={cat.name}>
													<a
														href={cat.href}
														className="flex items-center px-4 py-2 text-gray-200 hover:bg-red-600 hover:text-white transition-colors"
														style={{ textTransform: 'capitalize' }}
													>
														<span className="mr-3">{cat.icon}</span>
														<span>{cat.name}</span>
													</a>
												</li>
											))}
										</ul>
									</div>
								)}
							</div>
						</div>
					</div>
				)}
			</div>
			{isSearchModalOpen && (
				<div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
					<div className="bg-gray-900 rounded-lg p-6 w-full max-w-md">
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-white text-xl">Buscar productos</h2>
							<button onClick={() => setSearchModalOpen(false)}><X className="w-5 h-5 text-white"/></button>
						</div>
						<input
							type="text"
							value={modalTerm}
							onChange={(e) => { setModalTerm(e.target.value); }}
							placeholder="Buscar..."
							className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded mb-4 focus:outline-none"
						/>
						{modalLoading && <p className="text-gray-400">Buscando...</p>}
						{!modalLoading && modalError && <p className="text-red-500">{modalError}</p>}
									{!modalLoading && !modalError && (
										modalResults.length > 0 ? (
											<ul className="max-h-60 overflow-auto">
												{modalResults.map(p => (
													<li
														key={p.id}
														className="flex items-center py-2 border-b border-gray-700 cursor-pointer hover:bg-gray-800"
														onClick={() => { router.push(`/producto/${p.id}`); setSearchModalOpen(false); }}
													>
														<img
															src={p.imagenUrl || '/placeholder.jpg'}
															alt={p.nombre}
															className="w-10 h-10 object-cover rounded mr-3"
														/>
														<div>
															<p className="text-white font-medium">{p.nombre}</p>
															<p className="text-gray-400 text-sm">${p.precio}</p>
														</div>
													</li>
												))}
											</ul>
										) : (
											<p className="text-gray-400">No se encontraron productos</p>
										)
									)}
					</div>
				</div>
			)}
		</header>
	);
}

// Pequeño componente para la flecha animada
function ArrowIcon({ open }: { open: boolean }) {
    return (
        <svg
            className={`w-4 h-4 ml-1 transform transition-transform duration-200 ${open ? 'rotate-180' : 'rotate-0'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
            />
        </svg>
    );
}
