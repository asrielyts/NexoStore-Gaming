import {Link, NavLink, useNavigate} from 'react-router-dom';
import {
    Gamepad2,
    ShoppingBag,
    UserRound,
    LogOut,
    ArrowRight,
    Package,
    ShieldCheck,
    Truck,
    LifeBuoy,
    Minus,
    Plus
} from 'lucide-react';
import React, {useState} from 'react';
import {useStore} from '../context/StoreContext';
import {money} from '../data/database';

export function Header() {
    const {cart, session, signOut} = useStore();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const links = [['/', 'Inicio'], ['/productos', 'Productos'], ['/categorias', 'Categorías'], ['/ofertas', 'Ofertas'], ['/blog', 'Blog'], ['/nosotros', 'Nosotros'], ['/contacto', 'Contacto']];
    const logout = async () => {
        await signOut();
        setOpen(false);
        navigate('/');
    };
    return <>
        <div className="announcement text-center">ENVÍO GRATIS SOBRE $99.990 <span>•</span> 10% DE DESCUENTO EN
            PRODUCTOS SELECCIONADOS
        </div>
        <header className="main-header sticky-top">
            <div className="container header-row">
                <Link className="brand" to="/" onClick={() => setOpen(false)} aria-label="NexoStore inicio"><span
                    className="brand-mark"><Gamepad2 size={25}/></span><span>NEXO<span
                    className="brand-accent">STORE</span><small>GAMING GEAR</small></span></Link>
                <nav className={'site-nav ' + (open ? 'is-open' : '')}
                     aria-label="Navegación principal">{links.map(([to, label]) => <NavLink key={to} to={to}
                                                                                            onClick={() => setOpen(false)}
                                                                                            end={to === '/'}>{label}</NavLink>)}</nav>
                <div className="header-actions">
                    {session?.role === 'admin' &&
                        <Link to="/admin" className="head-icon admin-shortcut" title="Administración"><ShieldCheck
                            size={20}/></Link>}
                    {session ? <button className="head-icon" title={`Salir de ${session.name}`} onClick={logout}
                                       aria-label="Cerrar sesión"><LogOut size={19}/></button> :
                        <Link to="/acceso" className="head-icon" title="Iniciar sesión"
                              aria-label="Iniciar sesión"><UserRound size={20}/></Link>}
                    <Link to="/carrito" className="head-icon cart-icon"
                          aria-label={`Carrito con ${cart.reduce((n, i) => n + i.quantity, 0)} productos`}><ShoppingBag
                        size={21}/><span
                        className="cart-bubble">{cart.reduce((n, i) => n + i.quantity, 0)}</span></Link>
                    <button className="nav-toggle" aria-expanded={open} onClick={() => setOpen(!open)}
                            aria-label="Abrir navegación">☰
                    </button>
                </div>
            </div>
        </header>
    </>;
}

export function Footer() {
    return <footer className="site-footer">
        <div className="container footer-grid">
            <div>
                <div className="footer-brand"><Gamepad2/> NEXOSTORE</div>
                <p>Tu próximo nivel comienza con el equipo correcto. Tienda demostrativa académica, sin pagos
                    reales.</p></div>
            <div><h6>EXPLORA</h6><Link to="/productos">Catálogo</Link><Link to="/ofertas">Ofertas</Link><Link
                to="/blog">Blog</Link></div>
            <div><h6>AYUDA</h6><Link to="/contacto">Contacto</Link><Link to="/nosotros">Nosotros</Link><Link
                to="/acceso">Mi cuenta</Link></div>
            <div><h6>PROYECTO ACADÉMICO</h6><p>React · Spring Boot · API REST · H2 · JWT · Jasmine + Karma</p></div>
        </div>
        <div className="container footer-bottom">© 2026 NexoStore Gaming · Demostración educativa (datos y pagos
            simulados)
        </div>
    </footer>;
}

export function SectionTitle({kicker, title, description, action, href}) {
    return <div className="section-heading">
        <div>
            <div className="eyebrow">{kicker}</div>
            <h2>{title}</h2>{description && <p>{description}</p>}</div>
        {action && <Link className="text-action" to={href}>{action} <ArrowRight size={18}/></Link>}</div>;
}

export function ProductCard({product}) {
    const {addToCart} = useStore();
    const soldOut = product.stock < 1;
    return <article className="product-card"><Link to={'/producto/' + product.id} className="product-art"
                                                   style={{'--art-accent': product.color || '#8b72ff'}}><img
        loading="lazy" src={'/art/' + (product.art || 'controller') + '.svg'}
        alt={'Ilustración de ' + product.name}/>{product.badge &&
        <span className="product-badge">{product.badge}</span>}</Link>
        <div className="product-content">
            <div className="product-category">{product.categoryId.toUpperCase()}</div>
            <Link to={'/producto/' + product.id} className="product-name">{product.name}</Link>
            <div className="product-price">{money(product.price)} {product.oldPrice > product.price &&
                <s>{money(product.oldPrice)}</s>}</div>
            <button className="add-btn" onClick={() => addToCart(product)} disabled={soldOut}><ShoppingBag
                size={16}/> {soldOut ? 'Sin stock' : 'Agregar al carrito'}</button>
        </div>
    </article>;
}

export function ProductGrid({products}) {
    return <div className="row g-4">{products.map(p => <div key={p.id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
        <ProductCard product={p}/></div>)}</div>;
}

export function Empty({title = 'Sin resultados', detail = 'Prueba con otros filtros.'}) {
    return <div className="empty-state"><Package size={44}/><h3>{title}</h3><p>{detail}</p><Link to="/productos"
                                                                                                 className="btn btn-neon">Ver
        productos</Link></div>;
}

export function TrustStrip() {
    return <div className="trust-strip">
        <div className="container trust-grid">
            <div><Truck/><span><b>Despacho a todo Chile</b><small>Simulado para evaluación</small></span></div>
            <div><ShieldCheck/><span><b>Compra demostrativa</b><small>Sin cobros ni tarjetas reales</small></span></div>
            <div><LifeBuoy/><span><b>Soporte cercano</b><small>Formulario de contacto</small></span></div>
        </div>
    </div>;
}

export function QuantityControl({value, max = 99, onChange}) {
    return <div className="quantity-control">
        <button onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Reducir cantidad"><Minus
            size={15}/></button>
        <span>{value}</span>
        <button onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Aumentar cantidad"><Plus
            size={15}/></button>
    </div>;
}
