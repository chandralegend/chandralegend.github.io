---
title: "Synthetic users are not users: what Pew's AI polling test means for your evals"
description: "Pew asked an AI model to answer nearly 300 survey questions as real people would. It missed by 12 points on average and erased most of the disagreement. If you test your product with simulated users, the same thing is probably happening to you."
date: 2026-10-07
tags: [evals, reliability, llm]
draft: false
---

On 30 September, Pew Research Center published a [set of studies](https://www.pewresearch.org/data-labs/2026/09/30/can-ai-stand-in-for-human-survey-takers-not-really/) asking a simple question: can an AI model stand in for real people in a survey?

The answer, in their words, is that AI polling "is not a replacement for rigorously surveying real humans."

The setup was careful. Pew took real members of its American Trends Panel, gave the model each person's demographics and their answers to an earlier political typology survey, and asked it to answer nearly 300 questions as that person. Then it compared the synthetic answers with what the same people actually said. The main model was Claude Opus 4.6, with GPT-5.1 as a comparison.

The average miss was 12.4 percentage points. On about 28% of questions it was off by more than 15.

I'm not a pollster, and this post isn't really about polling. It's about a habit that's spreading fast in AI teams: using an LLM to pretend to be your users, and then trusting what it tells you.

## What Pew found

The headline number is the least interesting part. The way the model was wrong matters more.

**It removed disagreement.** In [the diversity report](https://www.pewresearch.org/data-labs/2026/09/30/how-well-synthetic-polls-capture-the-diversity-of-public-opinion/), 47% of questions in the synthetic poll had at least one answer option that no synthetic respondent picked. In the human surveys, that never happened. 66% of synthetic questions had an option chosen by fewer than 1% of respondents, against 1% for humans. Asked how often they had trouble falling asleep, 98% of synthetic people said "some days" or "rarely". Real people say "every day" and "never" too.

**It was confident and well informed when people aren't.** The synthetic respondents were about four times less likely to pick "not sure". On a First Amendment knowledge question, 98% of them got it right. 52% of the real people did.

**It stereotyped.** The model predicted 97% of Hispanic adults follow the World Cup. The real figure was 43%.

**It didn't know what it didn't know.** The model's knowledge cutoff was May 2025. On [questions about recent events](https://www.pewresearch.org/data-labs/2026/09/30/synthetic-surveys-and-timely-and-topical-questions/), it was much worse. 94% of synthetic respondents said they had heard at least a little about data centers. 49% of real people had. 23% were worried about electricity costs, against 52% of real Americans.

**The answers depended on which model you asked.** Pew reports that GPT-5.1 gave more extreme opinions and Claude leaned towards the middle. Same people, same questions, different "public".

## Why this is an AI engineering problem, not just a polling one

A lot of teams building agents and chatbots now test them with simulated users. You write a few personas, let one model play the customer, let your agent respond, and score the conversations. Some teams go further and use the same trick for product research: "ask 500 synthetic customers what they think of this pricing page".

I think simulated users are useful. I also think Pew just gave us a clear picture of how they fail, and every failure maps onto testing.

| What Pew saw | What it looks like in your eval |
|---|---|
| Disagreement collapses to the middle | Simulated users are polite, clear, and ask one thing at a time |
| Few "not sure" answers | Simulated users rarely get confused, change their mind, or go quiet |
| Knows facts real people don't | Simulated users use your product's vocabulary correctly |
| Stereotypes from demographics | Persona labels turn into clichés, not behaviour |
| Blind after the cutoff | Simulated users don't know about your new feature, price or policy |
| Depends on the model | Your pass rate changes when you swap the simulator, not the agent |

The common thread: an LLM gives you the most plausible user. Real users aren't the most plausible user. They're spread out, and the bugs live in the tails.

Think about a booking assistant. The synthetic customer writes "Hi, I'd like to book a court for tomorrow at 7pm, please." The real one writes "any court tmrw 7", then sends a voice note, then asks about the price in a different language, then disappears for two hours. An agent that passes 98% on the first kind of user can still fail most of the second.

So the risk isn't that synthetic testing is useless. It's that it produces a number that looks like a measurement of real behaviour, and isn't one.

## What I'd do about it

None of this needs new tooling. It needs a different view of what the simulator is for.

**Use simulated users for coverage, not for estimates.** They're good at generating many paths through a flow and catching regressions when you change a prompt. They're bad at telling you what share of real users will hit a problem. Don't report a synthetic pass rate as if it were a user success rate.

**Write the tails into the personas on purpose.** If the model won't produce confused, terse, rude or off-topic users on its own, ask for them explicitly. Give personas concrete behaviour ("replies with one word", "changes the date twice", "mixes Sinhala and English"), not just demographics. Pew's results suggest demographics alone mostly buy you stereotypes.

**Measure spread, not only the average.** For any synthetic run, look at the distribution of message lengths, intents and outcomes. If one option never appears, treat that as a warning about the simulator, the same way Pew treated zero-selection answers.

**Run two simulators.** If your agent's score moves a lot when you swap the model playing the user, the score is telling you about the simulator. Pew's Claude versus GPT-5.1 comparison is the same effect.

**Anchor to a small real sample.** Even 50 real conversations, labelled by a person, will show you where the synthetic ones are too clean. Mine real transcripts for the patterns, then feed those patterns back into the personas. Repeat when your product changes, because your simulator won't know it did.

**Give the simulator the context it lacks.** Anything after its cutoff, like your new pricing or a policy change, has to be in the prompt. Otherwise it will answer from an older world, confidently.

## Where I land

Pew's conclusion was careful: AI survey takers aren't an adequate replacement on topics of broad public importance, at least not yet. I'd apply the same standard to product teams.

Simulated users are a cheap way to explore what your system might do. They're a poor way to find out what people will do. The gap between those two is about 12 points on average in Pew's data, and much worse on exactly the questions you care about: new things, unusual people, and the moments where someone just isn't sure.

If your eval suite only has the polite user, you've tested your agent against a model's idea of a person. Go and read some real transcripts.
