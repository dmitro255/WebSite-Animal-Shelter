import { useEffect, useState } from "react";
import { useRequest } from "../Hooks/useRequest";

function AnimalCatalog() {
  const [animalList, setAnimalList] = useState([]);
  const { error, run } = useRequest();

  useEffect(() => {
    async function read() {
      const data = await run("GET", "/animals");
      if (data) setAnimalList(data);
    }
    read();
  }, [run]);

  return (
    <div>
      <h1>Каталог животных</h1>
      <section>
        {error && <p role="alert">{error}</p>}
        {animalList.map((animal) => (
          <article key={animal.id}>
            <h2>{animal.name}</h2>
            <p>Вид: {animal.species}</p>
            <p>Статус: {animal.status}</p>
          </article>
        ))}
      </section>
    </div>
  ); 
}

export default AnimalCatalog;