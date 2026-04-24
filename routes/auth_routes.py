from flask import Blueprint, render_template, request, redirect, session, url_for, flash
from database import get_connection
import random
import time
from services.email_service import send_otp_email
import re
from authlib.integrations.flask_client import OAuth
import config

auth = Blueprint("auth", __name__)

oauth = OAuth()

# Google OAuth Configuration
oauth.register(
    name='google',
    client_id=config.GOOGLE_CLIENT_ID,
    client_secret=config.GOOGLE_CLIENT_SECRET,
    server_metadata_url=config.GOOGLE_DISCOVERY_URL,
    client_kwargs={
        'scope': 'openid email profile',
        'verify': False  # ⚠️ DEBUG ONLY: Skip SSL verification to bypass local firewall/AV issues
    }
)

# LinkedIn OAuth Configuration
oauth.register(
    name='linkedin',
    client_id=config.LINKEDIN_CLIENT_ID,
    client_secret=config.LINKEDIN_CLIENT_SECRET,
    access_token_url='https://www.linkedin.com/oauth/v2/accessToken',
    authorize_url='https://www.linkedin.com/oauth/v2/authorization',
    api_base_url='https://api.linkedin.com/v2/',
    client_kwargs={
        'scope': 'openid email profile',
        'token_endpoint_auth_method': 'client_secret_post',
        'verify': False  # ⚠️ DEBUG ONLY: Skip SSL verification
    },
    userinfo_endpoint='https://api.linkedin.com/v2/userinfo'
)

def validate_password(password):
    if not (8 <= len(password) <= 12):
        return False, "Password must be between 8 and 12 characters."
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one capital letter."
    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one small letter."
    if not re.search(r"\d", password):
        return False, "Password must contain at least one number."
    if not re.search(r"[@$!%*?&#]", password):
        return False, "Password must contain at least one special character (@$!%*?&#)."
    return True, ""


# Hardcoded admin credentials
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"


@auth.route("/")
def index():
    if session.get("user_id"):
        if session.get("role") == "admin":
            return redirect(url_for("admin.dashboard"))
        return redirect(url_for("user.dashboard"))
    
    conn = get_connection()
    try:
        user_count = conn.execute("SELECT COUNT(*) FROM user").fetchone()[0]
        company_count = conn.execute("SELECT COUNT(DISTINCT company_name) FROM company").fetchone()[0]
    except Exception as e:
        print(f"Error fetching landing stats: {e}")
        user_count = 0
        company_count = 0
    finally:
        conn.close()
        
    return render_template("index.html", user_count=user_count, company_count=company_count)


@auth.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        action = request.form.get("action", "login")
        username = request.form["username"]
        password = request.form["password"]

        if action == "login":
            # ✅ ADMIN LOGIN CHECK
            if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
                session["username"] = username
                session["role"] = "admin"
                return redirect(url_for("admin.dashboard"))

            # ✅ USER LOGIN CHECK
            conn = get_connection()
            user = conn.execute(
                "SELECT * FROM user WHERE username=? AND password=?",
                (username, password)
            ).fetchone()
            if user:
                # Update last activity
                conn.execute("UPDATE user SET last_activity = CURRENT_TIMESTAMP WHERE id = ?", (user["id"],))
                conn.commit()

                session["user_id"] = user["id"]
                session["username"] = user["username"]
                session["role"] = "user"
                session["login_time"] = time.time()
                
                # Redirect to dashboard directly
                conn.close()
                return redirect(url_for("user.dashboard"))
            else:
                conn.close()
                flash("Invalid credentials", "error")
                return render_template("login.html", state="login")

        elif action == "signup":
            email = request.form.get("email").strip().lower()
            conn = get_connection()
            
            # 🛡️ DUPLICATE EMAIL CHECK
            existing_email = conn.execute("SELECT * FROM user WHERE LOWER(email)=?", (email,)).fetchone()
            if existing_email:
                conn.close()
                flash("Signup failed: This email is already registered.", "error")
                return render_template("login.html", state="signup")

            # DUPLICATE USERNAME CHECK
            existing_user = conn.execute("SELECT * FROM user WHERE username=?", (username,)).fetchone()
            if existing_user:
                conn.close()
                flash("Signup failed: Username already exists.", "error")
                return render_template("login.html", state="signup")

            is_valid, msg = validate_password(password)
            if not is_valid:
                conn.close()
                flash(msg, "error")
                return render_template("login.html", state="signup")

            # Instead of inserting, send OTP
            otp = random.randint(100000, 999999)
            session["otp"] = str(otp)
            session["otp_purpose"] = "signup"
            session["signup_data"] = {
                "username": username,
                "password": password,
                "email": email
            }
            
            if send_otp_email(email, otp, purpose="Account Verification"):
                flash("Verification code sent to your email.", "success")
                conn.close()
                return render_template("login.html", state="verify")
            else:
                conn.close()
                flash("Failed to send verification email. Please try again.", "error")
                return render_template("login.html", state="signup")

    return render_template("login.html", state="login")


