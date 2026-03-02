import requests
import re
from datetime import datetime, timezone
from config import ADZUNA_APP_ID, ADZUNA_APP_KEY


BASE_URL = "https://api.adzuna.com/v1/api/jobs/in/search/"


def clean_html(text):
    """Remove HTML tags from Adzuna text fields."""
    if not text: return ""
    return re.sub(r'<[^>]*>', '', text)


def role_match(job_title, role_keywords):
    job_title = clean_html(job_title).lower()
    words = role_keywords.lower().split()
    return all(word in job_title for word in words)


# ✅ NEW: check if job link active
def is_job_active(link):
    try:
        r = requests.head(link, allow_redirects=True, timeout=5)
        return r.status_code == 200
    except:
        return False


# ✅ NEW: extract experience level
def extract_experience(title, description):
    title_clean = clean_html(title).lower()
    desc_clean = clean_html(description).lower()
    full_text = f"{title_clean} {desc_clean}"

    fresher_keywords = [
        "fresher", "freshers", "entry level",
        "graduate", "0 years", "0-1 years", "no experience", "intern", "trainee", "entry-level"
    ]

    senior_keywords = [
        "senior", "sr.", "sr ", "lead", "architect", "manager", "staff", 
        "principal", "avp", "vp", "director", "head", "specialist", "expert"
    ]

    # 1. Check for explicit year patterns in description or title (most accurate)
    # Matches: 5 years, 3-5 yrs, 2+ yr, 4 to 6 years
    match = re.search(r'(\d+)\s*(?:\+?)\s*(?:-|to)?\s*(\d+)?\s*(?:years|yrs|year|yr)', full_text)
    if match:
        start = match.group(1)
        end = match.group(2)
        if end:
            return "Experienced", f"{start}-{end} years"
        else:
            return "Experienced", f"{start}+ years"

    # 2. Check for Fresher keywords (whole word)
    for word in fresher_keywords:
        if re.search(rf"\b{re.escape(word)}\b", full_text):
            return "Fresher", "0-1 years"

    # 3. Check for Seniority keywords in title (internal match is fine for titles)
    for word in senior_keywords:
        if word in title_clean:
            return "Experienced", "Senior Level"

    # 4. Junior check
    if any(word in title_clean for word in ["jr.", "jr ", "junior"]):
        return "Junior", "0-2 years"

    return "Not specified", "Not specified"


def fetch_filtered_jobs(companies, roles, days_limit=30):

    collected_jobs = []
    seen_links = set()
    today = datetime.now(timezone.utc)

    for company in companies:

        for page in range(1, 10):

            params = {
                "app_id": ADZUNA_APP_ID,
                "app_key": ADZUNA_APP_KEY,
                "results_per_page": 50,
                "what": company
            }

            response = requests.get(BASE_URL + str(page), params=params)

            if response.status_code != 200:
                break

            data = response.json()
            jobs = data.get("results", [])

            if not jobs:
                break

            for job in jobs:
                # ✅ FIX: safe values & clean HTML
                company_name = clean_html(job.get("company", {}).get("display_name") or "Not specified")
                title = clean_html(job.get("title") or "Not specified")
                location = clean_html(job.get("location", {}).get("display_name") or "Not specified")
                date_str = job.get("created", "")
                link = job.get("redirect_url") or ""
                description = job.get("description") or ""

                # Skip duplicate
                if not link or link in seen_links:
                    continue

                seen_links.add(link)

                # Company filter
                if company.lower() not in company_name.lower():
                    continue

                # Role filter
                if not any(role_match(title, role) for role in roles):
                    continue

                # Date filter
                try:
                    job_date = datetime.strptime(
                        date_str[:10], "%Y-%m-%d"
                    ).replace(tzinfo=timezone.utc)
                except:
                    continue

                if (today - job_date).days > days_limit:
                    continue

                # ✅ NEW: hiring status
                active = is_job_active(link)

                # ✅ NEW: experience detection
                level, experience = extract_experience(title, description)

                # Save valid job
                collected_jobs.append({
                    "company": company_name,
                    "role": title,
                    "location": location,
                    "date": job_date.strftime("%Y-%m-%d"),
                    "active": active,                 # NEW
                    "level": level,                   # NEW
                    "experience": experience,         # NEW
                    "link": link
                })

    return collected_jobs


def fetch_jobs(company_name, roles=None):
    if not roles:
        # Import dynamically to avoid circular dependencies if database.py ever imports this service
        from database import get_connection
        try:
            conn = get_connection()
            users = conn.execute("SELECT applied_job FROM user WHERE applied_job IS NOT NULL AND applied_job != ''").fetchall()
            conn.close()
            
            # Start with internal defaults, then add everything users are interested in
            dynamic_roles = {"software engineer", "software developer", "python developer"}
            for user in users:
                parts = [p.strip().lower() for p in user["applied_job"].split(',')]
                for p in parts:
                    if p:
                        dynamic_roles.add(p)
            roles = list(dynamic_roles)
        except Exception as e:
            print(f"Warning: Database error in job_service fetching roles: {e}")
            roles = ["software engineer", "software developer", "python developer"]

    return fetch_filtered_jobs([company_name], roles)