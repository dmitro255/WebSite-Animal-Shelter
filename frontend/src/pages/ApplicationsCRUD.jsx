import { useCallback, useEffect, useState } from "react";
import { useRequest } from "../Hooks/useRequest";

const emptyForm = {
  animal_id: "",
  person_name: "",
  phone: "",
  reason: "",
  status: "pending",
};

const statusLabels = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

const statusStyles = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-rose-100 text-rose-800",
};

const inputClassName =
  "w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-stone-800 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20";

function ApplicationsCRUD() {
  const { error, run } = useRequest();
  const [requests, setRequests] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [requestData, animalData] = await Promise.all([
        run("GET", "/adoptions"),
        run("GET", "/animals"),
      ]);

      if (requestData) setRequests(requestData);
      if (animalData) setAnimals(animalData);
    } finally {
      setLoading(false);
    }
  }, [run]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function startEdit(request) {
    setEditingId(request.id);
    setForm({
      animal_id: String(request.animal_id),
      person_name: request.person_name,
      phone: request.phone,
      reason: request.reason ?? "",
      status: request.status,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);

    const adoptionData = {
      ...form,
      animal_id: Number(form.animal_id),
      reason: form.reason.trim() || null,
      person_name: form.person_name.trim(),
      phone: form.phone.trim(),
    };

    try {
      const savedRequest =
        editingId === null
          ? await run("POST", "/adoptions", adoptionData)
          : await run("PUT", `/adoptions/${editingId}`, adoptionData);

      if (!savedRequest) return;

      setRequests((current) =>
        editingId === null
          ? [...current, savedRequest]
          : current.map((request) =>
              request.id === editingId ? savedRequest : request,
            ),
      );
      cancelEdit();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this application?")) return;

    setDeletingId(id);
    try {
      const deleted = await run("DELETE", `/adoptions/${id}`);
      if (deleted) {
        setRequests((current) =>
          current.filter((request) => request.id !== id),
        );
        if (editingId === id) cancelEdit();
      }
    } finally {
      setDeletingId(null);
    }
  }

  const animalNames = new Map(
    animals.map((animal) => [animal.id, animal.name]),
  );
  const selectableAnimals = animals.filter(
    (animal) =>
      animal.status !== "adopted" || animal.id === Number(form.animal_id),
  );

  return (
    <div className="space-y-7 py-4 text-stone-800">
      <header>
        <p className="mb-2 text-xs font-bold tracking-[0.18em] text-emerald-800 uppercase">
          APPLICATION MANAGEMENT
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Adoption applications
        </h1>
        <p className="mt-2 text-stone-600">
          Review applications and update their status.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:grid-cols-2 sm:p-6"
      >
        <h2 className="text-xl font-semibold sm:col-span-2">
          {editingId === null
            ? "New application"
            : `Edit application #${editingId}`}
        </h2>

        <label className="block space-y-2 text-sm font-semibold text-stone-700">
          Animal
          <select
            className={inputClassName}
            name="animal_id"
            value={form.animal_id}
            onChange={updateField}
            required
          >
            <option value="">Select an animal</option>
            {selectableAnimals.map((animal) => (
              <option key={animal.id} value={animal.id}>
                {animal.name} — {animal.species}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-2 text-sm font-semibold text-stone-700">
          Applicant name
          <input
            className={inputClassName}
            name="person_name"
            value={form.person_name}
            onChange={updateField}
            autoComplete="name"
            required
          />
        </label>

        <label className="block space-y-2 text-sm font-semibold text-stone-700">
          Phone
          <input
            className={inputClassName}
            name="phone"
            type="tel"
            value={form.phone}
            onChange={updateField}
            autoComplete="tel"
            required
          />
        </label>

        <label className="block space-y-2 text-sm font-semibold text-stone-700">
          Status
          <select
            className={inputClassName}
            name="status"
            value={form.status}
            onChange={updateField}
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </label>

        <label className="block space-y-2 text-sm font-semibold text-stone-700 sm:col-span-2">
          Reason for application
          <textarea
            className={`${inputClassName} min-h-24 resize-y`}
            name="reason"
            value={form.reason}
            onChange={updateField}
          />
        </label>

        {error && (
          <p
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 sm:col-span-2"
            role="alert"
          >
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-3 sm:col-span-2">
          <button
            type="submit"
            disabled={saving || selectableAnimals.length === 0}
            className="rounded-xl bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "Saving…"
              : editingId === null
                ? "Create application"
                : "Save changes"}
          </button>
          {editingId !== null && (
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-xl border border-stone-300 px-5 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
            >
              Cancel editing
            </button>
          )}
          {selectableAnimals.length === 0 && (
            <p className="self-center text-sm text-stone-500">
              No animals are available for a new application.
            </p>
          )}
        </div>
      </form>

      <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="border-b border-stone-200 px-5 py-4">
          <h2 className="text-xl font-semibold">All applications</h2>
        </div>

        {loading ? (
          <p className="px-5 py-10 text-center text-stone-500" role="status">
            Loading applications…
          </p>
        ) : error && requests.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-stone-500">
            Could not load applications.
          </p>
        ) : requests.length === 0 ? (
          <p className="px-5 py-10 text-center text-stone-500">
            There are no applications yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead className="bg-stone-50 text-xs tracking-wide text-stone-500 uppercase">
                <tr>
                  <th className="px-5 py-3 font-semibold">№</th>
                  <th className="px-5 py-3 font-semibold">Animal</th>
                  <th className="px-5 py-3 font-semibold">Applicant</th>
                  <th className="px-5 py-3 font-semibold">Phone</th>
                  <th className="px-5 py-3 font-semibold">Reason</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {requests.map((request) => (
                  <tr key={request.id} className="align-top">
                    <td className="px-5 py-4 font-medium text-stone-500">
                      {request.id}
                    </td>
                    <td className="px-5 py-4 font-medium">
                      {animalNames.get(request.animal_id) ??
                        `Animal #${request.animal_id}`}
                    </td>
                    <td className="px-5 py-4">{request.person_name}</td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {request.phone}
                    </td>
                    <td className="max-w-56 px-5 py-4 text-stone-600">
                      {request.reason || "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-center text-xs font-semibold ${
                          statusStyles[request.status] ??
                          "bg-stone-100 text-stone-700"
                        }`}
                      >
                        {statusLabels[request.status] ?? request.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(request)}
                          className="rounded-lg border border-stone-300 px-3 py-1.5 font-medium text-stone-700 transition hover:bg-stone-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(request.id)}
                          disabled={deletingId === request.id}
                          className="rounded-lg border border-rose-200 px-3 py-1.5 font-medium text-rose-700 transition hover:bg-rose-50 disabled:opacity-50"
                        >
                          {deletingId === request.id
                            ? "Deleting…"
                            : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default ApplicationsCRUD;
