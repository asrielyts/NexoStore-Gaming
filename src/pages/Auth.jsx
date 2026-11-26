import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {UserRound, ShieldCheck} from 'lucide-react';
import {useStore} from '../context/StoreContext';
import {loginApi, registerApi} from '../services/authApi';

export function Auth() {
    const {setSession} = useStore();
    const navigate = useNavigate();
    const [mode, setMode] = useState('login');
    const [form, setForm] = useState({name: '', email: '', password: ''});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const submit = async e => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const result = mode === 'register'
                ? await registerApi(form.name, form.email, form.password)
                : await loginApi(form.email, form.password);
            const user = {...result.user};
            await setSession(user);
            navigate(user.role === 'admin' ? '/admin' : '/');
        } catch (err) {
            setError(err.message || 'No fue posible iniciar sesión.');
        } finally {
            setLoading(false);
        }
    };
    return <main className="container section-pad">
        <div className="auth-layout">
            <div className="auth-promo">
                <div className="eyebrow">NEXOSTORE GAMING</div>
                <h2>TU CUENTA, TU UNIVERSO.</h2><p>Explora el catálogo y gestiona pedidos demostrativos en una sola
                experiencia.</p>
                <div className="auth-icon"><UserRound size={100}/></div>
                <p className="auth-warning"><ShieldCheck size={19}/> Autenticación gestionada por Spring Boot mediante
                    JWT. Proyecto educativo.</p></div>
            <form className="auth-form surface-panel" onSubmit={submit}>
                <div className="eyebrow">BIENVENIDO A NEXOSTORE</div>
                <h1>{mode === 'login' ? 'Iniciar sesión' : 'Crear una cuenta'}</h1>
                <p>{mode === 'login' ? 'Accede a tu experiencia gaming.' : 'Crea una cuenta demostrativa de cliente.'}</p>{mode === 'register' && <>
                <label className="form-label">Nombre completo</label><input required className="form-control mb-3"
                                                                            value={form.name} onChange={e => setForm({
                ...form,
                name: e.target.value
            })}/></>}<label className="form-label">Correo electrónico</label><input className="form-control mb-3"
                                                                                    type="email" required
                                                                                    value={form.email}
                                                                                    onChange={e => setForm({
                                                                                        ...form,
                                                                                        email: e.target.value
                                                                                    })}/><label
                className="form-label">Contraseña {mode === 'register' ? '(mínimo 6 caracteres)' : ''}</label><input
                className="form-control mb-3" type="password" minLength={mode === 'register' ? 6 : undefined} required
                value={form.password} onChange={e => setForm({...form, password: e.target.value})}/>{error &&
                <div className="alert alert-danger" role="alert">{error}</div>}
                <button disabled={loading}
                        className="btn btn-neon w-100 justify-content-center">{loading ? 'CONECTANDO...' : mode === 'login' ? 'ENTRAR' : 'CREAR CUENTA'}</button>
                <button type="button" className="auth-switch" onClick={() => {
                    setMode(mode === 'login' ? 'register' : 'login');
                    setError('');
                }}>{mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}</button>
            </form>
        </div>
    </main>;
}
