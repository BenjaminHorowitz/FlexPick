/*
  # Rename market columns to type columns

  1. Changes
    - Rename `market_1` column to `type_1` in `top10_bets` table
    - Rename `market_2` column to `type_2` in `top10_bets` table
  
  2. Notes
    - This is a non-destructive change that preserves all existing data
    - Column data types and constraints remain unchanged
*/

ALTER TABLE top10_bets 
  RENAME COLUMN market_1 TO type_1;

ALTER TABLE top10_bets 
  RENAME COLUMN market_2 TO type_2;
