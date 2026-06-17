"""Himova drafting engine — Vercel Python serverless function.

POST /api/draft
  body: { "email": str, "knowledgeBase"?: { ... } }
  returns: { reply, confidence, status, intent, matched, reasons }

This is a real, dependency-free grounded-reply engine:
  * intent detection over salon support topics (hours / price / booking / location)
  * TF-IDF-style cosine matching against the business FAQ list
  * grounded answer generation from the business knowledge base
  * a confidence score that drives human-in-the-loop escalation

No email is ever \"sent\" — Himova only drafts. The dashboard decides.
"""
from http.server import BaseHTTPRequestHandler
from collections import Counter
import json
import os
import re
import math

# ---------------------------------------------------------------------------
# Default salon knowledge base (overridable per request)
# ---------------------------------------------------------------------------
DEFAULT_KB = {
    "business_name": "Bloom Hair Studio",
    "location": "Thamel, Kathmandu, Nepal",
    "hours": {
        "Mon": "9:00am\u20137:00pm",
        "Tue": "9:00am\u20137:00pm",
        "Wed": "9:00am\u20137:00pm",
        "Thu": "9:00am\u20137:00pm",
        "Fri": "9:00am\u20137:00pm",
        "Sat": "9:00am\u20135:00pm",
        "Sun": "Closed",
    },
    "services": [
        {"name": "Haircut", "price": "$25"},
        {"name": "Hair colour", "price": "$60"},
        {"name": "Blow dry", "price": "$20"},
        {"name": "Beard trim", "price": "$10"},
    ],
    "policies": [
        "Free rescheduling up to 24 hours before your appointment.",
        "Walk-ins welcome when a chair is free, but booking ahead is recommended.",
    ],
    "faqs": [
        {"q": "What payment methods do you accept?",
         "a": "We accept cash, cards, and major mobile wallets like eSewa and Khalti."},
        {"q": "Do you have parking?",
         "a": "There is paid street parking nearby; we recommend arriving a few minutes early."},
    ],
}

STOPWORDS = set(
    "a an the is are am do does did to of for in on at and or you your i we my me "
    "can could would will hi hello hey there please thanks thank it this that with "
    "have has want need just be was were how what when where which who whom".split()
)

DAYS = {
    "monday": "Mon", "mon": "Mon", "tuesday": "Tue", "tue": "Tue",
    "wednesday": "Wed", "wed": "Wed", "thursday": "Thu", "thu": "Thu",
    "friday": "Fri", "fri": "Fri", "saturday": "Sat", "sat": "Sat",
    "sunday": "Sun", "sun": "Sun",
}

INTENT_KEYWORDS = {
    "hours": {"open", "close", "closed", "hours", "hour", "time", "times",
              "late", "early", "today", "tomorrow", "weekend", "saturday",
              "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"},
    "price": {"price", "prices", "cost", "costs", "much", "charge", "rate",
              "rates", "fee", "fees", "$", "cut", "haircut", "colour", "color",
              "dye", "blowdry", "trim", "beard"},
    "booking": {"book", "booking", "appointment", "appointments", "reschedule",
                "cancel", "move", "change", "available", "availability",
                "slot", "slots", "schedule", "reserve"},
    "location": {"where", "location", "located", "address", "directions",
                 "parking", "find", "map", "area"},
}


def tokenize(text):
    return [t for t in re.findall(r"[a-z0-9$]+", (text or "").lower())
            if t not in STOPWORDS]


def cosine(a_tokens, b_tokens):
    ca, cb = Counter(a_tokens), Counter(b_tokens)
    common = set(ca) & set(cb)
    num = sum(ca[t] * cb[t] for t in common)
    da = math.sqrt(sum(v * v for v in ca.values()))
    db = math.sqrt(sum(v * v for v in cb.values()))
    if da == 0 or db == 0:
        return 0.0
    return num / (da * db)


def best_faq(tokens, faqs):
    best, best_score = None, 0.0
    for f in faqs or []:
        score = cosine(tokens, tokenize(f.get("q", "")))
        if score > best_score:
            best, best_score = f, score
    return best, best_score


def _format_hours(hours):
    order = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    return ", ".join("%s %s" % (d, hours.get(d, "Closed")) for d in order if d in hours)


