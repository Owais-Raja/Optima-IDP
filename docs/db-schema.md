# Database Schema Documentation

This document describes the MongoDB schema used in the Optima IDP application.

## User
Stores all users in the system (Employees, Managers, Admins).

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | String | Yes | Full name of the user |
| `email` | String | Yes | Unique login email (lowercase) |
| `password` | String | Yes | Hashed password |
| `role` | String | No | Access level: `employee` (default), `manager`, `admin` |
| `skills` | Array | No | List of user skills |
| `skills.skillId` | ObjectId | - | Reference to `Skill` model |
| `skills.level` | Number | - | Skill level (1-10), default 1 |
| `refreshToken` | String | No | JWT refresh token for session management |
| `createdAt` | Date | - | Auto-generated timestamp |
| `updatedAt` | Date | - | Auto-generated timestamp |

## Skill
Stores individual skills.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | String | Yes | Unique skill name (e.g., "JavaScript") |
| `category` | String | Yes | Category (e.g., "Technical", "Soft Skill") |
| `description` | String | No | Optional description |
| `createdAt` | Date | - | Auto-generated timestamp |
| `updatedAt` | Date | - | Auto-generated timestamp |

## Resource
Learning resources (courses, articles, etc.) to help improve skills.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `title` | String | Yes | Title of the resource |
| `type` | String | Yes | Type: `course`, `video`, `article`, `certification`, `document`, `other` |
| `url` | String | Yes | Link to the resource |
| `skill` | ObjectId | Yes | Reference to `Skill` model |
| `provider` | String | No | Provider (e.g., "Udemy"), default "Unknown" |
| `difficulty` | String | No | `beginner` (default), `intermediate`, `advanced` |
| `description` | String | No | Optional description |
| `duration` | String | No | Optional duration (e.g., "3 hours") |
| `createdAt` | Date | - | Auto-generated timestamp |
| `updatedAt` | Date | - | Auto-generated timestamp |

## IDP (Individual Development Plan)
Tracks employee development goals and progress.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `employee` | ObjectId | Yes | Reference to `User` (Employee) |
| `skillsToImprove` | Array | No | List of skills to work on |
| `skillsToImprove.skill` | ObjectId | Yes | Reference to `Skill` |
| `skillsToImprove.currentLevel` | Number | - | Current skill level (default 1) |
| `skillsToImprove.targetLevel` | Number | - | Target skill level (default 5) |
| `recommendedResources` | Array | No | List of references to `Resource` |
| `goals` | String | No | Employee's goals (free text) |
| `managerFeedback` | String | No | Manager's comments |
| `status` | String | No | `draft` (default), `pending`, `approved`, `completed` |
| `createdAt` | Date | - | Auto-generated timestamp |
| `updatedAt` | Date | - | Auto-generated timestamp |

## PerformanceReport
Manager evaluations of employee performance.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `employee` | ObjectId | Yes | Reference to `User` (Employee) |
| `manager` | ObjectId | Yes | Reference to `User` (Manager) |
| `reviewPeriod` | String | Yes | Period (e.g., "Q1 2025") |
| `strengths` | String | No | Strengths text |
| `weaknesses` | String | No | Weaknesses text |
| `rating` | Number | Yes | Numeric score (1-5) |
| `relatedSkills` | Array | No | List of references to `Skill` |
| `managerComments` | String | No | Overall comments |
| `createdAt` | Date | - | Auto-generated timestamp |
| `updatedAt` | Date | - | Auto-generated timestamp |
