# Workflow of Tasks

*Replace all bracketed prompts with information specific to your proposed system. Delete instructional text that does not belong in your final specification. Add or remove task sections as needed. Every task shown in the general workflow must have a corresponding task specification below.*

## 1. Workflow Overview
### 1.1 Workflow Goal
This workflow supports the system goal defined in `my_first_agent/README.md`.

### 1.2 Workflow Trigger

A student fills out the attendance form and lists their email. 

### 1.3 Completion Condition at Runtime

The workflow is completed when the list of all non-responses has been sent to CPVC's director of outreach.  

### 1.4 General Workflow

Exactly three days prior to the Hackathon start date, the system will send out a follow-up email to all current sign-ups. The email will ask one question: "Do you plan on attending CPVC's Upcoming Hackathon on [Insert Date, Insert Time, Insert Location]?" The system will continuously record the answers to this survey and use the data to create an infographic chart showing the number of people attending and the number of people no longer planning to attend. 

One day before the start of a hackathon, the system will compile a list of all emails of students who have not responded and will send the list to CPVC's director of outreach. 

### 1.5 Workflow Diagram

[Insert a flowchart showing the tasks in sequence. Label each task with a task number and short name. Show decision branches, loops, review points, and possible stopping conditions. Below is an example of a Mermaid. You can either edit the mermaid below yourself or ask ChatGPT to generate a Mermaid script based on your workflow description above. Give every task a unique ID, such as T1, T2, and T3, and name tasks using a verb and an object in the mermaid.]

```mermaid
flowchart TD
    Trigger --> T1
T1 --> T2
T2 --> D1
D1 -- "No response yet" --> D3
D1 -- "Responded" --> D2
D2 -- "Still attending" --> T3
D2 -- "No longer attending" --> T3
T3 --> D3
D3 -- "Not yet one day before" --> T2
D3 -- "One day before Hackathon" --> T4
T4 --> T5
T5 --> Completion
```
