import { redirect } from "next/navigation";
import { checkAdminAuth } from "@/lib/auth/admin";
import ModerationActions from "@/components/admin/ModerationActions";

export default async function AdminForumModerationPage() {
  const auth = await checkAdminAuth();
  if (!auth.ok) {
    redirect(auth.reason === "unauthenticated" ? "/login" : "/");
  }
  const supabase = auth.supabase;

  const [{ data: pendingPosts }, { data: pendingReplies }] = await Promise.all([
    supabase
      .from("forum_posts")
      .select("id, title, status, created_at, guest_name")
      .in("status", ["pending", "flagged"])
      .order("created_at", { ascending: true }),
    supabase
      .from("forum_replies")
      .select("id, content, status, created_at, guest_name, forum_posts(title)")
      .in("status", ["pending", "flagged"])
      .order("created_at", { ascending: true }),
  ]);

  const totalPending = (pendingPosts?.length ?? 0) + (pendingReplies?.length ?? 0);

  return (
    <div className="rounded-card bg-white p-6 shadow-sm">
      <h1 className="text-xl font-bold">Forum Moderation</h1>
      <p className="mt-1 text-sm text-charcoal/60">Review posts and replies awaiting moderation.</p>

      {totalPending === 0 && (
        <p className="mt-5 text-sm text-charcoal/60">No forum content awaiting moderation.</p>
      )}

      {(pendingPosts ?? []).length > 0 && (
        <section className="mt-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-charcoal/50">Posts</h2>
          <div className="mt-2 space-y-3">
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
        </section>
      )}

      {(pendingReplies ?? []).length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-charcoal/50">Replies</h2>
          <div className="mt-2 space-y-3">
            {(pendingReplies ?? []).map((reply) => {
              const parent = reply.forum_posts as unknown as { title: string } | null;
              return (
                <div key={reply.id} className="rounded-lg border border-black/5 p-4">
                  <p className="text-xs font-semibold text-charcoal/50">
                    Reply to: {parent?.title ?? "Forum thread"}
                  </p>
                  <p className="mt-1 text-sm">{reply.content}</p>
                  <p className="mt-1 text-xs text-charcoal/50">
                    by {reply.guest_name ?? "user"} · status: {reply.status}
                  </p>
                  <ModerationActions table="forum_replies" id={reply.id} />
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
