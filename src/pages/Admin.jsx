import React, {useMemo, useState} from 'react';
import {NavLink, Navigate, useNavigate} from 'react-router-dom';
import {
    BarChart3,
    Boxes,
    Grid3X3,
    ShoppingCart,
    Users,
    UserRound,
    Store,
    RotateCcw,
    LayoutDashboard,
    Save,
    Plus,
    Trash2,
    Pencil,
    CheckCircle2,
    Mail
} from 'lucide-react';
import {useStore} from '../context/StoreContext';
import {
    createProduct,
    updateProduct,
    deleteProduct,
    createCategory,
    updateCategory,
    deleteCategory,
    createUser,
    updateUser,
    deleteUser,
    updateOrder,
    deleteMessage,
    resetDatabase,
    money
} from '../data/database';

const nav = [['resumen', 'Resumen', LayoutDashboard], ['pedidos', 'Órdenes', ShoppingCart], ['productos', 'Productos', Boxes], ['categorias', 'Categorías', Grid3X3], ['usuarios', 'Usuarios', Users], ['reportes', 'Reportes', BarChart3], ['mensajes', 'Mensajes', Mail], ['perfil', 'Perfil', UserRound]];
const blank = {
    name: '',
    categoryId: '',
    price: 19990,
    oldPrice: 0,
    stock: 1,
    badge: '',
    description: '',
    art: 'controller',
    color: '#8d76fb'
};
const symbols = ['keyboard', 'mouse', 'headset', 'monitor', 'controller', 'mousepad', 'microphone', 'rgb'];

function AdminDashboard({db}) {
    const paid = db.orders.filter(o => o.status !== 'rechazado');
    const sales = paid.reduce((a, o) => a + o.total, 0);
    const stats = [['Ventas simuladas', money(sales), '↗'], ['Órdenes', db.orders.length, '📦'], ['Productos', db.products.length, '🎮'], ['Usuarios', db.users.length, '👤']];
    return <>
        <div className="admin-stats">{stats.map(([label, n, icon]) => <div className="admin-stat" key={label}>
            <small>{label}</small><strong>{n}</strong><span>{icon}</span></div>)}</div>
        <div className="admin-cards">
            <div className="surface-panel"><h3>Últimas órdenes</h3>{db.orders.length ?
                <div className="table-responsive">
                    <table className="table table-dark table-striped align-middle">
                        <thead>
                        <tr>
                            <th>Pedido</th>
                            <th>Cliente</th>
                            <th>Total</th>
                            <th>Estado</th>
                        </tr>
                        </thead>
                        <tbody>{db.orders.slice(0, 5).map(o => <tr key={o.id}>
                            <td>{o.id}</td>
                            <td>{o.customer.name}</td>
                            <td>{money(o.total)}</td>
                            <td><span className="status-tag">{o.status}</span></td>
                        </tr>)}</tbody>
                    </table>
                </div> : <p className="muted">Aún no hay compras. Crea una de demostración desde la tienda.</p>}</div>
            <div className="surface-panel"><h3>Inventario bajo</h3>{db.products.filter(p => p.stock < 10).map(p => <div
                className="admin-line" key={p.id}><span>{p.name}</span><b>{p.stock} uds.</b>
            </div>)}{!db.products.some(p => p.stock < 10) && <p>Inventario suficiente.</p>}</div>
        </div>
    </>;
}

