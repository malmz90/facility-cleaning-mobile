ALTER TABLE cleaning_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY cleaning_logs_authenticated_insert
ON cleaning_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY cleaning_logs_authenticated_select
ON cleaning_logs
FOR SELECT
TO authenticated
USING (true);
