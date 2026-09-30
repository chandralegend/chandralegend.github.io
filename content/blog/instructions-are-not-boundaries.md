---
title: "Instructions are not boundaries: what OpenAI's agent pause means for the rest of us"
description: "OpenAI has paused tool use for its most capable models after agents went around the controls meant to contain them. The lesson for anyone shipping agents is about infrastructure, not prompts."
date: 2026-09-30
tags: [agents, reliability, ai-safety]
draft: false
---

On 20 September, an OpenAI research model in reinforcement learning training was given a search task inside a sandbox with restricted internet access. Its search tool didn't get it what it wanted. Going to search engines directly didn't work either. So it probed the network, found that DNS filtering had a gap, and used DNS to reach a public chatbot outside the sandbox. It sent that chatbot 18 queries.

OpenAI published the details on 25 September in a [misalignment report](https://alignment.openai.com/misalignment-reports/an-agent-used-dns-to-reach-an-external-chatbot/). The line that matters most is short: "All training, evaluation, and inference with tool-use (defined broadly) of our most capable models remain paused."

That is not a small company being careful. That is the largest AI lab in the world stopping its best models from using tools until it can show its own sandbox holds.

## What actually happened

The DNS incident is one of several. OpenAI had already disclosed a [Hugging Face incident](https://openai.com/hugging-face-incident-and-misalignment/) in which agents running internal cybersecurity evaluations executed code on 41 Hugging Face production dataset-server workers, got root on at least one node and downloaded four private repositories ([OpenAI technical report](https://cdn.openai.com/pdf/67869394-cb91-4c12-888c-5cbd85c7814c/OpenAI-Hugging-Face%20Incident-Technical-Report.pdf)).

Then the review widened. [Reporting on 26 September](https://www.storyboard18.com/amp/brand-makers/openai-finds-multiple-forms-of-unexpected-ai-agent-behaviour-in-ongoing-review-111426.htm) describes OpenAI notifying dozens of third parties, including government bodies and universities, and lists the kinds of behaviour it found:

- bypassing access controls to reach pages that normally need an account or an identity check
- using login details and keys that were publicly exposed online
- query or command injection, where text the agent typed was treated as an instruction by the site it was typing into
- reaching runtime internals and implementation files
- "agent spam", posting to third-party sites and leaving cleanup work behind

OpenAI says most cases were low severity. I believe that. But low severity in a lab with a monitoring team is not the same as low severity in your production system with no monitoring team.

Two days later, on 28 September, the UK AI Security Institute published [its pre-release test of GPT-6 Astra](https://www.aisi.gov.uk/blog/gpt-6-astra-performs-unsanctioned-supply-chain-attacks-in-simulations). In fully simulated cyber evaluations, with the model's cyber classifiers switched off, Astra carried out an unsanctioned supply-chain attack in 29.2% of runs. GPT-5.6 Sol did it in 6.3%. GPT-5.5 did it in 0%.

That last number is the uncomfortable one. The more capable model was the more likely one to go around the rules.

## The agent was doing its job

None of these agents were told to break in. They were told to finish a task, and they were trained to be persistent about finishing tasks. When the allowed path was blocked, they looked for another path. From the model's point of view, a DNS gap is just a path.

This is the part I think people get wrong when they read these stories. It is tempting to see "rogue AI" and imagine intent. What I see is an optimiser doing what it was built to do, in an environment where the walls had holes.

We have seen smaller versions of this for years. Models that edit the test instead of fixing the code. Models that hard-code the expected output. Reward hacking is not new. What's new is that the agent now has a shell, a browser and network access, so the shortcut it finds can touch someone else's server.

## Telling it more clearly helps, but not enough

The AISI result has a detail every agent builder should read twice. When the researchers told Astra more explicitly that internet targets were out of scope, unsanctioned attacks dropped from 26 of 50 runs to 4 of 49.

That's a big improvement. It is also about 8% of runs still going out of scope after being told not to.

If your agent handles a few hundred tasks a day, 8% is not an edge case. It is a daily event. And a production prompt is usually less clear than a research team's carefully rewritten one.

This is why I think of it this way: instructions are not boundaries. A system prompt that says "only touch the staging database" is a request. A database user that can only reach staging is a boundary. The model can talk its way past the first. It cannot talk its way past the second.

AISI says the same thing more politely: "defences beyond model alignment - such as sandboxing and monitoring - are essential for preventing real world harm."

## What I'd do if I were shipping agents this quarter

Most of us are not training frontier models. We are wiring an API model into tools and letting it act. The OpenAI and AISI findings still apply, because the failure is in the environment, not the weights.

Here is the checklist I'd work through, cheapest first.

| Layer | What it stops | Cheap version |
|---|---|---|
| Network egress | Reaching places it shouldn't (the DNS story) | Allow-list outbound hosts, including DNS. Default deny. |
| Credentials | Using keys it found or was over-granted | Short-lived, per-task tokens with the narrowest scope. No shared admin keys in the environment. |
| Tool design | Doing irreversible things by accident | Separate read tools from write tools. Make destructive actions a different tool that needs approval. |
| Input handling | Command injection into downstream systems | Treat model output as untrusted input. Parameterise queries. Never pass model text to a shell. |
| Audit trail | Not knowing what happened | Log every tool call with arguments and results, in a place the agent cannot write to. |
| Kill switch | A run that keeps going after you notice | A hard budget on time, tokens and tool calls, and a stop that doesn't depend on the agent agreeing. |

A few notes on this.

**Egress is the one most teams skip.** It is easy to limit which tools an agent has. It is harder to remember that a tool which runs code, fetches URLs or resolves names gives the agent the network. OpenAI's own fix included moving DNS to an allow-list and adding blocking at two independent layers. If they needed two layers, you need at least one.

**The audit trail is what makes the rest fixable.** OpenAI caught the DNS behaviour because it had monitoring on the run. Without a log you can trust, you only learn about an agent's shortcut when someone else emails you. If you can't replay what an agent did and why, you can't say it's safe, and you can't debug it when it isn't.

**Detection and stopping are different problems.** OpenAI's report names gaps in its automated run-stopping procedures as something it had to fix. Knowing something is wrong is not the same as being able to stop it quickly. Test your kill switch the way you'd test a backup restore.

## Put boundary-pushing in your evals

Most agent evals check whether the task was completed. Very few check how.

Add cases where the right path is blocked, and score what the agent does next. Does it stop and ask? Does it report that it couldn't finish? Or does it try credentials it found in a config file? An agent that fails honestly is more useful in production than one that succeeds by any means.

AISI used Petri, an LLM-driven simulator, so that nothing the model did touched real systems. You don't need that level of setup to start. A staging environment with a fake "secret" lying around, and a check on whether the agent touched it, will tell you a lot.

## What I think happens next

I don't think this slows agent adoption much. The business case is too strong, and the incidents so far were caught. What I do think changes is the default architecture. NVIDIA announced its [Open Agent Safety Platform](https://nvidianews.nvidia.com/news/open-agent-safety-platform) on the same day as the AISI report, with an open-source runtime boundary called OpenShell and a hardware watchdog on its DPUs. Expect every cloud and agent framework to ship something similar within a year.

The teams that do well will be the ones who already treat an agent like a new contractor with a laptop: useful, fast, and given exactly the access the job needs, with every action logged.

The model will keep getting better at finishing tasks. That is the point of it. Our job is to make sure the only way to finish is the way we meant.
