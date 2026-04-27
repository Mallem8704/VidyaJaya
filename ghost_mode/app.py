import streamlit as st
import random
import time
from datetime import datetime

# ==========================================
# 🎨 CUSTOM STYLES (Vidyajaya Premium Theme)
# ==========================================
def apply_custom_css():
    st.markdown("""
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap');
        
        html, body, [class*="css"] {
            font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .main {
            background-color: #060e1a;
            color: #e8f0fe;
        }

        .stButton>button {
            background: linear-gradient(135deg, #FF6B00 0%, #FF3D00 100%);
            color: white;
            border-radius: 12px;
            padding: 0.6rem 2rem;
            font-weight: 800;
            border: none;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(255, 107, 0, 0.3);
        }

        .stButton>button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(255, 107, 0, 0.4);
        }

        .question-card {
            background: rgba(255, 255, 255, 0.05);
            padding: 2rem;
            border-radius: 20px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            margin-bottom: 2rem;
        }

        .ghost-card {
            background: linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(124, 58, 237, 0.05) 100%);
            border: 1px solid rgba(124, 58, 237, 0.2);
            padding: 1rem;
            border-radius: 15px;
            margin-top: 1rem;
        }

        .stat-box {
            background: #111f35;
            padding: 1rem;
            border-radius: 12px;
            text-align: center;
            border: 1px solid #1a2f4a;
        }

        .topper-tag {
            background: #FFD700;
            color: #000;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
        }
        
        .stProgress > div > div > div > div {
            background-color: #FF6B00;
        }
    </style>
    """, unsafe_allow_html=True)

# =========================
# 📚 MOCK DATA
# =========================
QUESTIONS = [
    {"id": 1, "question": "Which article of the Indian Constitution deals with the Right to Equality?", "options": ["Article 14", "Article 19", "Article 21", "Article 32"], "answer": "Article 14", "section": "Polity"},
    {"id": 2, "question": "Who was the first Governor-General of independent India?", "options": ["Lord Mountbatten", "C. Rajagopalachari", "Dr. Rajendra Prasad", "Jawaharlal Nehru"], "answer": "Lord Mountbatten", "section": "History"},
    {"id": 3, "question": "The 'Green Revolution' in India was most successful in which crops?", "options": ["Rice and Wheat", "Tea and Coffee", "Cotton and Jute", "Oilseeds"], "answer": "Rice and Wheat", "section": "Economy"},
    {"id": 4, "question": "Which of the following passes connects Srinagar to Leh?", "options": ["Zoji La Pass", "Bara Lacha Pass", "Rohtang Pass", "Nathu La Pass"], "answer": "Zoji La Pass", "section": "Geography"},
    {"id": 5, "question": "Who is known as the 'Father of the Indian Constitution'?", "options": ["B.R. Ambedkar", "Mahatma Gandhi", "Sardar Patel", "Jawaharlal Nehru"], "answer": "B.R. Ambedkar", "section": "Polity"},
    {"id": 6, "question": "What is the capital of Kazakhstan?", "options": ["Astana", "Almaty", "Bishkek", "Tashkent"], "answer": "Astana", "section": "GK"},
    {"id": 7, "question": "The Quit India Movement was started in which year?", "options": ["1942", "1930", "1920", "1947"], "answer": "1942", "section": "History"},
    {"id": 8, "question": "Which planet is known as the 'Red Planet'?", "options": ["Mars", "Venus", "Jupiter", "Saturn"], "answer": "Mars", "section": "Science"},
    {"id": 9, "question": "The 'Statue of Unity' is dedicated to which Indian leader?", "options": ["Sardar Vallabhbhai Patel", "Subhash Chandra Bose", "B.R. Ambedkar", "Atal Bihari Vajpayee"], "answer": "Sardar Vallabhbhai Patel", "section": "GK"},
    {"id": 10, "question": "Which river is known as the 'Ganges of the South'?", "options": ["Cauvery", "Godavari", "Krishna", "Narmada"], "answer": "Cauvery", "section": "Geography"}
]

