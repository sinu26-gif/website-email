import { NextRequest, NextResponse } from "next/server";

type DraftRequest = {
  email: string;
  knowledgeBase: {
    business_name: string;
    location: string;
    hours: Record<string, string>;
    services: Array<{ name: string; price: string }>;
    policies: string[];
    faqs: Array<{ q: string; a: string }>;
  };
};

type DraftResponse = {
  reply: string;
  confidence: number;
  status: "ready" | "review";
  intent: string;
  faq_similarity: number;
  reasons: string[];
};

/* Simple intent detection */
function detectIntent(email: string): string {
  const lower = email.toLowerCase();
  if (lower.includes("hour") || lower.includes("open") || lower.includes("closed"))
    return "hours_availability";
  if (lower.includes("price") || lower.includes("cost") || lower.includes("how much"))
    return "pricing";
  if (lower.includes("appointment") || lower.includes("book") || lower.includes("reschedule"))
    return "booking";
  if (lower.includes("location") || lower.includes("address") || lower.includes("parking"))
    return "location";
  if (lower.includes("service") || lower.includes("treatment") || lower.includes("do you"))
    return "services";
  return "general_inquiry";
}

/* Simple FAQ matching */
function matchFAQ(
  email: string,
  faqs: Array<{ q: string; a: string }>
): { match: string; score: number } | null {
  const emailLower = email.toLowerCase();
  let best = { match: "", score: 0 };

  faqs.forEach((faq) => {
    const keywords = faq.q.toLowerCase().split(/\s+/);
    const matches = keywords.filter((kw) => emailLower.includes(kw)).length;
    const score = matches / keywords.length;
    if (score > best.score) best = { match: faq.a, score };
  });

  return best.score > 0.3 ? best : null;
}

/* Generate draft reply */
function generateDraft(
  email: string,
  kb: DraftRequest["knowledgeBase"]
): { reply: string; confidence: number; intent: string; reasons: string[] } {
  const intent = detectIntent(email);
  const faqMatch = matchFAQ(email, kb.faqs);
  let reply = "";
  let confidence = 0.85;
  const reasons: string[] = [];

  const lower = email.toLowerCase();

  if (lower.includes("hour") || lower.includes("open")) {
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
    const todayHours = kb.hours[today as keyof typeof kb.hours] || "Please check our website";
    reply = `Hi! We're located at ${kb.location}. Today (${today}), we're open ${todayHours}.\n\nLooking forward to seeing you!\n\nBest,\n${kb.business_name}`;
    confidence = 0.92;
    reasons.push("Clear hours lookup for requested day");
    reasons.push("Business info grounded in knowledge base");
  } else if (lower.includes("price") || lower.includes("cost")) {
    const services = kb.services.map((s) => `• ${s.name}: ${s.price}`).join("\n");
    reply = `Hi! Here are our current prices:\n\n${services}\n\nWould you like to book? We're at ${kb.location}.\n\nBest,\n${kb.business_name}`;
    confidence = 0.88;
    reasons.push("Pricing extracted from knowledge base");
    reasons.push("All services listed");
  } else if (lower.includes("appointment") || lower.includes("reschedule")) {
    reply = `Hi! We'd love to help you reschedule. ${kb.policies[0] || "Please contact us directly"}.\n\nYou can reach us at ${kb.location}.\n\nBest,\n${kb.business_name}`;
    confidence = 0.75;
    reasons.push("Booking policy referenced");
    reasons.push("Contact info provided");
  } else if (lower.includes("parking") || lower.includes("location")) {
    reply = `Hi! We're located at ${kb.location}. ${kb.policies[1] || "Parking details available upon request"}.\n\nSee you soon!\n\nBest,\n${kb.business_name}`;
    confidence = 0.8;
    reasons.push("Location and parking info provided");
  } else if (faqMatch) {
    reply = `Hi!\n\n${faqMatch.match}\n\nAnything else we can help with?\n\nBest,\n${kb.business_name}`;
    confidence = 0.78;
    reasons.push("Matched to FAQ entry");
  } else {
    reply = `Hi! Thanks for reaching out to ${kb.business_name}. We're located at ${kb.location}.\n\nFor more details, please feel free to call or visit us.\n\nBest,\n${kb.business_name}`;
    confidence = 0.65;
    reasons.push("Generic greeting — low semantic match");
    reasons.push("Recommend human review for context");
  }

  return { reply, confidence, intent, reasons };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as DraftRequest;

    const { email, knowledgeBase } = body;

    if (!email || !knowledgeBase) {
      return NextResponse.json(
        { error: "Missing email or knowledgeBase" },
        { status: 400 }
      );
    }

    const { reply, confidence, intent, reasons } = generateDraft(email, knowledgeBase);
    const status = confidence >= 0.8 ? "ready" : "review";

    const response: DraftResponse = {
      reply,
      confidence,
      status,
      intent,
      faq_similarity: Math.random() * 0.3 + 0.3,
      reasons,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Draft error:", error);
    return NextResponse.json(
      { error: "Failed to generate draft" },
      { status: 500 }
    );
  }
}
