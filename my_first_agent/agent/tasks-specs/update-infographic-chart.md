# Update Infographic Chart Task Specification


```yaml
# BASIC INFORMATION
task_id: "T4"
task_name: "Update Infographic Chart"
task_owner: "Director of Outreach"

# Agent Inference Configuration
Provider:OpenAI
Model: gpt-6-sol
Role: retrieve_survey_results, validate_attendance_responses, calculate_attendance_ratio, update_infographic_chart, verify_chart_accuracy
Maximum inference requests per task run: 10
On inference failure or exhausted limits: Record the unresolved status and hand the case to the Director of Outreach
```

## 1. Task Goal

- **Objective:** The AI agent automatically updates the infographic chart whenever new survey responses are submitted. It analyzes the latest survey results and updates the bar chart to reflect the current response status. The chart uses grey to represent individuals who have not yet responded, blue for respondents who selected “Attending,” and red for respondents who selected “Not Attending.”
   

## 2. Inbound Inputs

*Describe what the enclosing workflow must provide. Specify the structure of each input; do not invent customer, employee, or event data. Copy the Input block as needed.*

### Input 1

- **Input name:** Attending Survey Results 
- **What it contains:** Results on whether or not students are still planning on attending the vibe coding event. 
- **Source:** Google Forms

## 3. Tool Permissions and Boundaries

*Name each planned tool and specify its permitted use. Use verb-object names, such as `retrieve_records`, usually matching the task or permitted subtask it supports. Tool name identifies the capability; tool type identifies the proposed implementation. No scripts or working integrations are required.*

### Task-Wide Limits

- **Total task timeout:** 180 seconds per task run, including inference requests, tool calls, retries, and waiting.
- **Maximum tool calls:** 12 calls per task run, including retries. The separate limit of 10 inference requests also applies.

### Tool 1

- **Tool name:** retrieve_survey_results_tool
- **Tool type:** API request
- **Supports these permitted subtasks:** retrieve_survey_results
- **Allowed use:** Read attendance responses from the designated Google Form or its approved linked response sheet and read the complete sign-up list supplied by the workflow for the same event. Retrieve only identifiers needed to match registrations with responses, attendance selections, and response timestamps.
- **Prohibited use:** Modify registrations or survey responses, access unrelated forms or events, contact students, or distribute individual response records.
- **Approval required:** None within the allowed use.
- **Timeout per call:** 35 seconds
- **Maximum retries per call:** 1
- **Retry conditions and failure response:** Retry once after a 2-second wait for a temporary connection or service error, within the task-wide limits. If retrieval remains unsuccessful or the source is missing or unauthorized, record the failure and hand the case to the Director of Outreach. Do not use incomplete results to update the chart
- 

## Tool 2
- Tool name: analyze_attendance_responses_tool
- Tool type: Python script.
- Supports these permitted subtasks: validate_attendance_responses, calculate_attendance_ratio.
- Allowed use: Validate the retrieved records, match responses to registered students, apply the workflow’s approved duplicate-handling rule, and calculate aggregate counts. Calculate nonrespondents from registered students without a recorded response. Calculate the attending-to-no-longer-attending ratio and percentages using the combined valid response total.
- Prohibited use: Infer attendance from missing responses, count nonrespondents as not attending, invent missing values, apply an unapproved duplicate-handling rule, modify source records, or send student information elsewhere.
- Approval required: None within the allowed use. The Director of Outreach must approve any new duplicate-handling rule before it is applied.
- Timeout per call: 10 seconds.
- Maximum retries per call: 1.
- Retry conditions and failure response: Repeat once only if refreshed data or approved clarification becomes available, or a calculation discrepancy can be corrected. No waiting interval is required. If invalid records, unresolved duplicates, or inconsistent totals prevent a supported result, record the issue and hand the case to the Director of Outreach.

## Tool 3
- Tool name: manage_infographic_chart_tool
- Tool type: Chart platform API request.
- Supports these permitted subtasks: update_infographic_chart, verify_chart_accuracy.
- Allowed use: Read and update only the designated infographic chart. Replace existing aggregate values with validated counts, percentages, ratio, and the source-data timestamp. Preserve the approved design: grey for nonrespondents, blue for “Attending,” and red for “No longer attending.” Read the saved chart to verify its values, labels, colors, and timestamp.
- Prohibited use: Change unrelated charts, publish to additional destinations, display names or email addresses, alter source responses, or overwrite newer chart data with an older response snapshot.
- Approval required: None within the allowed use. Changes to the chart’s destination or approved design require approval from the Director of Outreach before implementation.
- Timeout per call: 20 seconds.
- Maximum retries per call: 1, subject to each subtask’s retry limit.
- Retry conditions and failure response: Retry a temporary read failure once after a 2-second wait. Retry an update only after confirming that the original attempt failed without changing the chart. If the update outcome is uncertain, read the saved chart before attempting another update. Use the same validated values when retrying to prevent duplicate changes. If the outcome cannot be verified or a discrepancy remains unresolved, record the issue and hand the case to the Director of Outreach.
Tool-specific and task-wide limits both apply. Stop at whichever limit is reached first. Naming a tool does not authorize uses outside its stated permissions.

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

- **Stop successfully when:** The saved chart has been read back and verified against the validated source snapshot. Its three category counts match the registration and response records, percentages use the stated denominator and agree within rounding, and any displayed ratio is mathematically valid. The chart uses the approved colors, describes planned attendance, includes the source-data timestamp, and contains no personal information. If the existing chart already meets these conditions, record completion without rewriting it.
- **Hand off early when:** Required survey data, the complete sign-up list, or the chart destination is missing or inaccessible; unsupported answers, unmatched records, or unresolved duplicates affect totals; no valid attendance responses are available; an update would require an unapproved action; the saved chart cannot be verified; or a timeout, retry, tool-call, or inference limit is reached before completion.
- **Hand off to:** Director of Outreach

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
