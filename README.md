# AgroRent - Agricultural Equipment Rental Platform

AgroRent is a comprehensive web application that connects farmers and equipment owners, enabling seamless rental of agricultural equipment. The platform facilitates easy access to farm machinery while providing equipment owners a way to monetize their assets.

## Features

### For Farmers
- **Browse Equipment** - Search and filter available agricultural equipment
- **Book Equipment** - Reserve equipment for specific dates
- **View Details** - Detailed equipment specifications and pricing
- **Reviews & Ratings** - Read and leave reviews for equipment and owners
- **Manage Bookings** - Track active and past bookings
- **User Profile** - Manage personal information and preferences

### For Equipment Owners
- **Add Equipment** - List agricultural equipment for rent
- **Manage Listings** - Edit equipment details and pricing
- **Booking Management** - Accept/reject booking requests
- **Dashboard** - Monitor equipment utilization and earnings
- **Analytics** - Track performance metrics

### Admin Features
- **User Management** - Manage farmers and equipment owners
- **Equipment Management** - Monitor all listed equipment
- **Booking Oversight** - View and manage all bookings
- **System Administration** - Manage platform settings

## Tech Stack

### Frontend
- **React** - UI framework
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **React Router** - Client-side routing
- **ESLint** - Code quality

### Backend
- **Java 17+** - Programming language
- **Spring Boot** - Application framework
- **Spring Security** - Authentication and authorization
- **JPA/Hibernate** - ORM
- **MySQL** - Database
- **Maven** - Dependency management

## Project Structure

```
AgroRent/
├── frontend/              # React application
│   ├── src/
│   │   ├── components/   # Reusable React components
│   │   ├── pages/        # Page components
│   │   ├── api/          # API integration
│   │   ├── context/      # React context for state management
│   │   └── assets/       # Images and static files
│   ├── package.json
│   └── vite.config.js
│
└── backend/              # Spring Boot application
    ├── src/
    │   ├── main/
    │   │   ├── java/com/farming/rental/
    │   │   │   ├── config/       # Configuration classes
    │   │   │   ├── controller/   # REST endpoints
    │   │   │   ├── dto/          # Data transfer objects
    │   │   │   ├── entity/       # JPA entities
    │   │   │   ├── repository/   # Data access layer
    │   │   │   ├── service/      # Business logic
    │   │   │   └── util/         # Utility classes
    │   │   └── resources/        # Configuration files
    │   └── test/                 # Unit tests
    ├── pom.xml
    └── mvnw.cmd

```

## Getting Started

### Prerequisites
- Node.js 16+ and npm (for frontend)
- Java 17+ (for backend)
- MySQL 8.0+ (for database)
- Git

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Configure database**
   - Update `src/main/resources/application.properties` with your MySQL credentials
   - Create a MySQL database named `agorent`

3. **Build the project**
   ```bash
   mvn clean install
   ```

4. **Run the application**
   ```bash
   mvn spring-boot:run
   ```
   The backend will start at `http://localhost:8080`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   The frontend will typically run at `http://localhost:5173`

## API Documentation

The backend provides REST APIs for:
- Authentication and authorization
- Equipment management (CRUD operations)
- Booking management
- User profiles
- Reviews and ratings
- Admin operations

### Base URL
```
http://localhost:8080/api
```

## Database Schema

Key entities include:
- **Users** - Farmers and equipment owners
- **Equipment** - Agricultural equipment listings
- **Bookings** - Rental reservations
- **Reviews** - User and equipment reviews
- **Roles** - User access levels (FARMER, OWNER, ADMIN)

## Environment Variables

### Backend (`application.properties`)
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/agorent
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
```

### Frontend (`.env` if needed)
```
VITE_API_URL=http://localhost:8080/api
```

## Development

### Running Tests (Backend)
```bash
cd backend
mvn test
```

### Code Quality
```bash
cd frontend
npm run lint
```

## Deployment

### Backend
- Build JAR: `mvn package`
- Deploy to cloud platform (AWS, Azure, Heroku, etc.)

### Frontend
- Build: `npm run build`
- Deploy to CDN or static hosting (Vercel, Netlify, etc.)

## Contributing

1. Create a feature branch
2. Commit your changes
3. Push to the branch
4. Open a pull request

## Support

For issues and questions, please create an issue in the repository.

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Roadmap

- [ ] Mobile app development
- [ ] Real-time chat notifications
- [ ] Payment gateway integration
- [ ] Equipment insurance options
- [ ] GPS tracking for equipment
- [ ] Advanced analytics dashboard
- [ ] Automated invoice generation

---

**Last Updated:** February 2026
