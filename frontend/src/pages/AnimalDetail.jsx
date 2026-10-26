import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api.js";

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

const adoptionStatusLabels = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

const speciesIcons = {
  Cat: "🐈",
  Dog: "🐕",
  Parrot: "🦜",
  Rabbit: "🐇",
  Hamster: "🐹",
};

function AnimalDetail() {
  const { animalId } = useParams();
  const [animal, setAnimal] = useState(null);
  const [adoptions, setAdoptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadDetails() {
      try {
        const [animalResult, adoptionResult] = await Promise.all([
          api("GET", `/animals/${animalId}`),
          api("GET", "/adoptions"),
        ]);

        if (!isActive) return;

        setAnimal(animalResult.data);
        setAdoptions(
          adoptionResult.data.filter(
            (adoption) => adoption.animal_id === Number(animalId),
          ),
        );
      } catch (err) {
        if (isActive) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load animal details.",
          );
        }
      } finally {
        if (isActive) setLoading(false);
      }
    }

    loadDetails();

    return () => {
      isActive = false;
    };
  }, [animalId]);

  if (loading) {
    return (
      <p className="py-12 text-center text-stone-500" role="status">
        Loading animal details…
      </p>
    );
  }

  if (error) {
    return (
      <div className="space-y-5 py-4">
        <p
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {error}
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

  if (!animal) {
    return (
      <div className="space-y-5 py-4">
        <h1 className="text-2xl font-bold text-stone-800">
          Animal not found
        </h1>
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
    <div className="mx-auto max-w-4xl space-y-7 py-4 text-stone-800">
      <Link
        to="/animal"
        className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 transition hover:text-emerald-950"
      >
        <span aria-hidden="true">←</span> Back to catalog
      </Link>

      <article className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
        <div className="relative flex min-h-52 items-center justify-center bg-gradient-to-br from-emerald-50 via-amber-50 to-orange-100 sm:min-h-64">
          <span className="text-8xl sm:text-9xl" aria-hidden="true">
            {speciesIcons[animal.species] ?? "🐾"}
          </span>
          <span
            className={`absolute top-5 right-5 rounded-full px-4 py-2 text-sm font-semibold ${
              statusStyles[animal.status] ?? "bg-stone-100 text-stone-700"
            }`}
          >
            {statusLabels[animal.status] ?? animal.status}
          </span>
        </div>

        <div className="space-y-6 p-6 sm:p-9">
          <header>
            <p className="text-sm font-semibold text-emerald-800">
              {animal.species}
              {animal.breed ? ` · ${animal.breed}` : ""}
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              {animal.name}
            </h1>
          </header>

          <dl className="grid gap-4 rounded-2xl bg-stone-50 p-5 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-stone-500">Age</dt>
              <dd className="mt-1 font-semibold">
                {animal.age}{" "}
                {animal.age === 1
                  ? "year"
                  : "years"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-stone-500">Status</dt>
              <dd className="mt-1 font-semibold">
                {statusLabels[animal.status] ?? animal.status}
              </dd>
            </div>
          </dl>

          <section>
            <h2 className="text-lg font-semibold">About</h2>
            <p className="mt-2 leading-7 whitespace-pre-wrap text-stone-600">
              {animal.description || "No description has been added yet."}
            </p>
          </section>
        </div>
      </article>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Applications for this animal
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            Total applications: {adoptions.length}
          </p>
        </div>

        {adoptions.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-stone-300 px-5 py-8 text-center text-stone-500">
            There are no applications for this animal yet.
          </p>
        ) : (
          <div className="space-y-3">
            {adoptions.map((adoption) => (
              <article
                key={adoption.id}
                className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-5"
              >
                <div>
                  <h3 className="font-semibold">{adoption.person_name}</h3>
                  <a
                    className="mt-1 inline-block text-sm text-emerald-800 underline-offset-2 hover:underline"
                    href={`tel:${adoption.phone}`}
                  >
                    {adoption.phone}
                  </a>
                  {adoption.reason && (
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
                      {adoption.reason}
                    </p>
                  )}
                </div>
                <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">
                  {adoptionStatusLabels[adoption.status] ?? adoption.status}
                </span>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default AnimalDetail;
