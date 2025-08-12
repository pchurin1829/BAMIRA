import { useRouter } from 'next/router';
import Link from 'next/link';

export default function ProductoByIdPage() {
	const router = useRouter();
	const { id } = router.query;
	return (
		<div className="min-h-screen bg-black text-white p-8">
			<h1 className="text-2xl font-semibold">Producto #{id}</h1>
			<p className="mt-2 opacity-80">Esta página está en construcción.</p>
			<Link href="/" className="text-blue-400 underline mt-4 inline-block">Volver al inicio</Link>
		</div>
	);
}
