import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useEffect, useState } from 'react';
import PromoCardsAdmin from './PromoCardsAdmin';
import FeaturedProductsAdmin from './FeaturedProductsAdmin';
import CurrentHomePreview from './CurrentHomePreview';

export default function AdminHomeSection() {
  const [currentSection, setCurrentSection] = useState({
    titulo: '',
    subtitulo: '',
    textoBoton: '',
    linkBoton: '',
    colorFondo: '#ffffff',
    colorTexto: '#000000',
    imagenUrl: '',
  });
  const [form, setForm] = useState({
    titulo: '',
    subtitulo: '',
    textoBoton: '',
    linkBoton: '',
    colorFondo: '#ffffff',
    colorTexto: '#000000',
    imagenUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetch('/api/home-section')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setCurrentSection(data);
          setForm(data); // Inicializa el formulario con los datos actuales
        }
      });
  }, []);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleColorChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (data.url) {
      setForm({ ...form, imagenUrl: data.url });
      setSuccess('Imagen subida correctamente');
    } else {
      setError('Error al subir la imagen');
    }
    setLoading(false);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    const res = await fetch('/api/home-section', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setSuccess('Sección actualizada correctamente');
      // Actualiza la vista actual con los nuevos datos
      setCurrentSection(form);
    } else {
      setError('Error al actualizar la sección');
    }
    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Editar sección principal del Home</h1>
        
        {/* Vista actual publicada */}
        <div className="max-w-4xl mx-auto py-8">
          <h2 className="text-xl font-bold mb-4 text-center">Vista actual publicada</h2>
          <CurrentHomePreview />
        </div>

        {/* Sección: Tarjetas Promocionales */}
        <div className="max-w-4xl mx-auto py-8">
          <h2 className="text-xl font-bold mb-4 text-center">Tarjetas Promocionales</h2>
          <PromoCardsAdmin />
        </div>

        {/* Sección: Productos Destacados */}
        <div className="max-w-4xl mx-auto py-8">
          <h2 className="text-xl font-bold mb-4 text-center">Productos Destacados</h2>
          <FeaturedProductsAdmin />
        </div>
      </div>

      <Footer />
    </>
  );
}