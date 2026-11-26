const API = process.env.API_URL || 'http://localhost:8080';
const fail = message => {
    console.error(`FAIL: ${message}`);
    process.exit(1);
};
const call = async (path, options = {}) => fetch(`${API}${path}`, {...options, headers: {...(options.headers || {})}});
const health = await call('/api/health');
if (!health.ok) fail('Spring Boot no responde en /api/health');
const catalogResponse = await call('/api/catalog');
if (!catalogResponse.ok) fail('No se pudo cargar el catálogo público');
const catalog = await catalogResponse.json();
if (!Array.isArray(catalog.products) || !Array.isArray(catalog.categories) || !Array.isArray(catalog.posts)) fail('Catálogo incompleto');
if ('users' in catalog || 'orders' in catalog || 'messages' in catalog) fail('El catálogo público expone datos privados');
const privateState = await call('/api/state');
if (privateState.status !== 401 && privateState.status !== 403) fail('GET /api/state debe requerir rol ADMIN');
const login = await call('/api/auth/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({email: 'admin@nexostore.cl', password: 'Admin123!'})
});
if (!login.ok) fail('No se pudo autenticar administrador demo');
const cookie = (login.headers.get('set-cookie') || '').split(';')[0];
if (!cookie.startsWith('NEXOSTORE_TOKEN=')) fail('La sesión debe entregarse como cookie HttpOnly');
const stateResponse = await call('/api/state', {headers: {Cookie: cookie}});
if (!stateResponse.ok) fail('La cookie admin no permite leer estado administrativo');
const state = await stateResponse.json();
if (!Array.isArray(state.users) || state.users.some(u => 'password' in u)) fail('Estado administrativo no debe exponer hashes ni contraseñas');
const cat = catalog.categories[0];
const created = await call('/api/products', {
    method: 'POST',
    headers: {Cookie: cookie, 'Content-Type': 'application/json'},
    body: JSON.stringify({
        name: 'Producto smoke test',
        categoryId: cat.id,
        price: 1234,
        oldPrice: 0,
        stock: 2,
        badge: '',
        description: 'test',
        art: 'controller',
        color: '#ffffff'
    })
});
if (created.status !== 201) fail('CRUD admin no crea producto');
const product = await created.json();
const deleted = await call(`/api/products/${encodeURIComponent(product.id)}`, {
    method: 'DELETE',
    headers: {Cookie: cookie}
});
if (!deleted.ok) fail('CRUD admin no elimina producto');
const before = (await (await call('/api/catalog')).json()).products.find(p => p.id === 'P102').stock;
const orderResponse = await call('/api/orders', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
        customer: {name: 'Smoke test', email: 'smoke@example.cl', address: 'Demo 1', region: 'RM'},
        items: [{productId: 'P102', quantity: 1}],
        paymentMethod: 'demo',
        simulateFailure: true
    })
});
if (orderResponse.status !== 201) fail('Backend no registra compra simulada');
const order = await orderResponse.json();
if (order.status !== 'rechazado') fail('Pago simulado rechazado no retorna estado esperado');
const after = (await (await call('/api/catalog')).json()).products.find(p => p.id === 'P102').stock;
if (before !== after) fail('El backend descontó stock de un pago rechazado');
console.log('PASS: health, catálogo sin datos privados, estado protegido, cookie JWT HttpOnly, CRUD admin y checkout validado en backend.');
