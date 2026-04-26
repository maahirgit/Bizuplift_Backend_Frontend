import { useState, useRef, useEffect } from 'react';
import { useTheme, THEMES } from '../../context/ThemeContext';

const ThemeSwitcher = () => {
    const { theme, setTheme, isAutoMode, nextFestival } = useTheme();
    const [open, setOpen] = useState(false);
    const panelRef = useRef(null);

    const themeList = Object.values(THEMES);
    const current = THEMES[theme] || THEMES.default;
    const isDiwali = theme === 'diwali';

    useEffect(() => {
        const handler = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        if (open) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const panelBg = isDiwali ? '#1a0a3a' : '#ffffff';
    const panelText = isDiwali ? '#FFF8E7' : '#374151';
    const panelMuted = isDiwali ? 'rgba(255,248,231,0.5)' : '#9CA3AF';
    const hoverBg = isDiwali ? 'rgba(255,215,0,0.1)' : '#F9FAFB';

    return (
        <div ref={panelRef} style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
            <div
                style={{
                    position: 'absolute',
                    bottom: '68px',
                    right: '0',
                    background: panelBg,
                    borderRadius: '16px',
                    padding: '8px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
                    minWidth: '260px',
                    maxHeight: '70vh',
                    overflowY: 'auto',
                    transformOrigin: 'bottom right',
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    opacity: open ? 1 : 0,
                    transform: open ? 'scale(1) translateY(0)' : 'scale(0.85) translateY(10px)',
                    pointerEvents: open ? 'auto' : 'none',
                    border: isDiwali ? '1px solid rgba(255,215,0,0.2)' : '1px solid rgba(0,0,0,0.06)',
                }}
            >
                <p style={{ padding: '8px 14px 4px', fontSize: '11px', fontWeight: 700, color: panelMuted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    Festival Theme
                </p>

                <button
                    onClick={() => { setTheme('auto'); setOpen(false); }}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        border: 'none',
                        background: isAutoMode ? 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.15))' : 'transparent',
                        width: '100%',
                        textAlign: 'left',
                        fontSize: '14px',
                        fontWeight: isAutoMode ? 700 : 500,
                        color: isAutoMode ? '#6366F1' : panelText,
                        transition: 'all 0.2s ease',
                        marginBottom: '4px',
                    }}
                >
                    <span style={{
                        width: '26px', height: '26px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366F1, #A855F7)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px'
                    }}>
                        🤖
                    </span>
                    <span style={{ flex: 1 }}>
                        <span style={{ display: 'block' }}>Auto Mode</span>
                        <span style={{ display: 'block', fontSize: '10px', color: panelMuted, fontWeight: 400 }}>
                            {isAutoMode && nextFestival ? `Active: ${nextFestival.emoji} ${nextFestival.name}` : 'Changes with festivals'}
                        </span>
                    </span>
                    {isAutoMode && (
                        <span style={{ color: '#6366F1', fontSize: '16px' }}>✓</span>
                    )}
                </button>

                <div style={{ height: '1px', background: isDiwali ? 'rgba(255,215,0,0.15)' : '#E5E7EB', margin: '4px 14px' }} />

                {themeList.map(t => {
                    const isActive = !isAutoMode && theme === t.id;
                    return (
                        <button
                            key={t.id}
                            onClick={() => { setTheme(t.id); setOpen(false); }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '10px 14px',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                border: 'none',
                                background: isActive ? (isDiwali ? 'rgba(255,215,0,0.15)' : 'rgba(232,93,4,0.08)') : 'transparent',
                                width: '100%',
                                textAlign: 'left',
                                fontSize: '14px',
                                fontWeight: isActive ? 700 : 500,
                                color: isActive ? 'rgb(var(--color-primary))' : panelText,
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = hoverBg; }}
                            onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                        >
                            <span
                                style={{
                                    width: '26px',
                                    height: '26px',
                                    borderRadius: '50%',
                                    background: t.dotColor,
                                    flexShrink: 0,
                                    boxShadow: isActive ? `0 0 0 3px rgba(232,93,4,0.25)` : 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '13px',
                                    transition: 'box-shadow 0.2s ease',
                                }}
                            >
                                {t.emoji}
                            </span>
                            <span style={{ flex: 1 }}>
                                <span style={{ display: 'block' }}>{t.name}</span>
                                <span style={{ display: 'block', fontSize: '11px', color: panelMuted, fontWeight: 400 }}>{t.description}</span>
                            </span>
                            {isActive && (
                                <span style={{ color: 'rgb(var(--color-primary))', fontSize: '16px' }}>✓</span>
                            )}
                        </button>
                    );
                })}
            </div>

            <button
                onClick={() => setOpen(o => !o)}
                title="Change Festival Theme"
                style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'var(--btn-gradient)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    transition: 'all 0.3s ease',
                    transform: open ? 'scale(1.1) rotate(15deg)' : 'scale(1)',
                }}
                aria-label="Festival Theme Switcher"
            >
                {open ? '✕' : (isAutoMode ? '🤖' : current.emoji)}
            </button>
        </div>
    );
};

export default ThemeSwitcher;
