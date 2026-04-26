import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const ThemeContext = createContext();

export const FESTIVAL_CALENDAR = [
    { id: 'lohri', themeId: 'lohri', name: 'Lohri', emoji: '🔥', date: '01-13', color: '#FF6B00', bg: 'from-orange-600 to-red-600', description: 'Bonfire Celebration' },
    { id: 'pongal', themeId: 'pongal', name: 'Pongal', emoji: '🌾', date: '01-14', color: '#BF5700', bg: 'from-yellow-500 to-orange-600', description: 'Harvest Festival' },
    { id: 'holi', themeId: 'holi', name: 'Holi', emoji: '🎨', date: '03-04', color: '#FF006E', bg: 'from-pink-500 to-purple-600', description: 'Vibrant & Joyful' },
    { id: 'eid', themeId: 'eid', name: 'Eid', emoji: '🌙', date: '03-20', color: '#06D6A0', bg: 'from-emerald-600 to-teal-800', description: 'Festival of Joy' },
    { id: 'onam', themeId: 'onam', name: 'Onam', emoji: '🌸', date: '08-26', color: '#FF6F00', bg: 'from-yellow-400 to-orange-500', description: 'Kerala Harvest' },
    { id: 'rakhi', themeId: 'rakhi', name: 'Raksha Bandhan', emoji: '🎀', date: '08-28', color: '#E91E8C', bg: 'from-pink-400 to-rose-600', description: 'Bond of Love' },
    { id: 'navratri', themeId: 'navratri', name: 'Navratri', emoji: '💃', date: '10-11', color: '#DC267F', bg: 'from-violet-600 to-fuchsia-600', description: 'Royal & Rhythmic' },
    { id: 'dussehra', themeId: 'dussehra', name: 'Dussehra', emoji: '🏹', date: '10-20', color: '#FF6B00', bg: 'from-orange-500 to-red-700', description: 'Victory of Good' },
    { id: 'diwali', themeId: 'diwali', name: 'Diwali', emoji: '🪔', date: '11-08', color: '#FFD700', bg: 'from-[#0f172a] via-[#1e1b4b] to-[#312e81]', description: 'Warm & Glowing' },
    { id: 'christmas', themeId: 'christmas', name: 'Christmas', emoji: '🎄', date: '12-25', color: '#C62828', bg: 'from-red-700 to-green-800', description: 'Festival of Giving' },
];

export const THEMES = {
    default: { id: 'default', name: 'Default', emoji: '🛍️', label: 'BizUplift', dotColor: '#E85D04', description: 'Warm Saffron' },
    holi: { id: 'holi', name: 'Holi', emoji: '🎨', label: 'Holi — Festival of Colors', dotColor: 'linear-gradient(135deg, #FF006E, #FFD60A, #06D6A0)', description: 'Vibrant & Joyful' },
    diwali: { id: 'diwali', name: 'Diwali', emoji: '🪔', label: 'Diwali — Festival of Lights', dotColor: '#FFD700', description: 'Warm & Glowing' },
    navratri: { id: 'navratri', name: 'Navratri', emoji: '🌺', label: 'Navratri — Festival of Dance', dotColor: 'linear-gradient(135deg, #DC267F, #7C3AED)', description: 'Royal & Rhythmic' },
    eid: { id: 'eid', name: 'Eid', emoji: '🌙', label: 'Eid — Festival of Joy', dotColor: 'linear-gradient(135deg, #06D6A0, #1B5E20)', description: 'Serene & Elegant' },
    christmas: { id: 'christmas', name: 'Christmas', emoji: '🎄', label: 'Christmas — Festival of Giving', dotColor: 'linear-gradient(135deg, #C62828, #2E7D32)', description: 'Warm & Festive' },
    onam: { id: 'onam', name: 'Onam', emoji: '🌸', label: 'Onam — Kerala Harvest', dotColor: 'linear-gradient(135deg, #FF6F00, #FFD700)', description: 'Golden Harvest' },
    rakhi: { id: 'rakhi', name: 'Raksha Bandhan', emoji: '🎀', label: 'Raksha Bandhan — Bond of Love', dotColor: 'linear-gradient(135deg, #E91E8C, #7C3AED)', description: 'Love & Bond' },
    dussehra: { id: 'dussehra', name: 'Dussehra', emoji: '🏹', label: 'Dussehra — Victory of Good', dotColor: 'linear-gradient(135deg, #FF6B00, #C62828)', description: 'Heroic & Bold' },
    pongal: { id: 'pongal', name: 'Pongal', emoji: '🌾', label: 'Pongal — Harvest Festival', dotColor: 'linear-gradient(135deg, #BF5700, #FFD700)', description: 'Earthy & Warm' },
    lohri: { id: 'lohri', name: 'Lohri', emoji: '🔥', label: 'Lohri — Bonfire Celebration', dotColor: 'linear-gradient(135deg, #FF6B00, #C62828)', description: 'Fiery & Warm' },
};

