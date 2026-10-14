---
title: "Typed answers are not calibrated answers: what a coin flip teaches about OpenAI's Decisions API"
description: "A developer flipped a 70% coin 1,000 times through OpenAI's new Decisions API. Asked for a probability, it said 70%. Asked to choose, it said 98%. Here's what that means if you use typed LLM outputs to make decisions in production, and how to check your own."
date: 2026-10-14
tags: [llm, evals, structured-output, reliability]
draft: false
---

On 6 October, OpenAI put its [Decisions API into public beta](https://community.openai.com/t/decisions-api-is-now-available-in-public-beta/1403877). A day later, a developer on OpenAI's community forum ran it against a loaded coin that lands heads 70% of the time.

Asked "will this flip be heads?" as a probability question, the API said 70%. Asked to choose between heads and tails, it picked heads in [1,000 out of 1,000 requests](https://community.openai.com/t/results-from-toy-experiments-with-decisions-api/1404010) and reported a 98% probability for heads.

Same model, same coin, same question. Two different answers depending on the shape you asked for.

I think the Decisions API is a good idea, and I'll explain why. I also think this little coin test is the most useful thing I read about LLMs in production this month, because the problem it shows isn't specific to OpenAI.

## What the Decisions API is

It's a new endpoint, `POST /v1/decisions`, that runs only on `gpt-6-luna`. Instead of asking for text and parsing it, you send an input and a list of questions, and each question has a type. The [docs](https://developers.openai.com/api/docs/guides/decisions) describe three:

| Type | What you get back |
|---|---|
| `predicate` | `probability`: a number from 0 to 1 that a condition is true |
| `choice` | `choice`, plus `probabilities` per option and a `confidence` value |
| `score` | a probability-weighted `score` across ordered levels, plus `probabilities` and `confidence` |

Pricing is unusual. Input is $0.10 per million tokens. Output, cache reads and cache writes are free. GA is expected "in the coming weeks".

The use cases are the boring, high-volume calls that sit inside most AI products: route this ticket, flag this message, decide whether this agent step needs a human. Today a lot of teams do that with a chat completion, a JSON schema and a regex they hope never breaks.

## Why I like the idea

In 2024 I co-authored a paper on Meaning Typed Prompting. The core argument was that an LLM call inside a program should look like a typed function call, not a chat message. You say what type you want back, the system makes sure you get that type, and your code can rely on it.

The Decisions API is that idea, shipped by the biggest vendor in the market. A `choice` question can only return one of the values you supplied. A `predicate` always returns a number between 0 and 1. No parsing, no "Sure! Here's the JSON you asked for". That alone removes a whole class of production bugs.

So I'm not writing this to dunk on it. I'm writing it because typed output fixes the shape of an answer, and it's very easy to assume it fixes more than that.

## What the coin test actually showed

The forum post ran three batches of 1,000 requests each, about 3.9 million input tokens in total, for roughly $0.39. Each request asked both predicate and choice questions.

- **Loaded coin, 70/30.** Predicate: 70% heads, 30% tails. Choice: 98% heads, 2% tails, and heads picked every single time.
- **Marble jar, 5 red, 3 blue, 2 white.** True odds are 50/30/20. Predicate questions matched. The choice question reported red 86%, blue 10%, white 4%, and picked red every time.
- **Same jar, options reversed** (white, blue, red). The choice probabilities moved to red 73%, blue 8%, white 19%. Same jar. Only the order of the list changed.

The predicates held up even on harder questions. For three coin flips, "all heads" came back at 34.0% against an exact 34.3%.

The author's own summary of the `score` type was blunter: "complete garbage unfortunately", with probabilities that summed to more than 100%.

Two things are going on here, and they're worth separating.

**A choice is a decision, not an estimate.** If you ask "heads or tails?" the right answer, if you have to bet, is always heads. Picking heads 1,000 times is arguably correct behaviour. The problem is the number attached to it. The `probabilities` field looks like an estimate of how likely each option is, and it isn't. It's closer to how sure the model is that heads is the better pick.

**Order changes the answer.** A 13 point swing from reversing a list of three options is the classic LLM position bias, and the typed wrapper doesn't remove it. If your routing logic says "send to billing when billing > 0.8", the order you happened to write the options in is now part of your routing logic.

One forum test is one forum test. It's a toy, it's not peer reviewed, and OpenAI hasn't commented on it. But it's cheap to rerun, and the pattern matches what we already know about LLMs.

## The real lesson: types are a contract on shape

A type system promises that a value has a certain form. `float between 0 and 1` is a form. It says nothing about whether 0.98 means "right 98% of the time".

That second property is calibration, and you only get it by checking against reality. OpenAI's own docs more or less say this. They don't explain how `confidence` is computed, and they recommend setting thresholds from "labeled examples from your application", based on what false positives and false negatives cost you.

I think that's the right advice, and I think most teams will skip it, because the API returns a tidy number and tidy numbers feel trustworthy.

## What I'd do before routing anything on these numbers

**1. Use `predicate` when you need a number.** In the test, predicate probabilities were close to correct and didn't move when options were reordered. If you need "how likely is this a refund request?", ask that as a predicate, one per class if you have to.

**2. Treat `choice` probabilities as a ranking.** Use the pick. Use the order of the probabilities if it helps. Don't put a threshold on the raw value until you've checked it.

**3. Shuffle option order in your evals.** Run the same labelled set with two or three option orders. If accuracy or the probabilities move a lot, you have position bias, and you want to know before your users find it.

**4. Check calibration on your own data.** You need a few hundred labelled examples from real traffic. Group predictions by stated probability and compare with how often they were actually right. Output is free on this endpoint, so the check costs you input tokens only.

Here's the whole check. Nothing in it is specific to OpenAI.

```python
import numpy as np

def calibration_table(probs, labels, bins=10):
    """probs: model's stated probability that the label is True.
    labels: what actually happened (True/False)."""
    probs, labels = np.asarray(probs), np.asarray(labels, dtype=float)
    edges = np.linspace(0, 1, bins + 1)
    ece = 0.0
    for lo, hi in zip(edges[:-1], edges[1:]):
        mask = (probs >= lo) & (probs < hi) if hi < 1 else (probs >= lo)
        if not mask.any():
            continue
        stated, actual = probs[mask].mean(), labels[mask].mean()
        ece += mask.mean() * abs(stated - actual)
        print(f"{lo:.1f}-{hi:.1f}  n={mask.sum():4d}  stated={stated:.2f}  actual={actual:.2f}")
    print(f"expected calibration error: {ece:.3f}")
```

If the 0.9-1.0 row says "stated 0.96, actual 0.71", you have your answer. Either recalibrate (a simple isotonic or Platt fit on the labelled set works for most cases) or move the threshold until the error rate is one you can live with.

**5. Keep the coin test as a unit test.** It's ten lines and costs cents. Run it when the model version changes. If the predicate stops saying 70%, something upstream changed, and you found out from a coin instead of from a customer.

## Where this leaves typed LLM calls

I still think typed outputs are the right way to put LLMs inside software. Parsing free text in 2026 is a waste of everyone's time, and an endpoint that guarantees shape is a real improvement.

But the guarantee stops at shape. Whether the number means anything is something you measure, the same way you'd measure any other model. The Decisions API makes the measurement cheaper. It doesn't do it for you.

If you're already using it, the most useful hour you can spend this week is rerunning that coin test and then running the calibration check on a sample of your own traffic. I'd like to hear what you find.
