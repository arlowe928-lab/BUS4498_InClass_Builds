# Compile List of Non-Responders 

## Basic Information

- **Task ID:** T5


- **Task name:** Compile List of Non-Responders
- **Task type:** Retrieve
- **Task owner:** Director of Outreach

## 1. Task Description

The AI agent compiles a list of students who have not yet submitted a survey response for the Cal Poly Vibe Coding Hackathon. The agent compares the complete sign-up list against the submitted survey responses and identifies students for whom no response has been recorded.

Students who have submitted either **“Attending”** or **“No longer attending”** are excluded from the non-responder list. The resulting list is used to track outstanding responses and support follow-up outreach.

## 2. Inputs

### Input 1

- **Input name:** Complete sign-up list
- **Contents and format:** Structured list containing each registered student’s name, email address, and unique identifier.
- **Source:** Cal Poly Vibe Coding Hackathon sign-up records.

### Input 2

- **Input name:** Survey response records
- **Contents and format:** Structured records containing students who have submitted a survey response and their assigned attendance status of **“Attending”** or **“No longer attending.”**
- **Source:** Survey response tracking data.

- **If a required input is missing or invalid:** Do not compile the non-responder list. Record the missing or invalid input and refer the case to the Director of Outreach for review.

## 3. Outputs

### Output 1

- **Output name:** Non-responder list
- **Contents and format:** Structured list containing the name, email address, and unique identifier of each student who has not submitted a survey response.
- **Next task or recipient:** Attendance tracking data and Director of Outreach.
- **Complete when:** Every student on the complete sign-up list has been checked against the survey response records and all students without a recorded response are included in the non-responder list.

## 4. Planned Tools

### Tool 1

- **Tool name:** `compile_non_responders`
- **Input:** Complete sign-up list, Survey response records
- **Output:** Non-responder list
- **Implementation Route:** Database query
- **Integration approach:** Direct integration
- **Role in this task:** Compares the complete sign-up list with submitted survey response records. Students with a recorded **“Attending”** or **“No longer attending”** response are excluded, while students without a recorded response are added to the non-responder list.
- **Task timeout:** 30 seconds per task run
- **Maximum retries:** 1
- **Retry only when:** A temporary database or connection error prevents access to the sign-up or survey response records. Retry only after confirming the first attempt did not successfully produce a complete list.
- **On timeout, exhausted retries, or an error that cannot be retried:** Do not use or distribute an incomplete non-responder list. Record the failure and send the case to the Director of Outreach for review.
