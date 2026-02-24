const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('--- WARNING: Supabase credentials missing ---');
    console.warn('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file.');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = supabase;
