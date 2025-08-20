import Head from 'next/head'
import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function PoliticaDeDevolucion() {
  return (
    <>
      <Head>
        <title>Política de Devolución | AIM Exchange</title>
        <meta name="description" content="Conoce nuestras condiciones y plazos de devolución" />
      </Head>

      <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
        <Navbar />

        <main className="container mx-auto px-4 py-12 flex-1">
          <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow p-8">
            <h1 className="text-3xl font-bold mb-4">Política de Devolución</h1>

            <p className="mb-4 leading-relaxed">
              En AIM Exchange ofrecemos un plazo de 30 días corridos para solicitar devoluciones desde la fecha
              de recepción. Para que la devolución sea aceptada, el producto debe encontrarse en condiciones
              originales, con su embalaje y comprobante de compra.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">Proceso de devolución</h2>
            <ol className="list-decimal list-inside space-y-2 mb-6">
              <li>Contactar a soporte indicando el número de pedido y motivo.</li>
              <li>Empacar el producto en su caja original y adjuntar el comprobante.</li>
              <li>Enviar el paquete a la dirección que te indique soporte.</li>
              <li>Una vez recibido y verificado, procesamos el reembolso o el cambio.</li>
            </ol>

            <h2 className="text-xl font-semibold mt-6 mb-3">Excepciones</h2>
            <p className="leading-relaxed">
              Productos con daños por uso, accesorios consumibles o instrucciones no seguidas pueden quedar
              fuera de la política de devolución. Consulta con soporte para casos particulares.
            </p>
          </div>
        </main>

        <Footer />
      </div>
    </>
  )
}