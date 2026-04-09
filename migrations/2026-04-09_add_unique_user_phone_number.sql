-- Purpose:
-- 1) Consolidate duplicate users by phone number
-- 2) Add UNIQUE constraint on user.phone_number
--
-- Run during a maintenance window.

START TRANSACTION;

-- Canonical user per phone_number (deterministic: smallest id).
CREATE TEMPORARY TABLE tmp_user_canonical AS
SELECT phone_number, MIN(id) AS canonical_user_id
FROM user
GROUP BY phone_number;

-- Duplicate user ids that should be merged into canonical ids.
CREATE TEMPORARY TABLE tmp_user_duplicates AS
SELECT u.id AS duplicate_user_id, c.canonical_user_id
FROM user u
JOIN tmp_user_canonical c
  ON c.phone_number = u.phone_number
WHERE u.id <> c.canonical_user_id;

-- Re-point references to canonical user ids.
UPDATE alerts a
JOIN tmp_user_duplicates d
  ON a.user_id = d.duplicate_user_id
SET a.user_id = d.canonical_user_id;

UPDATE chats c
JOIN tmp_user_duplicates d
  ON c.from_id = d.duplicate_user_id
SET c.from_id = d.canonical_user_id;

UPDATE chats c
JOIN tmp_user_duplicates d
  ON c.to_id = d.duplicate_user_id
SET c.to_id = d.canonical_user_id;

UPDATE like_and_dislikes l
JOIN tmp_user_duplicates d
  ON l.user_id = d.duplicate_user_id
SET l.user_id = d.canonical_user_id;

UPDATE like_and_dislikes l
JOIN tmp_user_duplicates d
  ON l.other_user_id = d.duplicate_user_id
SET l.other_user_id = d.canonical_user_id;

UPDATE matches m
JOIN tmp_user_duplicates d
  ON m.user_id = d.duplicate_user_id
SET m.user_id = d.canonical_user_id;

UPDATE matches m
JOIN tmp_user_duplicates d
  ON m.other_user_id = d.duplicate_user_id
SET m.other_user_id = d.canonical_user_id;

UPDATE user_config uc
JOIN tmp_user_duplicates d
  ON uc.user_id = d.duplicate_user_id
SET uc.user_id = d.canonical_user_id;

-- Keep a single user_config row per user_id after merge (smallest id wins).
DELETE uc1
FROM user_config uc1
JOIN user_config uc2
  ON uc1.user_id = uc2.user_id
 AND uc1.id > uc2.id;

-- Remove duplicate user rows now that references are updated.
DELETE u
FROM user u
JOIN tmp_user_duplicates d
  ON u.id = d.duplicate_user_id;

-- Enforce uniqueness at DB level.
ALTER TABLE user
  ADD UNIQUE KEY uq_user_phone_number (phone_number);

COMMIT;
