import React, {useMemo, useState, useEffect} from 'react';
import {Link, useNavigate, useParams, useSearchParams} from 'react-router-dom';
import {
    ArrowRight,
    ArrowUpRight,
    ArrowLeft,
    SlidersHorizontal,
    Search,
    CheckCircle2,
    XCircle,
    Trash2,
    Minus,
    Plus,
    ShoppingCart,
    Mail,
    MapPin,
    Phone,
    Sparkles,
    Star
} from 'lucide-react';
import {useStore} from '../context/StoreContext';
import {ProductCard, ProductGrid, SectionTitle, Empty, TrustStrip, QuantityControl} from '../components/Shared';
import {createMessage, createOrder, money, cartTotal, api} from '../data/database';

export function Home() {
    const {db} = useStore();
    return <>
        <section className="hero">
            <div className="hero-orbit hero-orbit-one"/>
            <div className="hero-orbit hero-orbit-two"/>
            <div className="container hero-grid">
                <div className="hero-copy">
                    <div className="eyebrow hero-kicker">● PRÓXIMA GENERACIÓN DE PERIFÉRICOS</div>
                    <h1>ELEVA TU <span>JUEGO.</span></h1><p>Encuentra periféricos y accesorios diseñados para llevar tu
                    setup al siguiente nivel.</p>
                    <div className="hero-ctas"><Link className="btn btn-neon btn-lg" to="/productos">EXPLORAR
                        CATÁLOGO <ArrowRight size={19}/></Link><Link className="hero-plain" to="/ofertas">Ver
                        ofertas <ArrowUpRight size={17}/></Link></div>
                    <div className="hero-stats">
                        <div><strong>12+</strong><small>Productos demo</small></div>
                        <div><strong>5</strong><small>Categorías</small></div>
                        <div><strong>100%</strong><small>React + Bootstrap</small></div>
                    </div>
                </div>
                <div className="hero-visual" aria-hidden="true">
                    <div className="halo halo-1"/>
                    <div className="halo halo-2"/>
                    <img src="/art/headset.svg" alt=""/><span
                    className="float-label float-top">EL SONIDO DE LA VICTORIA</span><span
                    className="float-label float-bottom">PRECISIÓN EN CADA PARTIDA</span></div>
            </div>
        </section>
        <TrustStrip/>
        <section className="section-pad">
            <div className="container"><SectionTitle kicker="EXPLORA POR ESTILO" title="Encuentra tu próxima mejora"
                                                     description="Todo lo que necesitas para completar tu estación de juego."/>
                <div className="row g-3">{db.categories.map(c => <div className="col-6 col-md-4 col-lg" key={c.id}><Link
                    to={'/productos?categoria=' + c.id} className="category-tile"><span
                    className="cat-emoji">{c.icon}</span><strong>{c.name}</strong><small>{c.description}</small><ArrowUpRight
                    size={19}/></Link></div>)}</div>
            </div>
        </section>
        <section className="section-pad section-dark">
            <div className="container"><SectionTitle kicker="SELECCIÓN NEXOSTORE" title="Destacados de la semana"
                                                     description="Los favoritos del catálogo gaming."
                                                     action="Ver catálogo completo" href="/productos"/><ProductGrid
                products={db.products.slice(0, 8)}/></div>
        </section>
        <section className="container promo-wrap">
            <div className="promo-banner">
                <div>
                    <div className="eyebrow">OFERTAS IMPERDIBLES</div>
                    <h2>TU SETUP MERECE MÁS.</h2><p>Descuentos demostrativos en teclados, mouse, monitores y audio.</p>
                    <Link className="btn btn-neon" to="/ofertas">VER OFERTAS <ArrowRight size={18}/></Link></div>
                <span aria-hidden="true">⚡</span></div>
        </section>
        <section className="section-pad">
            <div className="container"><SectionTitle kicker="APRENDE CON NOSOTROS" title="El blog del gamer"
                                                     action="Leer artículos" href="/blog"/>
                <div className="row g-4">{db.posts.map((post, i) => <div key={post.id} className="col-12 col-lg-4"><Link
                    to={'/blog/' + post.id} className={'blog-tile blog-tile-' + i}>
                    <div className="blog-top"><span>{post.tag}</span><b>↗</b></div>
                    <div className="blog-symbol">{['⌨', '✦', '♫'][i]}</div>
                    <small>{post.date}</small><h3>{post.title}</h3><p>{post.excerpt}</p></Link></div>)}</div>
            </div>
        </section>
    </>;
}

