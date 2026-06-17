import Navbar from "./Navbar";

export default function PageWrapper({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="overflow-hidden rounded-[28px] bg-white shadow-2xl ring-1 ring-slate-200">
          <Navbar />
          <main className="px-5 py-8 md:px-10 md:py-10">{children}</main>
        </div>
      </div>
    </div>
  );
}