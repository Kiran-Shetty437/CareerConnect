from google import genai
import json
import re
import random
from config import GEMINI_API_KEY
from database import get_connection

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY is not set in environment variables.")

client = genai.Client(api_key=GEMINI_API_KEY)

def save_questions_to_db(generated_test, difficulty, company_name):
    """
    Saves generated questions to the database for future fallback.
    """
    if not generated_test:
        return

    conn = get_connection()
    try:
        for section_data in generated_test:
            section_name = section_data.get("section", "General")
            questions = section_data.get("questions", [])
            
            for q in questions:
                # Check if question already exists to avoid duplicates
                existing = conn.execute(
                    "SELECT id FROM aptitude_questions WHERE section=? AND question_text=? AND company_name=?",
                    (section_name, q.get("text"), company_name)
                ).fetchone()
                
                if not existing:
                    conn.execute(
                        """INSERT INTO aptitude_questions 
                           (section, question_text, options_json, correct_index, difficulty, company_name) 
                           VALUES (?, ?, ?, ?, ?, ?)""",
                        (
                            section_name,
                            q.get("text"),
                            json.dumps(q.get("options")),
                            q.get("correct_index"),
                            difficulty,
                            company_name
                        )
                    )
        conn.commit()
    except Exception as e:
        print(f"Error saving questions to DB: {e}")
    finally:
        conn.close()

def fetch_questions_from_db(pattern_json, difficulty):
    """
    Fetches random questions from the database based on the pattern.
    """
    try:
        sections = json.loads(pattern_json)
        fallback_test = []
        conn = get_connection()
        
        for s in sections:
            section_name = s.get("section", "General")
            count = s.get("questions", 5)
            
            # Fetch questions for this section strictly. No mixing with other sections.
            # We prioritize matching the difficulty if possible.
            rows = conn.execute(
                """SELECT question_text, options_json, correct_index 
                   FROM aptitude_questions 
                   WHERE section = ? 
                   ORDER BY (difficulty = ?) DESC, RANDOM() LIMIT ?""",
                (section_name, difficulty, count)
            ).fetchall()

            section_questions = []
            for r in rows:
                section_questions.append({
                    "text": r["question_text"],
                    "options": json.loads(r["options_json"]),
                    "correct_index": r["correct_index"]
                })
            
            if section_questions:
                fallback_test.append({
                    "section": section_name,
                    "questions": section_questions
                })
        
        conn.close()
        return fallback_test if fallback_test else None
    except Exception as e:
        print(f"Error fetching from DB: {e}")
        return None

def generate_aptitude_questions(company_name, difficulty, pattern_json):
    """
    Calls Gemini to generate aptitude test based on the company pattern.
    Falls back to stored questions if Gemini fails.
    """
    try:
        sections = json.loads(pattern_json)
        
        prompt = f"""You are an expert aptitude tester and examiner for {company_name}.
Generate a {difficulty} difficulty aptitude test for {company_name}. 

CRITICAL: You MUST return a JSON array containing exactly {len(sections)} objects, one for each of these sections:
"""
        for s in sections:
            prompt += f"- {s.get('section', 'General')}: exactly {s.get('questions', 5)} questions\n"

        prompt += """
Each section MUST be a separate object in the array. Do NOT merge them.
Return the questions as a JSON array with this exact structure:
[
  {
    "section": "section name",
    "questions": [
      {
        "text": "Question text...",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correct_index": 0
      }
    ]
  }
]
"""
        response = client.models.generate_content(
            model="gemini-2.5-flash", 
            contents=prompt
        )
        
        # More robust JSON extraction
        text = response.text.strip()
        match = re.search(r'(\[.*\])', text, re.DOTALL)
        if match:
            json_str = match.group(1)
            generated_test = json.loads(json_str)
        else:
            # Fallback to direct load
            generated_test = json.loads(text)
        
        # Save successfully generated questions to DB for future use
        if generated_test:
            save_questions_to_db(generated_test, difficulty, company_name)
            
        return generated_test
        
    except Exception as e:
        print(f"Error generating test with Gemini: {e}. Falling back to stored questions.")
        # Fallback to DB
        return fetch_questions_from_db(pattern_json, difficulty)
