'use client';

import { useState, useEffect } from 'react';
import { X, Play, Plus, Star, Trash } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { useRouter } from 'next/navigation';

interface FavoritesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Favorite {
    id: string;
    questionText: string;
    createdAt: string;
}

export default function FavoritesModal({ isOpen, onClose }: FavoritesModalProps) {
    const router = useRouter();
    const [favorites, setFavorites] = useState<Favorite[]>([]);
    const [newFavorite, setNewFavorite] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            fetchFavorites();
        }
    }, [isOpen]);

    const fetchFavorites = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/api/Favorites');
            setFavorites(res.data);
        } catch (error) {
            console.error('Error fetching favorites', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFavorite.trim()) return;
        try {
            const res = await apiClient.post('/api/Favorites', { questionText: newFavorite });
            setFavorites([res.data, ...favorites]);
            setNewFavorite('');
        } catch (error) {
            console.error('Error adding favorite', error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await apiClient.delete(`/api/Favorites/${id}`);
            setFavorites(favorites.filter(f => f.id !== id));
        } catch (error) {
            console.error('Error deleting favorite', error);
        }
    };

    const handlePlay = (text: string) => {
        onClose();
        router.push(`/chat/new?prompt=${encodeURIComponent(text)}`);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[80vh]">
                <div className="flex justify-between items-center p-4 border-b border-neutral-100">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-neutral-800">
                        <Star className="text-amber-400 fill-amber-400 h-5 w-5" />
                        Perguntas Favoritas
                    </h2>
                    <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-4 border-b border-neutral-100 bg-neutral-50">
                    <form onSubmit={handleAdd} className="flex gap-2">
                        <input
                            type="text"
                            value={newFavorite}
                            onChange={(e) => setNewFavorite(e.target.value)}
                            placeholder="Cadastrar novo favorito..."
                            className="flex-1 bg-white border border-neutral-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                        />
                        <button type="submit" disabled={!newFavorite.trim()} className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white p-2 rounded-xl transition-colors">
                            <Plus className="h-5 w-5" />
                        </button>
                    </form>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {loading ? (
                        <p className="text-center text-sm text-neutral-500 py-4">Carregando...</p>
                    ) : favorites.length === 0 ? (
                        <p className="text-center text-sm text-neutral-500 py-4">Nenhum favorito cadastrado.</p>
                    ) : (
                        favorites.map(fav => (
                            <div key={fav.id} className="flex items-start justify-between p-3 rounded-xl border border-neutral-200 bg-white hover:border-emerald-200 hover:shadow-sm transition-all group">
                                <p className="text-sm text-neutral-700 flex-1 mr-3 leading-relaxed break-words">{fav.questionText}</p>
                                <div className="flex gap-1 shrink-0">
                                    <button
                                        onClick={() => handlePlay(fav.questionText)}
                                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                        title="Usar pergunta"
                                    >
                                        <Play className="h-4 w-4" fill="currentColor" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(fav.id)}
                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                        title="Remover favorito"
                                    >
                                        <Trash className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
