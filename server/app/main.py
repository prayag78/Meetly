import os
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import Groq
import pdfplumber
import markdown
import smtplib
from email.mime.text import MIMEText
from pathlib import Path

# Load env variables
load_dotenv()

app = FastAPI()

# Allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Groq client
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# ---------- Helpers ----------
def extract_text_from_file(file: UploadFile) -> str:
    if file.content_type == "text/plain":
        return file.file.read().decode("utf-8")
    elif file.content_type == "application/pdf":
        with pdfplumber.open(file.file) as pdf:
            return "\n".join(page.extract_text() or "" for page in pdf.pages)
    else:
        raise ValueError("Only .txt and .pdf are supported")


# ---------- Routes ----------
@app.post("/api/summarize")
async def summarize(
    transcript: str = Form(None),
    customPrompt: str = Form(None),
    file: UploadFile = File(None)
):
    try:
        if file:
            transcript_text = extract_text_from_file(file)
        elif transcript:
            transcript_text = transcript
        else:
            return {"error": "No transcript provided"}

        if not transcript_text.strip():
            return {"error": "Transcript empty or invalid"}

        # Prompt
        prompt = f"""Please provide a summary of this transcript.
        {f"Focus on: {customPrompt}" if customPrompt else "Include key points, action items, and decisions."}

        Transcript:
        {transcript_text}
        """

        # Call Groq
        chat_completion = groq_client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {"role": "system", "content": "You are a skilled meeting summarizer. Use markdown with **bold** headers and bullet points."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            max_tokens=1000,
        )

        summary = chat_completion.choices[0].message.content
        formatted_summary = markdown.markdown(summary)

        print(formatted_summary)

        return {
            "success": True,
            "summary": summary,
            "formattedSummary": formatted_summary,
            "originalTranscript": transcript_text,
        }

    except Exception as e:
        return {"error": str(e)}


class ShareRequest(BaseModel):
    recipients: list[str]
    subject: str | None = None
    summary: str


@app.post("/api/share")
async def share(req: ShareRequest):
    try:
        if not req.recipients or not req.summary:
            return {"error": "Recipients and summary required"}

        formatted_summary = markdown.markdown(req.summary)

        msg = MIMEText(formatted_summary, "html")
        msg["Subject"] = req.subject or "Meeting Summary Shared"
        msg["From"] = os.getenv("EMAIL_USER")
        msg["To"] = ", ".join(req.recipients)

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(os.getenv("EMAIL_USER"), os.getenv("EMAIL_PASS"))
            server.send_message(msg)

        return {"success": True, "message": "Summary shared successfully"}
    except Exception as e:
        return {"error": str(e)}
