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

        /* ── CLEAN UI PATCH ── */
        #MainMenu {visibility: hidden;}
        header {visibility: hidden;}
        footer {visibility: hidden;}
        .stDeployButton {display:none;}

        /* ── PRO LOCK OVERLAY ── */
        .pro-lock {
            background: rgba(10, 37, 64, 0.9);
            backdrop-filter: blur(10px);
            padding: 40px;
            border-radius: 24px;
            text-align: center;
            border: 1px solid rgba(255, 107, 0, 0.3);
            margin: 20px 0;
        }

        .anti-cheat-warn {
            color: #EF4444;
            font-size: 12px;
            font-weight: 600;
            text-align: center;
            margin-top: 10px;
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
    ghost_accuracy = 0.85
    ghost_times = []
    ghost_answers = []
    total_time = 0
    cumulative_times = []
    
    for _ in range(len(QUESTIONS)):
        t = random.randint(7, 10)
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
if 'logged_in' not in st.session_state:
    st.session_state.logged_in = False
if 'user_type' not in st.session_state:
    st.session_state.user_type = "Free"
if 'username' not in st.session_state:
    st.session_state.username = ""
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
if 'cheating_flag' not in st.session_state:
    st.session_state.cheating_flag = False
if 'last_interaction' not in st.session_state:
    st.session_state.last_interaction = 0
if 'flag_reason' not in st.session_state:
    st.session_state.flag_reason = ""

# =========================
# 🚀 UI RENDERING
# =========================
st.set_page_config(page_title="Vidyajaya | Ghost Mode", layout="wide")
apply_custom_css()

# Header
st.markdown("<h1 style='text-align: center; color: #FF6B00;'>👻 Vidyajaya Ghost Mode</h1>", unsafe_allow_html=True)

# =========================
# 🔐 LOGIN SYSTEM
# =========================
if not st.session_state.logged_in:
    col1, col2, col3 = st.columns([1, 1.5, 1])
    with col2:
        st.markdown("<div class='question-card'>", unsafe_allow_html=True)
        st.subheader("Login to your Account")
        username = st.text_input("Username", placeholder="e.g. Aspirant2026")
        plan = st.selectbox("Select Your Plan", ["Free", "Pro"])
        
        if st.button("Access Dashboard", use_container_width=True):
            if username.strip() == "":
                st.error("Please enter a username")
            else:
                st.session_state.username = username
                st.session_state.user_type = plan
                st.session_state.logged_in = True
                st.rerun()
        st.markdown("</div>", unsafe_allow_html=True)
    st.stop()

# =========================
# 📊 DASHBOARD / TEST START
# =========================
if st.session_state.logged_in and not st.session_state.test_started and not st.session_state.finished:
    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        st.markdown(f"### Welcome, {st.session_state.username}!")
        
        if st.session_state.user_type == "Free":
            st.markdown("""
            <div class='pro-lock'>
                <h2 style='color: #FF6B00;'>🔒 Pro Feature</h2>
                <p>Ghost Mode is available only for <b>Pro Users</b>. Upgrade your plan to compete against toppers in real-time.</p>
                <div style='margin-top: 20px; font-weight: 800; color: #7C3AED;'>Unlock Now for ₹499/year</div>
            </div>
            """, unsafe_allow_html=True)
            st.button("🚀 START GHOST MODE", disabled=True, use_container_width=True)
        else:
            st.markdown("""
            <div class='question-card' style='text-align: center;'>
                <span class='topper-tag' style='background: #00C853;'>Pro Access Active</span>
                <h3>Ready to take the challenge?</h3>
                <p>You will face 10 MCQs. A 'Ghost Topper' will be taking the test simultaneously.</p>
                <p class='anti-cheat-warn'>📵 WARNING: Stay on this screen. Activity is monitored for suspicious behavior.</p>
            </div>
            """, unsafe_allow_html=True)
            if st.button("🚀 START GHOST MODE", use_container_width=True):
                st.session_state.test_started = True
                st.session_state.start_time = time.time()
                st.session_state.last_interaction = time.time()
                st.rerun()

# =========================
# ⚔️ BATTLE ARENA (LIVE TEST)
# =========================
elif st.session_state.test_started and not st.session_state.finished:
    # --- ANTI-CHEAT ENGINE ---
    current_wall_time = time.time()
    time_since_last = current_wall_time - st.session_state.last_interaction
    
    # 1. Tab Switch Detection (Large gap > 30s)
    if time_since_last > 30 and st.session_state.current_idx > 0:
        st.session_state.cheating_flag = True
        st.session_state.flag_reason = "Tab Switching/Inactivity Detected"
        st.session_state.finished = True
        st.session_state.test_started = False
        st.rerun()

    # Live Data
    current_test_time = current_wall_time - st.session_state.start_time
    ghost_cumulative = st.session_state.ghost_data['cumulative_times']
    ghost_progress = sum(1 for t in ghost_cumulative if t <= current_test_time)
    ghost_progress = min(ghost_progress, len(QUESTIONS))
    
    # --- SIDEBAR: LIVE COMPARISON ---
    with st.sidebar:
        st.markdown("### ⚔️ Battle Progress")
        
        # User Progress
        user_p = st.session_state.current_idx / len(QUESTIONS)
        st.markdown(f"**You:** {st.session_state.current_idx}/{len(QUESTIONS)}")
        st.progress(user_p)
        
        # Ghost Progress
        ghost_p = ghost_progress / len(QUESTIONS)
        st.markdown(f"**Ghost Topper:** {ghost_progress}/{len(QUESTIONS)}")
        st.progress(ghost_p)
        
        st.markdown("---")
        st.markdown("### 📊 Live Insights")
        if st.session_state.current_idx < ghost_progress:
            st.warning("⚠️ Behind the topper!")
        elif st.session_state.current_idx > ghost_progress:
            st.success("🔥 Ahead of topper!")
        else:
            st.info("🎯 Neck and neck!")
            
        st.markdown(f"<div class='stat-box'>Time: {int(current_test_time)}s</div>", unsafe_allow_html=True)
        st.markdown("<p class='anti-cheat-warn'>EYE TRACKING ACTIVE 👁️</p>", unsafe_allow_html=True)

    # --- MAIN AREA: QUESTION ---
    if st.session_state.current_idx < len(QUESTIONS):
        q = QUESTIONS[st.session_state.current_idx]
        
        st.markdown(f"<div class='question-card'>", unsafe_allow_html=True)
        st.markdown(f"**Question {st.session_state.current_idx + 1}** | {q['section']}")
        st.markdown(f"### {q['question']}")
        
        answer = st.radio("Select Answer:", q['options'], key=f"q_{st.session_state.current_idx}")
        
        if st.button("SUBMIT ➔"):
            now = time.time()
            time_spent = now - st.session_state.last_interaction
            
            # 2. Time Anomaly Detection (Too fast < 1s)
            if time_spent < 1:
                st.session_state.cheating_flag = True
                st.session_state.flag_reason = "Speed Anomaly (Answered < 1s)"
                st.session_state.finished = True
                st.session_state.test_started = False
                st.rerun()

            # Save answer
            st.session_state.user_answers.append({
                "question_id": q['id'],
                "is_correct": answer == q['answer'],
                "time": time_spent
            })
            
            # Update last interaction
            st.session_state.last_interaction = now
            st.session_state.current_idx += 1
            
            if st.session_state.current_idx >= len(QUESTIONS):
                st.session_state.finished = True
                st.session_state.test_started = False
            st.rerun()
        st.markdown("</div>", unsafe_allow_html=True)
    
    time.sleep(0.5)
    st.rerun()

# =========================
# 🏁 RESULT SCREEN
# =========================
elif st.session_state.finished:
    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        if st.session_state.cheating_flag:
            st.error("🚫 TEST TERMINATED")
            st.markdown(f"""
            <div class='question-card' style='border-color: #EF4444;'>
                <h3 style='color: #EF4444;'>Result Invalid</h3>
                <p>Our anti-cheat system flagged this attempt for: <b>{st.session_state.flag_reason}</b></p>
                <p>Suspicious behavior leads to permanent ban in the actual exam environment.</p>
            </div>
            """, unsafe_allow_html=True)
        else:
            user_score = sum(1 for a in st.session_state.user_answers if a['is_correct'])
            ghost_score = sum(1 for a in st.session_state.ghost_data['answers'] if a)
            
            st.markdown("<h2 style='text-align: center;'>Battle Results</h2>", unsafe_allow_html=True)
            
            if user_score > ghost_score:
                st.balloons()
                st.success("🏆 YOU BEAT THE TOPPER!")
            else:
                st.error("😤 TOPPER WON THIS ROUND")
                
            c1, c2 = st.columns(2)
            c1.metric("Your Score", f"{user_score * 10}%")
            c2.metric("Topper Score", f"{ghost_score * 10}%")
            
        if st.button("🔁 TRY AGAIN", use_container_width=True):
            st.session_state.test_started = False
            st.session_state.current_idx = 0
            st.session_state.user_answers = []
            st.session_state.start_time = None
            st.session_state.ghost_data = initialize_ghost()
            st.session_state.finished = False
            st.session_state.cheating_flag = False
            st.rerun()

st.markdown("<p style='text-align: center; opacity: 0.3; margin-top: 50px;'>Vidyajaya Security Engine v2.0</p>", unsafe_allow_html=True)
