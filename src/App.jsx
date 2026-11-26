import {HashRouter, Routes, Route, Navigate, useLocation} from 'react-router-dom';
import React, {useState, useEffect} from "react";
import {Header, Footer} from './components/Shared';
import {
    Home,
    Shop,
    Categories,
    ProductDetail,
    Cart,
    Checkout,
    OrderResult,
    Blog,
    BlogDetail,
    About,
    Contact
} from './pages/Storefront';
import {Auth} from './pages/Auth';
import {Admin} from './pages/Admin';
import {StoreProvider} from './context/StoreContext';

function ScrollToTop() {
    const location = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);
    return null;
}

function Layout({children}) {
    const location = useLocation();
    const isAdmin = location.pathname.startsWith('/admin');
    return <><ScrollToTop/><Header/>{children}{!isAdmin && <Footer/>}</>;
}

export default function App() {
    return <StoreProvider><HashRouter><Layout><Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/productos" element={<Shop/>}/>
        <Route path="/ofertas" element={<Shop offers/>}/>
        <Route path="/categorias" element={<Categories/>}/>
        <Route path="/producto/:id" element={<ProductDetail/>}/>
        <Route path="/carrito" element={<Cart/>}/>
        <Route path="/checkout" element={<Checkout/>}/>
        <Route path="/resultado/:status/:id" element={<OrderResult/>}/>
        <Route path="/blog" element={<Blog/>}/>
        <Route path="/blog/:id" element={<BlogDetail/>}/>
        <Route path="/nosotros" element={<About/>}/>
        <Route path="/contacto" element={<Contact/>}/>
        <Route path="/acceso" element={<Auth/>}/>
        <Route path="/admin" element={<Admin/>}/>
        <Route path="*" element={<Navigate to="/" replace/>}/>
    </Routes></Layout></HashRouter></StoreProvider>;
}
