const supabase = require('./supabase');

async function testInsert() {
  const testId = '00000000-0000-0000-0000-000000000000'; // Dummy UUID
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: testId,
      name: 'Diagnostic Test',
      email: 'diag_' + Date.now() + '@example.com',
      is_verified: true
    });
    
  if (error) {
    console.error('Insert Error:', error);
  } else {
    console.log('Insert Success!');
    // Clean up
    await supabase.from('profiles').delete().eq('id', testId);
  }
}

testInsert();
