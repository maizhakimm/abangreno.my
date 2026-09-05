import { createClient } from "@/lib/supabase/server";
import ModerationActions from "@/components/admin/ModerationActions";

export default async function AdminForumModerationPage() {
  const supabase = await createClient();
  const { data: pendingPosts } = await supabase
    .from("forum_posts")
    .select("id, title, status, created_at, guest_name")
    .in("status", ["pending", "flagged"])
    .order("created_at", { ascending: true });

  return (
    <div className="rounded-card bg-white p-6 shadow-sm">
      <h1 className="text-xl font-bold">Forum Moderation</h1>
      <div className="mt-5 space-y-3">
        {(pendingPosts ?? []).length === 0 && (
          <p className="text-sm text-charcoal/60">No posts awaiting moderation.</p>
        )}
        {(pendingPosts ?? []).map((post) => (
          <div key={post.id} className="rounded-lg border border-black/5 p-4">
            <p className="font-semibold">{post.title}</p>
            <p className="text-xs text-charcoal/50">
              by {post.guest_name ?? "user"} · status: {post.status}
            </p>
            <ModerationActions table="forum_posts" id={post.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
