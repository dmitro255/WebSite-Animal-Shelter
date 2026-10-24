import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useRequest } from "../Hooks/useRequest";

const statusLabels = {
  available: "Доступен",
  reserved: "Забронирован",
  adopted: "Уже дома",
};

const statusStyles = {
  available: "bg-emerald-100 text-emerald-800",
  reserved: "bg-amber-100 text-amber-800",
  adopted: "bg-sky-100 text-sky-800",
};

const speciesIcons = {
  Кот: "🐈",
  Кошка: "🐈",
  Собака: "🐕",
  Попугай: "🦜",
  Кролик: "🐇",
  Хомяк: "🐹",
};

function AnimalCatalog() {
  const [animalList, setAnimalList] = useState([]);
  const [selectedSpecies, setSelectedSpecies] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const { error, run } = useRequest();

  const speciesList = [...new Set(animalList.map((animal) => animal.species))];
  const filteredAnimals = animalList.filter((animal) => {
    const matchesSpecies =
      selectedSpecies === "" || animal.species === selectedSpecies;
    const matchesStatus =
      selectedStatus === "" || animal.status === selectedStatus;

    return matchesSpecies && matchesStatus;
  });

  useEffect(() => {
    async function readAnimals() {
      const data = await run("GET", "/animals");
      if (data) setAnimalList(data);
      setLoading(false);
    }

    readAnimals();
  }, [run]);

  return (
    <div className="space-y-8 py-4 text-stone-800">
      <header className="flex flex-wrap items-end justify-between gap-5 rounded-3xl bg-gradient-to-br from-emerald-50 via-amber-50 to-orange-100 p-7 sm:p-9">
        <div>
          <p className="mb-2 text-xs font-bold tracking-[0.18em] text-emerald-800 uppercase">
            Знакомьтесь, они ждут вас
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Каталог животных
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-stone-600 sm:text-base">
            Найдите нового друга среди питомцев нашего приюта.
          </p>
        </div>
        <Link
          to="/animal/new"
          className="inline-flex items-center justify-center rounded-xl bg-emerald-800 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800"
        >
          + Добавить животное
        </Link>
      </header>

      <section
        aria-label="Фильтры животных"
        className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:flex-row sm:items-end"
      >
        <label className="flex flex-1 flex-col gap-2 text-sm font-semibold text-stone-700">
          Вид
          <select
            value={selectedSpecies}
            onChange={(event) => setSelectedSpecies(event.target.value)}
            className="rounded-xl border border-stone-300 bg-stone-50 px-3 py-2.5 font-normal outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20"
          >
            <option value="">Все виды</option>
            {speciesList.map((species) => (
              <option key={species} value={species}>
                {species}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-1 flex-col gap-2 text-sm font-semibold text-stone-700">
          Статус
          <select
            value={selectedStatus}
            onChange={(event) => setSelectedStatus(event.target.value)}
            className="rounded-xl border border-stone-300 bg-stone-50 px-3 py-2.5 font-normal outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20"
          >
            <option value="">Все статусы</option>
            <option value="available">Доступны</option>
            <option value="reserved">Забронированы</option>
            <option value="adopted">Пристроены</option>
          </select>
        </label>

        <p className="pb-2 text-sm text-stone-500" aria-live="polite">
          Найдено:{" "}
          <span className="font-semibold text-stone-800">
            {filteredAnimals.length}
          </span>
        </p>
      </section>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </p>
      )}

      {loading ? (
        <p className="py-12 text-center text-stone-500" role="status">
          Загружаем животных…
        </p>
      ) : filteredAnimals.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 px-6 py-14 text-center">
          <p className="text-lg font-semibold text-stone-700">
            Животные не найдены
          </p>
          <p className="mt-2 text-sm text-stone-500">
            Попробуйте выбрать другие фильтры.
          </p>
        </div>
      ) : (
        <section
          aria-label="Список животных"
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filteredAnimals.map((animal) => (
            <article
              key={animal.id}
              className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg"
            >
              <div className="relative flex h-36 items-center justify-center bg-gradient-to-br from-emerald-50 via-amber-50 to-orange-100">
                <span className="text-6xl transition-transform duration-200 group-hover:scale-110" aria-hidden="true">
                  {speciesIcons[animal.species] ?? "🐾"}
                </span>
                <span
                  className={`absolute top-4 right-4 rounded-full px-3 py-1 text-xs font-semibold ${
                    statusStyles[animal.status] ?? "bg-stone-100 text-stone-700"
                  }`}
                >
                  {statusLabels[animal.status] ?? animal.status}
                </span>
              </div>

              <div className="space-y-3 p-5">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">
                    {animal.name}
                  </h2>
                  <p className="mt-1 text-sm text-stone-500">
                    {animal.species}
                    {animal.breed ? ` · ${animal.breed}` : ""}
                    {" · "}
                    {animal.age}{" "}
                    {animal.age === 1
                      ? "год"
                      : animal.age > 1 && animal.age < 5
                        ? "года"
                        : "лет"}
                  </p>
                </div>
                <p className="min-h-10 text-sm leading-5 text-stone-600">
                  {animal.description || "Описание пока не добавлено."}
                </p>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

export default AnimalCatalog;
