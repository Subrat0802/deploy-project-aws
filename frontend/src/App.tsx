import { useEffect, useState } from "react";
import "./App.css";

interface Todo {
  id: string;
  title: string;
  status: boolean;
}

function App() {
  const [todos, setTodos] = useState<Todo[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const userTodos = async () => {
    try {
      const response = await fetch("http://localhost:3001/todos", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to fetch todos");
      }

      const result = await response.json();
      setTodos(result.data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    }
  };

  useEffect(() => {
    userTodos();
  }, []);

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  if (!todos) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <h2>Hello</h2>

      <div>
        {todos.map((el) => (
          <div key={el.id}>
            <p>{el.title}</p>
            <p>{el.status ? "true" : "false"}</p>
          </div>
        ))}
      </div>
    </>
  );
}

export default App;
