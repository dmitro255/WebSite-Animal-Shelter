import { NavLink, Outlet } from "react-router-dom";

const linkClass = ({ isActive }) =>
  `rounded-lg border px-3 py-1.5 no-underline ${
    isActive
      ? "border-stone-900 bg-stone-900 text-white"
      : "border-gray-200 bg-white text-stone-900"
  }`;

export default function Layout() {
  return (
    <main className="mx-auto max-w-[1080px] px-5 pt-7 pb-14">
      <nav className="mb-4 flex flex-wrap gap-2">
        <NavLink to="/" end className={linkClass}>
          Dashboard
        </NavLink>
        <NavLink to="/animal" className={linkClass}>
          Animamls
        </NavLink>
        <NavLink to="/adoption" className={linkClass}>
          Adoption
        </NavLink>
      </nav>

      <Outlet />
    </main>
  );
}
