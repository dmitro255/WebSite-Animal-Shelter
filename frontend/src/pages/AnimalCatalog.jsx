import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useRequest } from "../Hooks/useRequest";

const statusLabels = {
  available: "Available",
  reserved: "Reserved",
  adopted: "Adopted",
};

const statusStyles = {
  available: "bg-emerald-100 text-emerald-800",
  reserved: "bg-amber-100 text-amber-800",
  adopted: "bg-sky-100 text-sky-800",
};

const speciesIcons = {
  Cat: "🐈",
  Dog: "🐕",
  Parrot: "🦜",
  Rabbit: "🐇",
  Hamster: "🐹",
};

function AnimalCatalog() {
  const [animalList, setAnimalList] = useState([]);
  const [speciesList, setSpeciesList] = useState([]);
  const [selectedSpecies, setSelectedSpecies] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const { error, run } = useRequest();

  useEffect(() => {
    let isActive = true;

    async function readAnimals() {
      const query = new URLSearchParams();
      if (selectedSpecies) query.set("species", selectedSpecies);
      if (selectedStatus) query.set("status", selectedStatus);
      const queryString = query.toString();
      const path = queryString ? `/animals?${queryString}` : "/animals";

      const data = await run("GET", path);
      if (isActive && data) {
        setAnimalList(data);
        if (!selectedSpecies && !selectedStatus) {
          setSpeciesList(
            [...new Set(data.map((animal) => animal.species))].sort(),
          );
        }
      }
      if (isActive) setLoading(false);
    }

    readAnimals();

    return () => {
      isActive = false;
    };
  }, [run, selectedSpecies, selectedStatus]);

  async function deleteAnimal(animal) {
    if (
      !window.confirm(
        `Delete ${animal.name}? Any applications linked to this animal will also be deleted.`,
      )
    ) {
      return;
    }

    setDeletingId(animal.id);
    const deleted = await run("DELETE", `/animals/${animal.id}`);
    if (deleted) {
      setAnimalList((current) =>
        current.filter((currentAnimal) => currentAnimal.id !== animal.id),
      );
    }
    setDeletingId(null);
  }

  function changeSpecies(event) {
    setLoading(true);
    setSelectedSpecies(event.target.value);
  }

  function changeStatus(event) {
    setLoading(true);
    setSelectedStatus(event.target.value);
  }

  return (
    <div className="space-y-8 py-4 text-stone-800">
      <header className="flex flex-wrap items-end justify-between gap-5 rounded-3xl bg-gradient-to-br from-emerald-50 via-amber-50 to-orange-100 p-7 sm:p-9">
        <div>
          <p className="mb-2 text-xs font-bold tracking-[0.18em] text-emerald-800 uppercase">
            MEET YOUR NEW BEST FRIEND
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Animal catalog
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-stone-600 sm:text-base">
            Find your new companion among the animals at our shelter.
          </p>
        </div>
        <Link
          to="/animal/new"
          className="inline-flex items-center justify-center rounded-xl bg-emerald-800 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800"
        >
          + Add an animal
        </Link>
      </header>

      <section
        aria-label="Animal filters"
        className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:flex-row sm:items-end"
      >
        <label className="flex flex-1 flex-col gap-2 text-sm font-semibold text-stone-700">
          Species
          <select
            value={selectedSpecies}
            onChange={changeSpecies}
            className="rounded-xl border border-stone-300 bg-stone-50 px-3 py-2.5 font-normal outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20"
          >
            <option value="">All species</option>
            {speciesList.map((species) => (
              <option key={species} value={species}>
                {species}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-1 flex-col gap-2 text-sm font-semibold text-stone-700">
          Status
          <select
            value={selectedStatus}
            onChange={changeStatus}
            className="rounded-xl border border-stone-300 bg-stone-50 px-3 py-2.5 font-normal outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20"
          >
            <option value="">All statuses</option>
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="adopted">Adopted</option>
          </select>
        </label>

        <p className="pb-2 text-sm text-stone-500" aria-live="polite">
          Results:{" "}
          <span className="font-semibold text-stone-800">
            {animalList.length}
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
          Loading animals…
        </p>
      ) : animalList.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 px-6 py-14 text-center">
          <p className="text-lg font-semibold text-stone-700">
            No animals found
          </p>
          <p className="mt-2 text-sm text-stone-500">
            Try changing your filters.
          </p>
        </div>
      ) : (
        <section
          aria-label="Animal list"
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {animalList.map((animal) => (
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
                      ? "year"
                      : "years"}
                  </p>
                </div>
                <p className="min-h-10 text-sm leading-5 text-stone-600">
                  {animal.description || "No description has been added yet."}
                </p>
                <Link
                  to={`/animal/${animal.id}`}
                  className="inline-flex text-sm font-semibold text-emerald-800 underline-offset-4 transition hover:text-emerald-950 hover:underline"
                >
                  View animal details <span aria-hidden="true">→</span>
                </Link>
                <div className="flex flex-wrap gap-3 border-t border-stone-100 pt-3">
                  <Link
                    to={`/animal/${animal.id}/edit`}
                    className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => deleteAnimal(animal)}
                    disabled={deletingId === animal.id}
                    className="rounded-lg border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-wait disabled:opacity-50"
                  >
                    {deletingId === animal.id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

export default AnimalCatalog;
