import Head from 'next/head'
import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function PreguntasFrecuentes() {
  return (
    <>
      <Head>
        <title>Preguntas Frecuentes | AIM Exchange</title>
        <meta name="description" content="Resuelve tus dudas más comunes sobre AIM Exchange" />
      </Head>

      <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
        <Navbar />

        <main className="container mx-auto px-4 py-12 flex-1">
          <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow p-8">
            <h1 className="text-3xl font-bold mb-6">Preguntas Frecuentes</h1>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-2">¿Cómo realizo un pedido?</h2>
              <p className="leading-relaxed">
                Agrega los productos al carrito, revisa el resumen y procede al pago. Recibirás un correo con el
                detalle y el número de pedido. Si elegiste transferencia bancaria o efectivo,
                luego de realizar el pago asegurate de subir el comprobante de pago.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-2">¿Cuáles son los métodos de pago?</h2>
              <p className="leading-relaxed">
                Aceptamos tarjetas de crédito/débito a traves de MercadoPago, transferencias bancarias y efectivo 
                en el local previa seña realizada al finalizar la compra mediante transferencia bancaria.
              </p>
            </section>

            <section className="mb-6 hidden">
              <h2 className="text-xl font-semibold mb-2">¿Cuál es el tiempo de entrega?</h2>
              <p className="leading-relaxed">
                El tiempo de entrega depende del producto y la zona de envío. En general trabajamos con envíos
                exprés y estándar; el estimado aparece en la pantalla de checkout.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-2">¿Puedo devolver un producto?</h2>
              <p className="leading-relaxed">
                Sí, revisa nuestra política de devoluciones para condiciones y plazos. Conserva el comprobante
                y el embalaje original para facilitar el proceso.
              </p>
            </section>
          </div>
        </main>

        <Footer />
      </div>
    </>
  )
}