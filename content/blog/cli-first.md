---
title: "CLI-first is the new mobile-first"
description: "Mobile-first made us design for the smallest screen. Agents are becoming the first user of a lot of software, and the ones building it already work in a terminal. Build the CLI first, and they can test your product the way a user would."
date: 2026-10-09
tags: [agents, software-engineering, cli]
draft: true
---

In 2009, Luke Wroblewski argued that teams should design for mobile first. Desktop wasn't going away. But designing for the smallest screen forced you to decide what actually mattered, and the desktop site got better as a side effect.

I think we're at the same point again, with a different user.

More and more software use now starts with telling an agent what you want. Developers ask Claude Code or Codex to change a system. Founders ask an agent to pull a report. Soon, people who have never opened a terminal will ask one to pay a bill. The first user of a lot of software is no longer a person clicking through a UI. It's an agent acting for one.

So here's the proposal: **build the CLI first.** Every capability ships as a command before it ships as a screen, and a feature isn't done until it works from the terminal. The web app, the mobile app, the API and the product's own built-in agent are all clients of the same core, and the CLI is the reference client the others are checked against.

The part I care about most is a side effect, the same way better desktop sites were a side effect of mobile-first. Once the product is fully drivable from a terminal, the agents that build it can also use it: play out a user story, notice what's broken, fix it, and run the story again.

## Agents already live in the terminal

This isn't a prediction. Companies are publishing the numbers.

