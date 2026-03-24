ALTER TABLE room_instructions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read instructions in their organization" ON room_instructions;
CREATE POLICY "Users can read instructions in their organization"
ON room_instructions
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM rooms
    JOIN buildings ON buildings.id = rooms.building_id
    JOIN organization_members om ON om.organization_id = buildings.organization_id
    WHERE rooms.id = room_instructions.room_id
      AND om.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Admins can insert instructions" ON room_instructions;
CREATE POLICY "Admins can insert instructions"
ON room_instructions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM rooms
    JOIN buildings ON buildings.id = rooms.building_id
    JOIN organization_members om ON om.organization_id = buildings.organization_id
    WHERE rooms.id = room_instructions.room_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
  )
);
