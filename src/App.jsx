import "./index.css";
import TodoApp from "./components/TodoApp";
// `<h1>${nombre}</h1>`
// <></> | Fragment

// Pasar Props

function App() {
    return (
        <section className="containerTodoApp">
            <TodoApp />
        </section>
    );
}

export default App;
