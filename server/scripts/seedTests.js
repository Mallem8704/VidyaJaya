require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const testsData = [
  {
    title: 'UPSC Prelims - Indian Polity & Governance',
    category: 'UPSC',
    description: 'Test your knowledge on Constitutional provisions, Fundamental Rights, DPSPs, and key governance institutions.',
    duration: 3600,
    total_marks: 100,
    total_questions: 10,
    negative_marking: 0.33,
    is_premium: false,
  },
  {
    title: 'UPSC Prelims - Modern Indian History',
    category: 'UPSC',
    description: 'Comprehensive MCQs on the Freedom Movement, Social Reforms, and the events leading to Independence.',
    duration: 3600,
    total_marks: 100,
    total_questions: 10,
    negative_marking: 0.33,
    is_premium: false,
  },
  {
    title: 'SSC CGL - General Awareness',
    category: 'SSC',
    description: 'Covers current affairs, static GK, awards, sports, and national/international events relevant to SSC.',
    duration: 1800,
    total_marks: 50,
    total_questions: 10,
    negative_marking: 0,
    is_premium: false,
  },
  {
    title: 'UPSC PRO - Economy & Budgetary Policy',
    category: 'UPSC',
    description: 'Advanced economics questions covering Union Budget, monetary policy, GDP, inflation, and economic indices.',
    duration: 3600,
    total_marks: 100,
    total_questions: 10,
    negative_marking: 0.33,
    is_premium: true,
  },
];