export function Shop({offers = false}) {
    const {db} = useStore();
    const [params, setParams] = useSearchParams();
    const q = params.get('buscar') || '';
    const category = params.get('categoria') || '';
    const [sort, setSort] = useState('relevancia');
    let items = db.products.filter(p => (!offers || p.oldPrice > p.price) && (!category || p.categoryId === category) && (!q || `${p.name} ${p.description}`.toLowerCase().includes(q.toLowerCase())));
    if (sort === 'precio-asc') items = [...items].sort((a, b) => a.price - b.price);
    if (sort === 'precio-desc') items = [...items].sort((a, b) => b.price - a.price);
    const setField = (key, value) => setParams(current => {
        const next = new URLSearchParams(current);
        if (value) next.set(key, value); else next.delete(key);
        return next;
    });
    return <div className="container section-pad">
        <div className="page-header">
            <div className="eyebrow">NEXOSTORE / {offers ? 'OFERTAS' : 'CATÁLOGO'}</div>
            <h1>{offers ? 'Ofertas especiales' : 'Todos los productos'}</h1>
            <p>{offers ? 'Los descuentos que tu setup estaba esperando.' : 'Explora nuestro catálogo de accesorios gaming.'}</p>
        </div>
        <div className="filter-bar"><label className="filter-search"><Search size={19}/><input value={q}
                                                                                               onChange={e => setField('buscar', e.target.value)}
                                                                                               placeholder="Buscar accesorios..."
                                                                                               aria-label="Buscar productos"/></label><label><SlidersHorizontal
            size={18}/><select aria-label="Filtrar por categoría" value={category}
                               onChange={e => setField('categoria', e.target.value)}>
            <option value="">Todas las categorías</option>
            {db.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label><select
            aria-label="Ordenar productos" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="relevancia">Más relevantes</option>
            <option value="precio-asc">Menor precio</option>
            <option value="precio-desc">Mayor precio</option>
        </select></label>
            <button className="btn-clear" onClick={() => {
                setParams({});
                setSort('relevancia');
            }}>Limpiar
            </button>
        </div>
        <p className="result-count">{items.length} producto(s) encontrado(s)</p>{items.length ?
        <ProductGrid products={items}/> :
        <Empty title="No encontramos productos" detail="Cambia el término de búsqueda o la categoría."/>}</div>;
}

export function Categories() {
    const {db} = useStore();
    return <main className="container section-pad">
        <div className="page-header">
            <div className="eyebrow">ELIGE TU ESTILO</div>
            <h1>Categorías</h1><p>Encuentra tu equipo ideal en cada rincón de la tienda.</p></div>
        {db.categories.map(c => {
            const products = db.products.filter(p => p.categoryId === c.id);
            return <section className="category-section" key={c.id}><SectionTitle
                kicker={`${c.icon} ${products.length} PRODUCTOS`} title={c.name} description={c.description}
                action="Ver todos" href={'/productos?categoria=' + c.id}/><ProductGrid products={products.slice(0, 4)}/>
            </section>;
        })}</main>;
}

export function ProductDetail() {
    const {id} = useParams();
    const {db, addToCart} = useStore();
    const product = db.products.find(p => p.id === id);
    const [quantity, setQuantity] = useState(1);
    const [added, setAdded] = useState(false);
    if (!product) return <div className="container section-pad"><Empty title="Producto no encontrado"/></div>;
    return <div className="container section-pad"><Link className="back-link" to="/productos"><ArrowLeft
        size={17}/> Volver al catálogo</Link>
        <div className="detail-grid">
            <div className="detail-art" style={{'--art-accent': product.color}}><img
                src={'/art/' + (product.art || 'controller') + '.svg'} alt={product.name}/></div>
            <div className="detail-info">
                <div
                    className="eyebrow">{db.categories.find(c => c.id === product.categoryId)?.name.toUpperCase()}</div>
                <h1>{product.name}</h1><p className="detail-rating"><Star size={17} fill="currentColor"/> 4.8 <span>· Valoración ficticia para demostración</span>
            </p>
                <div className="detail-price">{money(product.price)} {product.oldPrice > product.price &&
                    <s>{money(product.oldPrice)}</s>}</div>
                <p className="detail-description">{product.description}</p><p
                className="stock-note">● {product.stock > 0 ? `${product.stock} unidades disponibles` : 'Agotado'}</p>
                <div className="detail-buy"><QuantityControl value={quantity} max={product.stock}
                                                             onChange={setQuantity}/>
                    <button className="btn btn-neon" disabled={!product.stock} onClick={() => {
                        addToCart(product, quantity);
                        setAdded(true);
                    }}><ShoppingCart size={17}/> Agregar al carrito
                    </button>
                </div>
                {added &&
                    <div role="status" className="alert alert-success mt-3">Agregado correctamente. <Link to="/carrito">Ver
                        carrito</Link></div>}
                <div className="detail-specs"><b>Características</b><span>Despacho: demostrativo</span><span>Garantía: información simulada</span><span>SKU: {product.id}</span>
                </div>
            </div>
        </div>
    </div>;
}

export function Cart() {
    const {db, cart, updateCart} = useStore();
    const lines = cart.map(item => ({
        ...item,
        product: db.products.find(p => p.id === item.productId)
    })).filter(x => x.product);
    const total = cartTotal(lines, db.products);
    return <main className="container section-pad">
        <div className="page-header">
            <div className="eyebrow">TU SELECCIÓN</div>
            <h1>Carrito de compras</h1><p>Revisa los productos antes de continuar.</p></div>
        {!lines.length ? <Empty title="Tu carrito está vacío" detail="Agrega productos desde nuestro catálogo."/> :
            <div className="checkout-grid">
                <div className="surface-panel">
                    <div className="panel-title">Productos seleccionados ({lines.length})</div>
                    {lines.map(({product, quantity}) => <div className="cart-row" key={product.id}><img
                        src={'/art/' + (product.art || 'controller') + '.svg'} alt=""/>
                        <div className="cart-row-text"><Link
                            to={'/producto/' + product.id}><strong>{product.name}</strong></Link><small>{money(product.price)} c/u</small><QuantityControl
                            value={quantity} max={product.stock} onChange={n => updateCart(product.id, n)}/></div>
                        <div className="cart-row-end"><strong>{money(product.price * quantity)}</strong>
                            <button title="Eliminar" aria-label={`Eliminar ${product.name}`}
                                    onClick={() => updateCart(product.id, 0)}><Trash2 size={17}/></button>
                        </div>
                    </div>)}</div>
                <aside className="surface-panel order-summary">
                    <div className="panel-title">Resumen de compra</div>
                    <div className="summary-line"><span>Subtotal</span><b>{money(total)}</b></div>
                    <div className="summary-line"><span>Despacho</span><b>Sin cobro (demo)</b></div>
                    <div className="summary-total"><span>Total</span><b>{money(total)}</b></div>
                    <Link className="btn btn-neon w-100 justify-content-center" to="/checkout">CONTINUAR AL
                        PAGO <ArrowRight size={17}/></Link><small>Simulación académica: no se procesan pagos
                    reales.</small></aside>
            </div>}</main>;
}

export function Checkout() {
    const {db, cart, setCart, session} = useStore();
    const navigate = useNavigate();
    const user = session;
    const [form, setForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        address: '',
        city: '',
        region: '',
        notes: ''
    });
    const [method, setMethod] = useState('transferencia');
    const [failure, setFailure] = useState(false);
    const [error, setError] = useState('');
    const lines = cart.map(item => ({
        ...item,
        product: db.products.find(p => p.id === item.productId)
    })).filter(i => i.product);
    const total = cartTotal(lines, db.products);
    const submit = async e => {
        e.preventDefault();
        setError('');
        try {
            const order = await createOrder({
                customer: form,
                items: cart,
                paymentMethod: method,
                simulateFailure: failure
            });
            if (!failure) setCart([]);
            navigate('/resultado/' + (failure ? 'error' : 'exito') + '/' + order.id);
        } catch (e) {
            setError(e.message);
        }
    };
    if (!lines.length) return <div className="container section-pad"><Empty title="No hay productos para pagar"/></div>;
    return <main className="container section-pad">
        <div className="page-header">
            <div className="eyebrow">ÚLTIMO PASO</div>
            <h1>Finaliza tu compra</h1><p>Checkout simulado: no ingreses datos sensibles ni información de pago
            real.</p></div>
        <form onSubmit={submit} className="checkout-grid">
            <div className="surface-panel">
                <div className="panel-title">Datos del cliente</div>
                <div
                    className="row g-3">{[['name', 'Nombre completo'], ['email', 'Correo electrónico'], ['phone', 'Teléfono'], ['address', 'Dirección de entrega'], ['city', 'Comuna'], ['region', 'Región']].map(([key, label]) =>
                    <div className="col-12 col-md-6" key={key}><label
                        className="form-label">{label}{key !== 'phone' && key !== 'city' ? ' *' : ''}</label><input
                        className="form-control" type={key === 'email' ? 'email' : 'text'}
                        required={!['phone', 'city'].includes(key)} value={form[key]}
                        onChange={e => setForm({...form, [key]: e.target.value})}/></div>)}
                    <div className="col-12"><label className="form-label">Indicaciones de entrega</label><textarea
                        className="form-control" rows="3" value={form.notes}
                        onChange={e => setForm({...form, notes: e.target.value})}/></div>
                </div>
                <hr/>
                <div className="panel-title">Método de pago simulado</div>
                <div className="payment-methods"><label><input type="radio" checked={method === 'transferencia'}
                                                               onChange={() => setMethod('transferencia')}/> Transferencia
                    (demostración)</label><label><input type="radio" checked={method === 'tarjeta-demo'}
                                                        onChange={() => setMethod('tarjeta-demo')}/> Tarjeta de prueba
                    (sin número real)</label></div>
                <label className="demo-failure"><input type="checkbox" checked={failure}
                                                       onChange={e => setFailure(e.target.checked)}/> Simular rechazo
                    del pago para probar el flujo de error</label>{error &&
                <p role="alert" className="alert alert-danger">{error}</p>}</div>
            <aside className="surface-panel order-summary">
                <div className="panel-title">Tu pedido</div>
                {lines.map(({product, quantity}) => <div className="summary-line" key={product.id}>
                    <span>{product.name} × {quantity}</span><b>{money(product.price * quantity)}</b></div>)}
                <div className="summary-total"><span>Total</span><b>{money(total)}</b></div>
                <button type="submit" className="btn btn-neon w-100 justify-content-center">SIMULAR PAGO <ArrowRight
                    size={17}/></button>
                <small>Este formulario no realiza transacciones reales.</small></aside>
        </form>
    </main>;
}

