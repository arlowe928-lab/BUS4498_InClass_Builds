# Update Infographic Chart Task Specification


```yaml
# BASIC INFORMATION
task_id: "T4"
task_name: "Update Infographic Chart"
task_owner: "Director of Outreach"

# Agent Inference Configuration
Provider: [e.g., Groq, OpenAI, Claude, Google Gemini]
Model: "[Exact supported API model ID.]"
Role: [permitted subtasks the model supports]
Maximum inference requests per task run: "[Whole-number limit.]"
On inference failure or exhausted limits: Record the unresolved status and hand the case to [human role].
```

## 1. Task Goal

- **Objective:** The AI agent should continuously use the survey results to update an infographic chart showing the ratio of event attendees to no longer attending.    

## 2. Inbound Inputs

*Describe what the enclosing workflow must provide. Specify the structure of each input; do not invent customer, employee, or event data. Copy the Input block as needed.*

### Input 1

- **Input name:** Attending Survey Results 
- **What it contains:** Results on whether or not students are still planning on attending the vibe coding event. 
- **Source:** Google Forms

## 3. Tool Permissions and Boundaries

*Name each planned tool and specify its permitted use. Use verb-object names, such as `retrieve_records`, usually matching the task or permitted subtask it supports. Tool name identifies the capability; tool type identifies the proposed implementation. No scripts or working integrations are required.*

### Task-Wide Limits

- **Total task timeout:** [Maximum elapsed time for one task run, with units; include tool calls, retries, and waiting.]
- **Maximum tool calls:** [Maximum total calls across all tools during one task run; retries count toward this total.]

### Tool 1

- **Tool name:** [Proposed verb-object name, used consistently throughout the project.]
- **Tool type:** [For example: Python script, pretrained model, API request, database query, or language-model call.]
- **Supports these permitted subtasks:** [Names from Section 4.]
- **Allowed use:** [What the tool may read, create, change, or send; identify permitted data sources and destinations.]
- **Prohibited use:** [Actions, data, or destinations outside this tool's authority.]
- **Approval required:** [What requires approval, who provides it, and when. Write "None within the allowed use" if applicable.]
- **Timeout per call:** [Maximum duration of a single attempt, with units.]
- **Maximum retries per call:** [Nonnegative whole number of additional attempts after the first; 0 means no retries.]
- **Retry conditions and failure response:** [When a retry is allowed, any waiting interval, and what happens on timeout or exhausted retries. For actions that change state, avoid duplicate actions and hand off if the outcome is uncertain.]

*Copy the Tool block as needed. Tool-specific and task-wide limits both apply; stop at whichever is reached first. Naming a tool does not authorize uses outside its stated permissions.*

## 4. How the Agent Should Reason

### Permitted Subtask 1

* **Subtask name:** retrieve_survey_results
* **Subtask description:** Examine the authorized Google Forms attendance responses for the specified vibe coding event. Identify the available attendance statuses, response timestamps, and any missing information needed to update the chart.
* **Subtask boundary:** Read only the survey data authorized in Section 3. Do not modify responses, access unrelated surveys, or contact respondents. If the event or source cannot be identified, hand off to the Director of Outreach.
* **Retry limits:** 1 additional attempt for a temporary retrieval failure, within Section 3’s limits.

### Permitted Subtask 2

* **Subtask name:** validate_attendance_responses
* **Subtask description:** Check responses for missing attendance selections, unsupported answers, and duplicate submissions. Produce a validated set of responses and identify unresolved records that could affect the totals.
* **Subtask boundary:** Use only explicit survey answers. Apply the workflow’s approved duplicate-handling rule; if none exists and duplicates affect the totals, request human review. Do not infer attendance from missing responses or alter source records.
* **Retry limits:** 1 additional attempt if refreshed data or an approved clarification becomes available within the same run.

### Permitted Subtask 3

* **Subtask name:** calculate_attendance_ratio
* **Subtask description:** Count valid responses for “still attending” and “no longer attending.” Calculate the attending-to-no-longer-attending ratio and each category’s percentage of the combined valid total.
* **Subtask boundary:** Use validated responses only. Do not treat nonrespondents as no longer attending or present survey intentions as actual event attendance. If either category has zero responses, display the counts directly without dividing by zero. If there are no valid responses, hand off rather than report a misleading ratio.
* **Retry limits:** 1 additional calculation if a discrepancy is found or validated inputs change.

### Permitted Subtask 4

* **Subtask name:** update_infographic_chart
* **Subtask description:** Compare the calculated results with the existing infographic and update its counts, percentages, ratio, and last-updated timestamp when needed.
* **Subtask boundary:** Modify only the designated chart through tools authorized in Section 3, after resolving issues that affect the totals and obtaining any required approval. Preserve the approved design and use aggregate data only. Do not publish to additional destinations or display respondents’ personal information.
* **Retry limits:** 1 additional attempt only when the previous update is confirmed to have failed without changing the chart. If the outcome is uncertain, inspect the chart before considering another attempt.

### Permitted Subtask 5

* **Subtask name:** verify_chart_accuracy
* **Subtask description:** Read the saved chart and compare its displayed values with the validated calculations. Confirm that labels describe planned attendance, totals match, and percentages are consistent within rounding.
* **Subtask boundary:** Mark the task complete only when the saved chart is verified. Any correction must use the authorized update subtask and remain within its retry limit. Hand off discrepancies that cannot be resolved within the remaining budget.
* **Retry limits:** 1 additional verification after an authorized correction or temporary read failure.

**Decision guidance:** After each subtask, select the permitted subtask most likely to resolve the most important remaining uncertainty. Subtasks may be skipped, repeated, or combined when supported by available evidence and their prerequisites. Do not follow a fixed sequence or continuously poll within one run; later workflow triggers may initiate new updates. All actions remain subject to Section 3’s permissions and limits. If no permitted subtask can make useful progress, stop and hand the case to the Director of Outreach.


## 5. When to Stop or Hand Off to a Human

- **Stop successfully when:** [What evidence shows that the required result is complete and acceptable? Confidence alone is not enough.]
- **Hand off early when:** [What missing evidence, lack of progress, failure, or out-of-scope finding requires human review?]
- **Hand off to:** [Specific person, role, or review queue.]

Stop at the first applicable budget limit or handoff condition. While awaiting review, take no further autonomous action.

## 6. Outbound Deliverable

*Revise these default items if your task needs a more specific deliverable, or retain them if they fit.*

- **Status:** Completed or escalated to human.
- **Result or recommendation:** The completed result. If escalated before reaching a supported result, write undetermined.
- **Evidence summary:** The most important evidence supporting the result or explaining why no result could be reached.
- **Subtasks performed:** Permitted subtasks completed, including repeated attempts.
- **Unresolved issues:** Remaining uncertainties or questions; use none only if no unresolved issue remains.
- **Handoff note:** Reason for stopping, unresolved questions, and what the reviewer needs to decide; write "Not applicable" for a completed task.
- **Next task or recipient:** Who receives the completed output? Unresolved cases go to the handoff recipient above.