@auth.route("/login/google")
def google_login():
    redirect_uri = url_for('auth.google_auth', _external=True)
    print(f"DEBUG: Google Redirect URI sent: {redirect_uri}") # Help user find the exact URI for console
    return oauth.google.authorize_redirect(redirect_uri)


@auth.route("/auth/google")
def google_auth():
    token = oauth.google.authorize_access_token()
    user_info = token.get('userinfo')
    if user_info:
        google_id = user_info['sub']
        email = user_info['email']
        username = user_info.get('name', email.split('@')[0])
        profile_pic = user_info.get('picture')

        conn = get_connection()
        # Check if user already exists by google_id
        user = conn.execute("SELECT * FROM user WHERE google_id = ?", (google_id,)).fetchone()
        
        if not user:
            # Check if user exists by email
            user = conn.execute("SELECT * FROM user WHERE LOWER(email) = ?", (email.lower(),)).fetchone()
            if user:
                # Link account
                conn.execute("UPDATE user SET google_id = ?, profile_pic = COALESCE(profile_pic, ?) WHERE id = ?", (google_id, profile_pic, user['id']))
                conn.commit()
            else:
                # Create new user
                cursor = conn.execute(
                    "INSERT INTO user (username, email, google_id, profile_pic, role) VALUES (?, ?, ?, ?, ?)",
                    (username, email, google_id, profile_pic, "user")
                )
                conn.commit()
                user = conn.execute("SELECT * FROM user WHERE id = ?", (cursor.lastrowid,)).fetchone()

        session["user_id"] = user["id"]
        session["username"] = user["username"]
        session["role"] = user["role"]
        session["login_time"] = time.time()
        
        conn.execute("UPDATE user SET last_activity = CURRENT_TIMESTAMP WHERE id = ?", (user["id"],))
        conn.commit()
        conn.close()
        
        flash(f"Welcome {user['username']}!", "success")
        return redirect(url_for("user.dashboard"))
    
    flash("Google authentication failed.", "error")
    return redirect(url_for("auth.login"))


@auth.route("/login/linkedin")
def linkedin_login():
    redirect_uri = url_for('auth.linkedin_auth', _external=True)
    print(f"DEBUG: LinkedIn Redirect URI sent: {redirect_uri}") # Help user find the exact URI for console
    return oauth.linkedin.authorize_redirect(redirect_uri)


@auth.route("/auth/linkedin")
def linkedin_auth():
    token = oauth.linkedin.authorize_access_token()
    # LinkedIn V2 userinfo endpoint
    resp = oauth.linkedin.get('userinfo')
    user_info = resp.json()
    
    if user_info:
        linkedin_id = user_info.get('sub') # OpenID Connect 'sub' is the unique ID
        email = user_info.get('email')
        username = user_info.get('name', email.split('@')[0])
        profile_pic = user_info.get('picture')

        conn = get_connection()
        # Check if user already exists by linkedin_id
        user = conn.execute("SELECT * FROM user WHERE linkedin_id = ?", (linkedin_id,)).fetchone()
        
        if not user:
            # Check if user exists by email
            user = conn.execute("SELECT * FROM user WHERE LOWER(email) = ?", (email.lower(),)).fetchone()
            if user:
                # Link account
                conn.execute("UPDATE user SET linkedin_id = ?, profile_pic = COALESCE(profile_pic, ?) WHERE id = ?", (linkedin_id, profile_pic, user['id']))
                conn.commit()
            else:
                # Create new user
                cursor = conn.execute(
                    "INSERT INTO user (username, email, linkedin_id, profile_pic, role) VALUES (?, ?, ?, ?, ?)",
                    (username, email, linkedin_id, profile_pic, "user")
                )
                conn.commit()
                user = conn.execute("SELECT * FROM user WHERE id = ?", (cursor.lastrowid,)).fetchone()

        session["user_id"] = user["id"]
        session["username"] = user["username"]
        session["role"] = user["role"]
        session["login_time"] = time.time()
        
        conn.execute("UPDATE user SET last_activity = CURRENT_TIMESTAMP WHERE id = ?", (user["id"],))
        conn.commit()
        conn.close()
        
        flash(f"Welcome {user['username']}!", "success")
        return redirect(url_for("user.dashboard"))
    
    flash("LinkedIn authentication failed.", "error")
    return redirect(url_for("auth.login"))