export function OrderResult() {
    const {status, id} = useParams();
    const {db} = useStore();
    const [remote, setRemote] = useState(null);
    const [loading, setLoading] = useState(false);
    const order = db.orders.find(o => o.id === id) || remote;
    useEffect(() => {
        if (!order) {
            setLoading(true);
            api(`/api/orders/${encodeURIComponent(id)}`).then(setRemote).catch(() => setRemote(null)).finally(() => setLoading(false));
        }
    }, [id, order]);
    if (loading) return <main className="container section-pad"><Empty title="Consultando pedido..."/></main>;
    if (!order) return <main className="container section-pad"><Empty title="Pedido no encontrado"/></main>;
    const ok = status === 'exito' && order.status !== 'rechazado';
    return <div className="container section-pad">
        <div className={'result-panel ' + (ok ? 'result-success' : 'result-error')}>{ok ? <CheckCircle2 size={64}/> :
            <XCircle size={64}/>}
            <div className="eyebrow">RESULTADO DE LA COMPRA</div>
            <h1>{ok ? '¡Compra simulada exitosa!' : 'No se pudo realizar el pago'}</h1>
            <p>Pedido <b>#{order.id}</b> · {ok ? 'Estado: Pagado' : 'Estado: Rechazado'}</p>
            <p>{ok ? 'Tu pedido de demostración ha sido registrado en el servidor.' : 'El pago fue rechazado deliberadamente para demostrar el flujo de error. Puedes intentarlo nuevamente.'}</p>
            <div className="result-lines">{order.items.map(p => <div className="summary-line" key={p.productId}>
                <span>{p.name} × {p.quantity}</span><b>{money(p.subtotal)}</b></div>)}
                <div className="summary-total"><span>Total</span><b>{money(order.total)}</b></div>
            </div>
            <div className="d-flex justify-content-center gap-2 flex-wrap mt-4"><Link
                to={ok ? '/productos' : '/checkout'}
                className="btn btn-neon">{ok ? 'Seguir comprando' : 'Volver a intentar'}</Link>
                <button type="button" className="btn btn-outline-light" onClick={() => window.print()}>Imprimir
                    resumen
                </button>
            </div>
        </div>
    </div>;
}

