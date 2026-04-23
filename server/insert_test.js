const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const supabase = require('./config/supabase');

const testInsert = async () => {
    console.log("--- TESTING DUMMY INSERT ---");
    const dummy = {
      text: "Test Question",
      options: ["A", "B", "C", "D"],
      correct_index: 0,
      explanation: "Test explanation",
      category: "Test",
      difficulty: "medium",
      // These might fail if columns don't exist
      question: "Test Question",
      answer: "A",
      subject: "Test",
      topic: "Test",
      sub_topic: "Test"
    };

    const { data, error } = await supabase.from('questions').insert([dummy]);
    if (error) {
        console.error("INSERT FAILED!");
        console.error("Error Code:", error.code);
        console.error("Error Message:", error.message);
        console.error("Error Details:", error.details);
        console.error("Hint:", error.hint);
    } else {
        console.log("INSERT SUCCESS!");
    }
};

testInsert();
