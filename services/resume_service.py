from google import genai
import pdfplumber
import docx
from config import GEMINI_API_KEY
import os

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY is not set in environment variables.")

client = genai.Client(api_key=GEMINI_API_KEY)

def extract_pdf_text(file):
    text = ""
    try:
        with pdfplumber.open(file) as pdf:
            for page in pdf.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
    except Exception as e:
        print(f"Error extracting PDF: {e}")
    return text

def extract_docx_text(file):
    text = ""
    try:
        doc = docx.Document(file)
        for para in doc.paragraphs:
            text += para.text + "\n"
    except Exception as e:
        print(f"Error extracting DOCX: {e}")
    return text

from PIL import Image
import json

def analyze_resume_image(image_file):
    """
    Analyzes an image of a resume and returns structured JSON data.
    """
    try:
        # Load and ensure it's a manageable size & format
        img = Image.open(image_file).convert("RGB")
        img.thumbnail((2000, 2000)) # Ensure it's not huge
        
        prompt = """
        Analyze this image of a resume. Extract the information into exactly this JSON format.
        CRITICAL: Capture the exact heading names used in the image (e.g., if the image says "Work History", use that for "experienceTitle").
        If a field is missing, use an empty string or empty list as appropriate.
        Do not include any preamble, introduction, or markdown formatting. 
        Only return the raw JSON string starting with { and ending with }.

        {
            "summaryTitle": "...",
            "experienceTitle": "...",
            "educationTitle": "...",
            "skillsTitle": "...",
            "design": {
                "headerAlignment": "center or left",
                "nameColor": "#hexcode",
                "sectionHeadingColor": "#hexcode",
                "hasPhoto": boolean
            },
            "personal": {
                "fullName": "...",
                "email": "...",
                "phone": "...",
                "location": "...",
                "professionalTitle": "...",
                "summary": "...",
                "linkedin": "...",
                "website": "...",
                "portfolio": "..."
            },
            "experience": [
                { "company": "...", "role": "...", "duration": "...", "desc": "..." }
            ],
            "education": [
                { "school": "...", "degree": "...", "year": "..." }
            ],
            "skills": ["...", "..."]
        }
        """

        try:
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=[prompt, img]
            )
            if response and response.text:
                json_text = response.text.strip()
                
                # More robust JSON extraction (handles markdown and leading/trailing text)
                if "```" in json_text:
                    # Find the first { after ``` and last } before ```
                    start_pos = json_text.find("{")
                    end_pos = json_text.rfind("}") + 1
                    if start_pos != -1 and end_pos != -1:
                        json_text = json_text[start_pos:end_pos]
                
                # Try direct parse
                try:
                    return json.loads(json_text)
                except json.JSONDecodeError:
                    # Find the first { and last } regardless
                    start_pos = json_text.find("{")
                    end_pos = json_text.rfind("}") + 1
                    if start_pos != -1 and end_pos != -1:
                        return json.loads(json_text[start_pos:end_pos])
                    raise
            else:
                return {"error": "AI Analysis failed: No response text."}
        except Exception as e:
            last_error = str(e).upper()
            print(f"[gemini-2.5-flash] Error: {last_error}")
            if any(x in last_error for x in ["429", "RESOURCE_EXHAUSTED", "QUOTA"]):
                return {"error": "⚠️ **AI Quota Exceeded.** Gemini model has hit its free-tier limit. Please wait about 60 seconds and try again. This happens often with free API keys."}
            return {"error": f"AI Analysis failed: {last_error}"}

    except Exception as e:
        print(f"Error in image analysis: {e}")
        return {"error": f"Internal Error: {str(e)}"}

def analyze_resume(text):
    prompt = f"""
    You are an AI Resume Analyzer.

    First determine if the document is a RESUME.

    A valid resume usually contains sections like:
    - Name
    - Contact information
    - Education
    - Skills
    - Projects / Experience

    If the document is NOT a resume (for example: project report, synopsis, article, notes),
    return only this message:

    "⚠️ This file does not appear to be a resume. Please upload a valid resume."

    If the document IS a resume, analyze it and return the result in this format:

    📌 Suitable Job Roles
    - Role 1
    - Role 2

    📌 Skills Found
    - Skill 1
    - Skill 2

    📌 Missing Skills to Learn
    - Skill 1
    - Skill 2

    📌 Resume Improvement Suggestions
    - Suggestion 1
    - Suggestion 2

    Keep each point concise and professional.

    Document:
    {text}
    """
    try:
        try:
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            return response.text
        except Exception as e:
            raise e
    except Exception as e:
        error_msg = str(e).upper()
        if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
            return "⚠️ **Service is busy.** Quota exceeded. Please wait 60 seconds."
        return f"Error analyzing resume: {str(e)}"