export function Blog() {
    const {db} = useStore();
    return <main className="container section-pad">
        <div className="page-header">
            <div className="eyebrow">CONOCIMIENTO GAMER</div>
            <h1>Blog de NexoStore</h1><p>Ideas, guías y consejos para mejorar tu experiencia.</p></div>
        <div className="row g-4">{db.posts.map((post, i) => <div className="col-md-6 col-lg-4" key={post.id}><Link
            className={'blog-tile blog-tile-' + i} to={'/blog/' + post.id}><span>{post.tag} · {post.date}</span>
            <div className="blog-symbol">{['⌨', '✦', '♫'][i]}</div>
            <h2>{post.title}</h2><p>{post.excerpt}</p><span className="text-action">Leer artículo <ArrowRight
                size={16}/></span></Link></div>)}</div>
    </main>;
}

export function BlogDetail() {
    const {id} = useParams();
    const {db} = useStore();
    const post = db.posts.find(x => x.id === id);
    if (!post) return <main className="container section-pad"><Empty title="Artículo no encontrado"/></main>;
    return <main className="container section-pad">
        <article className="article-page"><Link className="back-link" to="/blog"><ArrowLeft size={17}/> Volver al
            blog</Link>
            <div className="eyebrow">{post.tag} · {post.date}</div>
            <h1>{post.title}</h1><p className="lead">{post.excerpt}</p>
            <div className="article-illustration">✦</div>
            <p>{post.body}</p></article>
    </main>;
}

