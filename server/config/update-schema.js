const supabase = require('./supabase');

async function updateSchema() {
  console.log('Updating questions table schema to match requirements...');
  
  // We try to add columns one by one. This might fail if they exist, but that's fine.
  const sqlCommands = [
    'ALTER TABLE questions ADD COLUMN IF NOT EXISTS question TEXT;',
    'ALTER TABLE questions ADD COLUMN IF NOT EXISTS answer TEXT;',
    'ALTER TABLE questions ADD COLUMN IF NOT EXISTS subject TEXT;',
    'ALTER TABLE questions ADD COLUMN IF NOT EXISTS topic TEXT;'
  ];

  console.log('Please run the following SQL in your Supabase Dashboard to ensure perfect compliance:');
  console.log(sqlCommands.join('\n'));
  
  // Note: supabase-js doesn't support direct SQL. 
  // We suggest the user to run it in the dashboard.
}

updateSchema();
