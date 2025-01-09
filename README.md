# TanVentures

TanVentures is a secure web application I built over the Winter Break while tackling backend development with NoSQL databases. The highlights of my learning journey through this project include MongoDB's data aggregation pipeline, MVC architecture, Server-Side templating, paginating and rendering with Pug, and writing certain scripts to populate the database.

## Technology Stack
- Front-End: Pug, HTML, CSS
- Back-End: Node, Express, MongoDB (Shell, Atlas, Compass), Mongoose, JWT, Nodemailer

<div align="center">
  <img src="https://github.com/user-attachments/assets/23549eae-3924-4f0b-a530-4f9dff97bc32" alt="Main Page" width="600"/>
  <img src="https://github.com/user-attachments/assets/cb228ebe-affd-426b-bb4d-d8b45c1b3004" alt="Tour Description" width="600"/>
  <img src="https://github.com/user-attachments/assets/32f4f2a6-b7dc-472b-8897-e5a3636bdbf2" alt="Tour Reviews" width="600"/>
  <img src="https://github.com/user-attachments/assets/79f4f503-66fc-4cce-b03a-0c02ab530d33" alt="Create Account" width="600"/>
  <img src="https://github.com/user-attachments/assets/b8131313-42a8-493f-b0b4-d34762fc5006" alt="User Dashboard" width="600"/>
</div>

## Get Started

0. Ensure you have the following installed:

- [Node.js](https://nodejs.org/)
- [MySQL](https://www.mysql.com/)
- A package manager such as `npm`

1. Clone the repository to your local machine:
```bash
git clone <repository-url>
```

2. Navigate to the Project Directory
Change into the project directory:
```bash
cd tanventures
```
3. Install Dependencies
Install required Node.js packages:
```bash
npm install
```
or
```bash
npm i
```

4. Configure Environment Variables
Create a `.env` file in the root directory and specify the following variables:
```env
NODE_ENV=development
PORT=3000
USER=your user
DATABASE_PASSWORD=mongodb password
DATABASE=your mongo connection url

JWT_SECRET=this-is-my-super-secure-secret
JWT_EXPIRES_IN=90
JWT_COOKIE_EXPIRES_IN=90

EMAIL_USERNAME=mailtrap user
EMAIL_PASSWORD=mailtrap pass
EMAIL_HOST: usually smtp.mailtrap.io
EMAIL_PORT: any port given by mailtrap
EMAIL_FROM: your real email address
```

5. Set up MongoDB
Make a database named `tanventures` and initialize 3 collections under `tours`, `reviews` and `users`

6. Populate the database
Populate the database using the script and .json given in `./dev-data/data`

7. Start the Server
Launch the application:
```bash
npm start
```
The API will be available at `http://localhost:PORT` at the port specified in your `.env` file.

## Authentication

The API uses JWT for authentication. Upon successful login or signup, a JWT token is issued. The token must be included in the Authorization header as `Bearer <token>` for accessing protected routes.

## Database

The application uses MongoDB as its database. The main collections are:

- users: Stores user details including name, email, password (hashed), role, etc.
- tours: Stores tour details including name, duration, max group size, difficulty, price, etc.
- reviews: Stores review details including review text, rating, associated tour and user.

## Aggregation Pipeline

## Data Aggregation Endpoints

TanVentures leverages MongoDB's powerful aggregation pipeline to perform complex data analysis. Here are two key endpoints that showcase advanced data aggregation techniques:

### 1. Get Tour Stats

**Endpoint:** GET /api/v1/tours/tour-stats

This endpoint provides statistical insights about tours based on their ratings and difficulty levels.

```javascript
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: { avgPrice: 1 }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});
```

#### Aggregation Pipeline Stages:

1. **$match**: Filters tours with a rating average of 4.5 or higher.
   
2. **$group**: Groups the filtered tours by difficulty level and calculates various statistics:
2a. `numTours`: Count of tours in each difficulty level.
2b. `numRatings`: Sum of all ratings for tours in each difficulty level.
2c. `avgRating`: Average rating for tours in each difficulty level.
2d. `avgPrice`: Average price of tours in each difficulty level.
2e. `minPrice`: Minimum price of tours in each difficulty level.
2f. `maxPrice`: Maximum price of tours in each difficulty level.

3. **$sort**: Sorts the results by average price in ascending order.

### Sample Response

```javascript
{
  "status": "success",
  "data": {
    "stats": [
      {
        "_id": "EASY",
        "numTours": 4,
        "numRatings": 126,
        "avgRating": 4.7,
        "avgPrice": 1247.5,
        "minPrice": 397,
        "maxPrice": 1997
      },
      {
        "_id": "MEDIUM",
        "numTours": 3,
        "numRatings": 84,
        "avgRating": 4.8,
        "avgPrice": 1499.33,
        "minPrice": 497,
        "maxPrice": 2997
      },
      {
        "_id": "DIFFICULT",
        "numTours": 2,
        "numRatings": 36,
        "avgRating": 4.9,
        "avgPrice": 1997.5,
        "minPrice": 997,
        "maxPrice": 2997
      }
    ]
  }
}
```

### 2. Get Monthly Plan

**Endpoint:** GET /api/v1/tours/monthly-plan/:year

This endpoint provides a breakdown of tours starting in each month of a specified year.

```javascript
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; // 2021

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: { numTourStarts: -1 }
    },
    {
      $limit: 12
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan
    }
  });
});
```

#### Aggregation Pipeline Stages:

1. **$unwind**: Deconstructs the `startDates` array, creating a new document for each date.
2. **$match**: Filters tours with start dates within the specified year.
3. **$group**: Groups tours by the month of their start date and calculates:
3a. `numTourStarts`: Count of tours starting in each month.
3b. `tours`: An array of tour names starting in each month.
4. **$addFields**: Adds a `month` field with the same value as `_id` for clarity.
5. **$project**: Removes the `_id` field from the output.
6. **$sort**: Sorts the results by the number of tour starts in descending order.
7. **$limit**: Limits the output to 12 documents (one per month, maximum).

### Sample Response

```javascript
{
  "status": "success",
  "data": {
    "plan": [
      {
        "numTourStarts": 3,
        "tours": ["The Forest Hiker", "The Sea Explorer", "The Sports Lover"],
        "month": 7
      },
      {
        "numTourStarts": 2,
        "tours": ["The Wine Taster", "The Star Gazer"],
        "month": 9
      },
      {
        "numTourStarts": 2,
        "tours": ["The Snow Adventurer", "The City Wanderer"],
        "month": 3
      },
      {
        "numTourStarts": 1,
        "tours": ["The Park Camper"],
        "month": 5
      }
    ]
  }
}
```
