from google import genai
import json
from config import GEMINI_API_KEY

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY is not set in environment variables.")

client = genai.Client(api_key=GEMINI_API_KEY)

import re

def generate_aptitude_questions(company_name, difficulty, pattern_json):
    """
    Calls Gemini to generate aptitude test based on the company pattern.
    pattern_json is expected to be a string representing a list of dicts.
    e.g. '[{"section": "verbal", "questions": 10, "minutes": 9}]'
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
            return json.loads(json_str)
        else:
            # Fallback to direct load
            return json.loads(text)
        
    except Exception as e:
        print(f"Error generating test: {e}")
        return None
