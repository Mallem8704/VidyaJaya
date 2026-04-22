const supabase = require('./supabase');

async function fixRls() {
  // Since we can't easily run arbitrary SQL via RPC without defining the function first,
  // we will try to add a policy that explicitly allows the service role if it's somehow being blocked.
  // Actually, the best way is to tell the user to run this in their dashboard.
  
  console.log('Diagnostic: Attempting to insert a test profile with service role...');
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'RLS Check',
      email: 'rls_' + Date.now() + '@example.com'
    });
    
  if (error) {
    console.error('RLS Diagnostic Error:', error);
    if (error.message.includes('row-level security policy')) {
      console.error('CONFIRMED: RLS is blocking the service role. This is highly unusual for Supabase.');
    }
  } else {
    console.log('RLS Diagnostic Success! Service role can insert.');
    await supabase.from('profiles').delete().eq('id', '00000000-0000-0000-0000-000000000001');
  }
}

fixRls();
