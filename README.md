# Mobile Payment Budget Tracker App

## 1. Vision and Goal
The goal of the project is to create a scalable cloud-native budget-tracking mobile app that integrates with popular mobile payment systems such as Gpay, Apple Pay, etc. providing users with enhanced visuals and analysis of their spending habits. 

## 2. User Cases
This app will be used by anyone who does a lot of online shopping on their phone, doesn't like to carry physical cards around, or generally feels as if they need a centralized place to track their online purchases and needs help creating good financial habits.

1. **John**
   - _Description_: John does not like to carry his bulky wallet around. It barely fits in his pocket with how many cards he has and he is worried that it may be a prime target for a thief.
   - _Needs_: John needs one app to track his mobile payments throughout his 15 different cards without having to check the app of each individual bank

2. **Hannah**
   - _Description_: Hannah has very bad spending habits. It is too easy to whip out her phone at every shop and pay with her phone without looking at how much she has already spent because it is too difficult to keep track of her money.
   - _Needs_: Hannah needs an intuitive financial app that will analyze her spending habits in a readable and digestible format so she can see how much she spends and work towards her goal of saving money.
  
3. **Admin**
   - _Description_: Admin is responsible for managing user access and maintaining the integrity of the app. They ensure that all users comply with the law and the rules of the app, preventing fraudulent activities, and maintaining smooth operation for all users
   - _Needs_: Admin needs a centralized control panel to monitor user activity and restrict access for select users. This page should only be accessible to those of Admin level through secure login. They should also be able to adjust permissions and unblock or delete users

## 3. Scope and Features
In Scope:
- User login and authentication: AWS Cognito or Auth0 for authentication and role-based access control
- Admin management page with user restriction capabilities
- Track transaction history from popular payment apps
- Expense categorization, trend analysis, and visualization
- Daily/Weekly spending breakdowns and insights
- App, server code unit test and coverage/code lint checker integration
- CI/CD pipeline: Terraform to manage cloud infrastructure and GitHub Actions for automatic testing and deploying code/infrastructure resources
- Scalable database for user data: NoSQL DB such as MongoDB
- Connect and scale app using AWS

Out of Scope:
- Fully launched app

## 4. Solution Concept
Global Architectural Structure:
![software architecture](/images/architecture.png)
- Frontend: React Native + Expo
- Backend: Node.js + Express.js + Python
   - AWS Lambda
   - AWS API Gateway
- Database: MongoDB
  - MongoDB Atlas or AWS EC2
- Cloud: AWS
  - AWS CLoudwatch: monitor app performance
  - AWS EC2: host backend on EC2 instances for scaling
  - AWS Cognito: authentication
- CI/CD: GitHub Actions + Terraform
- Security: AWS Cognito

Design Implications and Discussion:
A microservice architecture was used for the benefits of modular development, scalability, and the ability to have multiple tech stacks for each individual microservice.

1. Front-end GUI/UI
- Financial data in easy to understand and intuitive graphs

2. API Gateway
- Responsible for recieving and redirecting API request to the corresponding microservice 

3. Authentation 
- Handles user registration, login, logout, and passwords

4. Transaction
- Request and accumalates data from different payment platforms. Then parses this data to house in a uniform format. Also holds user inputed financial data.

5. Data Analysis 
- Finds trends and analyzes users financial statement history. Also categorizes expenses.

6. Notifications
- Creates and sends custom notfications for each user

7. User Profile
- Saves user profile and prefrences including what kinds of graphics they like best to show thier financial data

8. Admin Control
- Admin user accounts and privalges such as blocking or restricting users

9. Monitoring/Logs
- Collects logs from all the individual microservices to monitor thier work and help realize when a microservice might need to expand based on demand. 

10. Integration Layer
- Unit test coverage and code lint system integration to both the frontend and backend. Also CI/CD pipeline for test and delpoyment of software

## 5. Acceptance Criteria
Minimum Acceptance Criteria:
- App UI able to run on IOS and Android emulator
- Able to receive financial information
- Able to create simple analyses and graphs from data received
- Able to manage data and see its overview from the admin portal

Stretch Goals:
- Integrating machine learning for data analysis
- Integrate payments through the app so financial data will upload automatically instead of manually


## 6. Release Planning
1. Sprint 1
   - Login function and a simple chart on a UI based on hard-coded of user financial data. 
2. Sprint 2
   - Setup API server and storing user data in a DB
3. Sprint 3
   - Define a set schema, make all API endpoints, improvements to frontend
4. Sprint 4
   - Create CI/CD Job, continue improvements as necessary
5. Sprint 5
   - Upload to cloud service and finished touches, create ways to monitor and maintain the application
