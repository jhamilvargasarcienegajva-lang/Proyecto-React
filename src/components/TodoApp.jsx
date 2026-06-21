import styles from "./todoApp.module.css";
import { useState, useEffect } from "react";
import TodoForm from "./TodoForm/TodoForm";
import { Trash, ShoppingCart, Plus, Minus, PackageX, X } from "lucide-react";

function TodoApp() {
    const [productos, setProductos] = useState([]);
    const [carrito, setCarrito] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Cargar productos desde json-server
    useEffect(() => {
        fetch("http://localhost:3000/productos")
            .then(res => {
                if (!res.ok) throw new Error("Error en el servidor");
                return res.json();
            })
            .then(data => setProductos(data))
            .catch(() => setError("Error al cargar los productos de db.json"))
            .finally(() => setLoading(false));
    }, []);

    const agregarProducto = (nuevoProducto) => {
        setProductos((prev) => [...prev, nuevoProducto]);
    };

    const eliminarProducto = async (id) => {
        try {
            await fetch(`http://localhost:3000/productos/${id}`, { method: "DELETE" });
            setProductos(productos.filter(prod => prod.id !== id));
            setCarrito(carrito.filter(item => item.id !== id));
        } catch {
            console.error("No se pudo eliminar el producto del servidor");
        }
    };

    const agregarAlCarrito = (producto) => {
        if (producto.estado === "Agotado") return;

        setCarrito((prevCarrito) => {
            const existe = prevCarrito.find(item => item.id === producto.id);
            if (existe) {
                return prevCarrito.map(item => 
                    item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
                );
            }
            return [...prevCarrito, { ...producto, cantidad: 1 }];
        });
    };

    const restarDelCarrito = (id) => {
        setCarrito((prevCarrito) => {
            const item = prevCarrito.find(i => i.id === id);
            if (item.cantidad === 1) return prevCarrito.filter(i => i.id !== id);
            return prevCarrito.map(i => i.id === id ? { ...i, cantidad: i.cantidad - 1 } : i);
        });
    };

    const cantidadTotalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    const totalPagar = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

    return (
        <div className={styles.dashboardContainer}>
            <header className={styles.header}>
                <div className={styles.headerTitleArea}>
                    <h1 className={styles.titulo}>Panel de Control Premium</h1>
                    <p className={styles.subtitulo}>Administra tus productos, categorías y stock en tiempo real</p>
                </div>
                
                <button className={styles.cartIconButton} onClick={() => setIsCartOpen(!isCartOpen)}>
                    <ShoppingCart size={24} />
                    {cantidadTotalItems > 0 && (
                        <span className={styles.notificationBadge}>{cantidadTotalItems}</span>
                    )}
                </button>
            </header>

            <TodoForm onAgregarProducto={agregarProducto} />

            <main className={styles.mainContent}>
                <section className={styles.catalogoSection}>
                    <h2>Catálogo Disponible</h2>
                    {loading && <p>Cargando productos...</p>}
                    {error && <p className={styles.errorMessage}>{error}</p>}
                    
                    <div className={styles.productsGrid}>
                        {productos.map((prod) => (
                            <div className={styles.productCard} key={prod.id}>
                                <div className={styles.imageContainer}>
                                    <img src={prod.imagen} alt={prod.nombre} />
                                    <button className={styles.btnDeleteProduct} onClick={() => eliminarProducto(prod.id)}>
                                        <Trash size={14} />
                                    </button>
                                    
                                    {/* ETIQUETA DE CATEGORÍA FLOTANTE */}
                                    <span className={styles.categoryBadge}>{prod.categoria || "General"}</span>
                                </div>
                                
                                <div className={styles.productContent}>
                                    <h3>{prod.nombre}</h3>
                                    <p>{prod.descripcion || "Sin descripción corta."}</p>
                                    
                                    {/* CONTENEDOR VISUAL DEL ESTADO (DISPONIBLE / AGOTADO) */}
                                    <div className={styles.statusRow}>
                                        <span className={`${styles.statusIndicator} ${prod.estado === 'Disponible' ? styles.bgDisponible : styles.bgAgotado}`}>
                                            {prod.estado || "Disponible"}
                                        </span>
                                    </div>

                                    <div className={styles.productFooter}>
                                        <span className={styles.price}>${prod.precio.toFixed(2)}</span>
                                        <button 
                                            className={`${styles.btnAddToCart} ${prod.estado === 'Agotado' ? styles.btnDisabled : ''}`} 
                                            onClick={() => agregarAlCarrito(prod)}
                                            disabled={prod.estado === 'Agotado'}
                                        >
                                            <ShoppingCart size={14} />
                                            {prod.estado === 'Disponible' ? 'Añadir' : 'Agotado'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {isCartOpen && (
                <div className={styles.cartOverlay} onClick={() => setIsCartOpen(false)}>
                    <aside className={styles.cartDropdown} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.cartDropdownHeader}>
                            <h2>Tu Pedido</h2>
                            <button className={styles.btnCloseCart} onClick={() => setIsCartOpen(false)}><X size={20} /></button>
                        </div>
                        {carrito.length === 0 ? (
                            <div className={styles.emptyCart}><PackageX size={40} /><p>El carrito está vacío.</p></div>
                        ) : (
                            <>
                                <div className={styles.cartList}>
                                    {carrito.map((item) => (
                                        <div className={styles.cartItem} key={item.id}>
                                            <img src={item.imagen} alt={item.nombre} className={styles.cartItemImg} />
                                            <div className={styles.cartItemInfo}>
                                                <h4>{item.nombre}</h4>
                                                <span className={styles.cartItemPrice}>${(item.precio * item.cantidad).toFixed(2)}</span>
                                                <div className={styles.quantityWidget}>
                                                    <button onClick={() => restarDelCarrito(item.id)}><Minus size={10} /></button>
                                                    <span>{item.cantidad}</span>
                                                    <button onClick={() => agregarAlCarrito(item)}><Plus size={10} /></button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className={styles.checkoutBox}>
                                    <div className={styles.totalRow}><span>Total:</span><span className={styles.grandTotal}>${totalPagar.toFixed(2)}</span></div>
                                    <button className={styles.btnCheckout} onClick={() => alert("¡Pedido Confirmado con éxito!")}>Confirmar Orden</button>
                                </div>
                            </>
                        )}
                    </aside>
                </div>
            )}
        </div>
    );
}

export default TodoApp;