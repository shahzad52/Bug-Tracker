# Bug Tracking System 🐛

A web application designed for managing software projects, tracking bugs, and facilitating collaboration between managers, QA testers, and developers.

---

## Features

### Authentication & Roles
* **Sign Up/Login/Logout:** Secure user authentication using email/password via Supabase Auth.
* **User Roles:** Three distinct roles with specific permissions:
    * **Manager:** Can create projects and assign users.
    * **QA:** Can create bugs within assigned projects.
    * **Developer:** Can update the status of assigned bugs.

### Projects
* **Creation:** Managers can create new software projects.
* **Assignment:** Managers can assign multiple QAs and Developers to each project.

### Bugs
* **Creation:** QAs can report bugs or feature requests, but only within projects they are assigned to.
* **Assignment:** Each bug is linked to a specific project and assigned to a Developer.
* **Status Updates:** Developers update the status of the bugs assigned to them.
* **Visibility:** Managers can view all bugs associated with the projects they created.
* **Details:** Bugs include:
    * `title` (must be unique within the project)
    * `description` (optional)
    * `deadline` (optional)
    * `screenshot` (optional, PNG/GIF only)
    * `type` (`feature` or `bug`)
    * `status` (dependent on `type`)
* **Status Logic:**
    * If `type` is `feature`, status can be `new`, `started`, or `completed`.
    * If `type` is `bug`, status can be `new`, `started`, or `resolved`.

### Notifications
* **Notification Alerts:** Automatic notifications are sent when:
    * A user is added to a project.
    * A bug is assigned to a developer.

---

## Tech Stack (Example)

* **Frontend:** React, Tailwind CSS, Axios, React Router
* **Backend:** Django, Django REST Framework
* **Database:** PostgreSQL 
* **Authentication:** JwtToken
---

## Non-Functional Requirements

* **UI:** Clean, consistent, and responsive user interface built with Tailwind CSS.
* **Validation:** Robust input validation implemented on both the client-side (React) and server-side (Django).
* **Code Quality:** Emphasis on readable, organized code with meaningful naming conventions and comments for complex logic.
* **Testing:** Includes basic, relevant automated tests for core functionalities.

---
