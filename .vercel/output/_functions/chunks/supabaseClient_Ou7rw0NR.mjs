import { createClient } from '@supabase/supabase-js';

const url = "https://wjnybucyhfbtvrerdvax.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqbnlidWN5aGZidHZyZXJkdmF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MTA4NjYsImV4cCI6MjA4NzA4Njg2Nn0.P4gjEAJtAE8GMKw4Ci9kQC3RPn68_CM870Sx6Kwh2sM";
const supabaseClient = createClient(
  url,
  key,
  {
    db: { schema: "public" },
    global: {
      headers: { Accept: "application/json" }
    }
  }
);

export { supabaseClient as s };
