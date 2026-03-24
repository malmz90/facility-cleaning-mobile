ALTER TABLE rooms DROP COLUMN IF EXISTS instructions;

CREATE TABLE IF NOT EXISTS room_instructions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE,
  text text NOT NULL,
  order_index int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_room_instructions_room_id
ON room_instructions(room_id);
