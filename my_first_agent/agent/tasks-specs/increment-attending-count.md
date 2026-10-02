# Increment Attending Count
```yaml
## Basic Information

- **Task ID:** T4
- **Task name:** Increment Attending Count
- **Task type:** Act
- **Task owner:** Director of Outreach
# Agent Inference Configuration
Provider: OpenAI
Model: gpt-6-sol
Role: Tally count
Maximum inference requests per task run: 2
On inference failure or exhausted limits: Record the unresolved status and hand the case to the Director of Outreach

```
## 1. Task Description

The AI agent updates the total number of students attending the Cal Poly Vibe Coding Hackathon. When a student is classified as **“Attending,”** the agent increments the attending count by one.

The count is updated only when a valid **“Attending”** classification is received. A student classified as **“No longer attending”** does not cause the attending count to increase.

## 2. Inputs

### Input 1

- **Input name:** Attendance classification
- **Contents and format:** Structured record containing the student identifier and assigned attendance category. The category must be **“Attending”** to trigger an increment.
- **Source:** Assign Attendance Category task.

### Input 2

- **Input name:** Current attending count
- **Contents and format:** Whole-number value representing the current number of students classified as **“Attending.”**
- **Source:** Attendance tracking data.

- **If a required input is missing or invalid:** Do not modify the attending count. Record the issue and refer the case to the Director of Outreach for review.

## 3. Outputs

### Output 1

- **Output name:** Updated attending count
- **Contents and format:** Whole-number value representing the previous attending count plus one.
- **Next task or recipient:** Attendance tracking data and the task responsible for updating the infographic chart.
- **Complete when:** The attending count has been increased by exactly one and the updated value has been successfully recorded.

## 4. Planned Tools

### Tool 1

- **Tool name:** `increment_attending_count`
- **Input:** Attendance classification, Current attending count
- **Output:** Updated attending count
- **Implementation Route:** Database query
- **Integration approach:** Direct integration
- **Role in this task:** Verifies that the student’s attendance classification is **“Attending”** and increases the stored attending count by exactly one. The update must be associated with the processed student response to prevent the same response from incrementing the count more than once.
- **Task timeout:** 10 seconds per update
- **Maximum retries:** 1
- **Retry only when:** A temporary database or connection error prevents the update and there is confirmation that the original update was not completed. Before retrying, verify that the student’s response has not already incremented the count to prevent duplicate counting.
- **On timeout, exhausted retries, or an error that cannot be retried:** Leave the attending count unchanged, record the failed update, and send the case to the Director of Outreach for review.