# =========================
# 👻 GHOST LOGIC
# =========================
def initialize_ghost():
    ghost_accuracy = 0.90
    ghost_times = []
    ghost_answers = []
    total_time = 0
    cumulative_times = []
    
    for _ in range(len(QUESTIONS)):
        t = random.randint(6, 12)
        total_time += t
        ghost_times.append(t)
        cumulative_times.append(total_time)
        ghost_answers.append(random.random() < ghost_accuracy)
        
    return {
        "times": ghost_times,
        "answers": ghost_answers,
        "cumulative_times": cumulative_times
    }

# =========================
# 🎮 STATE MANAGEMENT
# =========================
if 'test_started' not in st.session_state:
    st.session_state.test_started = False
if 'current_idx' not in st.session_state:
    st.session_state.current_idx = 0
if 'user_answers' not in st.session_state:
    st.session_state.user_answers = []
if 'start_time' not in st.session_state:
    st.session_state.start_time = None
if 'ghost_data' not in st.session_state:
    st.session_state.ghost_data = initialize_ghost()
if 'finished' not in st.session_state:
    st.session_state.finished = False

# =========================
# 🚀 UI RENDERING
# =========================
st.set_page_config(page_title="Vidyajaya | Ghost Mode", layout="wide")
apply_custom_css()

# Header
st.markdown("<h1 style='text-align: center; color: #FF6B00;'>👻 Ghost Mode</h1>", unsafe_allow_html=True)
st.markdown("<p style='text-align: center; opacity: 0.7;'>Can you beat the Topper in real-time?</p>", unsafe_allow_html=True)

if not st.session_state.test_started and not st.session_state.finished:
    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        st.markdown("""
        <div class='question-card' style='text-align: center;'>
            <h3>Ready to take the challenge?</h3>
            <p>You will face 10 MCQs. A 'Ghost Topper' will be taking the test simultaneously based on previous topper data.</p>
            <div style='margin: 20px 0;'>
                <span class='topper-tag'>Target Accuracy: 90%</span>
                <span class='topper-tag' style='background: #00C853; margin-left: 10px;'>Avg. Time: 9s</span>
            </div>
        </div>
        """, unsafe_allow_html=True)
        if st.button("🚀 START MOCK TEST", use_container_width=True):
            st.session_state.test_started = True
            st.session_state.start_time = time.time()
            st.rerun()

elif st.session_state.test_started and not st.session_state.finished:
    # --- LIVE DATA CALCULATION ---
    current_time = time.time() - st.session_state.start_time
    ghost_cumulative = st.session_state.ghost_data['cumulative_times']
    ghost_progress = sum(1 for t in ghost_cumulative if t <= current_time)
    ghost_progress = min(ghost_progress, len(QUESTIONS))
    
    # --- SIDEBAR: LIVE COMPARISON ---
    with st.sidebar:
        st.markdown("### ⚔️ Live Battle")
        
        # User Progress
        user_p = st.session_state.current_idx / len(QUESTIONS)
        st.markdown(f"**You:** {st.session_state.current_idx}/{len(QUESTIONS)}")
        st.progress(user_p)
        
        # Ghost Progress
        ghost_p = ghost_progress / len(QUESTIONS)
        st.markdown(f"**Ghost Topper:** {ghost_progress}/{len(QUESTIONS)}")
        st.progress(ghost_p)
        
        # Live Insights
        st.markdown("---")
        st.markdown("### 📊 AI Insights")
        if st.session_state.current_idx < ghost_progress:
            st.warning("⚠️ You are trailing the topper! Pick up the pace.")
        elif st.session_state.current_idx > ghost_progress:
            st.success("🔥 You are ahead of the topper! Keep it up.")
        else:
            st.info("🎯 Neck and neck! Every second counts.")
            
        st.markdown(f"<div class='stat-box'>Elapsed Time<br><span style='font-size: 24px; font-weight: 800;'>{int(current_time)}s</span></div>", unsafe_allow_html=True)

    # --- MAIN AREA: QUESTION ---
    if st.session_state.current_idx < len(QUESTIONS):
        q = QUESTIONS[st.session_state.current_idx]
        
        st.markdown(f"<div class='question-card'>", unsafe_allow_html=True)
        st.markdown(f"**Question {st.session_state.current_idx + 1} of {len(QUESTIONS)}**")
        st.markdown(f"<span class='topper-tag' style='background: #7C3AED; color: white;'>{q['section']}</span>", unsafe_allow_html=True)
        st.markdown(f"### {q['question']}")
        
        answer = st.radio("Choose the correct option:", q['options'], key=f"q_{st.session_state.current_idx}")
        
        if st.button("NEXT QUESTION ➔"):
            # Save answer
            st.session_state.user_answers.append({
                "question_id": q['id'],
                "user_answer": answer,
                "is_correct": answer == q['answer'],
                "time_at_submit": time.time() - st.session_state.start_time
            })
            
            # Move to next
            st.session_state.current_idx += 1
            if st.session_state.current_idx >= len(QUESTIONS):
                st.session_state.finished = True
                st.session_state.test_started = False
            st.rerun()
        st.markdown("</div>", unsafe_allow_html=True)
    
    # Auto-rerun trick to keep ghost moving (only if user is idle)
    time.sleep(0.5)
    st.rerun()