export function About() {
    return <>
        <div className="container section-pad">
            <div className="page-header">
                <div className="eyebrow">NUESTRA HISTORIA</div>
                <h1>Pasión por el gaming. <span className="text-neon">Diseño para ti.</span></h1><p>NexoStore nace como
                un proyecto académico que convierte una idea de comercio electrónico en una aplicación React
                modular.</p></div>
            <div className="row g-4">
                <div className="col-lg-7">
                    <div className="surface-panel about-panel"><h2>Más que una tienda</h2><p>Diseñamos esta experiencia
                        para demostrar cómo una tienda puede integrar catálogo, administración, carrito, checkout, datos
                        persistentes y pruebas automatizadas en el navegador.</p><p>Los productos, precios y operaciones
                        son ficticios. No aceptamos pagos ni enviamos productos reales.</p></div>
                </div>
                <div className="col-lg-5">
                    <div className="surface-panel about-panel"><h2>Stack tecnológico</h2>
                        <ul>
                            <li>React y React Router</li>
                            <li>Bootstrap y CSS personalizado</li>
                            <li>Persistencia H2 mediante Spring Boot</li>
                            <li>Pruebas con Jasmine y Karma</li>
                            <li>Git, GitHub y hosting estático</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </>;
}

export function Contact() {
    const [form, setForm] = useState({name: '', email: '', message: ''});
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const submit = async e => {
        e.preventDefault();
        try {
            await createMessage(form);
            setSuccess(true);
            setError('');
            setForm({name: '', email: '', message: ''});
        } catch (err) {
            setError(err.message);
        }
    };
    return <main className="container section-pad">
        <div className="page-header">
            <div className="eyebrow">HABLEMOS</div>
            <h1>Contacto</h1><p>Envíanos un mensaje de demostración (se guardará en la base de datos de la tienda).</p>
        </div>
        <div className="row g-4">
            <div className="col-lg-7">
                <form className="surface-panel" onSubmit={submit}>
                    <div className="panel-title">Cuéntanos cómo podemos ayudarte</div>
                    <label className="form-label">Nombre</label><input className="form-control mb-3" required
                                                                       value={form.name} onChange={e => setForm({
                    ...form,
                    name: e.target.value
                })}/><label className="form-label">Correo</label><input className="form-control mb-3" required
                                                                        type="email" value={form.email}
                                                                        onChange={e => setForm({
                                                                            ...form,
                                                                            email: e.target.value
                                                                        })}/><label
                    className="form-label">Mensaje</label><textarea className="form-control mb-3" rows="5" required
                                                                    value={form.message} onChange={e => setForm({
                    ...form,
                    message: e.target.value
                })}/>{error && <div className="alert alert-danger" role="alert">{error}</div>}{success &&
                    <div className="alert alert-success" role="status">Tu mensaje se guardó correctamente en el
                        servidor.</div>}
                    <button className="btn btn-neon" type="submit">Enviar mensaje <ArrowRight size={17}/></button>
                </form>
            </div>
            <div className="col-lg-5">
                <div className="surface-panel contact-info"><Mail/><h3>Correo demostrativo</h3>
                    <p>hola@nexostore.ejemplo</p><MapPin/><h3>Ubicación</h3><p>Santiago, Chile (proyecto ficticio)</p>
                    <Phone/><h3>Horario</h3><p>Disponible como demo las 24 horas</p></div>
            </div>
        </div>
    </main>;
}