export const FESTIVAL_PALETTES = {
    default: { primary: '#E85D04', secondary: '#03071E', accent: '#FFD700', particleColors: ['#E85D04', '#FFD700', '#FF6B00'] },
    holi: { primary: '#FF006E', secondary: '#06D6A0', accent: '#FFD60A', particleColors: ['#FF006E', '#00B4D8', '#FFD60A', '#06D6A0', '#FB5607', '#8338EC'] },
    diwali: { primary: '#FFD700', secondary: '#FFF8E7', accent: '#FF6B00', particleColors: ['#FFD700', '#FF6B00', '#FFF8E7', '#FF0000'] },
    navratri: { primary: '#DC267F', secondary: '#7C3AED', accent: '#F59E0B', particleColors: ['#DC267F', '#7C3AED', '#F59E0B', '#06D6A0', '#EF4444', '#3B82F6'] },
    eid: { primary: '#06D6A0', secondary: '#1B5E20', accent: '#A7F3D0', particleColors: ['#06D6A0', '#1B5E20', '#A7F3D0', '#FFD700'] },
    christmas: { primary: '#C62828', secondary: '#2E7D32', accent: '#FFD700', particleColors: ['#C62828', '#2E7D32', '#FFD700', '#FFFFFF'] },
    onam: { primary: '#FF6F00', secondary: '#FFD700', accent: '#FFA726', particleColors: ['#FF6F00', '#FFD700', '#FFA726', '#FFFFFF'] },
    rakhi: { primary: '#E91E8C', secondary: '#7C3AED', accent: '#F48FB1', particleColors: ['#E91E8C', '#7C3AED', '#F48FB1', '#FFD700'] },
    dussehra: { primary: '#FF6B00', secondary: '#C62828', accent: '#FFD700', particleColors: ['#FF6B00', '#C62828', '#FFD700'] },
    pongal: { primary: '#BF5700', secondary: '#FFD700', accent: '#8D6E63', particleColors: ['#BF5700', '#FFD700', '#8D6E63', '#FFA726'] },
    lohri: { primary: '#FF6B00', secondary: '#C62828', accent: '#FFD60A', particleColors: ['#FF6B00', '#C62828', '#FFD60A', '#FF8A00'] },
};

export function getNextFestival(now = new Date()) {
    const currentYear = now.getFullYear();
    const results = [];

    for (const fest of FESTIVAL_CALENDAR) {
        const [month, day] = fest.date.split('-').map(Number);
        for (const year of [currentYear, currentYear + 1]) {
            const festDate = new Date(year, month - 1, day);
            const diffMs = festDate - now;
            const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
            if (diffDays >= -3) {
                results.push({
                    ...fest,
                    nextDate: festDate,
                    daysUntil: diffDays,
                    isActive: diffDays >= -3 && diffDays <= 0,
                });
                break;
            }
        }
    }

    results.sort((a, b) => {
        if (a.isActive && !b.isActive) return -1;
        if (!a.isActive && b.isActive) return 1;
        return a.daysUntil - b.daysUntil;
    });

    return results;
}

export function getCurrentOrNextFestival(now = new Date()) {
    const sorted = getNextFestival(now);
    return sorted.length > 0 ? sorted[0] : null;
}

export const ThemeProvider = ({ children }) => {
    const [adminOverride, setAdminOverride] = useState(() => {
        return localStorage.getItem('bizuplift-admin-theme') || null;
    });

    const [autoTheme, setAutoTheme] = useState('default');
    const [nextFestival, setNextFestival] = useState(null);

    const effectiveTheme = adminOverride || autoTheme;

    const setThemeAdmin = useCallback((newTheme) => {
        if (newTheme === 'auto') {
            setAdminOverride(null);
            localStorage.removeItem('bizuplift-admin-theme');
        } else {
            setAdminOverride(newTheme);
            localStorage.setItem('bizuplift-admin-theme', newTheme);
        }
    }, []);

    const setTheme = useCallback((newTheme) => {
        setThemeAdmin(newTheme);
    }, [setThemeAdmin]);

    useEffect(() => {
        const updateAutoTheme = () => {
            const result = getCurrentOrNextFestival();
            if (result) {
                setNextFestival(result);
                if (result.isActive) {
                    setAutoTheme(result.themeId);
                } else if (result.daysUntil <= 15) {
                    setAutoTheme(result.themeId);
                } else {
                    setAutoTheme('default');
                }
            }
        };
        updateAutoTheme();
        const interval = setInterval(updateAutoTheme, 60 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', effectiveTheme);
    }, [effectiveTheme]);

    const festivalPalette = FESTIVAL_PALETTES[effectiveTheme] || FESTIVAL_PALETTES.default;

    const contextValue = useMemo(() => ({
        theme: effectiveTheme,
        autoTheme,
        adminOverride,
        setThemeAdmin,
        setTheme,
        themes: THEMES,
        nextFestival,
        isAutoMode: !adminOverride,
        festivalPalette,
    }), [effectiveTheme, autoTheme, adminOverride, setThemeAdmin, setTheme, nextFestival, festivalPalette]);

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
