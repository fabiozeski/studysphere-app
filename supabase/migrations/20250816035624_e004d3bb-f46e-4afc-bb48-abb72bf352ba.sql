-- Alterar coluna duration_hours para aceitar decimais ou renomear para duration_minutes
ALTER TABLE courses RENAME COLUMN duration_hours TO duration_minutes;
ALTER TABLE courses ALTER COLUMN duration_minutes TYPE integer;