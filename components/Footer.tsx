import React from 'react';
import { Instagram } from 'lucide-react';
import { FaDiscord, FaWhatsapp } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-black border-t border-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex justify-center mb-2">
          <img src="/logos/logoaimexchangepnghd.png" alt="Aim Exchange Logo" className="h-12 w-auto mx-auto" />
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
              <li className="hidden"><a href="/productos/mousepad" className="hover:text-red-600">Mousepad</a></li>
              <li className="hidden"><a href="/productos/accesorios" className="hover:text-red-600">Accesorios</a></li>
              <li className="hidden"><a href="/productos/audio" className="hover:text-red-600">Audio</a></li>
              <li><a href="/productos/teclados" className="hover:text-red-600">Teclado</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Seguinos</h3>
            <div className="flex justify-center space-x-4">
              <a href="https://instagram.com/aimexchange.com.ar" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-600">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://discord.com/invite/KPctbF49" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-600" aria-label="Discord">
                <FaDiscord className="w-5 h-5 inline" />
              </a>
              <a href="https://wa.me/+5492216168681" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-600" aria-label="WhatsApp">
                <FaWhatsapp className="w-5 h-5 inline" />
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
