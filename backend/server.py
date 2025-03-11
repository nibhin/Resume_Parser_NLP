from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import uuid
import gspread
from google.oauth2.service_account import Credentials
from resume_parser.ai_model import extract_text_from_pdf, extract_details

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
ALLOWED_EXTENSIONS = {"pdf", "docx"}

# Google Sheets Setup
SERVICE_ACCOUNT_FILE = "res.json"
SPREADSHEET_ID = "1inE9BqLytz8r_t8dAnsSBHp9KPEUeDLaojkvqQgDSE4"

# Authenticate with Google Sheets
creds = Credentials.from_service_account_file(SERVICE_ACCOUNT_FILE, scopes=["https://www.googleapis.com/auth/spreadsheets"])
client = gspread.authorize(creds)
sheet = client.open_by_key(SPREADSHEET_ID).sheet1

# Define expected headers
EXPECTED_HEADERS = ["ID", "Filename", "Name", "Email", "Phone", "LinkedIn", "GitHub", "Skills"]

# In-memory storage for resumes
resumes = {}

def ensure_headers():
    """Ensure headers exist in the spreadsheet."""
    existing_headers = sheet.row_values(1)
    if not existing_headers:
        sheet.append_row(EXPECTED_HEADERS)

def allowed_file(filename):
    """Check if the uploaded file has an allowed extension."""
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def append_to_google_sheet(data):
    """Append extracted resume data to Google Sheets in the correct order."""
    try:
        ensure_headers()
        row = [
            data.get("id", ""),
            data.get("filename", ""),
            data.get("name", ""),
            data.get("email", ""),
            data.get("phone", ""),
            data.get("linkedin", ""),
            data.get("github", ""),
            ", ".join(data.get("skills", []))
        ]
        sheet.append_row(row)
        print("✅ Successfully added to Google Sheets.")
    except Exception as e:
        print(f"❌ Error adding to Google Sheets: {str(e)}")

def fetch_resumes_from_sheets():
    """Fetch all resume data from Google Sheets and update in-memory storage."""
    try:
        ensure_headers()
        all_records = sheet.get_all_records()
        resumes.clear()

        for record in all_records:
            resume_id = record.get("ID", "")
            if resume_id:
                resumes[resume_id] = {
                    "id": resume_id,
                    "filename": record.get("Filename", ""),
                    "name": record.get("Name", ""),
                    "email": record.get("Email", ""),
                    "phone": record.get("Phone", ""),
                    "linkedin": record.get("LinkedIn", ""),
                    "github": record.get("GitHub", ""),
                    "skills": record.get("Skills", "").split(", ")
                }

        print("✅ Successfully fetched resumes from Google Sheets.")
    except Exception as e:
        print(f"❌ Error fetching resumes: {str(e)}")

@app.route("/api/resumes/", methods=["POST"])
def upload_resume():
    """Handle file upload and resume parsing while preventing duplicate uploads based on phone number."""
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400
    if not allowed_file(file.filename):
        return jsonify({"error": "Invalid file type. Only PDF and DOCX are allowed."}), 400

    try:
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4().hex}_{filename}"
        file_path = os.path.join(app.config["UPLOAD_FOLDER"], unique_filename)
        file.save(file_path)

        print(f"✅ File uploaded successfully: {file_path}")

        extracted_text = extract_text_from_pdf(file_path)
        if not extracted_text.strip():
            return jsonify({"error": "Could not extract text from file"}), 500

        parsed_details = extract_details(extracted_text)

        # **CHECK FOR DUPLICATE PHONE NUMBER**
        existing_resumes = sheet.get_all_records()
        for record in existing_resumes:
            if record.get("Phone") == parsed_details["phone"]:
                return jsonify({"error": "Resume already uploaded!!."}), 400
        
        parsed_details["id"] = unique_filename
        parsed_details["filename"] = filename

        resumes[unique_filename] = parsed_details
        append_to_google_sheet(parsed_details)

        print("✅ Successfully extracted and stored resume details.")
        return jsonify(parsed_details), 200

    except Exception as e:
        print(f"❌ Server Error: {str(e)}")
        return jsonify({"error": "Internal Server Error"}), 500

@app.route("/api/resumes", methods=["GET"])
def get_all_resumes():
    """Fetch all uploaded resumes from Google Sheets and memory."""
    try:
        fetch_resumes_from_sheets()
        return jsonify(list(resumes.values())), 200
    except Exception as e:
        print(f"❌ Server Error: {str(e)}")
        return jsonify({"error": "Internal Server Error"}), 500

@app.route("/api/resumes/<resume_id>", methods=["GET"])
def get_resume(resume_id):
    """Fetch a single resume by ID."""
    try:
        fetch_resumes_from_sheets()
        if resume_id not in resumes:
            return jsonify({"error": "Resume not found"}), 404
        return jsonify(resumes[resume_id]), 200
    except Exception as e:
        print(f"❌ Server Error: {str(e)}")
        return jsonify({"error": "Internal Server Error"}), 500

@app.route("/api/delete_resume/<resume_id>", methods=["DELETE"])
def delete_resume(resume_id):
    """Deletes a resume from Google Sheets and in-memory storage."""
    try:
        fetch_resumes_from_sheets()

        if resume_id not in resumes:
            return jsonify({"error": "Resume not found"}), 404

        del resumes[resume_id]

        sheet_data = sheet.get_all_values()
        for idx, row in enumerate(sheet_data):
            if row and row[0] == resume_id:
                sheet.delete_rows(idx + 1)
                print(f"✅ Deleted resume {resume_id} from Google Sheets.")
                break

        return jsonify({"message": "Resume deleted successfully"}), 200

    except Exception as e:
        print(f"❌ Error deleting resume: {str(e)}")
        return jsonify({"error": "Internal Server Error"}), 500

if __name__ == "__main__":
    app.run(debug=True)