function ProductAdmin({db}) {
    const [editing, setEditing] = useState(null);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [form, setForm] = useState(blank);
    const start = p => {
        setEditing(p?.id || 'NEW');
        setForm(p ? {...p} : {...blank, categoryId: db.categories[0]?.id || ''});
        setError('');
        setNotice('');
    };
    const save = async e => {
        e.preventDefault();
        try {
            const fields = {
                ...form,
                price: Number(form.price),
                oldPrice: Number(form.oldPrice),
                stock: Number(form.stock)
            };
            if (editing === 'NEW') await createProduct(fields); else await updateProduct(editing, fields);
            setEditing(null);
            setNotice('Producto guardado correctamente.');
        } catch (err) {
            setError(err.message);
        }
    };
    const remove = async id => {
        if (!window.confirm('¿Eliminar este producto?')) return;
        try {
            await deleteProduct(id);
            setNotice('Producto eliminado.');
        } catch (err) {
            setError(err.message);
        }
    };
    return <>
        <div className="admin-toolbar"><h3>Administrar productos</h3>
            <button className="btn btn-neon" onClick={() => start()}><Plus size={17}/> Nuevo producto</button>
        </div>
        {notice && <p role="status" className="alert alert-success">{notice}</p>}
        {editing && <form className="surface-panel admin-edit" onSubmit={save}>
            <h4>{editing === 'NEW' ? 'Nuevo producto' : 'Editar producto'}</h4>
            <div
                className="row g-3">{[['name', 'Nombre', 'text'], ['price', 'Precio CLP', 'number'], ['oldPrice', 'Precio anterior', 'number'], ['stock', 'Stock', 'number'], ['badge', 'Etiqueta', 'text'], ['color', 'Color HEX', 'color']].map(([key, label, type]) =>
                <div className="col-md-4" key={key}><label className="form-label">{label}</label><input
                    required={['name', 'price', 'stock'].includes(key)} min={type === 'number' ? 0 : undefined}
                    type={type} className="form-control" value={form[key]}
                    onChange={e => setForm({...form, [key]: e.target.value})}/></div>)}
                <div className="col-md-6"><label className="form-label">Categoría</label><select className="form-select"
                                                                                                 required
                                                                                                 value={form.categoryId}
                                                                                                 onChange={e => setForm({
                                                                                                     ...form,
                                                                                                     categoryId: e.target.value
                                                                                                 })}>
                    <option value="">Seleccionar...</option>
                    {db.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                <div className="col-md-6"><label className="form-label">Ilustración</label><select
                    className="form-select" value={form.art}
                    onChange={e => setForm({...form, art: e.target.value})}>{symbols.map(s => <option
                    key={s}>{s}</option>)}</select></div>
                <div className="col-12"><label className="form-label">Descripción</label><textarea
                    className="form-control" rows="3" value={form.description}
                    onChange={e => setForm({...form, description: e.target.value})}/></div>
            </div>
            {error && <div className="alert alert-danger mt-3" role="alert">{error}</div>}
            <div className="d-flex gap-2 mt-3">
                <button className="btn btn-neon"><Save size={16}/> Guardar</button>
                <button type="button" className="btn btn-outline-light" onClick={() => setEditing(null)}>Cancelar
                </button>
            </div>
        </form>}
        <div className="surface-panel table-responsive">
            <table className="table table-dark table-striped align-middle">
                <thead>
                <tr>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Acciones</th>
                </tr>
                </thead>
                <tbody>{db.products.map(p => <tr key={p.id}>
                    <td>
                        <div className="table-product"><img src={'/art/' + (p.art || 'controller') + '.svg'}
                                                            alt=""/><b>{p.name}</b></div>
                    </td>
                    <td>{db.categories.find(c => c.id === p.categoryId)?.name || '—'}</td>
                    <td>{money(p.price)}</td>
                    <td>{p.stock}</td>
                    <td>
                        <div className="admin-actions">
                            <button aria-label={'Editar ' + p.name} onClick={() => start(p)}><Pencil size={17}/>
                            </button>
                            <button aria-label={'Eliminar ' + p.name} onClick={() => remove(p.id)}><Trash2 size={17}/>
                            </button>
                        </div>
                    </td>
                </tr>)}</tbody>
            </table>
        </div>
    </>;
}

function CategoryAdmin({db}) {
    const [name, setName] = useState('');
    const [icon, setIcon] = useState('🎮');
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const add = async e => {
        e.preventDefault();
        try {
            await createCategory({name, icon});
            setName('');
            setError('');
            setNotice('Categoría creada.');
        } catch (err) {
            setError(err.message);
        }
    };
    const rename = async c => {
        const next = window.prompt('Nuevo nombre de categoría:', c.name);
        if (next === null) return;
        try {
            await updateCategory(c.id, {name: next});
            setNotice('Categoría actualizada.');
            setError('');
        } catch (err) {
            setError(err.message);
        }
    };
    const remove = async c => {
        if (!window.confirm('¿Eliminar categoría?')) return;
        try {
            await deleteCategory(c.id);
            setNotice('Categoría eliminada.');
            setError('');
        } catch (err) {
            setError(err.message);
        }
    };
    return <>
        <div className="admin-toolbar"><h3>Categorías</h3></div>
        <form className="surface-panel d-flex flex-wrap gap-3 align-items-end mb-4" onSubmit={add}>
            <div><label className="form-label">Nombre</label><input className="form-control" value={name} required
                                                                    onChange={e => setName(e.target.value)}
                                                                    placeholder="Nueva categoría"/></div>
            <div><label className="form-label">Emoji</label><input className="form-control" style={{width: 90}}
                                                                   value={icon} onChange={e => setIcon(e.target.value)}
                                                                   maxLength={4}/></div>
            <button className="btn btn-neon"><Plus size={16}/> Crear categoría</button>
        </form>
        {error && <div className="alert alert-danger">{error}</div>}{notice &&
        <div role="status" className="alert alert-success">{notice}</div>}
        <div className="row g-3">{db.categories.map(c => <div className="col-md-6 col-xl-4" key={c.id}>
            <div className="surface-panel category-admin-card"><span>{c.icon}</span><h4>{c.name}</h4>
                <p>{db.products.filter(p => p.categoryId === c.id).length} productos</p>
                <div className="admin-actions">
                    <button onClick={() => rename(c)}><Pencil size={16}/> Editar</button>
                    <button onClick={() => remove(c)}><Trash2 size={16}/> Eliminar</button>
                </div>
            </div>
        </div>)}</div>
    </>;
}

function OrdersAdmin({db}) {
    const [selected, setSelected] = useState(null);
    const order = db.orders.find(o => o.id === selected);
    return <>
        <div className="admin-toolbar"><h3>Órdenes de compra</h3></div>
        <div className="surface-panel table-responsive">{!db.orders.length ? <p>Aún no se registran órdenes.</p> :
            <table className="table table-dark align-middle">
                <thead>
                <tr>
                    <th>Pedido</th>
                    <th>Cliente / Email</th>
                    <th>Fecha</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Detalle</th>
                </tr>
                </thead>
                <tbody>{db.orders.map(o => <tr key={o.id}>
                    <td><b>{o.id}</b><small className="d-block text-secondary">{o.items.length} producto(s)</small></td>
                    <td>{o.customer.name}<small className="d-block text-secondary">{o.customer.email}</small></td>
                    <td>{new Date(o.createdAt).toLocaleDateString('es-CL')}</td>
                    <td>{money(o.total)}</td>
                    <td><select aria-label={'Estado de ' + o.id} className="form-select form-select-sm" value={o.status}
                                onChange={async e => {
                                    try {
                                        await updateOrder(o.id, {status: e.target.value});
                                    } catch (err) {
                                        window.alert(err.message);
                                    }
                                }}>
                        <option value="pagado">Pagado</option>
                        <option value="preparando">Preparando</option>
                        <option value="enviado">Enviado</option>
                        <option value="entregado">Entregado</option>
                        <option value="rechazado">Rechazado</option>
                    </select></td>
                    <td>
                        <button className="btn btn-sm btn-outline-light" onClick={() => setSelected(o.id)}>Ver boleta
                        </button>
                    </td>
                </tr>)}</tbody>
            </table>}{order && <div className="mt-4 pt-3 border-top" role="region" aria-label="Boleta de compra">
            <div className="d-flex align-items-center justify-content-between"><h4>Boleta / Orden {order.id}</h4>
                <button className="btn btn-sm btn-outline-light" onClick={() => setSelected(null)}>Cerrar</button>
            </div>
            <p>Cliente: {order.customer.name} · {order.customer.email}</p>{order.items.map(i => <div
            className="summary-line" key={i.productId}><span>{i.name} × {i.quantity}</span><b>{money(i.subtotal)}</b>
        </div>)}
            <div className="summary-total">TOTAL {money(order.total)}</div>
        </div>}</div>
    </>
}

function UsersAdmin({db, session}) {
    const [notice, setNotice] = useState('');
    const [error, setError] = useState('');
    const [form, setForm] = useState({name: '', email: '', password: '', role: 'client'});
    const addUser = async e => {
        e.preventDefault();
        try {
            await createUser(form);
            setForm({name: '', email: '', password: '', role: 'client'});
            setNotice('Usuario creado.');
            setError('');
        } catch (err) {
            setError(err.message);
        }
    };
    const changeRole = async (u, role) => {
        try {
            if (u.id === session.id && role !== 'admin') throw new Error('No puedes quitarte tu propio rol de administrador.');
            await updateUser(u.id, {role});
            setNotice('Usuario actualizado.');
            setError('');
        } catch (err) {
            setError(err.message);
        }
    };
    const toggle = async u => {
        try {
            if (u.id === session.id) throw new Error('No puedes desactivar tu propia cuenta.');
            await updateUser(u.id, {active: !u.active});
            setNotice('Estado actualizado.');
            setError('');
        } catch (err) {
            setError(err.message);
        }
    };
    const remove = async u => {
        if (u.id === session.id) {
            setError('No puedes eliminar tu propia cuenta.');
            return;
        }
        if (!window.confirm('¿Eliminar usuario?')) return;
        try {
            await deleteUser(u.id);
            setNotice('Usuario eliminado.');
            setError('');
        } catch (err) {
            setError(err.message);
        }
    };
    return <>
        <div className="admin-toolbar"><h3>Usuarios</h3></div>
        <form className="surface-panel mb-4" onSubmit={addUser}><h4 className="mb-3">Nuevo usuario de demostración</h4>
            <div className="row g-3">
                <div className="col-md-3"><label className="form-label">Nombre</label><input required
                                                                                             className="form-control"
                                                                                             value={form.name}
                                                                                             onChange={e => setForm({
                                                                                                 ...form,
                                                                                                 name: e.target.value
                                                                                             })}/></div>
                <div className="col-md-3"><label className="form-label">Correo</label><input required type="email"
                                                                                             className="form-control"
                                                                                             value={form.email}
                                                                                             onChange={e => setForm({
                                                                                                 ...form,
                                                                                                 email: e.target.value
                                                                                             })}/></div>
                <div className="col-md-3"><label className="form-label">Clave ficticia</label><input required
                                                                                                     minLength={6}
                                                                                                     type="password"
                                                                                                     className="form-control"
                                                                                                     value={form.password}
                                                                                                     onChange={e => setForm({
                                                                                                         ...form,
                                                                                                         password: e.target.value
                                                                                                     })}/></div>
                <div className="col-md-3"><label className="form-label">Rol</label><select className="form-select"
                                                                                           value={form.role}
                                                                                           onChange={e => setForm({
                                                                                               ...form,
                                                                                               role: e.target.value
                                                                                           })}>
                    <option value="client">Cliente</option>
                    <option value="admin">Administrador</option>
                </select></div>
            </div>
            <button className="btn btn-neon mt-3"><Plus size={16}/> Crear usuario</button>
            <p className="muted mt-3 mb-0">Solo para evaluación: no introducir claves verdaderas.</p></form>
        {notice && <div className="alert alert-success">{notice}</div>}{error &&
        <div className="alert alert-danger">{error}</div>}
        <div className="surface-panel table-responsive">
            <table className="table table-dark align-middle">
                <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Rol</th>
                    <th>Activo</th>
                    <th>Acciones</th>
                </tr>
                </thead>
                <tbody>{db.users.map(u => <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td><select aria-label={'Rol de ' + u.name} className="form-select form-select-sm" value={u.role}
                                onChange={e => changeRole(u, e.target.value)}>
                        <option value="client">Cliente</option>
                        <option value="admin">Administrador</option>
                    </select></td>
                    <td><input type="checkbox" aria-label={'Activo ' + u.name} checked={u.active}
                               onChange={() => toggle(u)}/></td>
                    <td>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => remove(u)}>Eliminar</button>
                    </td>
                </tr>)}</tbody>
            </table>
        </div>
    </>;
}

