import { redirect } from "next/navigation";
import { checkAdminAuth } from "@/lib/auth/admin";

export default async function AdminCategoriesPage() {
  const auth = await checkAdminAuth();
  if (!auth.ok) {
    redirect(auth.reason === "unauthenticated" ? "/login" : "/");
  }
  const supabase = auth.supabase;
  const { data: categories } = await supabase.from("categories").select("*").order("name");

  return (
    <div className="rounded-card bg-white p-6 shadow-sm">
      <h1 className="text-xl font-bold">Categories</h1>
      <table className="mt-4 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-black/10 text-xs uppercase text-charcoal/40">
            <th className="py-2">Name</th>
            <th>Slug</th>
            <th>Active</th>
          </tr>
        </thead>
        <tbody>
          {(categories ?? []).map((c) => (
            <tr key={c.id} className="border-b border-black/5">
              <td className="py-2 font-medium">{c.name}</td>
              <td className="text-charcoal/60">{c.slug}</td>
              <td>{c.is_active ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
