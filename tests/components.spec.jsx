import React from 'react';
import {render, fireEvent, screen, cleanup, waitFor} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import {ProductCard, Empty, Header} from '../src/components/Shared';
import {StoreProvider} from '../src/context/StoreContext';
import {productsSeed, categoriesSeed, postsSeed} from './fixtures/storeSeed';

const mockCatalog = {products: productsSeed, categories: categoriesSeed, posts: postsSeed};
const wrapper = Component => render(<MemoryRouter><StoreProvider><Header/>{Component}</StoreProvider></MemoryRouter>);
describe('Componentes React conectados al estado de interfaz', () => {
    beforeEach(() => {
        localStorage.clear();
        global.fetch = jasmine.createSpy('fetch').and.callFake(url => Promise.resolve(url.endsWith('/api/catalog') ? {
            ok: true,
            status: 200,
            json: () => Promise.resolve(mockCatalog)
        } : {ok: false, status: 401, json: () => Promise.resolve({error: 'No session'})}));
    });
    afterEach(() => cleanup());
    it('renderiza nombre y precio recibidos por props', () => {
        wrapper(<ProductCard product={{
            id: 'P101',
            name: 'Teclado prueba',
            categoryId: 'teclados',
            price: 10000,
            oldPrice: 0,
            stock: 4,
            art: 'keyboard',
            badge: ''
        }}/>);
        expect(screen.getByText('Teclado prueba')).toBeTruthy();
        expect(screen.getByText(/10.000/)).toBeTruthy();
    });
    it('deshabilita el botón del producto sin stock', () => {
        wrapper(<ProductCard product={{
            id: 'X',
            name: 'Sin stock prueba',
            categoryId: 'mouse',
            price: 10,
            oldPrice: 0,
            stock: 0,
            art: 'mouse',
            badge: ''
        }}/>);
        expect(screen.getByRole('button', {name: /Sin stock/i}).disabled).toBe(true);
    });
    it('mantiene el carrito solo en memoria de React', async () => {
        wrapper(<ProductCard product={{
            id: 'P101',
            name: 'Teclado prueba',
            categoryId: 'teclados',
            price: 10000,
            oldPrice: 0,
            stock: 4,
            art: 'keyboard',
            badge: ''
        }}/>);
        fireEvent.click(screen.getByRole('button', {name: /Agregar al carrito/i}));
        await waitFor(() => expect(screen.getByRole('link', {name: /Carrito con 1 productos/i})).toBeTruthy());
        expect(localStorage.length).toBe(0);
    });
    it('renderiza mensaje vacío', () => {
        wrapper(<Empty title="No existe" detail="Cambia el filtro"/>);
        expect(screen.getByText('No existe')).toBeTruthy();
        expect(screen.getByText('Cambia el filtro')).toBeTruthy();
    });
});
