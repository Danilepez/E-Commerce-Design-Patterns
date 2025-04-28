import { Input } from "@heroui/react";

import { SearchIcon } from "./icons";
import { useEffect, useState } from "react";

export const SearchInput = () => {
  // Estado para almacenar el valor del input
  const [query, setQuery] = useState("");
  // Estado para guardar los resultados de la búsqueda
  const [, setResults] = useState([]);

  useEffect(() => {
    // Si no hay consulta, limpiamos resultados
    if (query.trim() === "") {
      setResults([]);

      return;
    }

    // Configuramos un timeout para "debounce" (por ejemplo, 500ms)
    const timer = setTimeout(() => {
      // Aquí puedes hacer una petición a tu backend o filtrar una lista local.
      // Ejemplo de llamada a un API:
      fetch(`http://localhost:3000/search?q=${encodeURIComponent(query)}`)
        .then((response) => response.json())
        .then((data) => {
          // Se espera que el API devuelva un array de resultados
          setResults(data);
        })
        .catch((error) => {
          console.error("Error al buscar:", error);
        });
    }, 500);

    // Limpiamos el timeout si el usuario sigue escribiendo
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <Input
      aria-label="Search"
      classNames={{
        inputWrapper: "bg-default-100 w-full",
        input: "text-sm",
      }}
      labelPlacement="outside"
      placeholder="Buscar..."
      startContent={
        <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
      }
      type="search"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
};

export default SearchInput;
