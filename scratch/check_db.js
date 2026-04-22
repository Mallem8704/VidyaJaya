const supabase = require('../server/config/supabase');

async function checkDb() {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(5);

  if (error) {
    console.error('Error fetching profiles:', error);
  } else {
    console.log('Profiles:', profiles);
  }

  // Check submissions too
  const { data: submissions, error: subError } = await supabase
    .from('submissions')
    .select('*')
    .limit(5);

  // Test insert
  console.log('Testing profile insertion...');
  const testId = '00000000-0000-0000-0000-000000000000';
  const { error: insertError } = await supabase
    .from('profiles')
    .insert({
      id: testId,
      name: 'Test',
      email: 'test@test.com'
    });

  if (insertError) {
    console.error('Insert Error:', insertError);
  } else {
    console.log('Insert Success!');
    // Cleanup
    await supabase.from('profiles').delete().eq('id', testId);
  }
}

checkDb();
