# Civic Issue Management System

A comprehensive full-stack web application for managing civic issues and complaints in communities. This system allows citizens to report issues, track their status, and enables administrators to manage and resolve complaints efficiently.

## 🚀 Features

### For Citizens
- **User Registration & Authentication** - Secure login/signup with JWT tokens
- **Issue Reporting** - Submit complaints with detailed descriptions, location, and images
- **Real-time Tracking** - Monitor complaint status and receive updates
- **Interactive Maps** - Google Maps integration for precise location selection
- **Image Upload** - Attach photos to support complaint documentation
- **Dashboard** - View personal complaint history and statistics

### For Administrators
- **Admin Portal** - Comprehensive dashboard for managing all complaints
- **Status Management** - Update complaint status (Pending, In Progress, Resolved)
- **Bulk Operations** - Handle multiple complaints efficiently
- **Analytics** - View system statistics and complaint trends
- **Email Notifications** - Automated email alerts for status changes

### Public Features
- **Heatmap Visualization** - Public view of complaint distribution
- **Statistics Dashboard** - Public statistics about community issues
- **Search & Filter** - Find complaints by location, type, or status

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe JavaScript
- **Material-UI (MUI)** - Component library for consistent design
- **React Query** - Data fetching and caching
- **Axios** - HTTP client for API communication
- **Google Maps API** - Location services and mapping

### Backend
- **Spring Boot 3.2** - Java framework for microservices
- **Spring Security** - Authentication and authorization
- **Spring Data JPA** - Database abstraction layer
- **PostgreSQL** - Relational database
- **JWT** - JSON Web Tokens for authentication
- **Maven** - Build automation and dependency management

### Additional Services
- **Email Service** - SMTP integration for notifications
- **File Upload** - Image storage and management
- **CORS Configuration** - Cross-origin resource sharing

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Java 17** or higher
- **Node.js 16** or higher
- **npm** or **yarn**
- **PostgreSQL 12** or higher
- **Maven 3.6** or higher

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/civic-issue-system.git
cd civic-issue-system
```

### 2. Database Setup

#### Install PostgreSQL
```bash
# macOS (using Homebrew)
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### Create Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE civic_issues;
CREATE USER postgres WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE civic_issues TO postgres;
\q
```

### 3. Backend Setup

```bash
cd backend

# Update application.yml with your database credentials
# Edit src/main/resources/application.yml

# Run the application
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
echo "REACT_APP_API_URL=http://localhost:8080/api" > .env
echo "REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key" >> .env

# Start the development server
npm start
```

The frontend will start on `http://localhost:3000`

## 🔧 Configuration

### Environment Variables

#### Backend (application.yml)
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/civic_issues
    username: postgres
    password: password
  
  mail:
    host: smtp.gmail.com
    port: 587
    username: your-email@gmail.com
    password: your-app-password

jwt:
  secret: your-secret-key-here
  expiration: 86400000
```

#### Frontend (.env)
```bash
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### Google Maps API Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Maps JavaScript API
4. Create credentials (API Key)
5. Add the API key to your `.env` file

### Email Configuration
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password
3. Update the email configuration in `application.yml`

## 📱 API Endpoints

### Authentication
- `POST /api/auth/signin` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/auth/me` - Get current user

### Complaints
- `GET /api/citizen/complaints` - Get user's complaints
- `POST /api/citizen/complaints` - Create new complaint
- `GET /api/citizen/complaints/{id}` - Get complaint details
- `GET /api/admin/complaints` - Get all complaints (Admin)
- `PUT /api/admin/complaints/{id}/status` - Update complaint status

### Public
- `GET /api/public/complaints/stats` - Get public statistics
- `GET /api/public/complaints/heatmap` - Get complaints for heatmap

### File Upload
- `POST /api/upload` - Upload images

## 🗄️ Database Schema

### Users Table
- `id` - Primary key
- `name` - User's full name
- `email` - Unique email address
- `password` - Encrypted password
- `role` - USER or ADMIN
- `phone_number` - Contact number
- `address` - User address
- `created_at` - Account creation timestamp

### Complaints Table
- `id` - Primary key
- `title` - Complaint title
- `description` - Detailed description
- `type` - Issue type (INFRASTRUCTURE, ENVIRONMENT, SAFETY, etc.)
- `status` - PENDING, IN_PROGRESS, RESOLVED
- `latitude` - GPS latitude
- `longitude` - GPS longitude
- `address` - Human-readable address
- `user_id` - Foreign key to users table
- `created_at` - Submission timestamp

### Complaint Images Table
- `id` - Primary key
- `complaint_id` - Foreign key to complaints
- `image_url` - Path to uploaded image
- `image_name` - Original filename
- `file_size` - File size in bytes

## 🧪 Testing

### Backend Tests
```bash
cd backend
mvn test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🚀 Deployment

### Backend Deployment
```bash
# Build the application
mvn clean package

# Run the JAR file
java -jar target/civic-issue-system-0.0.1-SNAPSHOT.jar
```

### Frontend Deployment
```bash
# Build for production
npm run build

# Serve the build folder
npx serve -s build
```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- Spring Boot community for excellent documentation
- Material-UI team for the beautiful component library
- Google Maps API for location services
- PostgreSQL community for the robust database system

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Contact us at support@civicissues.com

## 🔮 Future Enhancements

- [ ] Mobile application (React Native)
- [ ] Real-time notifications (WebSocket)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Integration with government systems
- [ ] AI-powered issue categorization
- [ ] Social media integration
- [ ] Advanced reporting features

---

**Made with ❤️ for better communities**