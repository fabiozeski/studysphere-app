-- Converter todos os valores existentes para minutos e renomear coluna
UPDATE courses SET duration_hours = duration_hours * 60 WHERE duration_hours > 0;
ALTER TABLE courses RENAME COLUMN duration_hours TO duration_minutes;
ALTER TABLE courses ALTER COLUMN duration_minutes TYPE integer;