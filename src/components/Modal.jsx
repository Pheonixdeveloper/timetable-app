export default function Modal({ open, title, onClose, children, maxWidth = 520 }) {
    if (!open) return null
    return (
        <div onClick={e => { if (e.target === e.currentTarget) onClose() }}
            style={{
                position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(26,29,46,.45)', backdropFilter: 'blur(4px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
            }}>
            <div style={{
                background: '#fff', borderRadius: 16, boxShadow: '0 8px 32px rgba(67,97,238,.14)',
                width: '100%', maxWidth, padding: '2rem', maxHeight: '90vh', overflowY: 'auto'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{title}</h2>
                    <button onClick={onClose}
                        style={{
                            width: 32, height: 32, borderRadius: 8, background: '#eef1f8', border: 'none', cursor: 'pointer',
                            fontSize: '1.1rem', color: '#4a4e6a', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                        ✕
                    </button>
                </div>
                {children}
            </div>
        </div>
    )
}
