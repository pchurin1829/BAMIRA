import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).send('Método no permitido');
    return;
  }
  const uploadDir = path.join(process.cwd(), 'public/images');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  const form = new IncomingForm({ multiples: false, uploadDir, keepExtensions: true });
  // Parse request and handle file upload in a promise
  const result = await new Promise<{ url?: string; error?: string }>((resolve) => {
    form.parse(req, (err, fields, files) => {
      if (err || !files.file) {
        resolve({ error: 'Error al procesar archivo' });
        return;
      }
      const file = Array.isArray(files.file) ? files.file[0] : files.file;
      const ext = path.extname(file.originalFilename || file.newFilename);
      const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
      const destPath = path.join(uploadDir, filename);
      try {
        fs.renameSync(file.filepath, destPath);
        const url = `/images/${filename}`;
        resolve({ url });
      } catch (error) {
        resolve({ error: 'Error al guardar archivo' });
      }
    });
  });
  if (result.error) {
    res.status(400).json({ error: result.error });
    return;
  }
  res.status(200).json({ url: result.url });
}