elif st.session_state.finished:
    # --- RESULT SCREEN ---
    total_time = time.time() - st.session_state.start_time
    user_score = sum(1 for a in st.session_state.user_answers if a['is_correct'])
    ghost_score = sum(1 for a in st.session_state.ghost_data['answers'] if a)
    
    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        st.markdown("<h2 style='text-align: center;'>Test Complete!</h2>", unsafe_allow_html=True)
        
        # Winner Banner
        if user_score > ghost_score:
            st.balloons()
            st.markdown("<div style='background: #00C853; padding: 20px; border-radius: 15px; text-align: center; color: white; font-weight: 800; font-size: 24px;'>🏆 YOU BEAT THE TOPPER!</div>", unsafe_allow_html=True)
        elif user_score == ghost_score:
            st.markdown("<div style='background: #FFD700; padding: 20px; border-radius: 15px; text-align: center; color: #000; font-weight: 800; font-size: 24px;'>🤝 IT'S A TIE!</div>", unsafe_allow_html=True)
        else:
            st.markdown("<div style='background: #EF4444; padding: 20px; border-radius: 15px; text-align: center; color: white; font-weight: 800; font-size: 24px;'>😤 THE TOPPER WON.</div>", unsafe_allow_html=True)
            
        st.markdown("<br>", unsafe_allow_html=True)
        
        # Stats Grid
        c1, c2 = st.columns(2)
        with c1:
            st.markdown(f"<div class='stat-box'>Your Score<br><span style='font-size: 32px; color: #FF6B00;'>{user_score * 10}%</span></div>", unsafe_allow_html=True)
        with c2:
            st.markdown(f"<div class='stat-box'>Topper Score<br><span style='font-size: 32px; color: #7C3AED;'>{ghost_score * 10}%</span></div>", unsafe_allow_html=True)
            
        st.markdown(f"<div class='stat-box' style='margin-top: 15px;'>Total Time Taken: <b>{int(total_time)} seconds</b></div>", unsafe_allow_html=True)
        
        st.markdown("<br>", unsafe_allow_html=True)
        if st.button("🔁 TRY AGAIN", use_container_width=True):
            # Reset state
            st.session_state.test_started = False
            st.session_state.current_idx = 0
            st.session_state.user_answers = []
            st.session_state.start_time = None
            st.session_state.ghost_data = initialize_ghost()
            st.session_state.finished = False
            st.rerun()

st.markdown("---")
st.markdown("<p style='text-align: center; font-size: 12px; opacity: 0.5;'>Vidyajaya EdTech Platform - Ghost Mode v1.0.0</p>", unsafe_allow_html=True)
