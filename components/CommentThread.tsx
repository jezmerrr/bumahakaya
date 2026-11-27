"use client";

import { useState, type FormEvent } from "react";
import { relativeTime } from "@/lib/time";
import { useStore } from "@/lib/store";
import { CURRENT_USER } from "@/lib/user";
import { TrashIcon } from "./icons";
import { ConfirmDeleteDialog } from "./Sheet";
import { Avatar } from "./ui";

// Comments for one report plus the "Add a comment" box. Shown inside the
// card when Comments is tapped, and always open on the details page.
export function CommentThread({ reportId }: { reportId: string }) {
  const { comments, addComment, removeComment } = useStore();
  const thread = comments.filter((c) => c.reportId === reportId);
  const [draft, setDraft] = useState("");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  function postComment(e: FormEvent) {
    e.preventDefault();
    addComment(reportId, draft);
    setDraft("");
  }

  return (
    <div>
      {thread.length === 0 ? (
        <p className="text-xs text-navy/40">
          Wala pang comments. Ikaw ang mauna.
        </p>
      ) : (
        <ul className="space-y-2">
          {thread.map((c) => (
            <li key={c.id} className="flex gap-2">
              <Avatar name={c.author} className="h-7 w-7 text-[10px]" />
              <div className="min-w-0 flex-1">
                <p className="text-xs">
                  <span className="font-semibold text-navy">{c.author}</span>
                  <span className="text-navy/40">
                    {" "}
                    · {relativeTime(c.timestamp)}
                  </span>
                </p>
                <p className="text-sm text-navy/70">{c.text}</p>
              </div>
              {c.author === CURRENT_USER.handle ? (
                <button
                  type="button"
                  aria-label="Delete comment"
                  title="Delete comment"
                  onClick={() => setPendingDelete(c.id)}
                  className="grid h-7 w-7 shrink-0 place-items-center self-start rounded-full text-navy/40 hover:bg-impass/10 hover:text-impass"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={postComment} className="mt-3 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          aria-label="Add a comment"
          placeholder="Add a comment…"
          className="min-w-0 flex-1 rounded-full border border-navy/15 bg-white px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-full bg-signal px-4 py-2 text-sm font-semibold text-white"
        >
          Post
        </button>
      </form>

      {pendingDelete ? (
        <ConfirmDeleteDialog
          title="Delete this comment?"
          message="Your comment will be removed from this report."
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => {
            removeComment(pendingDelete);
            setPendingDelete(null);
          }}
        />
      ) : null}
    </div>
  );
}
