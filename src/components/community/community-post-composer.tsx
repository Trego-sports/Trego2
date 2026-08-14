import { MessageSquarePlusIcon } from "lucide-react";
import { useState } from "react";
import { textareaClassName } from "@/components/community/community-dialogs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateCommunityPost } from "@/modules/community";

export function CommunityPostComposer() {
  const createPost = useCreateCommunityPost();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const trimmedTitle = title.trim();
  const trimmedBody = body.trim();
  const canPublish = trimmedTitle.length > 0 && trimmedBody.length > 0 && !createPost.isPending;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canPublish) {
      return;
    }

    await createPost.mutateAsync({ title: trimmedTitle, body: trimmedBody });
    setTitle("");
    setBody("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquarePlusIcon className="size-5 text-[#004ac6]" />
          Start a discussion
        </CardTitle>
        <CardDescription>
          Looking for someone to play this week? Share your availability and coordinate a time here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="community-post-title">Title</Label>
            <Input
              id="community-post-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Looking for tennis this week"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="community-post-body">Body</Label>
            <textarea
              id="community-post-body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={5}
              placeholder="I'm free most evenings after 5. Anyone want to hit at PAC?"
              className={textareaClassName}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={!canPublish}>
              Publish post
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
