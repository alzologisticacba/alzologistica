import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://wjnybucyhfbtvrerdvax.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqbnlidWN5aGZidHZyZXJkdmF4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTUxMDg2NiwiZXhwIjoyMDg3MDg2ODY2fQ.pKilbbL1PaTGk179oHSPRa6NCTP-WGBuUVik4Ly9HLI";
const supabase = createClient(
  supabaseUrl,
  supabaseKey
);

export { supabase as s };
