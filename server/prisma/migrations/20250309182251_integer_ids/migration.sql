/*
  Warnings:

  - The primary key for the `ContextConfig` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `ContextConfig` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Game` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Game` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Option` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Option` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `StorySegment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `SegmentTitle` on the `StorySegment` table. All the data in the column will be lost.
  - The `id` column on the `StorySegment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[gameId,sequenceNumber]` on the table `StorySegment` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `userId` on the `ContextConfig` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `Game` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `storySegmentId` on the `Option` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `segmentTitle` to the `StorySegment` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `gameId` on the `StorySegment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "ContextConfig" DROP CONSTRAINT "ContextConfig_userId_fkey";

-- DropForeignKey
ALTER TABLE "Game" DROP CONSTRAINT "Game_userId_fkey";

-- DropForeignKey
ALTER TABLE "Option" DROP CONSTRAINT "Option_storySegmentId_fkey";

-- DropForeignKey
ALTER TABLE "StorySegment" DROP CONSTRAINT "StorySegment_gameId_fkey";

-- AlterTable
ALTER TABLE "ContextConfig" DROP CONSTRAINT "ContextConfig_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL,
ADD CONSTRAINT "ContextConfig_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Game" DROP CONSTRAINT "Game_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL,
ADD CONSTRAINT "Game_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Option" DROP CONSTRAINT "Option_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "storySegmentId",
ADD COLUMN     "storySegmentId" INTEGER NOT NULL,
ADD CONSTRAINT "Option_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "StorySegment" DROP CONSTRAINT "StorySegment_pkey",
DROP COLUMN "SegmentTitle",
ADD COLUMN     "segmentTitle" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "gameId",
ADD COLUMN     "gameId" INTEGER NOT NULL,
ADD CONSTRAINT "StorySegment_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "ContextConfig_userId_key" ON "ContextConfig"("userId");

-- CreateIndex
CREATE INDEX "Game_userId_idx" ON "Game"("userId");

-- CreateIndex
CREATE INDEX "Game_status_idx" ON "Game"("status");

-- CreateIndex
CREATE INDEX "Game_genre_idx" ON "Game"("genre");

-- CreateIndex
CREATE INDEX "Option_storySegmentId_idx" ON "Option"("storySegmentId");

-- CreateIndex
CREATE INDEX "StorySegment_gameId_sequenceNumber_idx" ON "StorySegment"("gameId", "sequenceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "StorySegment_gameId_sequenceNumber_key" ON "StorySegment"("gameId", "sequenceNumber");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorySegment" ADD CONSTRAINT "StorySegment_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Option" ADD CONSTRAINT "Option_storySegmentId_fkey" FOREIGN KEY ("storySegmentId") REFERENCES "StorySegment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContextConfig" ADD CONSTRAINT "ContextConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
