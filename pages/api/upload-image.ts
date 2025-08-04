import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Método no permitido');

  const form = new IncomingForm({ multiples: false });
  form.uploadDir = path.join(process.cwd(), 'public/images');
  form.keepExtensions = true;

  form.parse(req, async (err, fields, files) => {
    if (err || !files.file) return res.status(400).json({ error: 'Error al procesar archivo' });
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const ext = path.extname(file.originalFilename || file.newFilename);
    const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
    const destPath = path.join(form.uploadDir, filename);
    fs.renameSync(file.filepath, destPath);
    const url = `/images/${filename}`;
    return res.status(200).json({ url });
  });
}
