from google import genai
from config import GEMINI_API_KEY

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY is not set in environment variables.")

client = genai.Client(api_key=GEMINI_API_KEY)

def job_chatbot(user_input):
    prompt = f"""
You are a job assistant chatbot. Your goal is to provide helpful, structured, and easy-to-read information about jobs, companies, and careers.

Rules:
- If greeting → reply greeting politely.
- If job related → provide a detailed answer in a structured way (using bullet points, bold headers, and clear sections).
- If NOT job related → reply EXACTLY:
  Sorry, I answer only job related questions.

User: {user_input}
"""
    try:
        model_list = ["gemini-2.5-flash", "gemini-1.5-flash"]
        response = None
        for model in model_list:
            try:
                response = client.models.generate_content(model=model, contents=prompt)
                if response: break
            except Exception as e:
                if "503" in str(e) or "high demand" in str(e).lower():
                    continue
                else: raise e
        
        if not response:
            return "⚠️ All AI models are currently busy. Please try again in 60 seconds."
            
        return response.text
    except Exception as e:
        error_msg = str(e).upper()
        if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg or "QUOTA" in error_msg:
            return "⚠️ **Service is busy.** The AI has reached its free limit. Please try again in about 60 seconds."
        return f"Error connecting to chatbot: {str(e)}"
