import React, { useEffect } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { RefreshCw, X } from 'lucide-react';

function ReloadPrompt() {
    const {
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log('SW Registered: ' + r)
        },
        onRegisterError(error) {
            console.log('SW registration error', error)
        },
    })

    const close = () => {
        setNeedRefresh(false)
    }

    return (
        <div className="ReloadPrompt-container">
            {(needRefresh) && (
                <div className="reload-toast glass-card fade-in" style={{
                    position: 'fixed',
                    bottom: '80px',
                    right: '20px',
                    left: '20px',
                    zIndex: 2000,
                    background: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid var(--primary)',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <RefreshCw className="spin-slow" size={20} color="var(--primary)" />
                            <div>
                                <h3 style={{ fontSize: '14px', fontWeight: 'bold' }}>Nueva versión disponible</h3>
                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Actualiza para ver los últimos cambios.</p>
                            </div>
                        </div>
                        <button onClick={close} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                            <X size={18} />
                        </button>
                    </div>

                    <button
                        onClick={() => updateServiceWorker(true)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        INSTALAR ACTUALIZACIÓN
                    </button>
                </div>
            )}
        </div>
    )
}

export default ReloadPrompt
