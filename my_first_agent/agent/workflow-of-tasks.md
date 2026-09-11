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

```mermaid
flowchart TD
Start(["Trigger: Hackathon start date scheduled"]) --> D1{"3 days before hackathon start date?"}
D1 -->|"No"| D1
D1 -->|"Yes"| T1["Send follow-up email to sign-ups"]
T1 --> D2{"New response received?"}
D2 -->|"Yes"| T2["Record survey response"]
T2 --> D3{"Response indicates attending?"}
D3 -->|"Yes"| T3["Increment attending count"]
D3 -->|"No"| T4["Increment not-attending count"]
T3 --> T5["Update infographic chart"]
T4 --> T5
T5 --> D4{"1 day before hackathon start date?"}
D2 -->|"No"| D4
D4 -->|"No"| D2
D4 -->|"Yes"| T6["Compile non-responder email list"]
T6 --> T7["Send non-responder list to Director of Outreach"]
T7 --> End(["Completion: Non-responder list sent to Director of Outreach"])
```
