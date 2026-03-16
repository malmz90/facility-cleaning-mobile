CREATE TABLE cleaning_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE,
  cleaner_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  cleaned_at timestamptz DEFAULT now(),
  note text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_cleaning_logs_room_id ON cleaning_logs(room_id);
CREATE INDEX idx_cleaning_logs_cleaner_id ON cleaning_logs(cleaner_id);
CREATE INDEX idx_cleaning_logs_cleaned_at ON cleaning_logs(cleaned_at);
