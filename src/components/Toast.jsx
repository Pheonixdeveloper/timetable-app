export default function Toast({ msg, type = 'info' }) {
    const bg = type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : 'var(--primary)'
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'
    return (
        <div style={{
            position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 2000,
            background: bg, color: '#fff', padding: '.7rem 1.2rem', borderRadius: 10,
            fontSize: '.88rem', display: 'flex', alignItems: 'center', gap: '.5rem',
            boxShadow: '0 8px 32px rgba(0,0,0,.15)', animation: 'fadeIn .25s ease'
        }}>
            <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
            <span>{icon}</span> {msg}
        </div>
    )
}
