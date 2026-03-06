'use client';

import { useState, useEffect } from 'react';
import { ShieldAlert, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

export default function SessionModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [title, setTitle] = useState('Acesso Restrito');

    useEffect(() => {
        const handleShowModal = (event: any) => {
            const { message, errorType } = event.detail || {};
            setMessage(message || 'Sua sessão expirou ou outro acesso foi detectado.');

            if (errorType === 'CONCURRENT_SESSION') {
                setTitle('Acesso Simultâneo');
            } else if (errorType === 'FORBIDDEN_INACTIVE_USER') {
                setTitle('Conta Inativa');
            } else {
                setTitle('Sessão Encerrada');
            }

            setIsOpen(true);
        };

        window.addEventListener('show-session-modal', handleShowModal);
        return () => window.removeEventListener('show-session-modal', handleShowModal);
    }, []);

    const handleOk = async () => {
        setIsOpen(false);
        await signOut({ callbackUrl: '/' });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-neutral-100 overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-8 text-center">
                    <div className="mx-auto w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6">
                        <ShieldAlert className="h-10 w-10 text-amber-500" />
                    </div>

                    <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                        {title}
                    </h3>

                    <p className="text-neutral-600 mb-8 leading-relaxed text-balance">
                        {message}
                    </p>

                    <button
                        onClick={handleOk}
                        className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg shadow-emerald-200 active:scale-[0.98]"
                    >
                        OK, Entendido
                    </button>
                </div>

                <div className="bg-neutral-50 px-8 py-4 border-t border-neutral-100">
                    <p className="text-xs text-center text-neutral-400">
                        Por motivos de segurança, permitimos apenas um acesso simultâneo por conta.
                    </p>
                </div>
            </div>
        </div>
    );
}
