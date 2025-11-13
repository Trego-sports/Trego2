import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { gameParticipantsTable, gamesTable, playerSportsTable, usersTable } from "./src/db/tables";
import { generateId } from "./src/lib/id";
import { sign } from "./src/lib/crypto";
import type { SkillLevel } from "./src/modules/sports/sports";

// Get database URL from environment
const databaseUrl = process.env.CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE;
if (!databaseUrl) {
  throw new Error("CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE environment variable is required");
}

// Get session secret from environment
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET environment variable is required");
}

const client = new Pool({ connectionString: databaseUrl });
const db = drizzle(client);

// San Francisco coordinates (main user location)
const SF_LAT = 37.7749;
const SF_LON = -122.4194;

async function seed() {
  console.log("Starting comprehensive seed...");

  // ============================================================================
  // CREATE USERS
  // ============================================================================
  
  // Main user (San Francisco)
  const userId = generateId("user");
  await db.insert(usersTable).values({
    id: userId,
    email: "alex@example.com",
    name: "Alex Thompson",
    location: { lat: SF_LAT, lon: SF_LON },
    profilePictureUrl: null,
  });
  console.log("✅ Created Alex Thompson at San Francisco");

  // Add multiple sports for the main user to test hasSports and recommendations
  await db.insert(playerSportsTable).values([
    {
      userId,
      sport: "Basketball",
      skillLevel: "Intermediate",
      position: "Point Guard",
    },
    {
      userId,
      sport: "Soccer",
      skillLevel: "Advanced",
      position: "Midfielder",
    },
    {
      userId,
      sport: "Tennis",
      skillLevel: "Beginner",
      position: null,
    },
    {
      userId,
      sport: "Pickleball",
      skillLevel: "Intermediate",
      position: null,
    },
  ]);
  console.log("✅ Added 4 sports for Alex Thompson (Basketball, Soccer, Tennis, Pickleball)");

  // Create additional users for friends feature
  const users = [
    {
      id: generateId("user"),
      email: "jane@example.com",
      name: "Jane Smith",
      location: { lat: 37.8044, lon: -122.2712 }, // Oakland
      sports: [
        { sport: "Tennis" as const, skillLevel: "Advanced" as const, position: null },
        { sport: "Volleyball" as const, skillLevel: "Intermediate" as const, position: "Setter" },
        { sport: "Basketball" as const, skillLevel: "Advanced" as const, position: "Forward" },
      ],
    },
    {
      id: generateId("user"),
      email: "mike@example.com",
      name: "Mike Johnson",
      location: { lat: 37.7849, lon: -122.2585 }, // Berkeley
      sports: [
        { sport: "Soccer" as const, skillLevel: "Advanced" as const, position: "Goalkeeper" },
        { sport: "Basketball" as const, skillLevel: "Intermediate" as const, position: "Center" },
        { sport: "Football" as const, skillLevel: "Advanced" as const, position: "Quarterback" },
      ],
    },
    {
      id: generateId("user"),
      email: "sarah@example.com",
      name: "Sarah Chen",
      location: { lat: 37.7849, lon: -122.4094 }, // Mission District, SF
      sports: [
        { sport: "Pickleball" as const, skillLevel: "Advanced" as const, position: null },
        { sport: "Tennis" as const, skillLevel: "Intermediate" as const, position: null },
      ],
    },
    {
      id: generateId("user"),
      email: "alex@example.com",
      name: "Alex Rodriguez",
      location: { lat: 37.7849, lon: -122.4194 }, // Downtown SF
      sports: [
        { sport: "Basketball" as const, skillLevel: "Advanced" as const, position: "Shooting Guard" },
        { sport: "Soccer" as const, skillLevel: "Intermediate" as const, position: "Defender" },
      ],
    },
  ];

  for (const user of users) {
    await db.insert(usersTable).values({
      id: user.id,
      email: user.email,
      name: user.name,
      location: user.location,
      profilePictureUrl: null,
    });
    await db.insert(playerSportsTable).values(
      user.sports.map((s) => ({ userId: user.id, ...s })),
    );
  }
  console.log(`✅ Created ${users.length} additional users with sports`);

  // Extract user IDs with proper type safety for noUncheckedIndexAccess
  const janeId = users[0]!.id;
  const mikeId = users[1]!.id;
  const sarahId = users[2]!.id;
  const alexId = users[3]!.id;

  // ============================================================================
  // CREATE PAST GAMES (for pastGamesBySport feature)
  // ============================================================================
  
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  
  const pastGames = [
    // Basketball games (3 past games)
    {
      title: "Past Basketball Game #1",
      locationName: "Golden Gate Park Courts",
      latitude: 37.7694,
      longitude: -122.4862,
      sport: "Basketball" as const,
      scheduledAt: new Date(now - 30 * oneDayMs), // 30 days ago
      durationMinutes: 90,
      spotsTotal: 10,
      hostId: userId,
      participants: [userId, janeId, alexId], // 3 participants
    },
    {
      title: "Past Basketball Game #2",
      locationName: "Mission Recreation Center",
      latitude: 37.7575,
      longitude: -122.4193,
      sport: "Basketball" as const,
      scheduledAt: new Date(now - 20 * oneDayMs), // 20 days ago
      durationMinutes: 120,
      spotsTotal: 12,
      hostId: janeId,
      participants: [janeId, userId, alexId, mikeId], // 4 participants
    },
    {
      title: "Past Basketball Game #3",
      locationName: "Dolores Park Courts",
      latitude: 37.7599,
      longitude: -122.4269,
      sport: "Basketball" as const,
      scheduledAt: new Date(now - 10 * oneDayMs), // 10 days ago
      durationMinutes: 90,
      spotsTotal: 8,
      hostId: alexId,
      participants: [alexId, userId, janeId], // 3 participants
    },
    // Soccer games (2 past games)
    {
      title: "Past Soccer Match #1",
      locationName: "Crocker Amazon Playground",
      latitude: 37.7134,
      longitude: -122.4491,
      sport: "Soccer" as const,
      scheduledAt: new Date(now - 25 * oneDayMs), // 25 days ago
      durationMinutes: 90,
      spotsTotal: 22,
      hostId: userId,
      participants: [userId, mikeId, alexId], // 3 participants
    },
    {
      title: "Past Soccer Match #2",
      locationName: "Berkeley Marina Fields",
      latitude: 37.8651,
      longitude: -122.3127,
      sport: "Soccer" as const,
      scheduledAt: new Date(now - 15 * oneDayMs), // 15 days ago
      durationMinutes: 90,
      spotsTotal: 22,
      hostId: mikeId,
      participants: [mikeId, userId], // 2 participants
    },
    // Tennis games (2 past games)
    {
      title: "Past Tennis Session #1",
      locationName: "Dolores Park Tennis Courts",
      latitude: 37.7599,
      longitude: -122.4269,
      sport: "Tennis" as const,
      scheduledAt: new Date(now - 18 * oneDayMs), // 18 days ago
      durationMinutes: 60,
      spotsTotal: 4,
      hostId: janeId,
      participants: [janeId, userId, sarahId], // 3 participants
    },
    {
      title: "Past Tennis Session #2",
      locationName: "Golden Gate Park Tennis Center",
      latitude: 37.7694,
      longitude: -122.4862,
      sport: "Tennis" as const,
      scheduledAt: new Date(now - 5 * oneDayMs), // 5 days ago
      durationMinutes: 90,
      spotsTotal: 4,
      hostId: sarahId,
      participants: [sarahId, userId], // 2 participants
    },
    // Pickleball games (1 past game)
    {
      title: "Past Pickleball Tournament",
      locationName: "Mission Bay Courts",
      latitude: 37.7706,
      longitude: -122.3892,
      sport: "Pickleball" as const,
      scheduledAt: new Date(now - 12 * oneDayMs), // 12 days ago
      durationMinutes: 120,
      spotsTotal: 8,
      hostId: sarahId,
      participants: [sarahId, userId], // 2 participants
    },
  ];

  for (const game of pastGames) {
    const gameId = generateId("game");
    await db.insert(gamesTable).values({
      id: gameId,
      sport: game.sport,
      title: game.title,
      locationName: game.locationName,
      location: { lat: game.latitude, lon: game.longitude },
      scheduledAt: game.scheduledAt,
      durationMinutes: game.durationMinutes,
      allowedSkillLevels: ["Beginner", "Intermediate", "Advanced"],
      spotsTotal: game.spotsTotal,
      hostId: game.hostId,
    });
    // Add all participants
    for (const participantId of game.participants) {
      await db.insert(gameParticipantsTable).values({
        gameId,
        userId: participantId,
      });
    }
  }
  console.log(`✅ Created ${pastGames.length} past games across 4 sports (Basketball: 3, Soccer: 2, Tennis: 2, Pickleball: 1)`);

  // ============================================================================
  // CREATE UPCOMING GAMES (games user is participating in)
  // ============================================================================
  
  const upcomingGames = [
    // Games hosted by main user
    {
      title: "Morning Basketball at Golden Gate Park",
      locationName: "Golden Gate Park Basketball Courts",
      latitude: 37.7694,
      longitude: -122.4862,
      sport: "Basketball" as const,
      scheduledAt: new Date(now + 2 * oneDayMs), // 2 days from now
      durationMinutes: 90,
      spotsTotal: 10,
      hostId: userId,
      participants: [userId, janeId, alexId], // 3/10 filled
    },
    {
      title: "Soccer Match in Berkeley",
      locationName: "Berkeley Marina Fields",
      latitude: 37.8651,
      longitude: -122.3127,
      sport: "Soccer" as const,
      scheduledAt: new Date(now + 5 * oneDayMs), // 5 days from now
      durationMinutes: 90,
      spotsTotal: 22,
      hostId: userId,
      participants: [userId, mikeId], // 2/22 filled
    },
    {
      title: "Tennis Practice Session",
      locationName: "Dolores Park Tennis Courts",
      latitude: 37.7599,
      longitude: -122.4269,
      sport: "Tennis" as const,
      scheduledAt: new Date(now + 3 * oneDayMs), // 3 days from now
      durationMinutes: 60,
      spotsTotal: 4,
      hostId: userId,
      participants: [userId, janeId], // 2/4 filled
    },
    {
      title: "Pickleball Doubles Tournament",
      locationName: "Mission Bay Courts",
      latitude: 37.7706,
      longitude: -122.3892,
      sport: "Pickleball" as const,
      scheduledAt: new Date(now + 7 * oneDayMs), // 7 days from now
      durationMinutes: 120,
      spotsTotal: 8,
      hostId: userId,
      participants: [userId, sarahId], // 2/8 filled
    },
    {
      title: "Evening Basketball Pickup",
      locationName: "Lake Merritt Basketball Courts",
      latitude: 37.8044,
      longitude: -122.2712,
      sport: "Basketball" as const,
      scheduledAt: new Date(now + 1 * oneDayMs), // 1 day from now (next game)
      durationMinutes: 90,
      spotsTotal: 10,
      hostId: userId,
      participants: [userId, janeId, alexId, mikeId], // 4/10 filled
    },
    // Games hosted by others that main user joined
    {
      title: "Afternoon Tennis Practice",
      locationName: "Golden Gate Park Tennis Center",
      latitude: 37.7694,
      longitude: -122.4862,
      sport: "Tennis" as const,
      scheduledAt: new Date(now + 4 * oneDayMs), // 4 days from now
      durationMinutes: 90,
      spotsTotal: 4,
      hostId: janeId,
      participants: [janeId, userId, sarahId], // 3/4 filled
    },
    {
      title: "Friendly Soccer Scrimmage",
      locationName: "Crocker Amazon Playground",
      latitude: 37.7134,
      longitude: -122.4491,
      sport: "Soccer" as const,
      scheduledAt: new Date(now + 6 * oneDayMs), // 6 days from now
      durationMinutes: 90,
      spotsTotal: 22,
      hostId: mikeId,
      participants: [mikeId, userId, alexId], // 3/22 filled
    },
    {
      title: "Competitive Basketball Tournament",
      locationName: "Mission Recreation Center",
      latitude: 37.7575,
      longitude: -122.4193,
      sport: "Basketball" as const,
      scheduledAt: new Date(now + 8 * oneDayMs), // 8 days from now
      durationMinutes: 120,
      spotsTotal: 12,
      hostId: alexId,
      participants: [alexId, userId, janeId, mikeId], // 4/12 filled
    },
  ];

  for (const game of upcomingGames) {
    const gameId = generateId("game");
    await db.insert(gamesTable).values({
      id: gameId,
      sport: game.sport,
      title: game.title,
      locationName: game.locationName,
      location: { lat: game.latitude, lon: game.longitude },
      scheduledAt: game.scheduledAt,
      durationMinutes: game.durationMinutes,
      allowedSkillLevels: ["Beginner", "Intermediate", "Advanced"],
      spotsTotal: game.spotsTotal,
      hostId: game.hostId,
    });
    // Add all participants
    for (const participantId of game.participants) {
      await db.insert(gameParticipantsTable).values({
        gameId,
        userId: participantId,
      });
    }
  }
  console.log(`✅ Created ${upcomingGames.length} upcoming games (5 hosted by Alex Thompson, 3 joined)`);

  // ============================================================================
  // CREATE RECOMMENDED GAMES (games user hasn't joined yet)
  // ============================================================================
  
  const recommendedGames = [
    // Games matching user's sports
    {
      title: "Weekend Volleyball at the Beach",
      locationName: "Ocean Beach Volleyball Courts",
      latitude: 37.7595,
      longitude: -122.5107,
      sport: "Volleyball" as const,
      scheduledAt: new Date(now + 3 * oneDayMs),
      durationMinutes: 120,
      spotsTotal: 12,
      hostId: janeId,
      participants: [janeId, sarahId], // 2/12 filled - user not participating
    },
    {
      title: "Basketball Skills Clinic",
      locationName: "Embarcadero Courts",
      latitude: 37.7955,
      longitude: -122.3953,
      sport: "Basketball" as const,
      scheduledAt: new Date(now + 5 * oneDayMs),
      durationMinutes: 90,
      spotsTotal: 10,
      hostId: alexId,
      participants: [alexId, mikeId], // 2/10 filled - user not participating
    },
    {
      title: "Soccer Training Session",
      locationName: "Presidio Fields",
      latitude: 37.7989,
      longitude: -122.4662,
      sport: "Soccer" as const,
      scheduledAt: new Date(now + 4 * oneDayMs),
      durationMinutes: 90,
      spotsTotal: 22,
      hostId: mikeId,
      participants: [mikeId, alexId], // 2/22 filled - user not participating
    },
    {
      title: "Pickleball Social Hour",
      locationName: "Marina Green Courts",
      latitude: 37.8024,
      longitude: -122.4428,
      sport: "Pickleball" as const,
      scheduledAt: new Date(now + 6 * oneDayMs),
      durationMinutes: 90,
      spotsTotal: 8,
      hostId: sarahId,
      participants: [sarahId], // 1/8 filled - user not participating
    },
    // Games NOT matching user's sports (to test variety)
    {
      title: "Ultimate Frisbee Pickup",
      locationName: "Crissy Field",
      latitude: 37.8024,
      longitude: -122.4428,
      sport: "Ultimate Frisbee" as const,
      scheduledAt: new Date(now + 7 * oneDayMs),
      durationMinutes: 90,
      spotsTotal: 14,
      hostId: mikeId,
      participants: [mikeId, alexId], // 2/14 filled - user not participating
    },
    {
      title: "Football Scrimmage",
      locationName: "Kezar Stadium",
      latitude: 37.7647,
      longitude: -122.4568,
      sport: "Football" as const,
      scheduledAt: new Date(now + 9 * oneDayMs),
      durationMinutes: 120,
      spotsTotal: 22,
      hostId: mikeId,
      participants: [mikeId], // 1/22 filled - user not participating
    },
    // Games with different skill levels
    {
      title: "Beginner Tennis Lessons",
      locationName: "Golden Gate Park Tennis Center",
      latitude: 37.7694,
      longitude: -122.4862,
      sport: "Tennis" as const,
      scheduledAt: new Date(now + 2 * oneDayMs),
      durationMinutes: 60,
      spotsTotal: 6,
      allowedSkillLevels: ["Beginner"],
      hostId: sarahId,
      participants: [sarahId], // 1/6 filled - user not participating
    },
    {
      title: "Advanced Basketball League",
      locationName: "Mission Bay Courts",
      latitude: 37.7706,
      longitude: -122.3892,
      sport: "Basketball" as const,
      scheduledAt: new Date(now + 10 * oneDayMs),
      durationMinutes: 90,
      spotsTotal: 10,
      allowedSkillLevels: ["Advanced"],
      hostId: janeId,
      participants: [janeId, alexId], // 2/10 filled - user not participating
    },
  ];

  for (const game of recommendedGames) {
    const gameId = generateId("game");
    await db.insert(gamesTable).values({
      id: gameId,
      sport: game.sport,
      title: game.title,
      locationName: game.locationName,
      location: { lat: game.latitude, lon: game.longitude },
      scheduledAt: game.scheduledAt,
      durationMinutes: game.durationMinutes,
      allowedSkillLevels: (game.allowedSkillLevels || ["Beginner", "Intermediate", "Advanced"]) as SkillLevel[],
      spotsTotal: game.spotsTotal,
      hostId: game.hostId,
    });
    // Add participants (but NOT the main user)
    for (const participantId of game.participants) {
      await db.insert(gameParticipantsTable).values({
        gameId,
        userId: participantId,
      });
    }
  }
  console.log(`✅ Created ${recommendedGames.length} recommended games (user hasn't joined)`);

  // ============================================================================
  // GENERATE SESSION COOKIE
  // ============================================================================
  
  const signedSession = await sign(userId, sessionSecret);

  // ============================================================================
  // SUMMARY
  // ============================================================================
  
  console.log("\n" + "=".repeat(70));
  console.log("✅ COMPREHENSIVE SEED COMPLETED SUCCESSFULLY!");
  console.log("=".repeat(70));
  
  console.log("\n👤 Users Created:");
  console.log(`  1. Alex Thompson (alex@example.com)`);
  console.log(`     ID: ${userId}`);
  console.log(`     Location: San Francisco (${SF_LAT}, ${SF_LON})`);
  console.log(`     Sports: Basketball, Soccer, Tennis, Pickleball`);
  console.log(`  2. Jane Smith (jane@example.com)`);
  console.log(`     ID: ${janeId}`);
  console.log(`     Sports: Tennis, Volleyball, Basketball`);
  console.log(`  3. Mike Johnson (mike@example.com)`);
  console.log(`     ID: ${mikeId}`);
  console.log(`     Sports: Soccer, Basketball, Football`);
  console.log(`  4. Sarah Chen (sarah@example.com)`);
  console.log(`     ID: ${sarahId}`);
  console.log(`     Sports: Pickleball, Tennis`);
  console.log(`  5. Alex Rodriguez (alex@example.com)`);
  console.log(`     ID: ${alexId}`);
  console.log(`     Sports: Basketball, Soccer`);
  
  console.log("\n📊 Dashboard Data Summary:");
  console.log(`  ✅ hasSports: true (4 sports configured)`);
  console.log(`  ✅ upcomingGames: ${upcomingGames.length} games`);
  console.log(`     - 5 hosted by Alex Thompson`);
  console.log(`     - 3 joined (hosted by others)`);
  console.log(`     - Next game: "${upcomingGames[4]!.title}" (1 day away)`);
  console.log(`  ✅ recommendedGames: ${recommendedGames.length} games`);
  console.log(`     - Mix of sports matching and not matching user's interests`);
  console.log(`     - Various skill levels and distances`);
  console.log(`  ✅ pastGamesBySport:`);
  console.log(`     - Basketball: 3 games`);
  console.log(`     - Soccer: 2 games`);
  console.log(`     - Tennis: 2 games`);
  console.log(`     - Pickleball: 1 game`);
  console.log(`  ✅ friends: 4 friends (ordered by games together)`);
  console.log(`     - Jane Smith: ${pastGames.filter(g => g.participants.includes(janeId) && g.participants.includes(userId)).length + upcomingGames.filter(g => g.participants.includes(janeId) && g.participants.includes(userId)).length} games together`);
  console.log(`     - Alex Rodriguez: ${pastGames.filter(g => g.participants.includes(alexId) && g.participants.includes(userId)).length + upcomingGames.filter(g => g.participants.includes(alexId) && g.participants.includes(userId)).length} games together`);
  console.log(`     - Mike Johnson: ${pastGames.filter(g => g.participants.includes(mikeId) && g.participants.includes(userId)).length + upcomingGames.filter(g => g.participants.includes(mikeId) && g.participants.includes(userId)).length} games together`);
  console.log(`     - Sarah Chen: ${pastGames.filter(g => g.participants.includes(sarahId) && g.participants.includes(userId)).length + upcomingGames.filter(g => g.participants.includes(sarahId) && g.participants.includes(userId)).length} games together`);
  
  console.log("\n🍪 Signed Session Cookie for Alex Thompson:");
  console.log("  Name: session");
  console.log("  Value: " + signedSession);
  
  console.log("\n💡 To manually set the session cookie:");
  console.log("  1. Open your browser's DevTools (F12)");
  console.log("  2. Go to Application/Storage > Cookies");
  console.log("  3. Add a cookie with name 'session' and the value above");
  console.log("  4. Refresh the page - you'll be logged in as Alex Thompson!");
  
  console.log("\n🎯 Dashboard Features Tested:");
  console.log("  ✓ hasSports check (user has 4 sports)");
  console.log("  ✓ Upcoming games (8 total: 5 hosted, 3 joined)");
  console.log("  ✓ Next game card (shows closest upcoming game)");
  console.log("  ✓ Recommended games (8 games user can join)");
  console.log("  ✓ Past games by sport (4 sports with different counts)");
  console.log("  ✓ Friends list (4 friends ordered by games together)");
  console.log("  ✓ Distance calculations (various distances from SF)");
  console.log("  ✓ Spots filled/total display (various fill levels)");
  console.log("  ✓ Different game durations (60, 90, 120 minutes)");
  console.log("  ✓ Different skill levels (Beginner, Intermediate, Advanced)");
  
  await client.end();
}

seed().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});