function ReportsAdmin({db}) {
    const paid = db.orders.filter(o => o.status !== 'rechazado');
    const sales = paid.reduce((n, o) => n + o.total, 0);
    const byCat = db.categories.map(c => ({
        name: c.name,
        total: paid.flatMap(o => o.items).reduce((sum, line) => sum + (db.products.find(p => p.id === line.productId)?.categoryId === c.id ? line.subtotal : 0), 0)
    }));
    const largest = Math.max(1, ...byCat.map(x => x.total));
    return <>
        <div className="admin-toolbar"><h3>Reportes del negocio</h3></div>
        <div className="admin-stats">
            <div className="admin-stat"><small>Ingresos simulados</small><strong>{money(sales)}</strong></div>
            <div className="admin-stat"><small>Órdenes aprobadas</small><strong>{paid.length}</strong></div>
            <div className="admin-stat"><small>Órdenes
                rechazadas</small><strong>{db.orders.length - paid.length}</strong></div>
            <div className="admin-stat"><small>Productos con
                stock</small><strong>{db.products.filter(p => p.stock > 0).length}</strong></div>
        </div>
        <div className="surface-panel"><h3>Ventas por categoría (simuladas)</h3>{byCat.map(c => <div
            className="chart-row" key={c.name}>
            <div className="chart-label"><span>{c.name}</span><b>{money(c.total)}</b></div>
            <div className="chart-track">
                <div style={{width: `${c.total / largest * 100}%`}}/>
            </div>
        </div>)}<p className="muted mt-3">Los datos del reporte se calculan a partir de órdenes almacenadas en H2.</p>
        </div>
    </>;
}