const questionsData = {
  'UPSC Prelims - Indian Polity & Governance': [
    { text: 'Which article of the Indian Constitution abolishes untouchability?', options: ['Article 14', 'Article 15', 'Article 17', 'Article 21'], correct_index: 2, explanation: 'Article 17 abolishes the practice of untouchability and makes its enforcement a punishable offence under law.', difficulty: 'easy' },
    { text: 'The 42nd Constitutional Amendment is associated with which of the following?', options: ['Emergency Provisions', 'Adding Fundamental Duties', 'Formation of UPSC', 'Creation of Rajya Sabha'], correct_index: 1, explanation: 'The 42nd Amendment (1976) added the Fundamental Duties under Article 51A to the Indian Constitution.', difficulty: 'medium' },
    { text: 'Under which article can the President of India declare a National Emergency?', options: ['Article 352', 'Article 356', 'Article 360', 'Article 368'], correct_index: 0, explanation: 'Article 352 empowers the President to declare a National Emergency if the security of India is threatened by war, external aggression, or armed rebellion.', difficulty: 'medium' },
    { text: 'The concept of "Judicial Review" in India is borrowed from which country?', options: ['UK', 'Ireland', 'USA', 'Canada'], correct_index: 2, explanation: 'India borrowed the concept of Judicial Review from the United States Constitution, allowing courts to examine the constitutionality of legislative and executive actions.', difficulty: 'easy' },
    { text: 'Which Directive Principle of State Policy directs the state to secure Equal Pay for Equal Work?', options: ['Article 39(a)', 'Article 39(b)', 'Article 39(d)', 'Article 41'], correct_index: 2, explanation: 'Article 39(d) directs the State to ensure that there is equal pay for equal work for both men and women.', difficulty: 'hard' },
    { text: 'The term of office of a member of the Rajya Sabha is:', options: ['4 years', '5 years', '6 years', '2 years'], correct_index: 2, explanation: 'Members of the Rajya Sabha serve a term of 6 years. One-third of its members retire every two years.', difficulty: 'easy' },
    { text: 'Panchayati Raj institutions were given constitutional status by which amendment?', options: ['71st Amendment', '73rd Amendment', '74th Amendment', '76th Amendment'], correct_index: 1, explanation: 'The 73rd Constitutional Amendment Act, 1992 gave constitutional status to Panchayati Raj institutions and added Part IX to the Constitution.', difficulty: 'medium' },
    { text: 'Which schedule of the Indian Constitution deals with the allocation of seats in the Rajya Sabha?', options: ['Second Schedule', 'Third Schedule', 'Fourth Schedule', 'Fifth Schedule'], correct_index: 2, explanation: 'The Fourth Schedule of the Indian Constitution provides for the allocation of seats to States and Union Territories in the Council of States (Rajya Sabha).', difficulty: 'hard' },
    { text: 'The idea of a Concurrent List in the Indian Constitution was borrowed from which country?', options: ['USA', 'Canada', 'Australia', 'UK'], correct_index: 2, explanation: 'The concept of a Concurrent List was borrowed from Australia. It includes subjects on which both Parliament and State Legislatures can legislate.', difficulty: 'hard' },
    { text: 'Which Constitutional body is described as the "watchdog of public finances"?', options: ['Finance Commission', 'Comptroller and Auditor General', 'Reserve Bank of India', 'NITI Aayog'], correct_index: 1, explanation: 'The Comptroller and Auditor General (CAG) of India is often called the watchdog of public finances as it audits all expenditures of the Union and State Governments.', difficulty: 'medium' },
  ],
  'UPSC Prelims - Modern Indian History': [
    { text: 'Who founded the Indian National Congress in 1885?', options: ['Bal Gangadhar Tilak', 'A.O. Hume', 'Dadabhai Naoroji', 'Gopal Krishna Gokhale'], correct_index: 1, explanation: 'Allan Octavian Hume, a retired British civil servant, founded the Indian National Congress in 1885 with the intent of forming a platform for civic and political dialogue.', difficulty: 'easy' },
    { text: 'The Partition of Bengal in 1905 was done by which Viceroy?', options: ['Lord Curzon', 'Lord Minto', 'Lord Hardinge', 'Lord Dalhousie'], correct_index: 0, explanation: 'Lord Curzon, the Viceroy of India, partitioned Bengal in 1905, which was widely seen as a "divide and rule" policy and sparked the Swadeshi Movement.', difficulty: 'easy' },
    { text: 'The Jallianwala Bagh massacre occurred in which year?', options: ['1915', '1917', '1919', '1921'], correct_index: 2, explanation: 'The Jallianwala Bagh massacre occurred on April 13, 1919, when Brigadier-General Dyer ordered troops to fire on a crowd of unarmed Indian civilians.', difficulty: 'easy' },
    { text: 'The Non-Cooperation Movement was withdrawn by Mahatma Gandhi following which incident?', options: ['Kakori Conspiracy', 'Chauri Chaura incident', 'Lahore Conspiracy', 'Meerut Conspiracy'], correct_index: 1, explanation: 'Gandhi called off the Non-Cooperation Movement in February 1922 after the Chauri Chaura incident in UP, where a mob set fire to a police station killing 22 policemen.', difficulty: 'medium' },
    { text: 'Who among the following was NOT a member of the Cabinet Mission of 1946?', options: ['Lord Pethick-Lawrence', 'Sir Stafford Cripps', 'A.V. Alexander', 'Lord Wavell'], correct_index: 3, explanation: 'Lord Wavell was the Viceroy of India, not a member of the Cabinet Mission. The Mission consisted of Lord Pethick-Lawrence, Sir Stafford Cripps, and A.V. Alexander.', difficulty: 'hard' },
    { text: 'The "Doctrine of Lapse" was associated with which Governor-General?', options: ['Lord Wellesley', 'Lord Cornwallis', 'Lord Dalhousie', 'Lord Canning'], correct_index: 2, explanation: 'Lord Dalhousie introduced the Doctrine of Lapse, under which a princely state without a natural heir would be annexed to British India.', difficulty: 'medium' },
    { text: 'Which event directly led to the formation of the Muslim League in 1906?', options: ['Partition of Bengal', 'Minto-Morley Reforms', 'Lucknow Pact', 'Simon Commission'], correct_index: 0, explanation: 'The Partition of Bengal in 1905 created a political situation that led Muslim leaders to meet in Dhaka in 1906 and found the All India Muslim League.', difficulty: 'medium' },
    { text: 'The Rowlatt Act of 1919 was also known as:', options: ['Anarchical and Revolutionary Crimes Act', 'Indian Criminal Law Act', 'Sedition Committee Act', 'Press Censorship Act'], correct_index: 0, explanation: 'The Rowlatt Act, officially the Anarchical and Revolutionary Crimes Act 1919, allowed preventive detention without trial and was deeply opposed by Indian nationalists.', difficulty: 'hard' },
    { text: 'Who led the "Bardoli Satyagraha" of 1928?', options: ['Mahatma Gandhi', 'Jawaharlal Nehru', 'Vallabhbhai Patel', 'C. Rajagopalachari'], correct_index: 2, explanation: 'Vallabhbhai Patel successfully led the Bardoli Satyagraha of 1928, a tax revolt by farmers in Bardoli taluka. His leadership earned him the title "Sardar".', difficulty: 'medium' },
    { text: 'The Indian Independence Act of 1947 was passed by the British Parliament on which date?', options: ['June 3, 1947', 'July 18, 1947', 'August 15, 1947', 'June 15, 1947'], correct_index: 1, explanation: 'The Indian Independence Act was passed by the British Parliament on July 18, 1947, granting independence to India and Pakistan with effect from August 15, 1947.', difficulty: 'hard' },
  ],
  'SSC CGL - General Awareness': [
    { text: 'The headquarters of the International Monetary Fund (IMF) is located in:', options: ['Geneva', 'New York', 'Washington D.C.', 'London'], correct_index: 2, explanation: 'The International Monetary Fund (IMF) is headquartered in Washington D.C., USA. It was established in 1944 at the Bretton Woods Conference.', difficulty: 'easy' },
    { text: 'Which country is the largest producer of milk in the world?', options: ['USA', 'China', 'India', 'Brazil'], correct_index: 2, explanation: 'India is the largest producer of milk in the world, contributing to about 23% of global milk production. The White Revolution (Operation Flood) was instrumental in achieving this.', difficulty: 'easy' },
    { text: 'The Palk Strait separates India from which country?', options: ['Myanmar', 'Bangladesh', 'Maldives', 'Sri Lanka'], correct_index: 3, explanation: 'The Palk Strait is a strait between the Tamil Nadu state of India and the Mannar district of the Northern Province of the island nation of Sri Lanka.', difficulty: 'easy' },
    { text: 'Which vitamin is produced in the human body by the action of sunlight?', options: ['Vitamin A', 'Vitamin B12', 'Vitamin C', 'Vitamin D'], correct_index: 3, explanation: 'Vitamin D is synthesized in the human body when the skin is exposed to ultraviolet B (UVB) radiation from sunlight. It is crucial for calcium absorption.', difficulty: 'easy' },
    { text: 'The "Sagarmatha National Park" is located in which country?', options: ['India', 'Bhutan', 'Nepal', 'China'], correct_index: 2, explanation: 'Sagarmatha National Park is located in Nepal in the Himalayas. It is home to Mount Everest (Sagarmatha in Nepali) and is a UNESCO World Heritage Site.', difficulty: 'medium' },
    { text: 'Who invented the World Wide Web?', options: ['Bill Gates', 'Tim Berners-Lee', 'Steve Jobs', 'Vint Cerf'], correct_index: 1, explanation: 'Tim Berners-Lee invented the World Wide Web in 1989 while working at CERN. He proposed a system of interlinked hypertext documents accessible over the internet.', difficulty: 'easy' },
    { text: 'Which gas is most abundant in the Earth\'s atmosphere?', options: ['Oxygen', 'Carbon Dioxide', 'Argon', 'Nitrogen'], correct_index: 3, explanation: 'Nitrogen (N₂) makes up approximately 78% of the Earth\'s atmosphere, making it the most abundant gas. Oxygen is second at about 21%.', difficulty: 'easy' },
    { text: 'The Battle of Plassey (1757) was fought between the British and:', options: ['Hyder Ali', 'Siraj ud-Daulah', 'Tipu Sultan', 'Nizam of Hyderabad'], correct_index: 1, explanation: 'The Battle of Plassey was fought on June 23, 1757, between the British East India Company under Robert Clive and the Nawab of Bengal, Siraj ud-Daulah.', difficulty: 'medium' },
    { text: 'Which is the highest civilian award in India?', options: ['Padma Vibhushan', 'Padma Shri', 'Bharat Ratna', 'Padma Bhushan'], correct_index: 2, explanation: 'Bharat Ratna is the highest civilian honour in India. It is awarded for exceptional service of the highest order to the nation.', difficulty: 'easy' },
    { text: 'The "Right to Education" was added to the Constitution as a Fundamental Right by which amendment?', options: ['86th Amendment', '87th Amendment', '91st Amendment', '93rd Amendment'], correct_index: 0, explanation: 'The 86th Constitutional Amendment Act of 2002 inserted Article 21A, making free and compulsory education a Fundamental Right for children between 6-14 years.', difficulty: 'medium' },
  ],
  'UPSC PRO - Economy & Budgetary Policy': [
    { text: 'Which committee recommended the abolition of the Planning Commission of India?', options: ['Rangarajan Committee', 'Kelkar Committee', 'C. Rangarajan Committee', 'No specific committee; it was a government decision'], correct_index: 3, explanation: 'The abolition of the Planning Commission and the creation of NITI Aayog in January 2015 was a government decision announced by PM Modi. No specific committee recommended this.', difficulty: 'hard' },
    { text: 'The concept of "Dutch Disease" in economics refers to:', options: ['Hyperinflation caused by government spending', 'Negative effects on the manufacturing sector from a natural resource boom', 'Exchange rate manipulation by central banks', 'Stagflation in developed economies'], correct_index: 1, explanation: 'Dutch Disease refers to the adverse effects on an economy from a sharp appreciation in currency value, often caused by a natural resource boom (e.g., oil discovery), which makes exports uncompetitive.', difficulty: 'hard' },
    { text: 'In India, the fiscal year runs from:', options: ['January 1 to December 31', 'April 1 to March 31', 'March 1 to February 28', 'June 1 to May 31'], correct_index: 1, explanation: 'India\'s fiscal year runs from April 1 to March 31. The Union Budget is presented in Parliament on February 1 each year.', difficulty: 'easy' },
    { text: 'Which index measures the change in price of a fixed basket of goods and services typically purchased by urban wage earners?', options: ['Wholesale Price Index', 'Consumer Price Index', 'Producer Price Index', 'GDP Deflator'], correct_index: 1, explanation: 'The Consumer Price Index (CPI) measures the average change in prices over time of goods and services purchased by households. It is the primary measure of retail inflation in India.', difficulty: 'medium' },
    { text: 'The "Laffer Curve" illustrates the relationship between:', options: ['Inflation and unemployment', 'Tax rates and tax revenue', 'Interest rates and investment', 'Money supply and price level'], correct_index: 1, explanation: 'The Laffer Curve shows that as tax rates increase from 0%, tax revenues initially increase but eventually decrease if rates become too high, as they disincentivize economic activity.', difficulty: 'hard' },
    { text: 'What is the minimum capital requirement for a Small Finance Bank in India as per RBI guidelines?', options: ['₹100 crore', '₹200 crore', '₹500 crore', '₹1000 crore'], correct_index: 1, explanation: 'The minimum paid-up voting equity capital for small finance banks is ₹200 crore as per the RBI\'s revised guidelines for licensing of Small Finance Banks.', difficulty: 'hard' },
    { text: 'Which body in India has the authority to issue currency notes of all denominations except ₹1?', options: ['Ministry of Finance', 'Reserve Bank of India', 'State Bank of India', 'Securities and Exchange Board of India'], correct_index: 1, explanation: 'The Reserve Bank of India (RBI) has the exclusive right to issue currency notes in India. The ₹1 note is issued by the Ministry of Finance and bears the signature of the Finance Secretary.', difficulty: 'medium' },
    { text: 'The term "Monetary Policy Committee" (MPC) was constituted under which act?', options: ['RBI Act, 1934', 'Banking Regulation Act, 1949', 'FEMA, 1999', 'Finance Act, 2016'], correct_index: 0, explanation: 'The Monetary Policy Committee (MPC) was constituted under Section 45ZB of the RBI Act, 1934 (amended by Finance Act, 2016) to determine the policy interest rate to achieve the inflation target.', difficulty: 'hard' },
    { text: 'Which scheme was launched by the Government of India to provide financial security to the unorganized sector workers?', options: ['PMJDY', 'Atal Pension Yojana', 'PMSBY', 'NPS'], correct_index: 1, explanation: 'Atal Pension Yojana (APY), launched in May 2015, is focused on unorganized sector workers. It provides a guaranteed minimum pension of ₹1000 to ₹5000 per month after the age of 60.', difficulty: 'medium' },
    { text: 'The "Marginal Standing Facility" (MSF) rate is always:', options: ['Equal to the repo rate', 'Higher than the repo rate', 'Lower than the repo rate', 'Equal to the reverse repo rate'], correct_index: 1, explanation: 'MSF rate is the rate at which banks can borrow overnight from the RBI against their SLR securities in emergencies. It is always higher than the repo rate (currently repo + 25 basis points).', difficulty: 'hard' },
  ],
};

async function seed() {
  console.log('🌱 Starting database seed...');

  for (const testData of testsData) {
    console.log(`\n📝 Creating test: "${testData.title}"`);

    // Insert test
    const { data: insertedTest, error: testError } = await supabase
      .from('tests')
      .insert(testData)
      .select()
      .single();

    if (testError) {
      console.error(`❌ Failed to insert test "${testData.title}":`, testError.message);
      continue;
    }

    console.log(`   ✅ Test created with ID: ${insertedTest.id}`);

    // Insert questions for this test
    const questions = questionsData[testData.title];
    if (!questions) continue;

    const questionsToInsert = questions.map(q => ({
      test_id: insertedTest.id,
      text: q.text,
      options: q.options,
      correct_index: q.correct_index,
      explanation: q.explanation,
      category: testData.category,
      difficulty: q.difficulty,
    }));

    const { data: insertedQs, error: qError } = await supabase
      .from('questions')
      .insert(questionsToInsert)
      .select();

    if (qError) {
      console.error(`   ❌ Failed to insert questions:`, qError.message);
    } else {
      console.log(`   ✅ Inserted ${insertedQs.length} questions`);
    }
  }

  console.log('\n🎉 Seeding complete!');
}

seed().catch(console.error);
