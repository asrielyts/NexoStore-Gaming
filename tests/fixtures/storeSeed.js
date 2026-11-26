export const categoriesSeed = [
    {id: 'teclados', name: 'Teclados', icon: '⌨️', description: 'Precisión en cada pulsación.'},
    {id: 'mouse', name: 'Mouse', icon: '🖱️', description: 'Control milimétrico en cada partida.'},
    {id: 'audio', name: 'Audio', icon: '🎧', description: 'Escucha cada detalle del juego.'},
    {id: 'pantallas', name: 'Pantallas', icon: '🖥️', description: 'Fluidez, color y velocidad.'},
    {id: 'accesorios', name: 'Accesorios', icon: '🎮', description: 'Completa tu estación gamer.'}
];
export const productsSeed = [
    {
        id: 'P101',
        name: 'Teclado Aurora K87',
        categoryId: 'teclados',
        price: 59990,
        oldPrice: 79990,
        stock: 18,
        badge: 'TOP VENTAS',
        art: 'keyboard',
        color: '#7c6fff',
        description: 'Teclado mecánico TKL con switches lineales, iluminación RGB y cable USB-C desmontable.'
    },
    {
        id: 'P102',
        name: 'Mouse Vector X1',
        categoryId: 'mouse',
        price: 34990,
        oldPrice: 44990,
        stock: 25,
        badge: 'OFERTA',
        art: 'mouse',
        color: '#40cab4',
        description: 'Sensor de alta precisión, seis botones y diseño ultraligero de 59 gramos.'
    },
    {
        id: 'P103',
        name: 'Headset Eclipse 7.1',
        categoryId: 'audio',
        price: 74990,
        oldPrice: 0,
        stock: 12,
        badge: 'NUEVO',
        art: 'headset',
        color: '#bd82ff',
        description: 'Audífonos con micrófono desmontable y sonido envolvente virtual para juegos competitivos.'
    },
    {
        id: 'P104',
        name: 'Monitor Pulse 27',
        categoryId: 'pantallas',
        price: 239990,
        oldPrice: 269990,
        stock: 7,
        badge: 'OFERTA',
        art: 'monitor',
        color: '#43bafa',
        description: 'Panel IPS de 27 pulgadas, resolución QHD y frecuencia de actualización de 165 Hz.'
    },
    {
        id: 'P105',
        name: 'Control Nebula Pro',
        categoryId: 'accesorios',
        price: 49990,
        oldPrice: 0,
        stock: 10,
        badge: 'NUEVO',
        art: 'controller',
        color: '#ef87bb',
        description: 'Control inalámbrico con conectividad Bluetooth, vibración y batería recargable.'
    },
    {
        id: 'P106',
        name: 'Mousepad Titan XL',
        categoryId: 'accesorios',
        price: 19990,
        oldPrice: 27990,
        stock: 30,
        badge: 'OFERTA',
        art: 'mousepad',
        color: '#fbb265',
        description: 'Superficie extendida de 900 × 400 mm con base antideslizante.'
    },
    {
        id: 'P107',
        name: 'Micrófono StreamCast',
        categoryId: 'audio',
        price: 68990,
        oldPrice: 0,
        stock: 9,
        badge: 'STREAM',
        art: 'microphone',
        color: '#69a7ff',
        description: 'Micrófono USB de condensador con monitoreo directo y patrón cardioide.'
    },
    {
        id: 'P108',
        name: 'Teclado Nova 65',
        categoryId: 'teclados',
        price: 89990,
        oldPrice: 109990,
        stock: 6,
        badge: 'PREMIUM',
        art: 'keyboard',
        color: '#f29774',
        description: 'Teclado compacto 65% con switches hot-swap y estructura reforzada.'
    },
    {
        id: 'P109',
        name: 'Mouse Orbit Wireless',
        categoryId: 'mouse',
        price: 52990,
        oldPrice: 0,
        stock: 15,
        badge: 'WIRELESS',
        art: 'mouse',
        color: '#66d6c1',
        description: 'Mouse inalámbrico de baja latencia con hasta 65 horas de autonomía.'
    },
    {
        id: 'P110',
        name: 'Monitor Horizon 24',
        categoryId: 'pantallas',
        price: 139990,
        oldPrice: 159990,
        stock: 11,
        badge: 'OFERTA',
        art: 'monitor',
        color: '#9d85fb',
        description: 'Pantalla Full HD de 24 pulgadas y 144 Hz, ideal para comenzar tu setup.'
    },
    {
        id: 'P111',
        name: 'Base Lumina RGB',
        categoryId: 'accesorios',
        price: 24990,
        oldPrice: 0,
        stock: 19,
        badge: '',
        art: 'rgb',
        color: '#c67bfa',
        description: 'Base RGB antideslizante para auriculares con control táctil de iluminación.'
    },
    {
        id: 'P112',
        name: 'Headset Spectra Lite',
        categoryId: 'audio',
        price: 39990,
        oldPrice: 54990,
        stock: 22,
        badge: 'OFERTA',
        art: 'headset',
        color: '#61cdb4',
        description: 'Audio estéreo nítido con almohadillas suaves y micrófono flexible.'
    }
];
export const postsSeed = [
    {
        id: 'setup-perfecto',
        tag: 'GUÍAS',
        date: '12 OCT 2026',
        title: 'Cómo armar un setup gamer sin gastar de más',
        excerpt: 'Prioriza la ergonomía, el audio y los periféricos que realmente mejoran tu experiencia.',
        body: 'Un buen setup comienza por definir tus necesidades. Para juegos competitivos, prioriza periféricos consistentes: mouse con sensor confiable, teclado cómodo y monitor con buena frecuencia. Complementa con un espacio ordenado, una silla ajustada y buena iluminación. No siempre necesitas comprar lo más caro; compara características, garantía y compatibilidad antes de decidir.'
    },
    {
        id: 'teclado-mecanico',
        tag: 'TECNOLOGÍA',
        date: '08 OCT 2026',
        title: 'Teclados mecánicos: ¿qué switch elegir?',
        excerpt: 'Lineales, táctiles o clicky: descubre sus diferencias antes de comprar.',
        body: 'Los switches lineales ofrecen un recorrido suave; los táctiles brindan una respuesta perceptible y los clicky agregan un sonido marcado. Para jugar, la preferencia personal y la comodidad importan más que una etiqueta comercial. También revisa el tamaño del teclado, la distribución y la posibilidad de cambiar switches.'
    },
    {
        id: 'audio-gaming',
        tag: 'CONSEJOS',
        date: '01 OCT 2026',
        title: 'Audio competitivo: más allá del volumen',
        excerpt: 'Consejos para escuchar pasos y comunicaciones con mayor claridad.',
        body: 'Escuchar bien no significa subir el volumen al máximo. Prioriza un ajuste cómodo, un micrófono legible y una ecualización equilibrada. Usa niveles seguros de volumen y procura reducir el ruido ambiental. La espacialidad del juego y el uso de sus ajustes de audio también influyen.'
    }
];
