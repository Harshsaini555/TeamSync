"use client";

import React, { useState } from "react";
import { useTaskComments } from "@/hooks/use-tasks";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send, User } from "lucide-react";

interface TaskCommentSectionProps {
  taskId: string;
}

export const TaskCommentSection: React.FC<TaskCommentSectionProps> = ({ taskId }) => {
  const { comments, isLoading, addComment, isAddingComment } = useTaskComments(taskId);
  const [content, setContent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await addComment(content);
      setContent("");
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
        <MessageSquare className="h-4 w-4 text-blue-400" />
        <span>Comments ({comments.length})</span>
      </div>

      {/* Add Comment Box */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          rows={3}
          placeholder="Leave a comment or updates..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full rounded-md border border-slate-700/80 bg-slate-900/90 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
        />
        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="sm" isLoading={isAddingComment} disabled={!content.trim()}>
            Comment <Send className="ml-1.5 h-3 w-3" />
          </Button>
        </div>
      </form>

      {/* Comment List */}
      {isLoading ? (
        <div className="py-4 text-center text-xs text-slate-500">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="py-4 text-center text-xs text-slate-500 italic">No comments yet.</div>
      ) : (
        <div className="space-y-3 pt-2">
          {comments.map((comment) => (
            <div key={comment._id} className="p-3 rounded-md bg-slate-900/60 border border-slate-800/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-5 w-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-300 font-bold border border-slate-700">
                    {comment.authorId?.name ? comment.authorId.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className="text-xs font-semibold text-slate-200">{comment.authorId?.name}</span>
                </div>
                <span className="text-[10px] text-slate-500">
                  {new Date(comment.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </span>
              </div>
              <p className="text-xs text-slate-300 whitespace-pre-wrap pl-7">{comment.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