def generate_draft(email, kb):
    kb = kb or DEFAULT_KB
    name = kb.get("business_name", "our salon")
    tokens = tokenize(email)
    tset = set(tokens)

    scores = {intent: len(tset & kws) for intent, kws in INTENT_KEYWORDS.items()}
    top_intent = max(scores, key=scores.get)
    top_score = scores[top_intent]

    faq, faq_score = best_faq(tokens, kb.get("faqs", []))

    reasons = []
    body = None
    intent = top_intent if top_score > 0 else "unknown"
    confidence = 0.0

    # FAQ match wins if it is clearly the strongest signal.
    if faq_score >= 0.45 and faq_score >= (top_score * 0.25):
        intent = "faq"
        body = faq["a"]
        confidence = min(0.95, 0.6 + faq_score * 0.4)
        reasons.append("Matched an FAQ (similarity %.2f)." % faq_score)
    elif intent == "hours":
        hours = kb.get("hours", {})
        day_hits = [DAYS[t] for t in tokens if t in DAYS]
        if day_hits:
            parts = ["%s we're open %s" % (d, hours.get(d, "closed")) for d in dict.fromkeys(day_hits)]
            body = "Here are those hours: " + "; ".join(parts) + "."
            confidence = 0.9
            reasons.append("Asked about specific day(s): %s." % ", ".join(dict.fromkeys(day_hits)))
        else:
            body = "Our opening hours are: %s." % _format_hours(hours)
            confidence = 0.82
            reasons.append("General hours question answered from the knowledge base.")
    elif intent == "price":
        services = kb.get("services", [])
        matched = [s for s in services if any(w in tset for w in tokenize(s.get("name", "")))]
        target = matched or services
        listed = ", ".join("%s %s" % (s.get("name"), s.get("price")) for s in target)
        body = "Our pricing: %s. Prices can vary a little with hair length and style." % listed
        confidence = 0.88 if matched else 0.74
        reasons.append(("Matched service(s): " + ", ".join(s.get("name") for s in matched)) if matched
                       else "General pricing question — listed our main services.")
    elif intent == "booking":
        policies = " ".join(kb.get("policies", []))
        body = ("We'd be happy to get you booked in. Let us know your preferred day and time and "
                "the service you'd like, and we'll confirm a slot. " + policies).strip()
        confidence = 0.7
        reasons.append("Booking/scheduling request — used our booking policy.")
    elif intent == "location":
        body = "You'll find us at %s." % kb.get("location", "our salon")
        confidence = 0.85
        reasons.append("Location question answered from the knowledge base.")
    else:
        body = ("Thanks for your message! I want to make sure you get the right answer, "
                "so a member of our team will get back to you shortly.")
        confidence = 0.25
        reasons.append("No confident match in the knowledge base \u2014 flagged for a human.")

    # Ambiguity penalty: more than one strong intent lowers confidence.
    strong_intents = [i for i, s in scores.items() if s > 0]
    if len(strong_intents) > 1 and intent != "faq":
        confidence -= 0.12
        reasons.append("Multiple topics detected (%s) \u2014 reduced confidence." % ", ".join(strong_intents))

    confidence = max(0.0, min(0.99, round(confidence, 2)))
    status = "ready" if confidence >= 0.6 else "review"

    greeting = "Hi there, thanks for reaching out!"
    signoff = "\n\nWarm regards,\n%s" % name
    reply = "%s\n\n%s%s" % (greeting, body, signoff)

    return {
        "reply": reply,
        "confidence": confidence,
        "status": status,
        "intent": intent,
        "scores": scores,
        "faq_similarity": round(faq_score, 3),
        "reasons": reasons,
    }


def bedrock_draft(email, kb, base_result):
    """Optionally refine the reply with Amazon Bedrock (Claude).

    The deterministic engine still decides intent, confidence, and whether to
    escalate -- Bedrock only rewrites the prose, grounded in the same KB. Any
    failure falls back to the rules-based reply so the service never breaks.
    """
    try:
        import boto3  # lazy import so the function works without the dep
        region = os.environ.get("AWS_REGION", "us-east-1")
        model_id = os.environ.get(
            "BEDROCK_MODEL_ID", "anthropic.claude-3-5-sonnet-20240620-v1:0")
        client = boto3.client("bedrock-runtime", region_name=region)
        system = (
            "You are Himova, a warm, concise email assistant for a salon. "
            "Use ONLY the facts in the provided knowledge base. If the answer "
            "is not in the knowledge base, say a team member will follow up. "
            "Never invent prices, hours, or policies."
        )
        user = (
            "Business knowledge base (JSON):\n%s\n\nCustomer email:\n%s\n\n"
            "Write a short, friendly reply grounded only in the knowledge base."
            % (json.dumps(kb), email)
        )
        resp = client.converse(
            modelId=model_id,
            system=[{"text": system}],
            messages=[{"role": "user", "content": [{"text": user}]}],
            inferenceConfig={"maxTokens": 400, "temperature": 0.3},
        )
        text = resp["output"]["message"]["content"][0]["text"].strip()
        if text:
            return text
    except Exception as exc:  # noqa: BLE001
        base_result.setdefault("reasons", []).append(
            "Bedrock unavailable (%s) -- used the rules engine." % type(exc).__name__)
    return None


def draft_with_engine(email, kb):
    """Run the rules engine, then optionally refine the prose with Bedrock."""
    result = generate_draft(email, kb)
    result["engine"] = "rules"
    if os.environ.get("USE_BEDROCK") == "1":
        refined = bedrock_draft(email, kb, result)
        if refined:
            result["reply"] = refined
            result["engine"] = "bedrock"
    return result


class handler(BaseHTTPRequestHandler):
    def _send(self, code, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self._send(204, {})

    def do_GET(self):
        self._send(200, {
            "status": "ok",
            "service": "himova-draft",
            "usage": "POST { email, knowledgeBase? } to receive a drafted reply.",
        })

    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length", 0) or 0)
            raw = self.rfile.read(length) if length else b"{}"
            data = json.loads(raw or b"{}")
        except Exception as exc:  # noqa: BLE001
            self._send(400, {"error": "invalid JSON", "detail": str(exc)})
            return
        email = (data.get("email") or "").strip()
        kb = data.get("knowledgeBase") or DEFAULT_KB
        if not email:
            self._send(400, {"error": "missing 'email' field"})
            return
        self._send(200, draft_with_engine(email, kb))


if __name__ == "__main__":
    samples = [
        "Hi! Are you open this Saturday and how late?",
        "How much is a haircut and a beard trim?",
        "Can I reschedule my appointment to next Tuesday?",
        "Where are you located, and is there parking?",
        "What payment methods do you accept?",
        "Do you do bridal hair packages for a group of six?",
    ]
    for s in samples:
        r = generate_draft(s, DEFAULT_KB)
        print("Q:", s)
        print("   intent=%s confidence=%s status=%s" % (r["intent"], r["confidence"], r["status"]))
        print("   reply:", r["reply"].replace("\n", " "))
        print()
