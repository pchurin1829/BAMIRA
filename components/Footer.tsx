import React from 'react';
import { Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black border-t border-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex justify-center mb-2">
          <img src="/logos/logoaimexchangehd.png" alt="Aim Exchange Logo" className="h-12 w-auto mx-auto" />
        </div>
        <div className="text-2xl font-bold text-white mb-2">AIM EXCHANGE</div>
        <p className="text-gray-300 mb-4">Tu destino premium para gaming y esports</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mt-8 text-sm">
          <div>
            <h3 className="font-semibold text-white mb-3">Navega</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/productos/search" className="hover:text-red-600">Buscar</a></li>
              <li><a href="/quienessomos" className="hover:text-red-600">Quienes Somos</a></li>
              <li><a href="/preguntasfrecuentes" className="hover:text-red-600">Preguntas Frecuentes</a></li>
              <li><a href="/devolucion" className="hover:text-red-600">Política de devolución</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Categorías</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/productos/mouse" className="hover:text-red-600">Mouse</a></li>
              <li><a href="/productos/teclados" className="hover:text-red-600">Teclado</a></li>
              <li><a href="/productos/mousepad" className="hover:text-red-600">Mousepad</a></li>
              <li><a href="/productos/accesorios" className="hover:text-red-600">Accesorios</a></li>
              <li><a href="/productos/audio" className="hover:text-red-600">Audio</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Seguinos</h3>
            <div className="flex justify-center space-x-4">
              <a href="https://instagram.com/aimexchange.com.ar" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-600">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://wa.me/+5492216168681" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 32 32">
                  <path d="M16 3C9.373 3 4 8.373 4 15c0 2.647.832 5.174 2.406 7.324L4 29l6.902-2.263A12.93 12.93 0 0 0 16 27c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 22c-2.13 0-4.21-.627-5.98-1.81l-.426-.267-4.09 1.34 1.34-4.09-.267-.426A9.96 9.96 0 0 1 6 15c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10zm5.07-7.43c-.277-.139-1.637-.808-1.89-.902-.253-.093-.437-.139-.62.139-.184.277-.713.902-.874 1.088-.161.184-.322.208-.599.069-.277-.139-1.17-.431-2.23-1.373-.824-.734-1.381-1.641-1.543-1.918-.161-.277-.017-.427.122-.566.125-.124.277-.322.416-.483.139-.161.184-.277.277-.462.093-.184.046-.346-.023-.485-.069-.139-.62-1.497-.849-2.051-.224-.54-.452-.467-.62-.476-.161-.008-.346-.01-.53-.01-.184 0-.485.069-.74.346-.253.277-.968.947-.968 2.308 0 1.361.992 2.678 1.13 2.865.139.184 1.953 2.988 4.74 4.068.663.286 1.18.457 1.584.585.665.212 1.271.182 1.75.11.534-.08 1.637-.669 1.87-1.316.231-.647.231-1.201.162-1.316-.069-.115-.253-.184-.53-.323z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 text-xs text-gray-500">
          <p>&copy; 2025 Aim Exchange. Todos los derechos reservados. Desarrollado por Octavio Giudice.</p>
        </div>
      </div>
    </footer>
  );
}
