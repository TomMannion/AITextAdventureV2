-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "NarrativeStage" AS ENUM ('INTRODUCTION', 'RISING_ACTION', 'CLIMAX', 'FALLING_ACTION', 'RESOLUTION');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "Character" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "traits" TEXT[],
    "bio" TEXT NOT NULL,
    "gender" VARCHAR(20),
    "image" VARCHAR(255),
    "achievements" JSONB,
    "persistentMemories" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "genre" VARCHAR(50) NOT NULL,
    "status" "GameStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastPlayedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "turnCount" INTEGER NOT NULL DEFAULT 0,
    "narrativeStage" "NarrativeStage" NOT NULL DEFAULT 'INTRODUCTION',
    "minTurns" INTEGER NOT NULL DEFAULT 7,
    "softMaxTurns" INTEGER NOT NULL DEFAULT 18,
    "hardMaxTurns" INTEGER NOT NULL DEFAULT 25,
    "summary" TEXT,
    "endingSummary" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "characterId" INTEGER,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StorySegment" (
    "id" SERIAL NOT NULL,
    "sequenceNumber" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "userChoice" TEXT,
    "summary" TEXT,
    "locationContext" VARCHAR(100),
    "importance" INTEGER NOT NULL DEFAULT 1,
    "vectorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "gameId" INTEGER NOT NULL,

    CONSTRAINT "StorySegment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Option" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "risk" "RiskLevel" NOT NULL DEFAULT 'MEDIUM',
    "wasChosen" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "storySegmentId" INTEGER NOT NULL,

    CONSTRAINT "Option_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameItem" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "acquiredAt" INTEGER NOT NULL,
    "lostAt" INTEGER,
    "properties" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "gameId" INTEGER NOT NULL,

    CONSTRAINT "GameItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameCharacter" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "relationship" VARCHAR(50) NOT NULL DEFAULT 'neutral',
    "firstAppearedAt" INTEGER NOT NULL,
    "lastAppearedAt" INTEGER,
    "importance" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "gameId" INTEGER NOT NULL,

    CONSTRAINT "GameCharacter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContextConfig" (
    "id" SERIAL NOT NULL,
    "maxSegments" INTEGER NOT NULL DEFAULT 5,
    "includeItems" BOOLEAN NOT NULL DEFAULT true,
    "includeCharacters" BOOLEAN NOT NULL DEFAULT true,
    "maxItems" INTEGER NOT NULL DEFAULT 10,
    "maxCharacters" INTEGER NOT NULL DEFAULT 5,
    "useVectorSearch" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "ContextConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContextConfig_userId_key" ON "ContextConfig"("userId");

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorySegment" ADD CONSTRAINT "StorySegment_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Option" ADD CONSTRAINT "Option_storySegmentId_fkey" FOREIGN KEY ("storySegmentId") REFERENCES "StorySegment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameItem" ADD CONSTRAINT "GameItem_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameCharacter" ADD CONSTRAINT "GameCharacter_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContextConfig" ADD CONSTRAINT "ContextConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
