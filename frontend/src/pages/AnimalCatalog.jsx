import { useEffect, useState } from "react";
import { useRequest } from "../Hooks/useRequest";

function AnimalCatalog() {
  const [animalList, setAnimalList] = useState([]);
  const { error, run } = useRequest();
  const [selectedSpecies, setSelectedSpecies] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const speciesList = [...new Set(animalList.map((animal) => animal.species))];

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
      <h2>Фильтр по виду и статусу: </h2>

      <select
        value={selectedSpecies}
        onChange={(event) => setSelectedSpecies(event.target.value)}
      >
        <option value="">Все виды</option>
        {speciesList.map((species) => (
          <option key={species} value={species}>
            {species}
          </option>
        ))}

      </select>

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
