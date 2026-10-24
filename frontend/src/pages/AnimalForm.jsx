import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRequest } from "../Hooks/useRequest";

const fieldClassName =
  "w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20";

function AnimalForm() {
  const { run, error } = useRequest();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  async function createAnimal(event) {
    event.preventDefault();
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const animalData = {
      name: formData.get("name").trim(),
      species: formData.get("species").trim(),
      breed: formData.get("breed").trim() || null,
      age: Number(formData.get("age")),
      description: formData.get("description").trim() || null,
      status: formData.get("status"),
    };

    const createdAnimal = await run("POST", "/animals", animalData);
    setSubmitting(false);

    if (createdAnimal) navigate("/animal");
  }

  return (
    <div className="mx-auto max-w-2xl py-4 text-stone-800">
      <header className="mb-7">
        <p className="mb-2 text-xs font-bold tracking-[0.18em] text-emerald-800 uppercase">
          Карточка питомца
        </p>
        <h1 className="text-3xl font-bold tracking-tight">
          Добавить животное
        </h1>
        <p className="mt-2 text-stone-600">
          Заполните информацию о животном, чтобы добавить его в каталог.
        </p>
      </header>

      <form
        onSubmit={createAnimal}
        className="space-y-5 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <label className="block space-y-2 text-sm font-semibold text-stone-700">
          Имя
          <input
            className={fieldClassName}
            name="name"
            type="text"
            autoComplete="off"
            placeholder="Например, Луна"
            maxLength={100}
            required
          />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block space-y-2 text-sm font-semibold text-stone-700">
            Вид
            <input
              className={fieldClassName}
              name="species"
              type="text"
              placeholder="Например, кошка"
              maxLength={100}
              required
            />
          </label>

          <label className="block space-y-2 text-sm font-semibold text-stone-700">
            Порода
            <input
              className={fieldClassName}
              name="breed"
              type="text"
              placeholder="Можно оставить пустым"
              maxLength={100}
            />
          </label>
        </div>

        <label className="block space-y-2 text-sm font-semibold text-stone-700">
          Возраст (лет)
          <input
            className={fieldClassName}
            name="age"
            type="number"
            min="0"
            step="1"
            placeholder="Например, 2"
            required
          />
        </label>

        <label className="block space-y-2 text-sm font-semibold text-stone-700">
          Описание
          <textarea
            className={`${fieldClassName} min-h-28 resize-y`}
            name="description"
            placeholder="Расскажите о характере и привычках питомца"
            maxLength={2000}
          />
        </label>

        <label className="block space-y-2 text-sm font-semibold text-stone-700">
          Статус
          <select className={fieldClassName} name="status" defaultValue="available">
            <option value="available">Доступен</option>
            <option value="reserved">Забронирован</option>
            <option value="adopted">Пристроен</option>
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
            Отмена
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-xl bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-wait disabled:opacity-60"
          >
            {submitting ? "Сохраняем…" : "Добавить животное"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AnimalForm;
