import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useRequest } from "../Hooks/useRequest";

const emptyAnimal = {
  name: "",
  species: "",
  breed: "",
  age: "",
  description: "",
  status: "available",
};

const fieldClassName =
  "w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20";

function AnimalForm() {
  const { animalId } = useParams();
  const { run, error } = useRequest();
  const navigate = useNavigate();
  const [animal, setAnimal] = useState(emptyAnimal);
  const [loading, setLoading] = useState(Boolean(animalId));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!animalId) return undefined;

    let isActive = true;

    async function loadAnimal() {
      const result = await run("GET", `/animals/${animalId}`);
      if (isActive && result) {
        setAnimal({
          ...result,
          age: String(result.age),
          breed: result.breed ?? "",
          description: result.description ?? "",
        });
      }
      if (isActive) setLoading(false);
    }

    loadAnimal();

    return () => {
      isActive = false;
    };
  }, [animalId, run]);

  function updateField(event) {
    const { name, value } = event.target;
    setAnimal((current) => ({ ...current, [name]: value }));
  }

  async function saveAnimal(event) {
    event.preventDefault();
    setSubmitting(true);

    const animalData = {
      name: animal.name.trim(),
      species: animal.species.trim(),
      breed: animal.breed.trim() || null,
      age: Number(animal.age),
      description: animal.description.trim() || null,
      status: animal.status,
    };

    try {
      const savedAnimal = animalId
        ? await run("PUT", `/animals/${animalId}`, animalData)
        : await run("POST", "/animals", animalData);

      if (savedAnimal) {
        navigate(animalId ? `/animal/${animalId}` : "/animal");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const isEditing = Boolean(animalId);

  if (loading) {
    return (
      <p className="py-12 text-center text-stone-500" role="status">
        Loading animal…
      </p>
    );
  }

  if (isEditing && !animal.id) {
    return (
      <div className="mx-auto max-w-2xl space-y-5 py-4">
        <p
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {error || "Animal not found."}
        </p>
        <Link
          to="/animal"
          className="inline-flex rounded-xl border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
        >
          Back to catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl py-4 text-stone-800">
      <header className="mb-7">
        <p className="mb-2 text-xs font-bold tracking-[0.18em] text-emerald-800 uppercase">
          ANIMAL PROFILE
        </p>
        <h1 className="text-3xl font-bold tracking-tight">
          {isEditing ? "Edit animal" : "Add an animal"}
        </h1>
        <p className="mt-2 text-stone-600">
          {isEditing
            ? "Update the animal's information."
            : "Enter the animal's information to add it to the catalog."}
        </p>
      </header>

      <form
        onSubmit={saveAnimal}
        className="space-y-5 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <label className="block space-y-2 text-sm font-semibold text-stone-700">
          Name
          <input
            className={fieldClassName}
            name="name"
            type="text"
            value={animal.name}
            onChange={updateField}
            autoComplete="off"
            placeholder="For example, Luna"
            maxLength={100}
            required
          />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block space-y-2 text-sm font-semibold text-stone-700">
            Species
            <input
              className={fieldClassName}
              name="species"
              type="text"
              value={animal.species}
              onChange={updateField}
              placeholder="For example, cat"
              maxLength={100}
              required
            />
          </label>

          <label className="block space-y-2 text-sm font-semibold text-stone-700">
            Breed
            <input
              className={fieldClassName}
              name="breed"
              type="text"
              value={animal.breed}
              onChange={updateField}
              placeholder="Optional"
              maxLength={100}
            />
          </label>
        </div>

        <label className="block space-y-2 text-sm font-semibold text-stone-700">
          Age (years)
          <input
            className={fieldClassName}
            name="age"
            type="number"
            value={animal.age}
            onChange={updateField}
            min="0"
            step="1"
            placeholder="For example, 2"
            required
          />
        </label>

        <label className="block space-y-2 text-sm font-semibold text-stone-700">
          Description
          <textarea
            className={`${fieldClassName} min-h-28 resize-y`}
            name="description"
            value={animal.description}
            onChange={updateField}
            placeholder="Tell us about the animal's personality and habits"
            maxLength={2000}
          />
        </label>

        <label className="block space-y-2 text-sm font-semibold text-stone-700">
          Status
          <select
            className={fieldClassName}
            name="status"
            value={animal.status}
            onChange={updateField}
          >
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="adopted">Adopted</option>
          </select>
        </label>

        {error && (
          <p
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            {error}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Link
            to="/animal"
            className="inline-flex items-center justify-center rounded-xl border border-stone-300 px-5 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-xl bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-wait disabled:opacity-60"
          >
            {submitting
              ? "Saving…"
              : isEditing
                ? "Save changes"
                : "Add animal"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AnimalForm;
