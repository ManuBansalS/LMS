# LMS API Documentation

## Base URL
```
http://localhost:3000
```

## Swagger Documentation
Interactive API documentation is available at:
```
http://localhost:3000/api
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### User Roles
- `0` - STUDENT
- `1` - INSTRUCTOR

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "Password123!",
  "firstname": "John",
  "lastname": "Doe",
  "role": 0
}
```

**Response:** `201 Created`
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "username": "john_doe",
    "email": "john@example.com",
    "role": 0
  }
}
```

### Login
**POST** `/auth/login`

Authenticate and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "Password123!"
}
```

**Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "username": "john_doe",
    "email": "john@example.com",
    "role": 0
  }
}
```

### Refresh Token
**GET** `/auth/refresh`

Obtain a fresh JWT reflecting the current role/status of the authenticated user. The request must include the existing bearer token; the new token will be signed after looking up the user in the database (useful after role promotions).

**Response:** `200 OK`
```json
{
  "token": "<new_jwt>",
  "user": { /* same shape as login response */ }
}
```

---

## Course Endpoints

### Get All Courses
**GET** `/courses`

Get all courses with optional filters. Public endpoint.

**Query Parameters:**
- `title` (optional) - Search by course title
- `instructorId` (optional) - Filter by instructor ID
- `status` (optional) - Filter by status (draft/published/archived)

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "title": "React Mastery",
    "description": "Complete React course",
    "duration": "8 weeks",
    "price": 4999,
    "language": "English",
    "status": "published",
    "instructorId": "uuid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "sections": []
  }
]
```

### Get Published Courses
**GET** `/courses/published`

Get only published courses. Public endpoint.

**Response:** `200 OK`

### Get My Courses
**GET** `/courses/my-courses`

Get instructor's own courses. Requires INSTRUCTOR role.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`

### Get Course by ID
**GET** `/courses/:id`

Get detailed course information including sections. Public endpoint.

**Response:** `200 OK`
```json
{
  "id": 1,
  "title": "React Mastery",
  "description": "Complete React course",
  "duration": "8 weeks",
  "price": 4999,
  "language": "English",
  "status": "published",
  "sections": [
    {
      "id": 1,
      "title": "Introduction",
      "description": "Getting started",
      "orderIndex": 0
    }
  ],
  "instructor": {
    "id": "uuid",
    "username": "instructor_name"
  }
}
```

### Create Course
**POST** `/courses`

Create a new course with optional sections. Requires INSTRUCTOR role.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "React Mastery",
  "description": "Complete React course from beginner to advanced",
  "duration": "8 weeks",
  "price": 4999,
  "language": "English",
  "status": "draft",
  "thumbnailUrl": "https://example.com/thumbnail.jpg",
  "videoUrl": "https://example.com/intro.mp4",
  "sections": [
    {
      "title": "Introduction",
      "description": "Getting started with React",
      "orderIndex": 0
    },
    {
      "title": "Advanced Concepts",
      "description": "Hooks and Context",
      "orderIndex": 1
    }
  ]
}
```

**Response:** `201 Created`

### Update Course
**PATCH** `/courses/:id`

Update course details. Only course owner can update. Requires INSTRUCTOR role.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "React Mastery Updated",
  "status": "published"
}
```

**Response:** `200 OK`

### Delete Course
**DELETE** `/courses/:id`

Delete a course. Only course owner can delete. Requires INSTRUCTOR role.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`

---

## Enrollment Endpoints

### Create Enrollment
**POST** `/enrollments`

Enroll in a course. Requires STUDENT role.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "courseId": 1,
  "userId": "uuid"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "userId": "uuid",
  "courseId": 1,
  "status": "active",
  "progress": 0,
  "enrolledAt": "2024-01-01T00:00:00.000Z"
}
```

### Get Enrollments
**GET** `/enrollments`

Get enrollments. Students see their own, instructors see all.

**Query Parameters:**
- `userId` (optional) - Filter by user ID
- `courseId` (optional) - Filter by course ID

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`

### Check Enrollment
**GET** `/enrollments/check/:courseId`

Check if user is enrolled in a course. Requires STUDENT role.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
true
```

### Update Enrollment
**PATCH** `/enrollments/:id`

Update enrollment status or progress.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "completed",
  "progress": 100
}
```

**Response:** `200 OK`

### Delete Enrollment
**DELETE** `/enrollments/:id`

Unenroll from a course.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`

---

