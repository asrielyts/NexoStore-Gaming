import React, {createContext, useContext, useEffect, useMemo, useState, useCallback} from 'react';
import {loadCatalog, loadAdminState, api} from '../data/database';
import {currentUserApi, logoutApi} from '../services/authApi';

const empty = {version: 2, products: [], categories: [], users: [], orders: [], messages: [], posts: []};
const StoreContext = createContext(null);

export function StoreProvider({children}) {
    const [db, setDb] = useState(empty), [session, setSessionState] = useState(null), [cart, setCart] = useState([]), [loading, setLoading] = useState(true), [loadError, setLoadError] = useState('');
    const refresh = useCallback(async () => {
        try {
            const catalog = await loadCatalog();
            let next = {...empty, ...catalog};
            if (session?.role === 'admin') {
                const admin = await loadAdminState();
                next = {...next, ...admin};
                const current = admin.users?.find(u => u.id === session.id);
                if (current) setSessionState(current);
            }
            setDb(next);
            setLoadError('');
            return next;
        } catch (e) {
            setLoadError(e.message);
            throw e;
        }
    }, [session]);
    const setSession = useCallback(async user => {
        setSessionState(user || null);
        if (!user) {
            setCart([]);
            try {
                setDb({...empty, ...await loadCatalog()});
            } catch {
                setDb({...empty});
            }
            return;
        }
        if (user.role === 'admin') {
            try {
                const admin = await loadAdminState();
                setDb(old => ({...old, ...admin}));
            } catch (e) {
                setLoadError(e.message);
            }
        }
    }, []);
    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const catalog = await loadCatalog();
                let next = {...empty, ...catalog};
                try {
                    const current = await currentUserApi();
                    if (alive) {
                        setSessionState(current.user);
                        if (current.user.role === 'admin') next = {...next, ...await loadAdminState()};
                    }
                } catch {
                }
                if (alive) setDb(next);
            } catch (e) {
                if (alive) setLoadError(e.message);
            } finally {
                if (alive) setLoading(false);
            }
        })();
    }, []);
    useEffect(() => {
        const onRefresh = () => refresh().catch(() => {
        });
        const onOrder = e => setDb(old => ({
            ...old,
            orders: [e.detail, ...old.orders.filter(o => o.id !== e.detail.id)]
        }));
        window.addEventListener('nexostore:refresh', onRefresh);
        window.addEventListener('nexostore:order', onOrder);
        return () => {
            window.removeEventListener('nexostore:refresh', onRefresh);
            window.removeEventListener('nexostore:order', onOrder);
        };
    }, [refresh]);
    const addToCart = (product, quantity = 1) => {
        if (!product || product.stock < 1) return;
        setCart(current => {
            const present = current.find(x => x.productId === product.id)?.quantity || 0;
            return [...current.filter(x => x.productId !== product.id), {
                productId: product.id,
                quantity: Math.min(product.stock, present + quantity)
            }];
        });
    };
    const updateCart = (productId, quantity) => {
        const stock = db.products.find(p => p.id === productId)?.stock || 0;
        setCart(list => [...list.filter(x => x.productId !== productId), ...((quantity > 0 && stock > 0) ? [{
            productId,
            quantity: Math.min(stock, quantity)
        }] : [])]);
    };
    const signOut = async () => {
        try {
            await logoutApi();
        } finally {
            await setSession(null);
        }
    };
    const value = useMemo(() => ({
        db,
        session,
        setSession,
        signOut,
        cart,
        setCart,
        addToCart,
        updateCart,
        refresh,
        loading,
        loadError
    }), [db, session, setSession, signOut, cart, refresh, loading, loadError]);
    return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
    const value = useContext(StoreContext);
    if (!value) throw new Error('StoreProvider requerido');
    return value;
}
