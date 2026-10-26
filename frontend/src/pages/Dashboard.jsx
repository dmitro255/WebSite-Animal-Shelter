import { useEffect, useState } from "react";
import { api } from "../api.js";

const animalStatuses = [
  ["available", "Available", "Ready to meet a new family"],
  ["reserved", "Reserved", "There are active applications"],
  ["adopted", "Adopted", "They have found a new home"],
];

const adoptionStatuses = [
  ["pending", "Pending", "Waiting for staff review"],
  ["approved", "Approved", "Successfully approved applications"],
  ["rejected", "Rejected", "Applications with a final decision"],
];

function Dashboard() {
  const [animals, setAnimals] = useState([]);
  const [adoptions, setAdoptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [animalResult, adoptionResult] = await Promise.all([
          api("GET", "/animals"),
          api("GET", "/adoptions"),
        ]);
        setAnimals(animalResult.data);
        setAdoptions(adoptionResult.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard data.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div
        className="flex min-h-[210px] items-center justify-center gap-3 text-stone-500"
        role="status"
      >
        <span
          className="size-[22px] animate-spin rounded-full border-[3px] border-stone-200 border-t-[#718264]"
          aria-hidden="true"
        />
        Loading shelter overview…
      </div>
    );
  }

  return (
    <div className="py-3 pb-7 text-[#292b25]">
      <header className="mb-[34px] flex min-h-[184px] items-end justify-between gap-6 overflow-hidden rounded-3xl border border-[#eae9dc] bg-[radial-gradient(ellipse_at_90%_10%,_rgb(255_255_255/70%),_transparent_36%),linear-gradient(120deg,_#f2f2e9,_#f8f5eb_58%,_#f5eee2)] p-[30px_34px] max-[700px]:flex-col max-[700px]:items-start max-[700px]:p-6">
        <div>
          <p className="mb-2.5 text-[0.72rem] font-extrabold tracking-[0.16em] text-[#78806a]">
            SHELTER OVERVIEW
          </p>
          <h1 className="m-0 text-[clamp(1.8rem,4vw,2.5rem)] leading-[1.1] font-bold tracking-[-0.045em]">
            Dashboard
          </h1>
          <p className="mt-3 text-[0.98rem] text-[#77796f]">
            An overview of the animals and adoption applications.
          </p>
        </div>
        <div
          className="flex shrink-0 gap-2.5 max-[700px]:w-full"
          aria-label="Total records"
        >
          <div className="flex min-w-[94px] flex-col items-center justify-center rounded-2xl border border-white/90 bg-white/75 px-4 py-3 max-[700px]:flex-1">
            <span className="text-[1.65rem] leading-none font-bold tracking-[-0.04em]">
              {animals.length}
            </span>
            <small className="mt-[7px] text-xs text-[#77796f]">animals</small>
          </div>
          <div className="flex min-w-[94px] flex-col items-center justify-center rounded-2xl border border-white/90 bg-white/75 px-4 py-3 max-[700px]:flex-1">
            <span className="text-[1.65rem] leading-none font-bold tracking-[-0.04em]">
              {adoptions.length}
            </span>
            <small className="mt-[7px] text-xs text-[#77796f]">applications</small>
          </div>
        </div>
      </header>

      {error && (
        <div
          className="-mt-4 mb-6 flex flex-col gap-1 rounded-[14px] border border-[#f0d0cb] bg-[#fff3f1] px-4 py-[13px] text-[#7b3933]"
          role="alert"
        >
          <strong>Could not load the dashboard.</strong>
          <span className="text-[0.9rem]">{error}</span>
        </div>
      )}

      <section className="mt-[30px]" aria-labelledby="animals-heading">
        <div className="mb-4 flex items-center gap-[13px]">
          <div
            className="flex size-11 items-center justify-center rounded-[13px] bg-[#e8f0e5] text-[1.35rem] font-bold text-[#52754a]"
            aria-hidden="true"
          >
            ♡
          </div>
          <div>
            <h2 id="animals-heading" className="m-0 text-[1.22rem] font-semibold tracking-[-0.025em]">
              Animals
            </h2>
            <p className="mt-[3px] text-[0.84rem] text-[#77796f]">
              Animals by status
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-[14px] max-[700px]:grid-cols-2 max-[440px]:grid-cols-1">
          {animalStatuses.map(([status, label, description]) => {
            const count = animals.filter(
              (animal) => animal.status === status,
            ).length;
            
            const dotColor = {
              available: "bg-[#5c9564]",
              reserved: "bg-[#d29445]",
              adopted: "bg-[#6489b5]",
            }[status];

            return (
              <article
                className="min-h-[153px] rounded-[18px] border border-[#e9e9e2] bg-white px-5 pt-[19px] pb-[17px] transition duration-150 hover:-translate-y-0.5 hover:border-[#d9d9ce] hover:shadow-[0_10px_26px_rgb(41_43_37/7%)] max-[440px]:min-h-[136px] motion-reduce:transition-none"
                key={status}
              >
                <div className="flex items-center gap-[9px]">
                  <span className={`size-[9px] rounded-full ${dotColor}`} aria-hidden="true" />
                  <span className="text-[0.9rem] font-semibold text-[#56584f]">{label}</span>
                </div>
                <strong className="mt-[17px] block text-4xl leading-none font-bold tracking-[-0.06em]">
                  {count}
                </strong>
                <p className="mt-[7px] text-[0.8rem] leading-[1.4] text-[#77796f]">
                  {description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section
        className="mt-[30px]"
        aria-labelledby="adoptions-heading"
      >
        <div className="mb-4 flex items-center gap-[13px]">
          <div
            className="flex size-11 items-center justify-center rounded-[13px] bg-[#f8eadf] text-[1.35rem] font-bold text-[#a2683f]"
            aria-hidden="true"
          >
            +
          </div>
          <div>
            <h2 id="adoptions-heading" className="m-0 text-[1.22rem] font-semibold tracking-[-0.025em]">
              Applications
            </h2>
            <p className="mt-[3px] text-[0.84rem] text-[#77796f]">
              Applications by status
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-[14px] max-[700px]:grid-cols-2 max-[440px]:grid-cols-1">
          {adoptionStatuses.map(([status, label, description]) => {
            const count = adoptions.filter(
              (adoption) => adoption.status === status,
            ).length;
            const dotColor = {
              pending: "bg-[#d29445]",
              approved: "bg-[#6489b5]",
              rejected: "bg-[#bd6d66]",
            }[status];

            return (
              <article
                className="min-h-[153px] rounded-[18px] border border-[#e9e9e2] bg-white px-5 pt-[19px] pb-[17px] transition duration-150 hover:-translate-y-0.5 hover:border-[#d9d9ce] hover:shadow-[0_10px_26px_rgb(41_43_37/7%)] max-[440px]:min-h-[136px] motion-reduce:transition-none"
                key={status}
              >
                <div className="flex items-center gap-[9px]">
                  <span className={`size-[9px] rounded-full ${dotColor}`} aria-hidden="true" />
                  <span className="text-[0.9rem] font-semibold text-[#56584f]">{label}</span>
                </div>
                <strong className="mt-[17px] block text-4xl leading-none font-bold tracking-[-0.06em]">
                  {count}
                </strong>
                <p className="mt-[7px] text-[0.8rem] leading-[1.4] text-[#77796f]">
                  {description}
                </p>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