## Section Endpoints

### Create Section
**POST** `/sections`

Create a new section in a course. Requires INSTRUCTOR role and course ownership.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "courseId": 1,
  "title": "Advanced Topics",
  "description": "Deep dive into advanced concepts",
  "orderIndex": 2
}
```

**Response:** `201 Created`

### Get Sections
**GET** `/sections`

Get all sections or filter by course.

**Query Parameters:**
- `courseId` (optional) - Filter by course ID

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`

### Get Section by ID
**GET** `/sections/:id`

Get section details with contents and quizzes.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`

### Update Section
**PATCH** `/sections/:id`

Update section. Only course owner can update. Requires INSTRUCTOR role.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Updated Section Title",
  "orderIndex": 3
}
```

**Response:** `200 OK`

### Delete Section
**DELETE** `/sections/:id`

Delete section. Only course owner can delete. Requires INSTRUCTOR role.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`

---

## Content Type Endpoints

### Create Content
**POST** `/content-types`

Create content in a section. Requires INSTRUCTOR role and course ownership.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "sectionId": 1,
  "type": "video",
  "title": "Introduction Video",
  "content": "Video description",
  "url": "https://example.com/video.mp4",
  "duration": 600,
  "orderIndex": 0
}
```

**Content Types:**
- `video`
- `article`
- `quiz`
- `assignment`
- `resource`

**Response:** `201 Created`

### Get Contents
**GET** `/content-types`

Get all contents or filter by section/type.

**Query Parameters:**
- `sectionId` (optional) - Filter by section ID
- `type` (optional) - Filter by content type

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`

### Get Content by ID
**GET** `/content-types/:id`

Get content details.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`

### Update Content
**PATCH** `/content-types/:id`

Update content. Only course owner can update. Requires INSTRUCTOR role.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`

### Delete Content
**DELETE** `/content-types/:id`

Delete content. Only course owner can delete. Requires INSTRUCTOR role.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`

---

## Quiz Endpoints

### Create Quiz
**POST** `/quizzes`

Create a quiz in a section. Requires INSTRUCTOR role and course ownership.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "sectionId  ": 1,
  "title": "React Basics Quiz",
  "description": "Test your React knowledge",
  "duration": 1800,
  "passingScore": 70,
  "questions": {
    "questions": [
      {
        "id": 1,
        "question": "What is React?",
        "options": ["Library", "Framework", "Language"],
        "correctAnswer": 0
      }
    ]
  }
}
```

**Response:** `201 Created`

### Get Quizzes
**GET** `/quizzes`

Get all quizzes or filter by section.

**Query Parameters:**
- `sectionId` (optional) - Filter by section ID

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`

### Get Quiz by ID
**GET** `/quizzes/:id`

Get quiz details.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`

### Update Quiz
**PATCH** `/quizzes/:id`

Update quiz. Only course owner can update. Requires INSTRUCTOR role.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`

### Delete Quiz
**DELETE** `/quizzes/:id`

Delete quiz. Only course owner can delete. Requires INSTRUCTOR role.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`

---

## Progress Endpoints

### Create/Update Progress
**POST** `/progress`

Create or update progress for content.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "contentId": 1,
  "courseId": 1,
  "sectionId": 1,
  "completed": false,
  "progressPercentage": 50,
  "timeSpent": 300
}
```

**Response:** `201 Created`

### Mark Content Complete
**POST** `/progress/complete/:contentId`

Mark content as completed.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "courseId": 1,
  "sectionId": 1
}
```

**Response:** `201 Created`

### Get Course Progress
**GET** `/progress/course/:courseId`

Get user's progress for a specific course.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "courseId": 1,
  "userId": "uuid",
  "overallProgress": 45,
  "completedContent": 9,
  "totalContent": 20,
  "totalTimeSpent": 3600,
  "sectionProgress": [
    {
      "sectionId": 1,
      "completed": 5,
      "total": 10,
      "progress": 50,
      "timeSpent": 1800
    }
  ],
  "contentProgress": []
}
```

### Get All Progress
**GET** `/progress/all`

Get user's progress across all courses.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`

### Get Content Progress
**GET** `/progress/content/:contentId`

Get progress for specific content.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`

### Reset Course Progress
**DELETE** `/progress/course/:courseId`

Reset all progress for a course.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`

---

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Invalid or expired token",
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Resource not found",
  "error": "Not Found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "User already enrolled in this course",
  "error": "Conflict"
}
```

---