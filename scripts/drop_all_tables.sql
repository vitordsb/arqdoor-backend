-- ATENÇÃO: este script remove TODAS as tabelas do schema alvo.
-- Ajuste o nome do schema abaixo se não for 'arqdoordb'.

SET @SCHEMA := 'arqdoordb';
SET SESSION group_concat_max_len = 1000000;
SET FOREIGN_KEY_CHECKS = 0;

-- gera um único DROP para todas as tabelas do schema (DROP TABLE ... , ...)
SET @drop_cmds := (
  SELECT CONCAT('DROP TABLE IF EXISTS ', GROUP_CONCAT(CONCAT('`', table_name, '`') SEPARATOR ', '))
  FROM information_schema.tables
  WHERE table_schema = @SCHEMA
);

-- se não houver tabelas, evita erro
SET @drop_cmds := IFNULL(@drop_cmds, 'SELECT 1');

PREPARE stmt FROM @drop_cmds;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET FOREIGN_KEY_CHECKS = 1;
