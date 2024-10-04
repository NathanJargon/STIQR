# Student Attendance Tracker

This project is a Student Attendance Tracker application built using React Native and Firebase. The application allows teachers to create student profiles, generate QR codes for students, and track their attendance. Students can scan QR codes to mark their attendance, and teachers can view the attendance records.

## Features

- **Teacher Dashboard:** Teachers can create student profiles with email, password, name, and section. They can also generate QR codes for students and view all students.
- **Student Dashboard:** Students can scan QR codes to mark their attendance. The application tracks the number of times a student has scanned the QR code.
- **Attendance Tracking:** The application tracks the attendance dates for each student and displays them on a calendar with dots.
- **Detailed View:** Teachers can view detailed information about each student, including their attendance dates, by clicking on a student card.

## Technologies Used

- **React Native:** For building the mobile application.
- **Firebase:** For authentication and Firestore database.
- **Expo:** For development and testing.

## Getting Started

To get started with the project, follow these steps:

1. Clone the repository.
2. Install the dependencies using `npm install` or `yarn install`.
3. Set up Firebase and update the Firebase configuration in `FirebaseConfig.js`.
4. Run the application using `expo start`.

## License

This project is licensed under the MIT License.