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
To be Implemented

## Android System Architecture and User Flow Diagram
![User Flow Diagram](/images/android_architecture.png)

## Android Structure:
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
## Android UI
![mainScreen](/images/mainScreen.png)
![analysisScreen1](/images/analysisScreen1.png)
![analysisScreen2](/images/analysisScreen2.png)

## 1. Vision and Goal
The goal of the project is to create a scalable, cloud-native, budget-tracking mobile app that integrates with popular mobile payment systems, providing users with enhanced visuals and analysis of their spending habits. 

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
- User login and authentication: AWS Cognito authentication and role-based access control
- Admin management page with user restriction capabilities
- Track transaction history from popular payment apps
- Expense categorization, trend analysis, and visualization
- Daily/Weekly spending breakdowns and insights
- CI/CD pipeline: Github Actions for code unit tests and cloud deployment
- Scalable database for user data: DynamoDB
- Connect and scale app using AWS

Out of Scope:
- Fully launched app

## 4. Solution Concept
Global Architectural Structure:
![software architecture](/images/architecture.png)
- Frontend: React Native + Expo
- Authentication: AWS Cognito
  - AWS Secrets Manager
- Transaction and Data Analysis: Node.js + Express.js + DynamoDB + Python
  - AWS Lambda
- User Profile: Node.js + Express.js + DynamoDB
  - AWS Lambda
- Admin Control: Node.js + Express.js + DynamoDB
  - AWS IAM
  - AWS CloudWatch
  - AWS Lambda
  - AWS API Gateway
- API Gateway: AWS API Gateway
- CI/CD: GitHub Actions + Terraform

Design Implications and Discussion:

A microservice architecture was used for the benefits of modular development, scalability, and the ability to have multiple tech stacks for each individual microservice.

1. Front-end GUI/UI
- As the primary focus of this application is to display users' financial data in easy-to-understand and intuitive graphs, the front-end UI is an important part of the project. This allows users to easily view their consolidated financial statements from multiple external platforms. Furthermore, visual graphics will help users understand trends and behaviors in their spending and display future budgeting tips.

2. API Gateway
- The API gateway is important to receive and redirect API requests to the corresponding microservice. It acts as the main link between all the separated microservices and controls the flow of data. 

3. Authentication 
- Handles user registration, login, logout, and passwords. This is important to handle the main security of the app and distribute active tokens.

4. Transaction and Data Analysis
- Since financial data needs to be acquired from various third-party platforms there needs to be a service that requests and accumulates data from the different payment platforms. This will also hold user input financial data. Therefore, it is necessary to organize and parse all user financial data in to a uniform aggregated fashion. In order to understand user data this back-end server also needs to find trends and analyze the user's financial statement history. This includes categorizing expenses and possibly ML based on user data. 

- The reason why these two tasks are joined into one service is due to the fact that a bottleneck can be created if all the user financial data is stored in one microservice and a different microservice needs to request all the data to do analysis for that user. The API gateway would constantly need to send user data to the analysis microservice especially since user financial data from the third-party processing payments would need to be constantly requested and refreshed. Furthermore, conducting the analysis of the data on the same microservice has the benefit of locality to the DB that is storing the financial data.

6. Notifications
- In order to keep users aware of their budget and spending habits a notification service is needed to create and send custom notifications for each user.

7. User Profile
- Each individual user can have a different purpose for using the app. Some may want to use it to help budget, others might just want to analyze their statements, etc. This service saves user profiles and preferences including graphics preferences

8. Admin Control
- It is important for applications to have administrator accounts with different privileges from regular users. This service keeps track of admin user accounts and privileges such as blocking or restricting users.

9. Monitoring/Logs
- Since microservices are modular and self-contained it is important to keep track of how each microservice communicates with the API gateway and each other. The purpose of this service is to collect logs from all the individual microservices to monitor their performance and workload.

10. Integration Layer
- In order to produce consistent and dependable software, unit test coverage and code lint system integration are important to both the frontend and each individual microservice. Also a CI/CD pipeline is necessary for the testing and deployment of software.

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
1. Sprint 1 | [Video](https://drive.google.com/file/d/1cg6foiZNHz1umlqbRjRblaXEWv6Vn9a6/view?usp=sharing) | [Slides](https://docs.google.com/presentation/d/1PdOa5CJWINqlqsrM9BU1k0yq5qJ377nHfTmoPCIcJRA/edit?usp=sharing)
   - Create an authentication microservice, have a usable API gateway, and create front-end sign-in and home page.
2. Sprint 2 | [Video](https://drive.google.com/file/d/1vgQqm39kYifTXs3IUkoG8ieGKExtU4m4/view?usp=sharing) | [Slides](https://docs.google.com/presentation/d/1fFp8IKXdV4HfbzRrYJrmV8z269l-AxWpU7dCllMW5pU/edit?usp=sharing)
   - Setup main aggregated financial data DB and have user upload data functionality. Then Link with API gateway accordingly. Furthermore create first UI graph to display data
3. Sprint 3 | [Video](https://drive.google.com/file/d/17GjCx7kCwknXN-Tg0384MRtkwxDArMeo/view?usp=sharing) | [Slides](https://docs.google.com/presentation/d/1c-rZZOEFvjer7FCvhaeeOTezc5iSvI8Inz6U74GK3Fc/edit?usp=sharing)
   - Set up linking from third party payment processing methods and storing user transaction history from those 
4. Sprint 4 | [Video](https://drive.google.com/file/d/1OVubMdz_gnoPZWPvgfdGLR3YbKL7gQlS/view?usp=sharing) | [Slides](https://docs.google.com/presentation/d/1bUKGUhu--5mr0x2RcuwG7BEYDW1C2iyG2uoDHJuxKHs/edit?usp=sharing)
   - Create CI/CD Job, continue improvements as necessary
5. Sprint 5 | iOS ->  [Video](https://drive.google.com/file/d/1ssnRE09APachdxAk1qXORDTYaNrPPz6v/view?usp=sharing) | [Slides](https://docs.google.com/presentation/d/1ps0tMNt_lfaHvWWq752TarxN84oRCgcKXDbud6M7yes/edit?usp=sharing)
| Android -> [Video](https://drive.google.com/file/d/14kB4pkwYCbw6NmTBmcH1e5-PM8ZCjOS7/view?usp=sharing) | [Slides](https://docs.google.com/presentation/d/1LTs_HDMRNyy8TC-LfvsPJq1Z_TUDRjZkrM6maFlkIo4/edit?usp=sharing)
   - Upload to cloud service and finished touches, create ways to monitor and maintain the application
