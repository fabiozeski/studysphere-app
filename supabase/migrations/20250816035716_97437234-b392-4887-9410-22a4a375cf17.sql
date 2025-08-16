-- Reverter mudança anterior e usar decimal
ALTER TABLE courses RENAME COLUMN duration_minutes TO duration_hours;
ALTER TABLE courses ALTER COLUMN duration_hours TYPE decimal(5,2);