import React, { useState } from 'react';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    setStatus(data.message);
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Subir Excel para actualizar stock</h1>
      <input type="file" accept=".xlsx" onChange={e => setFile(e.target.files?.[0] || null)} />
      <button onClick={handleUpload} className="bg-red-600 text-white px-4 py-2 rounded mt-4">
        Subir
      </button>
      {status && <p className="mt-4 text-green-600">{status}</p>}
    </div>
  );
}