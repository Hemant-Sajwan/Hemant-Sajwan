/**
 * CISSP Accelerator – reminder & follow-up emails (wording only)
 * ------------------------------------------------------------------
 * Paste this whole file into a SECOND script file in the same Apps Script project:
 *   Apps Script editor → "+" next to Files → Script → name it "emails" → paste → Save.
 *
 * You can edit the wording here any time. Rules:
 *   - A blank line starts a new paragraph.
 *   - Lines starting with "- " become a bullet list.
 *   - **text** is bold.  [text](link) is a link, e.g. [Book a call]({booking_link})
 *   - {first_name} {dates} {time} {join_link} {replay_link_day1} {replay_link_day2} {booking_link}
 *     are filled in for each person (dates, time and links come from the Settings tab).
 *   - Promotional emails (promo: true) get an "unsubscribe" line automatically, and are
 *     NOT sent to people who unsubscribed. Reminders and replays always go out.
 *
 * WHEN each email goes out:
 *   anchor "registration" = after the person registered, "day1" / "day2" = the session start time.
 *   minutes: negative = before, positive = after.  (1 hour = 60, 1 day = 1440)
 * Email 1 is the confirmation, sent straight away by registrations.gs. Emails 2–20 are below.
 */
var EMAILS = [
  {
    id: 2, anchor: "registration", minutes: 60, promo: true,
    subject: "CISSP Domain 1 Bootcamp: Quick Question Before We Begin...",
    body: `Hi {first_name},

Thank you for registering for my upcoming CISSP Accelerator - Domain 1 Bootcamp. I’m really looking forward to helping you simplify and master this critical domain.

Now, before we kick things off, I’d love to get to know you a little better, so I can tailor the sessions to help you get the most out of them.

I’d love to know a little more about where you are right now in your CISSP journey. It’ll help me make the bootcamp even more useful for you.

**Just hit Reply and tell me:**

**1️⃣ Where are you in your CISSP prep?** For example:

- Haven’t started yet
- Just started
- Studying regularly
- Already booked the exam

**2️⃣ When are you aiming to take the exam?** For example:

- Within 3 months
- Within 6 months
- Just exploring for now

**3️⃣ What’s been your biggest struggle so far?**

Whether you’re just getting started or already deep in prep, this bootcamp will meet you where you are.

Looking forward to hearing from you!

- Hemant`
  },
  {
    id: 3, anchor: "day1", minutes: -4 * 1440, promo: true,
    subject: "You made a smart move. Here's why..",
    body: `Hi {first_name},

Just a quick note to congratulate you. By registering for the CISSP Accelerator – Domain 1 Bootcamp, you’ve already taken a **powerful step forward in your cybersecurity career.**

**Here’s why it matters:**

- The average salary for CISSP holders globally is about **US $119,577.**
- In the Asia-Pacific region, CISSP certified professionals earn around **US $70,898** on average.
- CISSP remains among the **top three highest-paying IT certifications** worldwide.
- Demand is high: there’s a global shortage of **more than 3 million cybersecurity professionals**, making that certification a clear competitive edge.

**What this means for you:**

Your decision to invest time and focus will pay off. CISSP isn’t just another certification. It signals senior-level knowledge, leadership capability, and readiness for roles that offer higher responsibility and stronger compensation.

And with our 2-Day Bootcamp, you’re lining up the foundation you need to move confidently in that direction:

- I’ll simplify Domain 1, the cornerstone of the CISSP exam.
- You’ll build understanding (not just memorise), so you’re ready for all 8 domains later.
- You’ll boost your confidence and prep momentum.

**So yes, you made the right move.**

Stay excited, stay committed, and get ready to make this bootcamp count.

Any questions? Hit “reply” and let me know.

See you soon,

Hemant`
  },
  {
    id: 4, anchor: "day1", minutes: -3 * 1440, promo: true,
    subject: "Thinking about CISSP but not sure where to start?",
    body: `Hi {first_name},

If you’ve been hearing about CISSP and wondering what it really is, or whether it’s the right next step for you, this will help.

CISSP (Certified Information Systems Security Professional) isn’t just another exam. It’s the **gold standard certification in information security**, recognized globally and often a must-have for senior roles like Security Manager, Architect, or even CISO.

But here’s the catch: the CISSP covers 8 domains, each packed with concepts from risk to governance to cryptography to software testing.

It’s a broad and concept-heavy exam, and that’s where most people struggle.

That’s exactly why I’m hosting the CISSP Accelerator - Domain 1 Bootcamp. To help you **build the right foundation** before you dive into the full CISSP journey.

Over 2 days, we’ll cover CISSP's Domain 1 (Security and Risk Management) in simple, practical terms so you **actually understand the concepts, not just memorize them.**

Whether you’re just starting out, or you’ve already started, this bootcamp is the perfect way to set out on your CISSP prep confidently.

If you have any questions related to CISSP, just hit “reply” and let me know. I’ll be happy to address your queries or concerns.

See you inside,

Hemant`
  },
  {
    id: 5, anchor: "day1", minutes: -2 * 1440, promo: true,
    subject: "The most important domain in your CISSP prep",
    body: `Hi {first_name},

Ever seen a house being built?

They don’t start with the walls or the paint. **They start with the foundation.**

That’s exactly what Domain 1 is for your CISSP prep.

CISSP syllabus has got 8 domains, and the first domain i.e. Domain 1 is the base that supports everything else - from risk management to security policies, frameworks, and governance.

If this foundation is weak, everything that comes after it, such as access control, cryptography, SDLC, starts feeling confusing and disconnected.

But once you get Domain 1 right, the rest of the domains start making sense automatically.

And not just that, Domain 1 is also the most critical of the 8 domains - because it **holds the maximum weightage (16%)** among all the domains. So, if your Domain 1 is not solid, your chances of clearing the CISSP exam go really low.

That’s why this bootcamp focuses on Domain 1. To help you truly understand the “why” behind security, not just the “what”, and increase your chances of clearing the CISSP exam.

We’ll go deep into it inside the bootcamp, and you’ll see how this one domain can transform the way you approach CISSP.

I’m looking forward to it. Hope you’re too.

In case you have any questions, let me know.

See you inside,

Hemant`
  },
  {
    id: 6, anchor: "day1", minutes: -1440,
    subject: "[1 Day to Go] CISSP Domain 1 Bootcamp starts tomorrow",
    body: `Hi {first_name},

Day 1 of our 2-Day CISSP Accelerator - Domain 1 Bootcamp **kicks off tomorrow**, and we’re about to lay the rock-solid foundation your CISSP prep needs.

This session is all about cutting through the fluff and finally understanding the core principles that most candidates skim through (and regret later).

**Schedule:**
Dates: **{dates}**
Time: **{time}**
Duration: Approx. 2 hours/day
Meeting Link: {join_link}

One quick heads-up: You may see an earlier start time on the registration page. That's simply because the webinar room opens a few minutes before the training starts. The actual bootcamp begins at **{time}**, so that's the time to be ready.

**Here’s what you’ll discover:**

- **CISSP Overview:** What the certification really entails: scoring, endorsement, mindset, and more
- **Security Principles (CIA + Hexad):** Going beyond the CIA basics, we dive into the full security hexad
- **Foundational Security Terms:** Get fluent in the language of CISSP
- **Security Controls:** Learn to distinguish categories vs. functionalities
- **Intellectual Property:** Yes, you’ll need to know the difference between copyrights and trademarks
- **Threat Modeling:** Attack tree, reduction analysis
- **Risk Assessment:** How to perform it, quantitative vs qualitative risk analysis, and methods to handle risk
- **Quiz:** Reinforce your learning with clarity

See you there,

Hemant`
  },
  {
    id: 7, anchor: "day1", minutes: -7 * 60,
    subject: "[Day 1 Has Arrived] CISSP Accelerator Bootcamp Starts Today!",
    body: `Hi {first_name},

Day 1 of our 2-Day CISSP Accelerator - Domain 1 Bootcamp **kicks off today**, and we’re about to lay the rock-solid foundation your CISSP prep needs.

This session is all about cutting through the fluff and finally understanding the core principles that most candidates skim through (and regret later).

**Schedule:**
Dates: **{dates}**
Time: **{time}**
Duration: Approx. 2 hours/day
Meeting Link: {join_link}

One quick heads-up: You may see an earlier start time on the registration page. That's simply because the webinar room opens a few minutes before the training starts. The actual bootcamp begins at **{time}**, so that's the time to be ready.

**Here’s what you’ll discover:**

- **CISSP Overview:** What the certification really entails: scoring, endorsement, mindset, and more
- **Security Principles (CIA + Hexad):** Going beyond the CIA basics, we dive into the full security hexad
- **Foundational Security Terms:** Get fluent in the language of CISSP
- **Security Controls:** Learn to distinguish categories vs. functionalities
- **Intellectual Property:** Yes, you’ll need to know the difference between copyrights and trademarks
- **Threat Modeling:** Attack tree, reduction analysis
- **Risk Assessment:** How to perform it, quantitative vs qualitative risk analysis, and methods to handle risk
- **Quiz:** Reinforce your learning with clarity

See you there,

Hemant`
  },
  {
    id: 8, anchor: "day1", minutes: -3 * 60,
    subject: "[3 Hrs To Go] CISSP Accelerator - Domain 1 Bootcamp",
    body: `Hi {first_name},

This is a reminder for your 2-Day CISSP Bootcamp.

**Day 1 of the bootcamp starts in 3 hours.**

**Workshop Details:**
📅 Dates: **{dates}**
🕒 Time: **{time}**
⏱️ Duration: Approx. 2 hours/day
🔗 Meeting Link: {join_link}

(The above link is a registration link. When you register, you'll receive your unique join link on your email.)

---

One quick heads-up: You may see an earlier start time on the registration page. That's simply because the webinar room opens a few minutes before the training starts. The actual bootcamp begins at **{time}**, so that's the time to be ready.

---

**🔓 What You’ll Discover Over 2 Days:**
✅ CISSP overview, security principles, and foundational terms
✅ CISSP Domain 1 coverage
✅ Real clarity on risk, privacy laws, intellectual property laws and security documentation
✅ Mastery of BCP, disaster recovery, and backup strategies
✅ Deep understanding of risk analysis, its approaches, methodologies and handling techniques
✅ Quiz + Q&As to cement your learning

Regards,

Hemant`
  },
  {
    id: 9, anchor: "day1", minutes: -60,
    subject: "[1 Hr To Go] CISSP Accelerator - Domain 1 Bootcamp",
    body: `Hi {first_name},

The wait is almost over. The 2-Day CISSP Accelerator - Domain 1 Bootcamp **kicks off in an hour.**

**Here’s what you can expect over the next 2 days:**
✅ **Clarity on CISSP Exam Structure** - no more confusion about what matters most
✅ **Deep Dive into Domain 1 Concepts** - explained in simple, real-world terms
✅ **Interactive Learning** - examples, scenarios, and Q&A so nothing feels vague
✅ **Solid Foundation** - you’ll walk away with confidence to tackle this critical domain

Dates: **{dates}**
Time: **{time}**
Duration: Approx. 2 hours/day
Meeting Link: {join_link}

One quick heads-up: You may see an earlier start time on the registration page. That's simply because the webinar room opens a few minutes before the training starts. The actual bootcamp begins at **{time}**, so that's the time to be ready.

See you there,

Hemant`
  },
  {
    id: 10, anchor: "day1", minutes: -15,
    subject: "[Going Live in 15 mins..Join NOW] CISSP Accelerator - Domain 1 Bootcamp",
    body: `Hi {first_name},

The wait is almost over. The 2-Day CISSP Accelerator - Domain 1 Bootcamp kicks off in 15 minutes. **Join NOW!**

**Joining Details:**
Dates: **{dates}**
Time: **{time}**
Duration: Approx. 2 hours/day
Meeting Link: {join_link}

See you there,

Hemant`
  },
  {
    id: 11, anchor: "day1", minutes: 4 * 60, needs: ["replay_link_day1"],
    subject: "Day 1 Recap, Homework & What’s Next in CISSP Bootcamp",
    body: `Hi {first_name},

**Day 1 of the CISSP Domain 1 Bootcamp is officially done - and what a great start!**

Thanks again for showing up and staying engaged. I hope you found today’s session both practical and energizing.

**Here’s What We Covered Today:**
We laid the foundation - and it’s a strong one. Here’s a quick recap of the key topics:

- **Security Principles** – The CIA triad, DAD triad, Parkerian Hexad
- **Foundational Terms** – Understanding assets, threats, vulnerabilities, and risk
- **Types of Security Controls** – Categories vs Functionalities
- **Intellectual Property** – Copyrights, patents, trademarks, trade secrets (CTPT..remember?)
- **Security Program Documentation** – What policies, standards, procedures, and guidelines actually mean
- **Threat Modeling** – Attack tree, reduction analysis and more
- **Risk Assessment** – Steps involved, Qualitative vs. quantitative, risk handling

We also did a Q&A and wrapped up with a short quiz.

If you missed it, here's the replay:

**[▶ Day 1 Replay]({replay_link_day1})**

**Your Homework**
Answer these from memory (and then check your notes or book!):

1. What’s the difference between authentication and authenticity?
2. What 3 new elements are added in the Parkerian Hexad besides the CIA triad?
3. What 2 components make up risk?
4. What are the different control functionalities?
5. What’s the primary purpose of a patent?

**What’s Coming Up on Day 2:**

- Quick Recap of Day 1
- **BCP/DR:** Learn how to keep the business running even when disaster strikes (This is BIG. So, **DO NOT MISS it**)
- **Personnel Security:** Separation of duties, mandatory vacation etc.
- **Security Governance:** ISO 27004 vs NIST 800-55

Trust me, these are high-value topics, and CISSP loves testing them.

Plus.. I'll also be sharing **the entire mind map for Domain 1** that I have used for this bootcamp, along with a **100 practice questions PDF** which you can use to test your preparedness.

**Want to Fast-Track Your CISSP Journey?**
I’ll be sharing something special at the end of tomorrow’s session - an invite to my full CISSP Accelerator Program. If you’ve been looking for structure, support, and a guaranteed plan, don’t miss this.

Can’t wait, or won't be able to attend? [Book a 1:1 call with me directly here]({booking_link}).

Let’s keep the momentum going. I’ll see you tomorrow, same time as today, sharp.

Cheers,

Hemant

P.S: If you found the bootcamp helpful so far, I’d love for you to share your experience with me. Your feedback matters a lot. If something stood out to you or if you have suggestions, reply back and share. It helps me shape the bootcamp to serve you better.

And let's connect on [LinkedIn](https://www.linkedin.com/in/hemantsajwan)!`
  },
  {
    id: 12, anchor: "day2", minutes: -7 * 60,
    subject: "Here's what we're covering today: Day 2 of CISSP Domain 1 Bootcamp",
    body: `Hi {first_name},

Just a quick reminder - **today is Day 2 of the CISSP Domain 1 Bootcamp.** And this one is going to be big.

Yesterday, we laid the foundation with key concepts of Security and Risk Management, and today we’re going deeper into the real-world side of things that every CISSP must understand.

**We’ll talk about:**
✅ BCP/DR
✅ Security Governance
✅ Personnel Security

But that’s not all. I’ll also be sharing something special today:

- A roadmap for what to do after Domain 1
- A look into how you can continue your CISSP journey with structured guidance and mentorship (through my CISSP Accelerator Program)
- Plus, your **bonus Domain 1 Mind Map and 100 Practice Questions PDF** - both shared at the end of the session

If you attended Day 1, you already know how practical this bootcamp is, and today's session will show you how to keep that momentum going without falling into the “self-study struggle” that slows most people down.

**Here are your session details for Day 2 of the bootcamp:**
Date: **{dates}**
Time: **{time}**
Meeting Link: {join_link}

(The registration page shows a slightly earlier time. That's because that's when the doors open, but the actual teaching starts at {time}.)

I’ll be doing a quick recap before we jump in.

Can’t wait to see you there!

Best,

Hemant`
  },
  {
    id: 13, anchor: "day2", minutes: -3 * 60,
    subject: "[3 hours to go] Day 2: CISSP Domain 1 Bootcamp",
    body: `Hi {first_name},

We’re on Day 2 of the CISSP Domain 1 Bootcamp - and today is going to be a powerful session.

**Here’s what we’ll cover today:**

- **Business Continuity & Disaster Recovery (BCP/DR):** how to build resilient systems and ace these high-weightage exam questions.
- **Security Governance:** how to know how effective your security program is.
- **Personnel Security:** separation of duties, rotation of duties, mandatory vacation etc.

Among the above topics, BCP/DR is one topic that many aspirants struggle with as it's not just one topic - rather, it's one BIG topic with SEVERAL sub-topics WITHIN it, and today I’ll simplify them for you so you’re crystal clear.

**Make sure you join because towards the end..**

- I'll be giving away the **Domain 1 Mind Map** that I've been using during this bootcamp.
- Plus, I’ll also be sharing the details of my **CISSP Accelerator Program** - the complete program that takes you from “just starting out” to “CISSP-ready with confidence.”

**Here's how to join:**
Date: **{dates}**
Time: **{time}**
Duration: Approx 2 hours/day
Meeting Link: {join_link}

Please register now, so you can reach out to me in advance in case you face any issues.

The registration page shows a slightly earlier time. That's because that's when the doors open for you to connect, but the actual teaching starts at **{time}**.

See you inside. Let’s finish strong today!

Best,

Hemant`
  },
  {
    id: 14, anchor: "day2", minutes: -60,
    subject: "[1 hour to go] Day 2: CISSP Domain 1 Bootcamp",
    body: `Hi {first_name},

The wait is almost over. The 2-Day CISSP Accelerator - Domain 1 Bootcamp **kicks off in an hour.**

**Joining Details:**
Date: **{dates}**
Time: **{time}**
Duration: Approx 2 hours/day
Meeting Link: {join_link}

The registration page shows a slightly earlier time. That's because that's when the doors open for you to log in, but the actual teaching starts at **{time}**.

Please register now, so you can reach out to me in advance in case you face any issues.

See you there,

Hemant`
  },
  {
    id: 15, anchor: "day2", minutes: -15,
    subject: "[Going Live in 15 mins..Join Now] CISSP Accelerator - Domain 1 Bootcamp",
    body: `Hi {first_name},

The wait is almost over. The 2-Day CISSP Accelerator - Domain 1 Bootcamp kicks off in 15 minutes. **Join NOW!**

**Joining Details:**
Date: **{dates}**
Time: **{time}**
Duration: Approx 2 hours/day
Meeting Link: {join_link}

See you there,

Hemant`
  },
  {
    id: 16, anchor: "day2", minutes: 4 * 60, needs: ["replay_link_day1", "replay_link_day2"],
    subject: "CISSP Bootcamp Day 2: Replay + What’s Next",
    body: `Hi {first_name},

**And just like that… our 2-day CISSP Domain 1 Bootcamp has officially wrapped up!**

It’s been an incredible experience connecting with all of you over the last two days, and I truly hope it gave you the clarity and confidence you needed to move forward in your CISSP journey.

**Here’s what we covered on Day 2:**

- **BCP vs DR** – Understanding the difference and why both matter
- **Business Impact Analysis** – MTD, RTO, WRT made simple
- **Contingency Strategies** – Backup types, MTBF, MTTR, and more
- **Database Recovery Techniques** – Electronic vaulting, remote journaling, mirroring
- And many more topics.

If you missed it (or want to review), you have the replays below:

**[▶ Day 1 Replay]({replay_link_day1})**
**[▶ Day 2 Replay]({replay_link_day2})**

**Interested in Going Beyond Just Domain 1?**
At the end of today’s session, I shared details about my CISSP Accelerator Program - a complete, structured coaching program to help you clear the CISSP exam with guidance, accountability, and support every step of the way.

If you missed that part and would like to learn more (I also gave away some exclusive bonuses for the bootcampers), feel free to [book a 1:1 call with me here]({booking_link}).

Once again, thank you for showing up, participating, and making this bootcamp such a success.

If there’s ever anything I can do to support your CISSP prep, just hit reply. I’m just one message away.

All the best,

Hemant`
  },
  {
    id: 17, anchor: "day2", minutes: 15 * 60,
    subject: "Quick Favor — Just need your 2 mins, please!",
    body: `Hi {first_name},

Thank you again for joining the CISSP Accelerator - Domain 1 Bootcamp. I hope it gave you clarity and a strong foundation for your CISSP journey.

I’d really appreciate it if you could take **2–3 minutes to share your feedback.** Your thoughts will help me improve future sessions and guide others who are considering joining.

**👉 [Click here for the feedback link](https://forms.gle/eYXeZAdro39YZFSy9)**

Feel free to write as much or as little as you like. I read every single response personally.

Thanks in advance!

Warm regards,

Hemant`
  },
  {
    id: 18, anchor: "day2", minutes: 17 * 60, promo: true,
    subject: "What comes AFTER Domain 1?",
    body: `Hi {first_name},

Let’s be real for a moment.

You’ve completed Domain 1 (assuming you didn't just register, but actually attended the bootcamp, which shows you are indeed serious about becoming a CISSP). That’s a great start - but it’s just the beginning.

**What happens next is what separates those who wish to clear CISSP from those who actually do.**

And here’s what I’ve seen over and over again:

- People get stuck after Domain 1
- They lose momentum when Domain 3 hits
- Life gets in the way - vacations, projects, travel
- Weeks turn into months… and eventually, they quit or restart from scratch

Why does this happen?
Because most people try to self-study without a clear roadmap. No structure. No accountability. No real support. Just hope.

If that sounds familiar - you’re not alone. **But it is fixable.**

That’s exactly why I created the **CISSP Accelerator Program:**
A complete, structured system to take you from where you are today… to CISSP-certified in the next few months.

✅ Live domain classes
✅ Weekly doubt-clearing sessions
✅ Mind maps, topic-wise practice questions
✅ Private community for support and momentum
✅ And direct access to me throughout your journey

But before I say anything else, I want to speak with you personally.

Let’s have a quick 1:1 conversation. I’ll understand where you are in your journey, share what the program offers, and help you decide if it’s the right fit.

No fluff. No pressure.

**👉 [Click here to book a call]({booking_link})**

If CISSP is something you actually want to clear, don’t let Domain 1 be the end of the story.

Best,

Hemant`
  },
  {
    id: 19, anchor: "day2", minutes: 41 * 60, promo: true,
    subject: "Speed. Structure. Support. Or the long road alone.",
    body: `Hi {first_name},

At this point, you’ve got two options when it comes to preparing for CISSP.

**Option 1:**
You keep trying to do it all yourself.
Read the big fat books.
Watch random YouTube videos.
Piece together your study plan.
Hope you’re ready by the time the exam comes.

It’s not impossible. Many try it.

But here’s what happens most of the time:

- Inconsistent progress
- Doubts that pile up
- No one to ask
- No clue if you're really ready
- You end up spinning in circles, burning time - and confidence.

**Now here’s Option 2:**

- You follow a proven roadmap.
- You get structure.
- You get support.
- You move faster.
- You stay consistent.
- Your doubts don’t pile up - they get cleared every week.
- You stay motivated because you're part of a community that’s moving forward with you.
- And when exam day comes… you know you’re ready.

This second option? **That’s what the CISSP Accelerator Program is all about.**

If you value speed, structure, and support - this is built for you.

Let’s talk 1-on-1. I’ll walk you through exactly how it works and help you decide if it’s the right fit for you.

**👉 [Click here to book a call]({booking_link})**

You don’t need more information.
You need a decision.
One path is uncertain.
The other is guided - and it leads to results.

**Which one will you take?**

- Hemant`
  },
  {
    id: 20, anchor: "day2", minutes: 65 * 60, promo: true,
    subject: "If you’re still on the fence, read this.",
    body: `Hi {first_name},

You already know the truth:

**The longer you wait, the harder it gets.**

Not because the material changes.

But because life gets in the way.
Work deadlines.
Family responsibilities.
Fatigue.

And the longer you’re away from it, the more confidence slips through your fingers.

That’s why I created the CISSP Accelerator Program - to give professionals like you a structure that works with real life, not against it.

Your next step is simple:

**👉 [Book a 1-on-1 call with me by clicking here]({booking_link})**

Let’s talk about your journey and see if this program is the right fit.

It’s your move now.

If you still have doubts, I’m guessing it’s NOT because you’re not serious about CISSP.

It’s probably because you’re worried about making a bad decision.

And you know what? That’s fair.

But let’s get real for a minute.

Let’s say you join the CISSP Accelerator Program… and you hate it.

Let’s say it’s the worst program you’ve ever enrolled in.

It’s unhelpful, it’s not what you expected, and it just doesn’t click.

That’s the worst case, right?

Now imagine that happens. Here’s exactly what you do:

Just drop me an email at support@hemantsajwan.com within 14 days of joining.

**And you’ll get 100% of your money back.**

It’ll be like it never even happened.

But let’s flip the script for a second…

What if this actually works?

What if 6 months from now, you’ve passed your CISSP?

What if the fog clears, and you finally feel in control of your study?

What if this is the turning point?

It’s happened for others. It can happen for you too.

And honestly… isn’t that at least worth trying?

You’re not locked in. You’re not taking a leap of faith.

The worst that can happen? You click “refund.”

The best that can happen? You become a CISSP and level up your entire career.

So why wait?

**👉 [Book a 1:1 call with me by clicking here]({booking_link})**

Let’s talk it through, and if it’s the right fit - we get started.

– Hemant`
  }
];
