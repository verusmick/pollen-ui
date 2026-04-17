# AI-First Development Workflow (Personal Reference)

## Core Idea

Modern AI-assisted development is **not about using one model**.
High-productivity developers treat AI models as **specialized roles**, similar to a real engineering team.

> **An LLM is not an assistant — it is a specialist.**

---

## Role-Based Model Architecture

| Human Role         | Model Type                         | Purpose                      |
| ------------------ | ---------------------------------- | ---------------------------- |
| Staff Architect    | Cloud model (Claude / GPT / Codex) | Deep reasoning & planning    |
| Senior Engineer    | Large local model                  | Implementation & refactoring |
| Junior Executor    | Fast local model                   | Iterative fixes              |
| Typing Accelerator | Copilot                            | Autocomplete & speed         |

---

## The Professional Pipeline

```
Problem
   ↓
Cloud Planner
   ↓
Plan.md
   ↓
Local Executor
   ↓
Code Changes
   ↓
Autocomplete Assistance
```

---

## The Golden Workflow

### 1. THINK (Cloud Model)

Use a powerful cloud model for reasoning.

Example prompt:

```
Analyze this repository and propose an implementation plan.
Output ONLY an execution plan.
```

Goal:

* Architecture decisions
* Strategy
* Risk analysis

**Do NOT generate code yet.**

---

### 2. FREEZE (Create Specification)

Save the output as a document:

```
/docs/PLAN_feature_name.md
```

Why this matters:

* Prevents context drift
* Converts AI output into a specification
* Enables cheaper execution later
* Creates reusable engineering knowledge

---

### 3. EXECUTE (Local Model)

Use a local model (e.g., Qwen3-Coder via Ollama):

```
Follow PLAN_feature_name.md step 1.
Modify only affected files.
```

Local models excel at:

* Editing repositories
* Iterative implementation
* Refactoring
* Debugging with local context

Cost ≈ zero.

---

### 4. ITERATE

Cycle repeatedly:

```
Local model → edits
Human → review
Local model → refine
```

The cloud model is not needed during iteration.

---

### 5. VERIFY (Return to Cloud Model)

After major changes:

```
Review the implementation against the plan.
Identify architectural risks.
```

Cloud model acts as senior reviewer.

---

## The Core Pattern

```
THINK   → expensive model
FREEZE  → document
EXECUTE → local model
VERIFY  → expensive model
```

If only one rule is remembered, remember this one.

---

## Recommended VS Code Setup

```
VS Code
│
├── GitHub Copilot
│     Autocomplete acceleration
│
├── Cloud Model (Claude / Codex / GPT)
│     Planning + Review
│
└── Continue + Ollama
      Local execution
```

---

## Common Beginner Mistake

Doing everything in a single chat:

```
build X
change Y
add Z
```

Results:

* Context degradation
* Inconsistent decisions
* Architectural drift

Professionals separate phases.

---

## Correct Communication Style with AI

Treat AI as an implementation engine:

```
You are implementing a specification.

Specification:
<plan file>

Constraints:
...

Output:
Diff only.
```

AI becomes a **semantic compiler**, not a chatbot.

---

## Recommended Repository Structure

```
/ai
   /plans
   /reviews
   /prompts
```

Example:

```
ai/plans/auth-refactor.md
```

Your repository begins to store structured thinking.

---

## Why This Works

| Cloud Models       | Local Models       |
| ------------------ | ------------------ |
| Superior reasoning | Superior iteration |
| Expensive          | Nearly free        |
| Slower             | Fast               |
| Strategic          | Tactical           |

Combining both creates a productivity multiplier.

---

## Decision Rule

**If the task requires thinking → use cloud.**
**If the task requires editing → use local.**

---

## Personal AI Stack (Recommended)

### Planner (Cloud)

* Claude Opus **or**
* GPT / Codex class models

Use for:

* Architecture
* System design
* Complex debugging

### Executor (Local)

* Qwen3-Coder (Ollama)

Use for:

* Implementation
* Refactors
* Incremental changes

### Accelerator

* GitHub Copilot

Use for:

* Inline coding speed

---

## Guiding Principle

> Think globally. Execute locally.

---

# Advanced Workflow: Large Architectural Refactors

This section extends the workflow with the process used by senior and staff‑level developers when performing **large-scale architectural refactors**.

## Key Principle

Architectural refactoring is **not a single interaction** with an AI model. It is an iterative engineering loop with checkpoints and validation.

---

## Iterative Architectural Refactor Loop

```
Analyze → Plan → Review → Execute → Validate → Repeat
```

Each phase uses a different model role.

---

### Phase 0 — Preparation

Create a dedicated AI workspace inside the repository:

```
/ai
   /analysis
   /plans
   /reviews
```

Purpose:

* Preserve reasoning history
* Prevent context loss
* Make AI decisions auditable

---

### Phase 1 — Repository Analysis (Cloud Model)

Example prompt:

```
Analyze this repository.

Produce:
1. Current architectural style
2. Main coupling problems
3. Scalability risks
4. Technical debt hotspots

Do NOT propose solutions yet.
```

Save output as:

```
ai/analysis/current_architecture.md
```

---

### Phase 2 — Refactor Design (Cloud Model)

```
Based on current_architecture.md,
design a step-by-step architectural refactor plan.

Constraints:
- incremental changes
- system must remain runnable
- avoid big-bang rewrite

Output phases only.
```

Save as:

```
ai/plans/refactor_v1.md
```

---

### Phase 3 — Plan Review (Cloud Model)

```
Critically review refactor_v1.md.
Identify risks, missing migrations, and breaking points.
```

Save as:

```
ai/reviews/refactor_review.md
```

Merge improvements into:

```
ai/plans/refactor_v2.md
```

This becomes the **frozen specification**.

---

### Phase 4 — Execution (Local Model)

```
You are implementing Phase 1 from refactor_v2.md.

Rules:
- modify only necessary files
- keep behavior unchanged
- provide explanation and diff
```

---

### Phase 5 — Local Iteration Loop

```
Local model → implement
Human → test & review
Local model → refine
```

---

### Phase 6 — Architectural Checkpoint (Cloud Model)

```
Evaluate whether the implementation still aligns
with refactor_v2.md architecture.
Identify risks or deviations.
```

---

## Full Refactor Flow

```
Analyze (cloud)
      ↓
Plan v1 (cloud)
      ↓
Review (cloud)
      ↓
Plan v2 — frozen spec
      ↓
Execute phase (local)
      ↓
Test
      ↓
Architectural review (cloud)
      ↓
Next phase
```

---

## What Top Developers Avoid

* Asking for a full refactor in one prompt
* Infinite single-chat workflows
* Mixing planning and coding simultaneously
* Executing entire plans without checkpoints

---

## Advanced Mental Model

```
Cloud model = CPU (reasoning)
Local model = GPU (execution throughput)
```

---

## Optional Advanced Enhancements

Experienced AI-first teams often add:

* `STATE.md` → persistent refactor memory
* reusable prompt templates
* phase execution checklists
* architectural decision logs

These practices turn AI assistance into a reproducible engineering system rather than ad‑hoc conversations.

---

> Large refactors succeed when thinking, execution, and validation are intentionally separated.