@auth.route("/signup")
def signup():
    return render_template("login.html", state="signup")



@auth.route("/forgot-password", methods=["GET", "POST"])
def forgot_password():
    if request.method == "POST":
        email_input = request.form.get("forgot_email", "").strip().lower()
        if not email_input:
            flash("Please enter an email address.", "error")
            return redirect(url_for("auth.login"))
            
        conn = get_connection()
        user = conn.execute("SELECT * FROM user WHERE LOWER(email)=?", (email_input,)).fetchone()
        conn.close()

        if user:
            otp = random.randint(100000, 999999)
            session["otp"] = str(otp)
            session["reset_email"] = email_input
            session["otp_purpose"] = "forgot"
            if send_otp_email(email_input, otp, purpose="Password Reset"):
                flash("OTP sent to your email.", "success")
                return render_template("login.html", state="verify")
            else:
                flash("Failed to send OTP. Please try again.", "error")
        else:
            flash("No account associated with this email.", "error")
        
        return redirect(url_for("auth.login"))

    return render_template("login.html")


@auth.route("/verify-otp", methods=["POST"])
def verify_otp():
    user_otp = request.form["otp"]
    saved_otp = session.get("otp")
    purpose = session.get("otp_purpose")

    if user_otp == saved_otp:
        if purpose == "signup":
            signup_data = session.get("signup_data")
            if signup_data:
                conn = get_connection()
                try:
                    cursor = conn.execute(
                        "INSERT INTO user (username, password, role, email) VALUES (?, ?, ?, ?)",
                        (signup_data["username"], signup_data["password"], "user", signup_data["email"])
                    )
                    conn.commit()
                    user_id = cursor.lastrowid
                    
                    # Auto-login
                    session["user_id"] = user_id
                    session["username"] = signup_data["username"]
                    session["role"] = "user"
                    session["login_time"] = time.time()
                    
                    # Update last activity
                    conn.execute("UPDATE user SET last_activity = CURRENT_TIMESTAMP WHERE id = ?", (user_id,))
                    conn.commit()
                    
                    # Clear verification data
                    session.pop("otp", None)
                    session.pop("otp_purpose", None)
                    session.pop("signup_data", None)
                    
                    flash("Account verified! Welcome to CareerConnect.", "success")
                    return redirect(url_for("user.dashboard"))
                except Exception as e:
                    flash("Error creating account. Please try again.", "error")
                    return redirect(url_for("auth.login"))
                finally:
                    conn.close()
            else:
                flash("Session expired. Please sign up again.", "error")
                return redirect(url_for("auth.login"))
        
        elif purpose == "forgot":
            # User is "allowed" to reset their password
            return render_template("login.html", state="reset")
            
        else:
            flash("Invalid session.", "error")
            return redirect(url_for("auth.login"))
    else:
        flash("Invalid OTP. Please try again.", "error")
        return render_template("login.html", state="verify")


@auth.route("/reset-password", methods=["POST"])
def reset_password():
    new_password = request.form.get("new_password")
    email = session.get("reset_email")

    if not new_password:
        flash("Password cannot be empty.", "error")
        return render_template("login.html", state="reset")

    if email:
        is_valid, msg = validate_password(new_password)
        if not is_valid:
            flash(msg, "error")
            return render_template("login.html", state="reset")

        conn = get_connection()
        conn.execute("UPDATE user SET password=? WHERE email=?", (new_password, email))
        conn.commit()
        conn.close()
        session.pop("otp", None)
        session.pop("reset_email", None)
        flash("Password reset successful. Please login.", "success")
        return redirect(url_for("auth.login"))
    else:
        flash("Invalid session.", "error")
        return redirect(url_for("auth.login"))


@auth.route("/notification/view/<int:notification_id>")
def view_notification(notification_id):
    redirect_url = request.args.get("redirect", url_for("auth.login"))
    
    conn = get_connection()
    try:
        conn.execute("UPDATE notifications SET is_seen = 1 WHERE id = ?", (notification_id,))
        conn.commit()
    except Exception as e:
        print(f"Error updating notification: {e}")
    finally:
        conn.close()
        
    return redirect(redirect_url)


@auth.route("/logout")
def logout():
    user_id = session.get("user_id")
    login_time = session.get("login_time")
    
    if user_id and login_time:
        # Calculate session duration in minutes (at least 1 minute if they logged in)
        duration = int((time.time() - login_time) / 60) + 1
        conn = get_connection()
        conn.execute("UPDATE user SET total_screen_time = total_screen_time + ? WHERE id = ?", (duration, user_id))
        conn.commit()
        conn.close()

    session.clear()
    return redirect(url_for("auth.login"))