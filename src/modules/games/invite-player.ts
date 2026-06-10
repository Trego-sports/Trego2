import { createServerFn } from "@tanstack/react-start";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { gameParticipantsTable, gamesTable, usersTable } from "@/db/tables";
import { authMiddleware } from "@/lib/middleware/auth";
import { dbMiddleware } from "@/lib/middleware/db";
import { createNotification } from "@/modules/notifications";

export const INVITE_USER_NOT_FOUND_ERROR = "USER_NOT_FOUND";

export const invitePlayerSchema = z
  .object({
    gameId: z.string(),
    userId: z.string().optional(),
    email: z.string().trim().email().optional(),
  })
  .refine((data) => data.userId || data.email, {
    message: "Either userId or email is required",
  })
  .refine((data) => !(data.userId && data.email), {
    message: "Provide either userId or email, not both",
  });
export type InvitePlayerInput = z.input<typeof invitePlayerSchema>;

export const $invitePlayer = createServerFn({ method: "POST" })
  .middleware([authMiddleware, dbMiddleware])
  .inputValidator(invitePlayerSchema)
  .handler(async ({ context, data }) => {
    await context.db.transaction(async (tx) => {
      const [game] = await tx
        .select({
          id: gamesTable.id,
          hostId: gamesTable.hostId,
          sport: gamesTable.sport,
          title: gamesTable.title,
          locationName: gamesTable.locationName,
          scheduledAt: gamesTable.scheduledAt,
          spotsTotal: gamesTable.spotsTotal,
          participantCount: sql<number>`COUNT(${gameParticipantsTable.userId})::int`,
        })
        .from(gamesTable)
        .leftJoin(gameParticipantsTable, eq(gamesTable.id, gameParticipantsTable.gameId))
        .where(eq(gamesTable.id, data.gameId))
        .groupBy(gamesTable.id)
        .limit(1);

      if (!game) {
        throw new Error("Game not found");
      }

      if (game.hostId !== context.userId) {
        throw new Error("Only the game host can invite players.");
      }

      if (game.participantCount >= game.spotsTotal) {
        throw new Error("This game is full");
      }

      let targetUserId = data.userId;

      if (data.email) {
        const [userByEmail] = await tx
          .select({ id: usersTable.id })
          .from(usersTable)
          .where(eq(sql`lower(${usersTable.email})`, data.email.toLowerCase()))
          .limit(1);

        if (!userByEmail) {
          throw new Error(INVITE_USER_NOT_FOUND_ERROR);
        }

        targetUserId = userByEmail.id;
      } else {
        if (!data.userId) {
          throw new Error("Player not found");
        }

        const [user] = await tx
          .select({ id: usersTable.id })
          .from(usersTable)
          .where(eq(usersTable.id, data.userId))
          .limit(1);

        if (!user) {
          throw new Error("Player not found");
        }
      }

      if (!targetUserId) {
        throw new Error("Player not found");
      }

      const invitedUserId = targetUserId;

      if (invitedUserId === context.userId) {
        throw new Error("You cannot invite yourself to your own game.");
      }

      const [existingParticipant] = await tx
        .select({ userId: gameParticipantsTable.userId })
        .from(gameParticipantsTable)
        .where(and(eq(gameParticipantsTable.gameId, data.gameId), eq(gameParticipantsTable.userId, invitedUserId)))
        .limit(1);

      if (existingParticipant) {
        throw new Error("This player is already in the game.");
      }

      await tx.insert(gameParticipantsTable).values({
        gameId: data.gameId,
        userId: invitedUserId,
        joinedViaInvite: true,
        invitedBy: context.userId,
        invitedAt: new Date(),
      });

      await createNotification(tx, {
        recipientUserId: invitedUserId,
        actorUserId: context.userId,
        gameId: data.gameId,
        type: "game_joined",
        title: "You were added to a game",
        body: `The host added you to "${game.title}".`,
        metadata: {
          gameTitle: game.title,
          sport: game.sport,
          locationName: game.locationName,
          scheduledAt: game.scheduledAt.toISOString(),
          joinedViaInvite: true,
        },
      });
    });
  });
