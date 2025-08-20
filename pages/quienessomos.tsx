import Head from 'next/head'
import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function QuienesSomos() {
  return (
    <>
      <Head>
        <title>Quiénes Somos | AIM Exchange</title>
        <meta name="description" content="Conoce la historia y misión de AIM Exchange" />
      </Head>

      <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
        <Navbar />

        <main className="container mx-auto px-4 py-12 flex-1">
          <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow p-8">
            <h1 className="text-3xl font-bold mb-4">Quiénes Somos</h1>
            <p className="mb-4 leading-relaxed">
              En AIM Exchange somos un equipo apasionado por los periféricos gamer. Nacimos con la misión de
              ofrecer productos de calidad, atención personalizada y la mejor comunidad para quienes buscan
              potenciar su experiencia de juego.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">Nuestra misión</h2>
            <p className="mb-4 leading-relaxed">
              Brindar acceso a los mejores productos del mercado, con soporte honesto y precios competitivos.
              Creemos en la transparencia, la velocidad de entrega y en construir relaciones duraderas con
              nuestros clientes.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">Valores</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Calidad y selección</li>
              <li>Atención al cliente dedicada</li>
              <li>Confianza y seguridad en las compras</li>
            </ul>
          </div>
        </main>

        <Footer />
      </div>
    </>
  )
}