import { IncomingForm } from 'formidable'
import xlsx from 'xlsx'
import { PrismaClient } from '@prisma/client'

export const config = { api: { bodyParser: false } }

const prisma = new PrismaClient()

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send("Método no permitido")

  const form = new IncomingForm({ multiples: false })
  form.parse(req, async (err, fields, files) => {
    if (err || !files.file) return res.status(400).json({ message: "Error al procesar archivo" })

    const file = Array.isArray(files.file) ? files.file[0] : files.file
    const workbook = xlsx.readFile(file.filepath)
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const data = xlsx.utils.sheet_to_json(sheet)

    let productosAgregados = 0
    for (const row of data) {
      if (!row.nombre) continue
      await prisma.producto.upsert({
        where: { nombre: row.nombre },
        update: {
          descripcion: row.descripcion,
          precio: parseFloat(row.precio),
          stock: row.stock,
          categoriaId: row.categoriaId
        },
        create: {
          nombre: row.nombre,
          descripcion: row.descripcion,
          precio: parseFloat(row.precio),
          stock: row.stock,
          categoriaId: row.categoriaId
        }
      })
      productosAgregados++
    }

    return res.status(200).json({ message: `Actualizados ${productosAgregados} productos.` })
  })
}