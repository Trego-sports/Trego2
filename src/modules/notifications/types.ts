import type { NotificationMetadata, NotificationType } from "@/db/tables";

export type { NotificationMetadata };

export interface CreateNotificationInput {
  recipientUserId: string;
  type: NotificationType;
  title: string;
  body: string;
  actorUserId?: string | null;
  gameId?: string | null;
  metadata?: NotificationMetadata | null;
}
