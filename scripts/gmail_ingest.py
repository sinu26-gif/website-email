"""Himova -- Gmail ingest worker.

Polls a connected Gmail inbox for unread messages, drafts a grounded reply
with the Himova engine, and saves it as a *Gmail draft* (it never sends).
A human reviews and sends from Gmail or the Himova dashboard.

Setup (one time):
  1. In Google Cloud Console, enable the Gmail API and create OAuth client
     credentials (Desktop app). Download as credentials.json into this folder.
  2. pip install -r scripts/requirements-ingest.txt
  3. Authorize once (opens a browser, writes token.json):
       python scripts/gmail_ingest.py --auth
  4. Run the worker:
       python scripts/gmail_ingest.py --max 10

Scopes: gmail.modify (read messages + create drafts).
"""
import argparse
import base64
import json
import os
import sys
from email.mime.text import MIMEText

# Make the Himova engine importable when run from the project root.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from api.draft import draft_with_engine, DEFAULT_KB  # noqa: E402

SCOPES = ["https://www.googleapis.com/auth/gmail.modify"]
TOKEN_PATH = os.environ.get("GMAIL_TOKEN_PATH", "token.json")
CREDENTIALS_PATH = os.environ.get("GMAIL_CREDENTIALS_PATH", "credentials.json")


def get_credentials(run_auth=False):
    from google.oauth2.credentials import Credentials
    from google.auth.transport.requests import Request
    from google_auth_oauthlib.flow import InstalledAppFlow

    creds = None
    if os.path.exists(TOKEN_PATH):
        creds = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        elif run_auth:
            flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_PATH, SCOPES)
            creds = flow.run_local_server(port=0)
        else:
            raise SystemExit(
                "No valid token. Run: python scripts/gmail_ingest.py --auth")
        with open(TOKEN_PATH, "w") as fh:
            fh.write(creds.to_json())
    return creds


def build_service(creds):
    from googleapiclient.discovery import build
    return build("gmail", "v1", credentials=creds)


def _header(msg, name):
    for h in msg.get("payload", {}).get("headers", []):
        if h.get("name", "").lower() == name.lower():
            return h.get("value", "")
    return ""


def _extract_body(payload):
    if payload.get("body", {}).get("data"):
        return base64.urlsafe_b64decode(payload["body"]["data"]).decode("utf-8", "ignore")
    for part in payload.get("parts", []) or []:
        if part.get("mimeType") == "text/plain" and part.get("body", {}).get("data"):
            return base64.urlsafe_b64decode(part["body"]["data"]).decode("utf-8", "ignore")
    for part in payload.get("parts", []) or []:
        text = _extract_body(part)
        if text:
            return text
    return ""


def create_draft(service, to, subject, body, thread_id):
    mime = MIMEText(body)
    mime["To"] = to
    mime["Subject"] = subject if subject.lower().startswith("re:") else "Re: " + subject
    raw = base64.urlsafe_b64encode(mime.as_bytes()).decode()
    return service.users().drafts().create(
        userId="me", body={"message": {"raw": raw, "threadId": thread_id}}
    ).execute()


def load_kb():
    path = os.environ.get("HIMOVA_KB_PATH")
    if path and os.path.exists(path):
        with open(path) as fh:
            return json.load(fh)
    return DEFAULT_KB


def run(max_results=10):
    creds = get_credentials()
    service = build_service(creds)
    kb = load_kb()
    listing = service.users().messages().list(
        userId="me", q="is:unread -in:chats -category:promotions",
        maxResults=max_results,
    ).execute()
    messages = listing.get("messages", [])
    if not messages:
        print("No unread messages.")
        return
    for ref in messages:
        msg = service.users().messages().get(
            userId="me", id=ref["id"], format="full").execute()
        sender = _header(msg, "From")
        subject = _header(msg, "Subject")
        body = _extract_body(msg.get("payload", {}))
        result = draft_with_engine(body, kb)
        draft = create_draft(service, sender, subject, result["reply"], msg.get("threadId"))
        flag = "READY " if result["status"] == "ready" else "REVIEW"
        print("[%s %3d%%] draft %s for: %s" % (
            flag, int(result["confidence"] * 100), draft.get("id"), subject[:50]))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Himova Gmail ingest worker")
    parser.add_argument("--auth", action="store_true", help="Run the one-time OAuth flow")
    parser.add_argument("--max", type=int, default=10, help="Max unread messages to process")
    args = parser.parse_args()
    if args.auth:
        get_credentials(run_auth=True)
        print("Authorized. token.json written.")
    else:
        run(args.max)