Cloudflare says agents went from single digits to a quarter of its Wrangler CLI usage between early 2025 and [March 2026](https://blog.cloudflare.com/cloudflare-cf-cli-launch/), and to 48% by late September. Agents also ran almost twice as many distinct commands per day as people did. Mistral built its [Spaces CLI](https://mistral.ai/news/spaces) "for humans and agents", gave every interactive input a flag equivalent, and had an agent go from a single prompt to a live deployment, CI included, in under ten minutes.

A few reasons agents do well here:

- **They were trained on it.** Decades of shell scripts, READMEs and Stack Overflow answers. A model knows what `--help`, a pipe and an exit code mean without being told.
- **`--help` is discovery on demand.** The agent asks what it can do, one level at a time, instead of carrying your whole schema around. For a CLI the model has never seen, that discovery costs round trips, which I measured below. Peter Steinberger [put it bluntly](https://simonwillison.net/b/9052): load GitHub's MCP server and "see 23k tokens gone", or use the `gh` CLI and "pay zero context tax".
- **Commands compose.** The output of one call feeds the next. Agents that act by writing code beat JSON tool calls by [up to 20% in success rate](https://arxiv.org/abs/2402.01030) across 17 models in the CodeAct paper.
- **The same command runs everywhere.** On a laptop, in CI, in a sandbox, inside your product's own agent loop.

Clicking through a GUI is the opposite. Computer-use agents still take [2.7 to 4.3 times](https://arxiv.org/abs/2506.16042) more steps than a task needs, and every step is a screenshot to interpret.

## What it looks like in Salli

Salli, the personal finance and tax app I'm building for Sri Lanka, was built in this order. The agent guidance in the repo says it in one line:

> Core + CLI first. All domain logic runs from the terminal before any HTTP server exists.

Then the API, wrapping the same services. Then the web and mobile apps. The core is now open source as [salli-core](https://github.com/leafmonkeylabs/salli-core): 125 commands in 23 groups, `--json` on every one that returns data, an MCP server over the same services, and agent skills that teach Claude Code to drive the CLI.

The `--json` part matters more than it looks. It's what lets one command feed the next without the agent reading and retyping everything in between:

```bash
CASH=$(salli accounts list --json | jq -r '.[] | select(.name=="Cash") | .id')
FOOD=$(salli accounts list --json | jq -r '.[] | select(.name=="General Expenses") | .id')
salli entry add --date 2026-03-28 --desc "Groceries" \
  --debit "$FOOD:4250" --credit "$CASH:4250" --json
salli tax compute --json | jq -r .tax_payable
```

None of this is new as architecture. It's ports and adapters, functional core and imperative shell, the Unix philosophy. What changed is who the first user is.

## Who uses the CLI, and who doesn't

I first thought of this as one interface for three kinds of agent. Looking at what actually happens in Salli, it's more specific than that.

![Diagram: coding agents use the CLI, users' agents use an OAuth-scoped MCP server, and people use the web and mobile apps and a built-in agent. The CLI, HTTP API, MCP server, apps and built-in agent all call one core that holds the domain logic, rules, data and guardrails. The CLI is marked as the reference client.](/images/blog/cli-first/one-core.png)

**Coding agents** use the CLI all the time. They build the product, so they need to run it, and a command is the fastest way to exercise a feature without a browser.

**Users' agents** mostly don't. Someone asking Claude to "move my emergency fund target to six months of expenses" reaches Salli through its MCP server, with OAuth scoping it to their data. CLI-first still helps them, because every capability already exists as a scriptable operation in the core before anyone writes an MCP tool for it. The exception is self-hosters, whose own agent can drive the CLI with the bundled skills.

**The product's own agent** calls the same core operations as everything else. Salli's tax agent gets read-only tools backed by the tax engine. No private, more powerful path.

## The agents test it too

This is the part I care about most, and the part I haven't seen measured.

When everything is a command, a coding agent can do more than run unit tests. It can play the user: run the commands a real person would, read the output, notice when something's off, go into the code, fix it, and run it again.

![Diagram: a coding agent runs a user story from the terminal, reads the output, notices what's off, fixes the code and runs the story again. In July, one pass through Salli's CLI found an approval gate that silently did nothing, while the web app had it wired correctly.](/images/blog/cli-first/test-loop.png)

In July, a full end-to-end pass through Salli's CLI with a coding agent turned up a handful of bugs in one go. The commit lists them. Two stood out:

- `profile export` crashed for anyone who had ever run `tax compute`, because one repository returned a plain dict where the export code expected an object.
- The CLI never set up the agent's checkpointer, so `agent history` crashed and, worse, the approval gate on the agent's write tools **silently did nothing**. The web app had it wired correctly. Nobody would have seen this from the browser.

That second one is my favourite example, because it's a guardrail that existed and wasn't actually there.

The usual alternative is browser end-to-end tests. They're slow, they need a running frontend, and UI tests are some of the [flakiest tests a team owns](https://arxiv.org/abs/2103.02669).

## What makes a CLI agent-ready

Mostly the same things that make a CLI good for people, with a few you can't skip.

**1. Parity, not a subset.** The best comparison so far, 440 tasks across 18 apps, had GUI agents beating CLI agents [59.1% to 48.2%](https://arxiv.org/abs/2606.24551), until the CLI's missing capabilities were filled in and the CLI agent reached 69.3%. Gaps send the agent back to the screen.

**2. Flags, not prompts.** Every interactive question has a flag that answers it. Consent is the one exception, more on that below.

**3. `--json` on anything that returns data.** Data on stdout, messages on stderr, so commands chain.

**4. Plain flags for input.** Waldek Mastykarz [tested](https://developer.microsoft.com/blog/dont-rewrite-your-cli-for-agents/) one-big-JSON-payload against named flags on five models. Flags were right every time. The JSON version failed on the two smaller models and cost 4 to 11 times more per task, mostly from retries and shell quoting.

**5. A short cheat sheet, not just `--help`.** [Documentation alone](https://arxiv.org/abs/2308.00675) gets models about as far as demonstrations do. In my test, a 1,100-token sheet listing the commands and the JSON they return mattered more than anything else.

**6. Errors that say what went wrong, never a traceback.** A vague "validation failed" looks to an agent exactly like a bug in the CLI. Salli's first CLI went the other way and dumped Python tracebacks of up to 9,400 characters into the agent's context. The rewritten one reports errors without them.

**7. `--dry-run` for anything that changes state.**

**8. Guardrails in the core, not the client.**

## Guardrails belong in the backend

The obvious worry is an agent with a shell doing something you didn't ask for. It's a real risk. An agent holding your credentials, reading untrusted content, with a way to send data out, is what Simon Willison calls the [lethal trifecta](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/).

The answer isn't to keep agents out. It's to stop treating the client as the place rules live. If the only thing stopping a destructive action is a confirmation dialog in the web app, the rule was never in the product.

What I'd want, and what Salli doesn't fully have yet:

- **Approval out of band.** A `--yes` flag the agent can pass is not consent. A destructive command should create a pending action that a person approves somewhere else, a notification, the web app, an MCP prompt. Salli's tax return workflow pauses for human review before it finalises. That's the pattern, applied to one flow so far.
- **Agents get their own credentials.** Scoped, short-lived, read-only by default, so the audit log can tell the agent from the person. The Salli CLI I first tested acted as whoever the local config said, with no login at all. The rewritten version I tested logs in with personal access tokens, but they carry no scopes, so a token can do anything its user can. That's still the biggest gap.
- **The model explains, the engine computes.** In Salli the language model never produces a money or tax figure. Deterministic code does, and the model explains it.
- **Everything is logged** with who acted and for whom. In both versions I tested, Salli logged what its MCP tools did but not what the CLI did, so the surface I'm recommending for agents is the one that isn't audited.
- **A sandbox under the shell.** My own test setup shows why. Claude Code's command allowlist refused composed commands, so my runner bypassed permissions under a deny-list, with no sandbox. In the follow-up runs, agents used `/tmp` instead of their own folder in 83 of 1,440, searched Claude Code's saved outputs across every project on the machine in 10, and in two saw other runs' commands while listing processes. Nothing harmful happened, but nothing stopped it either.

## I ran a test

Before publishing this, I tested the cost argument on salli-core. Same product, same database, 704 agent runs through Claude Code with Claude Haiku 5.5 and Sonnet 5.5. Six tasks, from "what tax do I owe" to "post these 25 expenses" and "set a review reminder for every category over LKR 20,000". Eight setups: Salli's own MCP server (24 tools), an MCP server generated from the whole CLI (102 tools), and the CLI with different amounts of help.

The short version: a CLI isn't cheap just because it's a CLI.

![Chart of cost relative to Salli's 24-tool MCP server, 704 runs. On chains of dependent steps, the CLI learned from --help cost 1.6 to 2.0 times as much, the CLI with a command sheet, composed, 0.9 to 1.2 times, and an MCP server generated from the CLI with 102 tools 1.6 to 1.8 times. On tasks that repeat one operation, the CLI with the sheet cost 0.61 to 0.64 times and the generated MCP server 1.3 to 1.5 times; the help-only CLI was not run on those tasks.](/images/blog/cli-first/cost.png)

When the agent had to learn the CLI from `--help`, it cost 1.6 to 2 times as much as MCP. Every help call is another round trip. Zero context tax is real for the prefix. You pay it back in passes.

When I gave it a 1,100-token cheat sheet with the commands and the JSON they return, it flipped for Sonnet. On chains of dependent steps it was about even with MCP. On the two tasks that repeat an operation, it was 36 to 39% cheaper: one shell loop instead of 25 tool calls. Haiku only saved on one of the two, the bulk-entry task. Two tasks isn't enough to say how far that holds, so I'm treating it as a lead, not a result.

![The same task through both interfaces, Sonnet on the large ledger, medians of three runs each: set a review reminder for every expense account over LKR 20,000. Salli's MCP server took 26 tool calls, 4.1k output tokens, 11.7 cents and 25 seconds. The CLI with the command sheet took 2 tool calls, a shell script ending in one loop (shown from one run), 0.9k output tokens, 4.4 cents and 48 seconds: 62% cheaper but twice as long, with all 24 writes behind one approval.](/images/blog/cli-first/same-task.png)

The MCP server generated from the full CLI was the worst of both. It cost 1.3 to 1.8 times the curated one for exactly the same outputs. Some of that is the "MCP eats your context" problem people talk about, but the generated server also sent back bigger results, so I can't tell how much is down to catalogue size.

The curated MCP server was also the fastest: a median of about 10 seconds a run on chains against 15 to 39 for the CLI setups, and 27 seconds on the repeat tasks against 60 or more for everything else. Part of that is Salli's CLI starting a Python process on every call. The CLI also broke in ways the curated MCP server didn't: Python tracebacks of up to 9,400 characters dumped into the context (mostly after shortened IDs that Salli's own docs said would work), and a `sort` waiting forever on stdin. And when the agent composes, it puts 25 writes behind one approval instead of 25. Now I have a list of things to fix.

## Three more rounds

After the first version of the paper, I ran 1,440 more runs in three rounds, aimed at the parts I was least sure of.

**Which parts of the cheat sheet matter?** I cut the sheet up: one version without the options, one without the JSON output shapes, one with just command names and one-line descriptions, and one four times bigger. The answer depended on the model. Haiku needed both: without the options it cost 1.24 times as much on chains, without the output shapes 1.10 times. Sonnet only needed the output shapes, and cost 1.19 times as much without them.

The four-times-bigger sheet cost about the same, but only because every run shared a warm cache. Priced as if each run paid for its own cache, it cost 1.27 to 1.59 times as much. And without the output shapes, agents on the repeat tasks more often threw away what their writes returned: 17 of 32 runs, against 4 of 32 with the full sheet. That leaves a reviewer less to check.

**The rewrite.** I rewrote salli-core after the main experiment. The CLI is now a TypeScript client of the API. It takes account codes and names as well as ids, accepts the shortened ids its docs promise, has filters like `--type` and `--balances`, and reports errors without tracebacks. The MCP server grew from 24 tools to 46. Same test setup, same six tasks, a regenerated sheet: the CLI with the sheet now cost 0.90 times what MCP did on chains for Haiku and 0.60 for Sonnet, and 0.48 and 0.32 times on the repeat tasks. A CLI learned from `--help` still cost Haiku twice as much on chains.

I built both versions, and I'd seen the first results before I finished the rewrite, so I didn't trust this on its own. Two of the changes could explain it: the MCP server got bigger, and only the CLI learned to take account codes, while MCP's tools still need ids.

**Isolating it.** So I ran 384 more, with nothing else on the machine. One setup served the same MCP server with only the original 24 tools. Another used a CLI that refuses account codes and names. The smaller server was 12% cheaper for Haiku on chains and 5% cheaper for Sonnet on the repeat tasks, with no difference I could detect in the other two. Forcing the CLI onto ids made no clear difference: its scripts just looked the ids up with `jq`. Against the 24-tool server, the CLI was level for Haiku on chains and still cheaper everywhere else, 0.52 times for Haiku on the repeat tasks and 0.69 and 0.39 for Sonnet.

![Chart from the isolation round, 384 runs on the rewritten product: cost of the CLI with its sheet relative to MCP, first against the 46-tool server and then against the same server cut to its original 24 tools. Haiku on chains 0.84 then 0.95; Haiku on repeated operations 0.53 then 0.52; Sonnet on chains 0.61 then 0.69; Sonnet on repeated operations 0.37 then 0.39.](/images/blog/cli-first/mcp-growth.png)

So part of the CLI's lead was MCP getting bigger. Measured against a same-size server in both versions, the CLI itself also got cheaper, clearly so for Haiku on chains, by about a fifth. I can't say which change did that: the filters, the missing tracebacks or the new sheet.

**The new sheet had a bug.** It said `accounts list` returns a list. With `--balances` it returns an object. In 21 of the 24 Haiku runs that used the flag, a `jq` error followed. The generator recorded one output shape per command and missed that a flag changes it. The description is part of the interface, and it needs tests like the rest of it.

Agents on both protocols still sometimes reported success they hadn't achieved. Three of the nine follow-up failures were silent: two refunds to the wrong account, and a job that created 22 of 24 reminders and said it had done them all.

None of this was pre-registered, and it's still one product, which I built, and two models from one provider. But the pattern held across all four rounds: what the agent is told about the interface matters more than which protocol carries it.

So my takeaway: ship the CLI with `--json` and a short cheat sheet generated from the CLI and tested against it, keep the MCP server small, and treat both descriptions as part of the product. The bigger reason I still like CLI-first is the part these tests didn't touch: the agents building the product, using the CLI to find what's broken.

## Where this breaks

**Parity is expensive.** Salli's CLI coverage fell from 68% of API routes to 24% within a month while a rule said "CLI first", recovered to 82% in one dedicated push, and slipped again to 73%. It only holds if something checks it. Salli-core now has a CI check that fails when an API route has neither a CLI command nor a written reason for not having one.

![Line chart of Salli's CLI commands and API feature routes from June to September 2026. The API grew from 19 to 54 routes while the CLI stayed at 13 commands, so commands per route fell from 68% to 24% in a month. A CLI push in mid-July took it to 82%, and it drifted to 73% by September.](/images/blog/cli-first/coverage.png)

**The interface isn't the only variable.** One study of seven agent setups found CLI-only setups 5 to 28 times cheaper than MCP ones, but [paired comparisons](https://arxiv.org/abs/2608.08654) swung from 0.43 to 29 times and the authors call the result unstable. Mario Zechner's [120-run benchmark](https://mariozechner.at/posts/2025-08-15-mcp-vs-cli/) found MCP 23% faster and 2.5% cheaper, and called the protocol choice "a wash" next to tool design.

**CLI tests don't see the screen.** Layout, rendering, client state and accessibility bugs live in the GUI. CLI-first moves most testing down a layer. It doesn't remove the need to look at the product.

**"Isn't this just API-first?"** Partly. A core with many clients is old. What's different is that the first client is an agent, and that the same interface doubles as the test surface for the agents building the product.

**Accessibility.** CLIs are [not automatically accessible](https://research.google/pubs/pub49865); terminal output is unstructured text for a screen reader. But in a CLI-first product the person usually doesn't touch the CLI at all. I think letting someone get a thing done by saying it is a real gain. The hard part moves to whether they can understand and check what their agent did.

## What's next

The full write-up is [on arXiv](https://arxiv.org/abs/TODO), with the numbers from Salli's history, the main experiment and the three follow-up rounds. The paper's source, the test code, all 2,144 transcripts and the analysis are [on GitHub](https://github.com/leafmonkeylabs/cli-first-paper). The open questions are the obvious ones: does any of this hold on other products and models, is the CLI a better test surface than the browser, which other CLI design choices matter, and how do people fare when they delegate.

Salli-core is AGPL and runs locally in about ten minutes if you want to poke at a CLI-first product yourself. If you're building this way, or have data that says I'm wrong, I'd like to hear it. I'm [@xchandralegend](https://x.com/xchandralegend) on X and [on LinkedIn](https://www.linkedin.com/in/chandralegend/).
