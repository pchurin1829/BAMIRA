import { useEffect, useState } from 'react';

export default function PromoCardsAdmin() {
  const [cards, setCards] = useState([]);
  const [form, setForm] = useState({ title: '', subtitle: '', description: '', imageUrl: '', bgColor: '#1f2937' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/promocards')
      .then(res => res.json())
      .then(setCards);
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAdd = async e => {
    e.preventDefault();
    setLoading(true);
    await fetch('/api/promocards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setForm({ title: '', subtitle: '', description: '', imageUrl: '', bgColor: '#1f2937' });
    fetch('/api/promocards').then(res => res.json()).then(setCards);
    setLoading(false);
  };

  const handleDelete = async id => {
    setLoading(true);
    await fetch('/api/promocards', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    fetch('/api/promocards').then(res => res.json()).then(setCards);
    setLoading(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Tarjetas Promocionales</h1>
      <p className="mb-4 text-gray-600">Administra las tarjetas promocionales que se muestran en la página principal.</p>
      
      <form onSubmit={handleAdd} className="mb-6 space-y-4 bg-gray-900 p-4 rounded shadow text-white">
        <h2 className="text-lg font-semibold">Agregar nueva tarjeta promocional</h2>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Título</label>
          <input 
            name="title" 
            value={form.title} 
            onChange={handleChange} 
            placeholder="Ej: ¡Nuevo!" 
            className="border border-gray-700 bg-gray-800 text-white px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Subtítulo</label>
          <input 
            name="subtitle" 
            value={form.subtitle} 
            onChange={handleChange} 
            placeholder="Ej: Lamzu Maya X" 
            className="border border-gray-700 bg-gray-800 text-white px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Descripción</label>
          <input 
            name="description" 
            value={form.description} 
            onChange={handleChange} 
            placeholder="Ej: El mouse más esperado del año" 
            className="border border-gray-700 bg-gray-800 text-white px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">URL de la imagen (opcional)</label>
          <input 
            name="imageUrl" 
            value={form.imageUrl} 
            onChange={handleChange} 
            placeholder="https://ejemplo.com/imagen.jpg" 
            className="border border-gray-700 bg-gray-800 text-white px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Color de fondo</label>
          <div className="flex items-center gap-2">
            <input 
              type="color" 
              name="bgColor" 
              value={form.bgColor} 
              onChange={handleChange} 
              className="w-10 h-10 border border-gray-700 rounded cursor-pointer bg-gray-800"
            />
            <span className="text-sm text-gray-400">{form.bgColor}</span>
          </div>
        </div>
        <button 
          type="submit" 
          className="bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700 transition-colors" 
          disabled={loading}
        >
          {loading ? 'Guardando...' : 'Agregar tarjeta'}
        </button>
      </form>
      
      <h2 className="text-lg font-semibold mb-3">Tarjetas existentes</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map(card => (
          <div key={card.id} className="rounded shadow overflow-hidden" style={{ background: card.bgColor }}>
            <div className="p-5 text-white relative">
              <button 
                onClick={() => handleDelete(card.id)} 
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700"
                title="Eliminar"
              >
                ×
              </button>
              <h3 className="font-bold text-lg">{card.title}</h3>
              <h4 className="text-base mb-1">{card.subtitle}</h4>
              <p className="text-sm opacity-90 mb-3">{card.description}</p>
              <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded text-sm font-medium transition-colors">
                Ver más
              </button>
            </div>
          </div>
        ))}
      </div>
      {cards.length === 0 && (
        <p className="text-gray-500 text-center py-4">No hay tarjetas promocionales. Agrega una para empezar.</p>
      )}
    </div>
  );
}