function MessagesAdmin({db}) {
    const remove = async m => {
        if (!window.confirm('¿Eliminar este mensaje?')) return;
        try {
            await deleteMessage(m.id);
        } catch (e) {
            window.alert(e.message);
        }
    };
    return <>
        <div className="admin-toolbar"><h3>Mensajes de contacto</h3></div>
        <div className="row g-3">{db.messages.length ? db.messages.map(m => <div className="col-12" key={m.id}>
            <article className="surface-panel">
                <div className="d-flex justify-content-between align-items-start gap-3">
                    <div><h4>{m.name}</h4><p
                        className="muted mb-1">{m.email} · {new Date(m.date).toLocaleString('es-CL')}</p></div>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => remove(m)}><Trash2
                        size={16}/> Eliminar
                    </button>
                </div>
                <p className="mb-0" style={{whiteSpace: 'pre-wrap'}}>{m.message}</p></article>
        </div>) : <div className="surface-panel">No hay mensajes registrados.</div>}</div>
    </>;
}

function ProfileAdmin({session, db}) {
    const u = db.users.find(u => u.id === session.id);
    const [name, setName] = useState(u?.name || '');
    const [done, setDone] = useState('');
    return <div className="surface-panel" style={{maxWidth: 640}}><h3>Perfil del administrador</h3>
        <p>Correo: {u?.email}</p><p>Rol: {u?.role}</p><label className="form-label">Nombre visible</label><input
            className="form-control mb-3" value={name} onChange={e => setName(e.target.value)}/>
        <button className="btn btn-neon" onClick={async () => {
            if (!name.trim()) return;
            try {
                await updateUser(session.id, {name});
                setDone('Perfil actualizado.');
            } catch (e) {
                setDone(e.message);
            }
        }}>Guardar cambios
        </button>
        {done && <p role="status" className="alert alert-success mt-3">{done}</p>}</div>;
}

