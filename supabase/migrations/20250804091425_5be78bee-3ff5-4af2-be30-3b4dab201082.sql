-- Enable email confirmation bypass for faster testing
UPDATE auth.config SET confirm_email_change_enabled = false;

-- Create admin user role if not exists
DO $$
BEGIN
  INSERT INTO user_roles (user_id, role) 
  SELECT '00000000-0000-0000-0000-000000000000'::uuid, 'admin'
  WHERE NOT EXISTS (
    SELECT 1 FROM user_roles WHERE role = 'admin'
  );
EXCEPTION WHEN OTHERS THEN
  -- User doesn't exist yet, ignore
  NULL;
END $$;