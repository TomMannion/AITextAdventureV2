-- AlterTable
ALTER TABLE "GameCharacter" ADD COLUMN     "aliases" TEXT[],
ADD COLUMN     "canonicalId" VARCHAR(100),
ADD COLUMN     "lastMentionedAt" INTEGER,
ADD COLUMN     "originalCharacterId" INTEGER,
ADD COLUMN     "stateHistory" JSONB,
ALTER COLUMN "relationship" SET DEFAULT 'NEUTRAL';

-- AlterTable
ALTER TABLE "GameItem" ADD COLUMN     "canonicalId" VARCHAR(100),
ADD COLUMN     "currentState" VARCHAR(50) NOT NULL DEFAULT 'default',
ADD COLUMN     "lastMentionedAt" INTEGER,
ADD COLUMN     "stateHistory" JSONB;

-- CreateTable
CREATE TABLE "EntityMention" (
    "id" SERIAL NOT NULL,
    "entityType" VARCHAR(20) NOT NULL,
    "entityId" INTEGER NOT NULL,
    "segmentId" INTEGER NOT NULL,
    "mentionCount" INTEGER NOT NULL DEFAULT 1,
    "context" TEXT,
    "stateChange" BOOLEAN NOT NULL DEFAULT false,
    "newState" VARCHAR(50),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EntityMention_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EntityMention" ADD CONSTRAINT "EntityMention_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "StorySegment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameCharacter" ADD CONSTRAINT "GameCharacter_originalCharacterId_fkey" FOREIGN KEY ("originalCharacterId") REFERENCES "GameCharacter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
