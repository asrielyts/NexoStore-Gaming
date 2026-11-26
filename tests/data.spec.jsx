import {api, createOrder, createProduct, money, cartTotal, loadCatalog} from '../src/data/database';

describe('Cliente API de NexoStore: operaciones remotas', () => {
    beforeEach(() => {
        localStorage.clear();
        global.fetch = jasmine.createSpy('fetch').and.returnValue(Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({id: 'ORD-test', status: 'rechazado'})
        }));
    });
    it('usa credenciales de cookie y no persiste tokens en el navegador', async () => {
        await api('/api/catalog');
        expect(fetch).toHaveBeenCalled();
        const options = fetch.calls.mostRecent().args[1];
        expect(options.credentials).toBe('include');
        expect(localStorage.length).toBe(0);
    });
    it('envía la creación de productos al backend', async () => {
        await createProduct({name: 'Demo', price: 100, stock: 1, categoryId: 'mouse'});
        expect(fetch.calls.mostRecent().args[0]).toContain('/api/products');
        expect(fetch.calls.mostRecent().args[1].method).toBe('POST');
    });
    it('envía el checkout sin precio calculado por el cliente', async () => {
        await createOrder({
            customer: {name: 'A', email: 'a@demo.cl', address: 'A 1', region: 'RM'},
            items: [{productId: 'P102', quantity: 2}],
            paymentMethod: 'demo'
        });
        const body = JSON.parse(fetch.calls.mostRecent().args[1].body);
        expect(body.items[0].productId).toBe('P102');
        expect(body.items[0].quantity).toBe(2);
        expect(body.items[0].price).toBeUndefined();
    });
    it('carga catálogo desde la API y calcula formato de presentación', async () => {
        fetch.and.returnValue(Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({products: [{id: 'P1'}], categories: [], posts: []})
        }));
        expect((await loadCatalog()).products.length).toBe(1);
        expect(money(1000)).toContain('1.000');
        expect(cartTotal([{productId: 'P1', quantity: 2}], [{id: 'P1', price: 100}])).toBe(200);
    });
    it('propaga errores de API', async () => {
        fetch.and.returnValue(Promise.resolve({
            ok: false,
            status: 403,
            json: () => Promise.resolve({error: 'No autorizado'})
        }));
        await expectAsync(api('/api/state')).toBeRejectedWithError('No autorizado');
    });
});