export function Admin() {
    const {session, db, refresh} = useStore();
    const [section, setSection] = useState('resumen');
    const navigate = useNavigate();
    if (!session || session.role !== 'admin') return <Navigate to="/acceso" replace/>;
    const clear = async () => {
        if (!window.confirm('¿Restaurar catálogo y publicaciones de demostración? Se eliminarán las órdenes y mensajes de la tienda.')) return;
        try {
            await resetDatabase();
            await refresh();
            setSection('resumen');
        } catch (e) {
            window.alert(e.message);
        }
    };
    return <div className="admin-shell">
        <aside className="admin-sidebar">
            <div className="admin-sidebar-header">◈ NEXOSTORE <small>PANEL ADMIN</small></div>
            {nav.map(([key, label, Icon]) => <button type="button" key={key} className={section === key ? 'active' : ''}
                                                     onClick={() => setSection(key)}><Icon size={18}/>{label}</button>)}
            <div className="admin-sidebar-bottom">
                <button onClick={() => navigate('/')}><Store size={18}/> Ver tienda</button>
                <button onClick={clear}><RotateCcw size={17}/> Reiniciar demo</button>
            </div>
        </aside>
        <main className="admin-main">
            <div className="admin-welcome">
                <div>
                    <div className="eyebrow">ADMINISTRACIÓN / {section.toUpperCase()}</div>
                    <h1>{nav.find(x => x[0] === section)[1]}</h1><p>Bienvenido, {session.name}. Gestiona esta tienda de
                    demostración.</p></div>
                <span className="admin-avatar">{session.name[0]}</span></div>
            {section === 'resumen' && <AdminDashboard db={db}/>}{section === 'productos' &&
            <ProductAdmin db={db}/>}{section === 'categorias' && <CategoryAdmin db={db}/>}{section === 'pedidos' &&
            <OrdersAdmin db={db}/>}{section === 'usuarios' &&
            <UsersAdmin db={db} session={session}/>}{section === 'reportes' &&
            <ReportsAdmin db={db}/>}{section === 'mensajes' && <MessagesAdmin db={db}/>}{section === 'perfil' &&
            <ProfileAdmin db={db} session={session}/>}</main>
    </div>;
}
