---
alwaysApply: true
---
# App Structure & Requirements

This document defines the mandatory structure and requirements for all "Apps" within the platform. An "App" corresponds to a major domain section visible in the Workspace Dashboard (e.g., Pyramid Solver, Product Definition, Technical Architecture).

## 1. Dashboard Integration
- **Workspace Card**: Every App must have a dedicated card component displayed on the main Workspace Dashboard.

## 2. App Page Requirements
The main page for the App must include:
- **CRUD Operations**:
  - **Create**: A button to create new objects, opening a modal form.
  - **Rename**: Ability to rename existing objects.
  - **Delete**: A secure delete mechanism where the user **must type the name of the object** to confirm deletion.
- **Search**:
  - A search bar or functionality to filter/find objects within the App page.

## 3. Global Context Integration
- **Context Category**: The App's domain objects must be registered as a distinct category in the Global Context.
- **Context Usage**: Objects from this App must be selectable and usable within the Global Context (e.g., for AI context or cross-referencing).

## Summary of "Must-Haves"
| Feature | Requirement |
| :--- | :--- |
| **Dashboard** | Dedicated Card |
| **Creation** | Modal-based |
| **Deletion** | Requires typing object name |
| **Renaming** | Supported |
| **Local Search** | Filter objects in App Page |
| **Global Context** | Registered as Category & Usable |

Any additional features are specific to the App, but these base requirements are mandatory for consistency.
