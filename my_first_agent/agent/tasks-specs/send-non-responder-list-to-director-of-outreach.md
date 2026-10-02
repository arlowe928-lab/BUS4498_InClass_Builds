# Send Non-Responder List to Director of Outreach.md
```yaml
## Basic Information

- **Task ID:** T6
- **Task name:** Send Non-Responder List to Director of Outreach
- **Task type:** Act
- **Task owner:** Director of Outreach

# Agent Inference Configuration
Provider: OpenAI
Model: gpt-6-sol
Role: Send email
Maximum inference requests per task run: 3
On inference failure or exhausted limits: Record the unresolved status and hand the case to the Director of Outreach 

```

## 1. Task Description

The AI agent sends the completed list of students who have not responded to the Cal Poly Vibe Coding Hackathon survey to the Director of Outreach through Microsoft Outlook.

Before sending, the agent verifies that the non-responder list was successfully compiled and contains the required student information. The agent then sends the list to the Director of Outreach so they can review the outstanding responses and determine any necessary follow-up actions.

## 2. Inputs

### Input 1

- **Input name:** Non-responder list
- **Contents and format:** Structured list containing the name, email address, and unique identifier of each student who has not submitted a survey response.
- **Source:** Compile List of Non-Responders task.

### Input 2

- **Input name:** Director of Outreach email address
- **Contents and format:** Valid Microsoft Outlook email address for the Director of Outreach.
- **Source:** Approved team contact information.

- **If a required input is missing or invalid:** Do not send the email. Record the missing or invalid information and refer the issue to the Director of Outreach for review.

## 3. Outputs

### Output 1

- **Output name:** Non-responder list email
- **Contents and format:** Microsoft Outlook email containing the current non-responder list, including each non-responder’s name, email address, and unique identifier.
- **Next task or recipient:** Director of Outreach.
- **Complete when:** Microsoft Outlook confirms that the email containing the non-responder list was successfully sent to the Director of Outreach.

### Output 2

- **Output name:** Email send record
- **Contents and format:** Record containing the recipient, send timestamp, and email send status.
- **Next task or recipient:** Outreach tracking records.
- **Complete when:** The send attempt and its outcome have been successfully recorded.

## 4. Planned Tools

### Tool 1

- **Tool name:** `send_non_responder_list`
- **Input:** Non-responder list, Director of Outreach email address
- **Output:** Non-responder list email, Email send record
- **Implementation Route:** Microsoft Outlook API call
- **Integration approach:** MCP integration
- **Role in this task:** Verifies that the non-responder list is available, formats the list into an email, sends it through Microsoft Outlook to the Director of Outreach, and records whether the email was successfully sent.
- **Task timeout:** 30 seconds per task run
- **Maximum retries:** 2
- **Retry only when:** Microsoft Outlook returns a temporary connection, timeout, or service-availability error and there is no confirmation that the original email was sent. Before retrying, verify the send status to prevent duplicate emails.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the email as unresolved or failed and notify the Director of Outreach through the designated exception process. Do not record the email as successfully sent.
