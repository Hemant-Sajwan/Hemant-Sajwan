#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generates the 3 CISSP Accelerator campaign variations from one template.
Run:  python build.py
Outputs:
  index.html                 -> paid (Rs.97) clone of cisspaccelerator.com/
  free/index.html            -> free clone of cisspaccelerator.com/free
  free-bootcamp/index.html   -> free clone of cisspaccelerator.com/free-bootcamp
All share ../styles.css & ../script.js (root uses styles.css / script.js).
Content is identical across variants; only date/time/price/CTA differ.
"""
import os

VIMEO = "https://player.vimeo.com/video/1146180123?autoplay=1&muted=1&loop=1&title=0&byline=0&portrait=0"

# ---- shared content ----------------------------------------------------------
DAY1 = [
    ("CISSP Overview", " – What is CISSP, how the questions are scored, the endorsement process, and what it really takes to get certified."),
    ("Security Principles: CIA + More", " – Not just the CIA triad — we dive into the full security hexad and why it matters."),
    ("Foundational Security Terms", " – Get crystal clear on the basic language of CISSP so you’re never lost."),
    ("Security Controls", " – Understand the difference between control categories vs functionalities — because the exam will expect you to."),
    ("Types of Law", " – Civil, criminal, and administrative law — and how they show up in security decisions."),
    ("Intellectual Property Laws", " – Know your copyrights from your trademarks (yes, it’s testable)."),
    ("Security Program Documentation", " – Policy, guideline, standard, procedure — finally understand who uses what, when, and why."),
    ("Threat Modeling", " – Learn the what, why, and how of threat modeling."),
    ("Risk Assessment", " – We’ll go deep into this one. Qualitative vs. quantitative, risk handling techniques, and much more."),
    ("Live Q&amp;A + Quiz", " – Wrap up with clarity and confidence."),
]
DAY2 = [
    ("Recap of Day 1", " – Short and sharp review to reconnect all the dots."),
    ("Business Continuity &amp; Disaster Recovery (BCP/DR)", " – Deep-dive into all the steps of creating a BCP/DR plan and how one step leads to another, so you easily remember them for the exam."),
    ("Business Impact Analysis", " – Understand how BIA is conducted along with terms like MTD, RTO, and WRT made simple (and memorable)."),
    ("Contingency Strategies", " – Learn how systems bounce back from failure with concepts like MTBF, MTTR, MAAs, and how choosing the right backup method (incremental or differential) makes all the difference."),
    ("Database Recovery Techniques", " – Understand the pros, cons, and ideal use cases of electronic vaulting, remote journaling, and remote mirroring — so you’re not just guessing on the exam."),
    ("Personnel Security", " – What separation of duties, rotation, and mandatory vacations have to do with protecting systems."),
    ("Live Q&amp;A", " – Final opportunity to clear concepts and cement your foundation."),
]
TESTIMONIALS = [
    "I am very much pleased with the patience of the instructor. He explains the concepts in such detail that everyone understands. Today’s concepts of Encryption, Hash Functions and Digital Signatures are too good to learn. Thanks a lot again.",
    "Very good course today, instructor did a great job involving the class, including a good discussion on pros/cons of BYOD.",
    "The instructor gave the best explanation of Hash Functions that I have ever heard before. Very helpful.",
    "I wanted to express my deepest gratitude for the exceptional CISSP Domain 1 Bootcamp you conducted. The session was incredibly well-organized, insightful, and delivered with remarkable clarity. Your expertise and engaging teaching style made complex security concepts accessible, even for someone like me with a legal background.",
]
MENTOR = [
    "20+ years of experience in the cybersecurity and training industry.",
    "Have trained senior IT professionals in global MNCs such as Cisco, HCL, Cognizant, Wipro, E-Starta in countries including India, Dubai, Jordan.",
    "Known for breaking down complex topics into simple, practical insights.",
    "1st trainer to score 100% in Cisco’s GTAP (Global Talent Academy Program).",
]
WHY_POINTS = [
    "Gain a solid grasp of the most foundational CISSP domain (Domain 1: Security &amp; Risk Management).",
    "Learn how to study smart — not hard — with a structured and proven approach.",
    "Get expert guidance that removes the overwhelm and guesswork.",
]
WHY_CISSP = [
    "CISSP-certified professionals earn 25% more on average than non-certified peers.",
    "It’s ranked among the Top 10 highest-paying IT certifications globally.",
    "It’s recognized in over 160 countries, and often required for leadership roles.",
    "Whether you’re aiming for a promotion, relocation, or new role — CISSP opens doors.",
]
MISTAKES = [
    ("Jumping into random resources", "YouTube, PDFs, forums… without a plan, it just leads to wasted time and more confusion."),
    ("Ignoring the “why” behind the domains", "When you only memorize, you forget fast. True understanding lasts."),
    ("Studying alone with no feedback", "Without guidance, you don’t know what you don’t know. And mistakes go uncorrected."),
    ("Trying to “wing it” without a study plan", "CISSP is too broad for guesswork. You need structure."),
    ("Taking weekend-only classes with no follow-up", "Learning doesn’t stick without repetition and reinforcement."),
    ("No exam strategy", "You might know the content but still fail the test. Strategy is half the game."),
]
BONUS = [
    "CISSP Domain 1 Mind Map (in 3 different formats — pick what suits you)",
    "Practice Questions (PDF)",
    "Live Q&amp;A",
]
FAQ = [
    ("What&#39;s included?", "Live sessions, quizzes, downloadable study aids, live Q&amp;A every day, and a structured overview of Domain 1 with practical explanations."),
    ("How long is each session?", "Each session runs for around 2.5 hours. Over just 2 days (5 hours total), you’ll cover the most critical domain of CISSP, without feeling overwhelmed."),
    ("What kind of results should I expect?", "You’ll walk away with a solid understanding of CISSP Domain 1 (Security &amp; Risk Management), and greater clarity about how to approach the CISSP exam."),
    ("What if I don&#39;t like the session?", "You get a 100% Money-Back Guarantee — no questions asked."),
    ("Who do I email to get a refund?", "Drop an email to <a href=\"mailto:support@hemantsajwan.com\">support@hemantsajwan.com</a>."),
    ("Should I trust this?", "Hemant brings 20+ years of experience and has trained senior IT professionals at global MNCs, helping many aspirants move toward CISSP certification with clarity and confidence."),
    ("Will this work for me if I&#39;ve already tried other resources and got stuck?", "Yes. In fact, this bootcamp is designed exactly for people who are overwhelmed, confused, or unsure how to begin (or restart) their CISSP prep."),
    ("Will there be a recording?", "Yes, recordings will be available for limited-time replay, but attending live gives you the chance to ask questions directly."),
    ("Do I need prior CISSP knowledge?", "Nope. This is designed for beginners and early-stage aspirants."),
    ("Is this beginner-friendly?", "Yes! Everything is explained simply – even if you’re starting from scratch."),
    ("What if I can&#39;t attend all 2 days live?", "No worries! Each session is recorded and you’ll get access to the replays (for a limited time). But I highly recommend attending live if you can."),
]

# ---- variants ----------------------------------------------------------------
VARIANTS = {
    "index.html": {
        "asset": "", "title": "CISSP Accelerator – 2-Day Live Domain 1 Bootcamp | Hemant Sajwan",
        "date": "23rd &amp; 24th Sep 2026 (Wed-Thu)",
        "times": ["7:30 PM IST (Ind)"],
        "cta": 'Register Now for INR <s>2999</s> 97',
        "cta_sub": "(100% Risk Free. Full Refund if Not Satisfied.)",
        "reg": "#register",
    },
    "free/index.html": {
        "asset": "../", "title": "FREE CISSP Domain 1 Bootcamp (2-Day Live) | Hemant Sajwan",
        "date": "21st &amp; 22nd Sep 2026 (Mon-Tue)",
        "times": ["11 AM IST (Ind)", "3:30 PM AEST (Sydney)", "5:30 PM NZST (New Zealand)", "9:30 AM (UAE)"],
        "cta": 'Register Now for INR <s>2999</s> FREE',
        "cta_sub": "(2-Day Live CISSP Accelerator – Domain 1 Bootcamp)",
        "reg": "#register",
    },
    "free-bootcamp/index.html": {
        "asset": "../", "title": "FREE CISSP Domain 1 Bootcamp (2-Day Live) | Hemant Sajwan",
        "date": "23rd &amp; 24th Sep (Wed-Thu)",
        "times": ["7:30 PM IST (Ind)", "6 PM GST (UAE)"],
        "cta": 'Register Now for INR <s>2999</s> FREE',
        "cta_sub": "(2-Day Live CISSP Accelerator – Domain 1 Bootcamp)",
        "reg": "#register",
    },
}

def cta_btn(v, block=False):
    cls = "cta cta-block" if block else "cta"
    return ('<div class="cta-wrap">'
            f'<a href="{v["reg"]}" class="{cls}" data-register>{v["cta"]}</a>'
            f'<p class="cta-sub">{v["cta_sub"]}</p></div>')

def render(v):
    a = v["asset"]
    days = ""
    for badge, title, sub, items in [
        ("Day 1", "Getting the Foundation Right", "Risk, Privacy &amp; Documentation Demystified. Lay the groundwork for CISSP success by truly understanding the core principles most people skip.", DAY1),
        ("Day 2", "BCP, Recovery &amp; Pulling It All Together", "Turn confusing buzzwords into practical clarity — from risk and threat modeling to policies and privacy laws.", DAY2),
    ]:
        lis = "".join(f"<li><strong>{t}</strong>{d}</li>" for t, d in items)
        days += (f'<article class="day-card reveal"><span class="day-badge">{badge}</span>'
                 f'<h3>{title}</h3>'
                 f'<p class="day-sub">{sub}</p><ul class="day-list">{lis}</ul></article>')
    testis = ""
    for i, t in enumerate(TESTIMONIALS):
        wide = " testi-wide" if i == len(TESTIMONIALS) - 1 else ""
        testis += f'<figure class="testi reveal{wide}"><div class="stars">★★★★★</div><p>{t}</p></figure>'
    mentor_li = "".join(f"<li>{m}</li>" for m in MENTOR)
    why_li = "".join(f"<li>{w}</li>" for w in WHY_POINTS)
    whycissp_li = "".join(f"<li>{w}</li>" for w in WHY_CISSP)
    mistakes = "".join(
        f'<article class="mistake reveal"><span class="num">{i+1:02d}</span><h3>{t}</h3><p>{d}</p></article>'
        for i, (t, d) in enumerate(MISTAKES))
    bonus_li = "".join(f"<li>{b}</li>" for b in BONUS)
    faq = "".join(
        f'<details class="faq-item"><summary>{q}</summary><div class="ans"><p>{a2}</p></div></details>'
        for q, a2 in FAQ)
    times = "".join(f'<span class="v">{t}</span>' for t in v["times"])

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>{v['title']}</title>
<meta name="description" content="2-Day Live CISSP Accelerator – Domain 1 Bootcamp with Hemant Sajwan. Build a solid foundation in Security &amp; Risk Management and unlock your CISSP success path." />
<meta property="og:title" content="2-Day Live CISSP Accelerator – Domain 1 Bootcamp" />
<meta property="og:image" content="https://storage.files-vault.com/landing_pages/50524/c0788b22a4d80f772fb329e3f18c42be-c0788b22a4d80f772fb329e3f18c42be-profileLP.webp" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="{a}styles.css" />
<script>window.REGISTRATION_URL = {v['reg']!r};</script>
</head>
<body>

<!-- HERO -->
<header class="hero on-blue">
  <div class="container">
    <div class="hero-card reveal">
      <p class="presents">\U0001F510 Hemant Sajwan Presents</p>
      <p class="title">2-Day Live CISSP Accelerator – Domain 1 Bootcamp</p>
      <p class="tagline">2 days. 1 Domain. Done.</p>
    </div>
    <h1 class="hero-headline reveal">This isn&#39;t about <span class="gold-text">Domain 1</span>. It&#39;s about building momentum, developing real understanding, and unlocking your <span class="gold-text">CISSP success path</span>.</h1>
    <p class="hero-lead reveal">Whether you&#39;re looking to move up in your InfoSec career or transition into cybersecurity, this is the foundation you need to clear CISSP in under 6 months.</p>
    <p class="hero-mentor reveal"><strong>Hemant Sajwan</strong> · Information Security Executive · CISSP Mentor</p>

    <!-- VIDEO (right after hero, same as original) -->
    <div class="video-wrap reveal">
      <div class="video-frame">
        <iframe src="{VIMEO}" title="CISSP Accelerator intro video"
          allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>
      </div>
    </div>

    <!-- EVENT + CTA -->
    <div class="event-row reveal">
      <div class="event-info">
        <span class="ev-label">Date – 2 Day Live Workshop!</span>
        <span class="ev-date">{v['date']}</span>
        <span>2.5 hours each day</span>
        <div class="event-block"><span class="k">Time</span><br />{times}</div>
        <div class="event-block"><span class="k">Mode</span><br /><span class="v">Zoom Live (English)</span></div>
      </div>
      <div class="event-cta">{cta_btn(v, block=True)}</div>
    </div>
  </div>
</header>

<!-- FOUNDATION -->
<section class="section on-light">
  <div class="container">
    <div class="foundation reveal">
      <h2>Domain 1 is not just the first CISSP domain — it&#39;s the foundation for the other 7.</h2>
      <p>If you don&#39;t get this part right, everything else becomes harder. This bootcamp helps you build the right mindset, understand key principles, and avoid the burnout that comes from trying to do it all on your own.</p>
      <p>Get this right, and you&#39;ll move through the rest of your CISSP prep with confidence.</p>
      <p class="mini-quote">“The session was very informative and useful.”</p>
    </div>
  </div>
</section>

<!-- WHAT YOU'LL DISCOVER -->
<section class="section on-light" id="curriculum" style="padding-top:0">
  <div class="container">
    <div class="sec-head reveal"><span class="emoji-tag">\U0001F513</span><h2>What You&#39;ll Discover in 2 Days</h2>
      <p>This bootcamp isn&#39;t about dumping information — it&#39;s about helping you truly grasp the concepts, connect the dots, and build lasting understanding of CISSP Domain 1 (Security &amp; Risk Management) instead of relying on rote memorization.</p></div>
    <div class="days">{days}</div>
    <p class="after-days reveal">You&#39;ll walk away with a solid foundation, a ton of clarity, and the confidence that you&#39;re finally on the right path.</p>
  </div>
</section>

<!-- CTA BAND -->
<section class="section on-blue"><div class="container">{cta_btn(v)}</div></section>

<!-- TESTIMONIALS -->
<section class="section on-light" id="testimonials">
  <div class="container">
    <div class="sec-head reveal"><h2>What Past Participants Are Saying</h2></div>
    <div class="testis">{testis}</div>
  </div>
</section>

<!-- MENTOR -->
<section class="section on-blue" id="mentor">
  <div class="container mentor">
    <div class="reveal"><img src="https://storage.files-vault.com/landing_pages/50524/053a0ace3dca0894d2e4a178dc631d80-053a0ace3dca0894d2e4a178dc631d80-aboutus.webp" alt="Hemant Sajwan, CISSP Mentor" loading="lazy" width="520" height="560" /></div>
    <div class="reveal">
      <span class="emoji-tag">\U0001F44B</span>
      <h2>Meet Your Mentor – Hemant Sajwan</h2>
      <p class="intro">Hi, I&#39;m Hemant — an Information Security Executive and CISSP Mentor.</p>
      <ul class="check-list">{mentor_li}</ul>
      <p class="tagline">Start smart. Build confidence. Lay the groundwork for CISSP success — minus the fluff.</p>
    </div>
  </div>
</section>

<!-- WHY THIS BOOTCAMP -->
<section class="section on-light" id="why">
  <div class="container">
    <div class="sec-head reveal"><span class="emoji-tag">⚡</span><h2>Why This Bootcamp Matters</h2></div>
    <p class="why-intro reveal">Preparing for the CISSP can feel like navigating a maze — hundreds of pages, dozens of resources, and a constant fear of not doing it &quot;right.&quot; This 2-day bootcamp is your reset button. Instead of second-guessing your every step, you&#39;ll:</p>
    <ul class="why-points reveal">{why_li}</ul>
    <div class="why-cissp reveal">
      <h3>But let&#39;s zoom out for a second — why CISSP?</h3>
      <ul>{whycissp_li}</ul>
    </div>
    <p class="why-foot reveal">This bootcamp helps you take the first (and most important) step with clarity, structure, and zero fluff.</p>
  </div>
</section>

<!-- CTA BAND -->
<section class="section on-blue"><div class="container">{cta_btn(v)}</div></section>

<!-- MISTAKES -->
<section class="section on-light" id="mistakes">
  <div class="container">
    <div class="sec-head reveal"><span class="emoji-tag">❌</span><h2>Don&#39;t Make These 6 Mistakes</h2>
      <p>Most CISSP aspirants don&#39;t fail because they&#39;re not smart — they fail because they fall into one (or more) of these traps:</p></div>
    <div class="mistakes">{mistakes}</div>
    <p class="mistakes-foot reveal">\U0001F6AB These mistakes cost people time, money, and confidence, as well as career growth. This bootcamp is designed to help you avoid them all for the most foundational domain of CISSP (Domain 1: Security and Risk Management) — in just 2 days!</p>
  </div>
</section>

<!-- BONUS -->
<section class="section on-blue" id="bonus">
  <div class="container">
    <div class="bonus-card reveal">
      <span class="emoji-tag">\U0001F534</span>
      <h2>BONUS WHEN YOU ATTEND LIVE</h2>
      <ul class="bonus-list">{bonus_li}</ul>
      <p class="bonus-note">You don&#39;t need more resources. You need clarity, structure, and someone who&#39;s walked the path before. I&#39;ll help you start strong — all you have to do is show up.</p>
    </div>
  </div>
</section>

<!-- FINAL CTA -->
<section class="section on-blue final" id="register">
  <div class="container">
    <h2 class="reveal">MOVE TOWARDS YOUR DREAM NOW</h2>
    <div class="final-cta-wrap reveal">{cta_btn(v)}</div>
  </div>
</section>

<!-- FAQ -->
<section class="section on-light" id="faq">
  <div class="container container-narrow">
    <div class="sec-head reveal"><h2>Frequently Asked Questions</h2></div>
    <div class="faq-list reveal">{faq}</div>
  </div>
</section>

<!-- FOOTER -->
<footer class="footer">
  <div class="container">
    <p class="disclaimer">This site is not part of the Google website or Google Inc., or the Facebook website or Facebook Inc. This site is not endorsed by Google Inc. or Facebook Inc. in any way.</p>
    <p class="copy">Copyright © <span id="year"></span> CISSP Accelerator. All Rights Reserved.</p>
  </div>
</footer>

<script src="{a}script.js"></script>
</body>
</html>
"""

def main():
    here = os.path.dirname(os.path.abspath(__file__))
    for path, v in VARIANTS.items():
        full = os.path.join(here, path)
        os.makedirs(os.path.dirname(full) or here, exist_ok=True)
        with open(full, "w", encoding="utf-8") as f:
            f.write(render(v))
        print("wrote", path)

if __name__ == "__main__":
    main()
