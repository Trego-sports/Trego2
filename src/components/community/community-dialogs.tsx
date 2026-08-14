import { PencilIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const textareaClassName = cn(
  "flex min-h-24 w-full resize-y rounded-lg border border-[#c3c6d7] bg-white px-3 py-2 text-base text-[#0b1c30] shadow-sm outline-none transition-[color,box-shadow,border-color] placeholder:text-[#8a93a8] md:text-sm",
  "focus-visible:border-[#004ac6] focus-visible:ring-2 focus-visible:ring-[#004ac6]/20",
);

interface CommunityOwnActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  disabled?: boolean;
}

export function CommunityOwnActions({ onEdit, onDelete, disabled }: CommunityOwnActionsProps) {
  return (
    <div className="flex items-center gap-1">
      <Button size="sm" variant="ghost" className="h-8 px-2" onClick={onEdit} disabled={disabled}>
        <PencilIcon />
        Edit
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="h-8 px-2 text-[#b91c1c] hover:bg-[#fef2f2] hover:text-[#991b1b]"
        onClick={onDelete}
        disabled={disabled}
      >
        <Trash2Icon />
        Delete
      </Button>
    </div>
  );
}

interface CommunityEditPostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  body: string;
  isPending: boolean;
  onSave: (data: { title: string; body: string }) => Promise<void>;
}

export function CommunityEditPostDialog({
  open,
  onOpenChange,
  title,
  body,
  isPending,
  onSave,
}: CommunityEditPostDialogProps) {
  const [nextTitle, setNextTitle] = useState(title);
  const [nextBody, setNextBody] = useState(body);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          setNextTitle(title);
          setNextBody(body);
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit post</DialogTitle>
          <DialogDescription>Update the title and body of your discussion.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-post-title">Title</Label>
            <Input id="edit-post-title" value={nextTitle} onChange={(event) => setNextTitle(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-post-body">Body</Label>
            <textarea
              id="edit-post-body"
              value={nextBody}
              onChange={(event) => setNextBody(event.target.value)}
              rows={6}
              className={textareaClassName}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button
            disabled={isPending || nextTitle.trim().length === 0 || nextBody.trim().length === 0}
            onClick={async () => {
              await onSave({ title: nextTitle.trim(), body: nextBody.trim() });
              onOpenChange(false);
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface CommunityEditCommentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  body: string;
  isPending: boolean;
  onSave: (body: string) => Promise<void>;
}

export function CommunityEditCommentDialog({
  open,
  onOpenChange,
  body,
  isPending,
  onSave,
}: CommunityEditCommentDialogProps) {
  const [nextBody, setNextBody] = useState(body);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          setNextBody(body);
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit comment</DialogTitle>
          <DialogDescription>Update your comment. Replies will stay in place.</DialogDescription>
        </DialogHeader>
        <textarea
          value={nextBody}
          onChange={(event) => setNextBody(event.target.value)}
          rows={5}
          className={textareaClassName}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button
            disabled={isPending || nextBody.trim().length === 0}
            onClick={async () => {
              await onSave(nextBody.trim());
              onOpenChange(false);
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface CommunityDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  isPending: boolean;
  onConfirm: () => Promise<void>;
}

export function CommunityDeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  isPending,
  onConfirm,
}: CommunityDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={async () => {
              await onConfirm();
              onOpenChange(false);
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { textareaClassName };
