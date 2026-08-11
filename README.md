**Task Management Backend**



A REST API backend built with Node.js, Express, MongoDB, and Mongoose for managing users and tasks.



&#x20;Requirements



* &#x20;Node.js
* &#x20;MongoDB
* &#x20;npm



**Installation**



Clone the project and install the dependencies:



npm install



**Environment Variables**



Create a .env file in the project root and add:



PORT=5000

MONGODB\_URI=your\_mongodb\_connection\_string





Use your own MongoDB connection string. Do not commit the .env file to GitHub.



**Run the Server**



Start the development server with:



npm run dev





The server runs on:



http://localhost:5000



&#x20;**Health Check**



Test the server using:



GET /api/health



Expected response:

{

&#x20; "status": "ok",

&#x20; "timestamp": "..."

}



**Database Seeding**

The project includes a seed script for creating sample users and tasks.

**Run:**



npm run seed



The seed script:



* &#x20;Clears existing users and tasks.
* &#x20;Creates 3 sample users.
* &#x20;Creates 9 sample tasks.
* &#x20;Hashes sample user passwords using bcrypt.
* &#x20;Links tasks to the sample users.



The seed script can be run again whenever fresh sample data is needed during local development.



**The seed script deletes existing users and tasks before inserting the sample data. Use it only for development/testing.**



**Verify Seeded Data**



After running:



npm run seed



Open MongoDB Compass and connect to your configured MongoDB database. Check the users and tasks collections to verify the seeded data.

&#x20;

**Available Scripts**



npm run dev



Starts the development server using nodemon.



npm run seed



Clears and recreates the sample users and tasks.

&#x20;

**API**



Task CRUD endpoints:



POST   /api/tasks

GET    /api/tasks

GET    /api/tasks/:id

PUT    /api/tasks/:id

DELETE /api/tasks/:id





**Health endpoint:**



GET /api/health





**Project Structure**



server/

├── src/

│   ├── config/

│   │   └── db.js

│   ├── controllers/

│   ├── models/

│   │   ├── Task.js

│   │   └── User.js

│   ├── routes/

│   │   └── taskRoutes.js

│   ├── scripts/

│   │   └── seed.js

│   └── index.js

├── .env

├── .gitignore

├── package.json

├── package-lock.json

└── README.md





