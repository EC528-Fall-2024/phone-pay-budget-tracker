# Mobile Payment Budget Tracker App

## Team Members

| Name       | Email           |
| ---------- | --------------- |
| Andrew Nguyen | aynguyen@bu.edu  |
| Brennan Mahoney| bmm1@bu.edu |
| Naomi Gonzalez  | ngonzalz@bu.edu     |
| Hin Lui Shum   | jshl@bu.edu  |

## Mentors

| Name           | Email              |
| -------------- | ------------------ |
| James Colley | colleyloyejames@gmail.com |
| Yashaswi Upmon  | yashaswiupmon2407@gmail.com      |
| Supriya Nanjundaswamy      | supriya.jog29@gmail.com     |


## Android Installation

### Option 1 (Recommended): Install APK 
1. **Download the APK**: [Google Drive Link](https://drive.google.com/file/d/1bd3j3kstaWTQMVPkcld4BV7CrTpCAhNB/view?usp=sharing)
2. **Install on Device or Emulator**:
   - **For physical devices**: Transfer the APK file to your device and install it.
   - **For an emulator**: Drag and drop the APK file into the running emulator.
3. **Run the Application**.

---

### Option 2: Clone and Run Locally

#### 1. Clone the Repository:
```bash
git clone https://github.com/EC528-Fall-2024/phone-pay-budget-tracker.git
```
#### 2. Install Dependencies:
```bash
cd Android/PhonePayBudgetTracker
npm install
cd android
touch local.properties
sdk.dir=/Users/<your-username>/Library/Android/sdk
./gradlew --refresh-dependencies
cd ..
npm install -g expo-cli
npx expo install nativewind tailwindcss react-native-reanimated react-native-safe-area-context
```
#### 3. Open in Android Studio:
```bash
open -a "/Applications/Android Studio.app" ./android
```
#### 4. Run the App on Emulator or Device:
```bash
npx expo run:android
```

## iOS Installation
### Requirements
- XCode
- IOS Xcode Simulator 

### Installation
#### 1. Clone the Repository:
```bash
git clone https://github.com/EC528-Fall-2024/phone-pay-budget-tracker.git
```
#### 2. Install Dependencies:
```bash
cd IOS/Frontend
npm install
```

#### 3. Run the App on IOS Emulator
```bash
npx expo start
```

## 1. Vision and Goal
The goal of the project is to create a scalable, cloud-native, budget-tracking mobile app that integrates with plaid for an all-in-one space to view and analyze your financial data.

## 2. User Cases
This app will be used by anyone who wants to improve their financial literacy, has trouble tracking their expenses, needs easy visuals to improve their spending habits, or just has too many bank accounts/credit cards to manage individually.

1. **John**
   - _Description_: John has multiple checking accounts, credit cards, and saving accounts. He sometimes does not remember to check all his accounts and does not have the time to adequately control all his spendings from these various sources.
   - _Needs_: John needs one app to track his payments throughout his 15 different cards and accounts without having to check the app of each individual bank.
  
3. **Admin**
   - _Description_: Admin is responsible for managing user access and maintaining the integrity of the app. They ensure that all users comply with the law and the rules of the app, preventing fraudulent activities, and maintaining smooth operation for all users
   - _Needs_: Admin needs a centralized control panel to restrict access for select users. This page should only be accessible to those of Admin level through secure login. They should also be able to view and delete users.

## 3. Scope and Features
In Scope:
- Secure user registration and authentication
- Admin management page with user viewing and deleting capabilities
- Track transaction history from bank accounts
- Intuitive expense analysis and visualizations
- Unit tests and cloud deployment
- Scalable database for secure app data
- Connect and scale app using cloud provider

Out of Scope:
- Fully launched app

## 4. Solution Concept
### Global Architectural Structure iOS:
![software architecture](/images/ios.png)

### Android System Architecture and User Flow Diagram
![User Flow Diagram](/images/android_architecture.png)

Plaid is used as a reputable and safe third party api to link user bank account information. It is used to pull transaction data from linked accounts.


### IOS 
- Frontend: React Native + Expo
- Authentication: AWS Cognito
  - Controls user sign up and login as well as token validation in microservices
- Microservices using AWS lambda functions
  - Transaction and Data Analysis:
    - AWS CloudFormation: template to define infrastructure of microservice
    - Plaid API: access financial information
    - Node.js
    - REST API’s
  - User Profile:
    - AWS CloudFormation: template to define infrastructure of microservice
    - Node.js
    - REST API’s
  - Admin Control:
    - React web app: frontend for admin portal
    - AWS Cognito role-based access control
    - REST APIs
    - Python
- API Gateway: AWS API Gateway
- CI/CD: GitHub Actions
- Database: DynamoDB

### ANDROID
- Frontend: React Native + Expo
- Authentication: Firebase Auth
- Account & Transaction Data: Plaid API
- Database: Cloud Firestore
- Admin Control: React App + DynamoDB + AWS Cognito + Firebase Auth
- API Gateway: GCP Cloud Functions
- CI/CD: GitHub Actions

### Android Structure:
Here is an overview of the project structure:
```plaintext
PhonePayBudgetTracker/
 ├── functions/
     └── index.js                         # Cloud functions integration
 
 └── app/
     └── (auth)/
         ├── _layout.tsx                  # Layout for authentication-related screens
         ├── loginScreen.tsx              # User login screen
         └── signupScreen.tsx             # User signup screen
     └── (components)/
         ├── AccountCard.js               # Displays account details
         ├── DonutChart.tsx               # Visualizes spending by category as a donut chart
         ├── inputForm.tsx                # Reusable input form component
         ├── LineChart.tsx                # Displays monthly spending trends as a line chart
         ├── TopCategoriesCard.tsx        # Shows top spending categories
         ├── TopTransactionsCard.tsx      # Shows top transactions by spending
         └── TransactionCard.js           # Displays individual transaction details
     └── (context)/
         ├── accountContext.tsx           # Context for managing account data
         ├── transactionContext.tsx       # Context for managing transaction data
         └── UserContext.tsx              # Context for managing user information
     └── (sections)/
         ├── Accounts.js                  # Displays accounts overview on dashboard
         ├── Header.js                    # Header component with navigation toggle
         ├── Sidebar.js                   # Sidebar navigation menu
         └── Transaction.js               # Displays transaction list on dashboard
     └── (tabs)/
         ├── _layout.tsx                  # Layout for post-login navigation
         ├── aboutUsScreen.tsx            # About Us screen with app details
         ├── analysisScreen.tsx           # Spending analysis and trends
         ├── billPlanScreen.tsx           # Billing plan selection screen
         ├── helpCenterScreen.tsx         # Help center screen with FAQs
         ├── mainScreen.tsx               # Main dashboard after login
         ├── manageScreen.tsx             # Edit user profile and settings
         ├── onBoardingScreen.tsx         # New users onboarding and link Plaid
         ├── privacyPolicyScreen.tsx      # Privacy policy details
         └── profileScreen.tsx            # Application settings and details
     └── (utils)/
         ├── fetchUtils.tsx               # Utility functions for data fetching
         ├── linkPlaidUtils.tsx           # Utility functions for Plaid integration
         ├── loginUtils.tsx               # Helper functions for login
         ├── signupUtils.tsx              # Helper functions for signup
         └── validationUtils.jsx          # Validation for login/signup form inputs
     └── _layout.jsx                      # Main layout entry point for the app

```
### Android UI
![mainScreen](/images/mainScreen.png)
![analysisScreen1](/images/analysisScreen1.png)
![analysisScreen2](/images/analysisScreen2.png)


Design Implications and Discussion:

This application adopts a microservice architecture to enable modular development, scalability, and flexibility in technology choices for each service. Here is an overview of the key components:

Architecture Components: 
1. Front-end GUI/UI
   - Purpose: We aim to provide users with an intuitive and visually appealing interface for viewing their consolidation financial data. Graphs and visualizations make sure data is easy to digest and understand.
   - Why: Ensures smooth user experience and simplifies data.
2. API Functions Entry Points
  - Purpose: Each microservice exposes unique API endpoints to enable interactions with specific functions. AWS / GCP serverless architecture supports real-time scalability by adjusting resources based on request volumes
  - Why: AWS API Gateway / GCP Cloud Functions ensures the modularity of our microservices, scalability, and efficient deployment

3. Authentication
   - Purpose: AWS Cognito / Firebase Auth manages user authentication and role-based access control. All users are added to a shared user pool, with admins added to a group within the pool with elevated privileges. Tokens from Cognito secure access to the API Gateway and the Lambda functions to keep all data secure.
   - Why: For a financial application, security is paramount. Cognito provides a robust and centralized approach to managing security concerns within the app.

4. Transaction and Data Analysis
   - Purpose: Plaid securely links and aggregates users’ bank account data. This service collects, organizes, and analyzes pulled users' transaction data from various different payment platforms, and bank accounts.
   - Why: Have an independent and secure service to handle user financial information.

5. Security Implementations
   - Purpose: Our application ensures the security and privacy of user data through strict measures, including never returning sensitive information like the accessToken to the client side and leveraging encrypted identifiers for database keys. These measures safeguard user data from potential breaches or misuse.


   - Implementation:
      - Access Token Protection:
      The accessToken is securely stored server-side and is never exposed to the client. All operations requiring the accessToken (e.g., retrieving transactions or account balances) are handled via server-side APIs. This minimizes the risk of unauthorized access.
      - Encrypted UID for Database Keys:
      User database entries utilize an encrypted version of the user's UID as their identifier. This obfuscation prevents direct access to user data and ensures that even in the unlikely event of a breach, the database structure and keys remain incomprehensible to malicious actors.
   - Why:
      These security measures are essential for a financial application handling sensitive user data. By never exposing critical information like accessToken to the client and using encrypted UIDs as keys, we create a layered security approach that protects user privacy and ensures data integrity across the application.

6. Data Storage Design: Platform-Specific Approach
   - Purpose:
   To provide an optimized user experience tailored to platform-specific needs, the design of transaction data storage varies between iOS and Android platforms:
      - iOS: Transaction data is stored in a secure centralized database to ensure persistent access across sessions and devices.
      - Android: Transaction data is stored locally in React Context (local cache) to prioritize performance and responsiveness during active sessions.
   - Implementation:
      - iOS Database Storage:
         Transaction data is securely stored in a backend database. This design ensures data is available across multiple devices and persists beyond app closures or reinstallations. The centralized storage also enables server-side analytics and efficient backup solutions.
      - Android Local Cache:
         Transaction data is stored locally in memory using React Context. This lightweight solution focuses on fast, session-specific access, allowing the app to fetch and update data dynamically without frequent server calls. The local cache is reset upon logout or session expiration for security and consistency.
   - Why:
      - iOS (Database):
         - Ensures long-term persistence of user data across sessions and devices.
         - Supports centralized analytics and backup mechanisms.
         - Offers consistency for iOS users who frequently access data on multiple Apple devices.
      - Android (Local Cache):
         - Provides a performance-centric design, minimizing server dependencies for real-time data retrieval during active use.
         - Enhances app responsiveness by avoiding network latency for every transaction update.
         - Simplifies development for session-specific data management, aligning with Android's diverse device ecosystem.

7. User Profile
  - Purpose: Holds user metadata and unique settings for their profile. 
  - Why: A user must be able to tailor an app experience to their needs and store information on the number of accounts linked.

8. Admin Control
  - Purpose: A totally separate interface from the financial app for security. Admins are able to see users of the app and remove them if they feel as if the user is using the application for malicious purposes.
  - Why: Ensures proper oversight and management of the platform without giving too much access.

9. Integration Layer
  - Purpose: Ensures consistent and reliable performance of the application through unit test coverage of both the frontend and backend components. A CI/CD pipeline automates testing and cloud deployment.
  - Why: Promotes software consistency and quality and a streamlined development and update process.

## 5. Acceptance Criteria
Minimum Acceptance Criteria:
- App able to run on IOS and Android emulators
- Able to securely receive financial information
- Able to create simple analyses and graphs from data received
- Able to manage data and see its overview from the admin portal


## 6. Release Planning
1. Sprint 1 | [Video](https://drive.google.com/file/d/1cg6foiZNHz1umlqbRjRblaXEWv6Vn9a6/view?usp=sharing) | [Slides](https://docs.google.com/presentation/d/1PdOa5CJWINqlqsrM9BU1k0yq5qJ377nHfTmoPCIcJRA/edit?usp=sharing)
   - Make design decisions and create plan for development
   - Create simple test UI of app pages using React Native
   - Create and test local API gateway
2. Sprint 2 | [Video](https://drive.google.com/file/d/1vgQqm39kYifTXs3IUkoG8ieGKExtU4m4/view?usp=sharing) | [Slides](https://docs.google.com/presentation/d/1fFp8IKXdV4HfbzRrYJrmV8z269l-AxWpU7dCllMW5pU/edit?usp=sharing)
   - Analyze architecture decisions and make adjustments
   - Add authentication using AWS Cognito and implement sign up and login
   - Create bases for all microservices
   - Start CI/CD pipeline to ensure smooth further development
   - Connect microservice to API gateway and test locally
3. Sprint 3 | [Video](https://drive.google.com/file/d/17GjCx7kCwknXN-Tg0384MRtkwxDArMeo/view?usp=sharing) | [Slides](https://docs.google.com/presentation/d/1c-rZZOEFvjer7FCvhaeeOTezc5iSvI8Inz6U74GK3Fc/edit?usp=sharing)
   - Choose Plaid third-party API and connect to transaction and data analysis microservice.
   - Successfully store mock data in DynamoDB and display in IOS Expo app 
   - Update UI
   - Separate IOS and Android for ease of development
4. Sprint 4 | [Video](https://drive.google.com/file/d/1OVubMdz_gnoPZWPvgfdGLR3YbKL7gQlS/view?usp=sharing) | [Slides](https://docs.google.com/presentation/d/1bUKGUhu--5mr0x2RcuwG7BEYDW1C2iyG2uoDHJuxKHs/edit?usp=sharing)
   - Create real Plaid user and connect to app
   - Update microservices to correctly connect databases, API gateway, and frontend
   - More UI updates
   - end-to-end IOS integration
5. Sprint 5 | iOS ->  [Video](https://drive.google.com/file/d/1ssnRE09APachdxAk1qXORDTYaNrPPz6v/view?usp=sharing) | [Slides](https://docs.google.com/presentation/d/1ps0tMNt_lfaHvWWq752TarxN84oRCgcKXDbud6M7yes/edit?usp=sharing)
| Android -> [Video](https://drive.google.com/file/d/14kB4pkwYCbw6NmTBmcH1e5-PM8ZCjOS7/view?usp=sharing) | [Slides](https://docs.google.com/presentation/d/1LTs_HDMRNyy8TC-LfvsPJq1Z_TUDRjZkrM6maFlkIo4/edit?usp=sharing)
   - Increase security of app by managing Cognito tokens throughout API gateway and microservices
   - Secure database by only allowing certain actions to certain functions
   - Admin portal able to view and delete users
   - Have unit tests for everything
   - Deploy microservices and API gateway to cloud
   - Deployment discussions and considerations for scalability
6. Final Presentation | [Video](https://drive.google.com/file/d/1fnNzdi4zgp3IspeO2UI4No4rK_DU1hrL/view?ts=6754c339) | [Slides](https://docs.google.com/presentation/d/1BXvmnuQdKUjN8flTnhV0rTST8W_Y3Yhj4lsXC-gu22o/edit?usp=sharing)

