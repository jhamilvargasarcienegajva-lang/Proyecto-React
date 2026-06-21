import styles from "./todoForm.module.css";
import { useState } from "react";
import { Plus } from "lucide-react";

const TodoForm = ({ onAgregarProducto }) => {
    const [nombre, setNombre] = useState("");
    const [precio, setPrecio] = useState("");
    const [categoria, setCategoria] = useState("Audio");
    const [estado, setEstado] = useState("Disponible");
    const [descripcion, setDescripcion] = useState("");
    const [imagen, setImagen] = useState("");
    const [error, setError] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);

        if (!nombre.trim() || !precio.trim() || !imagen.trim()) {
            setError("Por favor, completa los campos obligatorios (*).");
            return;
        }

        const nuevoProducto = {
            nombre,
            precio: parseFloat(precio),
            categoria,
            estado,
            descripcion,
            imagen
        };

        try {
            const response = await fetch("http://localhost:3000/productos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(nuevoProducto)
            });
            if (!response.ok) throw new Error("Error al guardar");
            const data = await response.json();
            
            onAgregarProducto(data);

            // Restablecer el formulario
            setNombre("");
            setPrecio("");
            setDescripcion("");
            setImagen("");
            setCategoria("Audio");
            setEstado("Disponible");
        } catch {
            // Se eliminó 'err' para solucionar la advertencia de ESLint de variable no usada
            setError("No se pudo conectar con el servidor de la base de datos.");
        }
    };

    return (
        <div className={styles.formContainer}>
            <h2>Añadir Nuevo Producto</h2>
            <form onSubmit={handleSubmit} className={styles.gridForm}>
                {/* Fila 1 */}
                <input 
                    type="text" 
                    value={nombre} 
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Nombre del producto *"
                />
                <input 
                    type="number" 
                    step="0.01"
                    value={precio} 
                    onChange={(e) => setPrecio(e.target.value)}
                    placeholder="Precio ($) *"
                />
                <input 
                    type="text" 
                    value={imagen} 
                    onChange={(e) => setImagen(e.target.value)}
                    placeholder="URL de la imagen *"
                />
                
                {/* Fila 2 */}
                <div className={styles.selectWrapper}>
                    <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                        <option value="Audio">Audio</option>
                        <option value="Dispositivos">Dispositivos</option>
                        <option value="Accesorios">Accesorios</option>
                        <option value="Otros">Otros</option>
                    </select>
                </div>

                <div className={styles.selectWrapper}>
                    <select value={estado} onChange={(e) => setEstado(e.target.value)}>
                        <option value="Disponible">Disponible</option>
                        <option value="Agotado">Agotado</option>
                    </select>
                </div>

                {/* Fila 3 y 4 */}
                <div className={styles.textareaWrapper}>
                    <textarea 
                        value={descripcion} 
                        onChange={(e) => setDescripcion(e.target.value)}
                        placeholder="Descripción corta del artículo..."
                    />
                </div>

                <button type="submit" className={styles.btnSubmit}>
                    <Plus size={18} />
                    Agregar al Catálogo
                </button>
            </form>
            {error && <p className={styles.errorMessage}>{error}</p>}
        </div>
    );
};

export default TodoForm;