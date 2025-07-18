# semi-nuke messaging

This is a messaging application which allows users to chat with one another in chat rooms involving 2 or more people.

## Dashboard page

The image below showcases the dashboard page where users create chat rooms, open existing rooms, and talk to other users. This service also includes notifications which are represented with a red badge next to the chat room name.

<img width="1920" height="1080" alt="Screenshot 2025-07-18 at 16-03-11 Semi-Nuke-Messaging" src="https://github.com/user-attachments/assets/7b68503f-1d45-4e2c-832a-33ec9468eda3" />

## Sign in and account creation

An account can be created using a username and a password which are transported using TLS and hashed in the backend before being stored in a database. When creating a new account the user will be notified if the username has already been taken and if the password they entered is at least 8 characters long. Sign in works in a similar manner by notifying if the username or password is incorrect.

<img width="1920" height="1080" alt="Screenshot 2025-07-18 at 16-08-01 Semi-Nuke-Messaging" src="https://github.com/user-attachments/assets/09c7b288-3a89-43cd-a1be-1f761421fb8a" />
