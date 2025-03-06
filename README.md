# Django React JWT Authentication with PostgreSQL

A complete authentication and order management system using Django REST Framework for the backend and React for the frontend. It features JWT authentication with secure HttpOnly cookie-based storage and PostgreSQL as the database.

## Features

- JWT authentication with secure httpOnly cookie storage
- PostgreSQL database integration
- Automatic token refresh
- Role-based user authentication
- Material-UI user interface
- Protected routes in both frontend and backend
- Scalable system architecture
- CORS configured for local development

### Core Features
- Project and client management
- Multi-warehouse support
- Carrier and shipping service integration
- Material tracking with lot numbers
- Inventory management with location tracking
- Order processing workflow
- License plate tracking
- Price history tracking for materials
- Inbound and outbound order management
- Advanced order filtering and search
- Real-time order status updates
- Customer and contact management
- Customizable reports with SQL integration
- Export capabilities (JSON/CSV)

### Dashboard Features
- Active orders tracking
- Recently delivered orders (30-day view)
- Order status visualization
- Quick search by order, reference, customer, or destination
- Separate views for inbound and outbound orders
- Order action controls (View/Edit/Delete)

### Order Management
- Multi-step order creation
- Material selection with quantity management
- Logistics information handling
- Shipping and billing address management
- Order status workflow
- Order type and class categorization
- Reference number tracking
- Notes and additional information support

### Inventory Features
- Material type categorization
- Unit of measure (UOM) management
- Serial number tracking
- Location management
- License plate management
- Lot and vendor lot tracking
- Available quantity tracking

### Reports Module
- Custom SQL query execution
- Predefined report templates
- Dynamic column handling
- Multiple export formats
- Real-time data access

## Using this Template

To use this project as a starting point for your own application:

1. Clone the repository:
```bash
git clone git@github.com:juliomeza/django-react-logistics-orders.git your-project-name
```

2. Move into your project directory:
```bash
cd your-project-name
```

3. Remove the existing git repository and initialize a new one:
```bash
rm -rf .git
git init
```

4. Remove the previous remote origin (if any):
```bash
git remote remove origin
```

5. Add the new remote repository:
```bash
git remote add origin git@github.com:your-github-username/your-project-name.git
```

6. Verify the remote repository is correctly set:
```bash
git remote -v
```

7. Make your first commit (optional, if you modified files):
```bash
git add .
git commit -m "First commit"
```

8. Push the changes to the new repository:
```bash
git push -u origin main
```

## Backend Setup

1. Create and activate a virtual environment:
```bash
cd server
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure PostgreSQL database in `settings.py`:

Before proceeding, ensure you have created a PostgreSQL database and a user with appropriate permissions. Avoid using special characters like `@` in the password, as they may cause connection issues.

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'your_database_name',
        'USER': 'your_database_user',
        'PASSWORD': 'your_secure_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

To create a PostgreSQL database and user, you can use the following commands:
```sql
CREATE DATABASE your_database_name;
CREATE USER your_database_user WITH PASSWORD 'your_secure_password';
ALTER ROLE your_database_user SET client_encoding TO 'utf8';
ALTER ROLE your_database_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE your_database_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE your_database_name TO your_database_user;
```

4. Run migrations:
```bash
python manage.py migrate
```

5. Create a superuser:
```bash
python manage.py createsuperuser
```

6. Start the development server:
```bash
python manage.py runserver
```

The backend will be available at `http://localhost:8000`

## Frontend Setup

1. Install dependencies:
```bash
cd client
npm install
```

2. Start the development server:
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## API Endpoints

The backend provides a set of API endpoints for managing different modules. Below are some key API routes:

- **Authentication:**
  - `POST /api/auth/login/` - Login user and return JWT tokens
  - `POST /api/auth/refresh/` - Refresh JWT token
  - `POST /api/auth/logout/` - Logout user and clear tokens

- **Users & Roles:**
  - `GET /api/users/` - List all users
  - `POST /api/users/` - Create a new user
  - `GET /api/roles/` - List available roles

- **Enterprise & Clients:**
  - `GET /api/enterprises/` - List enterprises
  - `GET /api/clients/` - List clients
  - `GET /api/projects/` - List projects

- **Orders & Inventory:**
  - `GET /api/orders/` - List orders
  - `POST /api/orders/` - Create a new order
  - `GET /api/inventories/` - List inventory items
  - `GET /api/materials/` - List materials
  - `GET /api/uoms/` - List units of measure
  - `GET /api/material-types/` - List material types

- **Logistics:**
  - `GET /api/warehouses/` - List warehouses
  - `GET /api/addresses/` - List addresses
  - `GET /api/carriers/` - List carriers
  - `GET /api/carrier-services/` - List carrier services
  - `GET /api/contacts/` - List contacts

- **Reports:**
  - `GET /api/reports/` - List available reports
  - `POST /api/reports/{id}/execute/` - Execute a predefined report
  - `POST /api/reports/execute-custom-query/` - Execute a custom SQL query

## API Documentation (Swagger & Redoc)

To explore and test the API endpoints interactively, you can use **Swagger** or **Redoc**.

- **Swagger UI:** Allows you to test API endpoints directly from the interface.  
  👉 [`http://localhost:8000/swagger/`](http://localhost:8000/swagger/)

- **Redoc:** Provides a well-structured and easy-to-read API documentation view.  
  👉 [`http://localhost:8000/redoc/`](http://localhost:8000/redoc/)

- **Download Swagger JSON Schema:**  
  👉 [`http://localhost:8000/swagger.json`](http://localhost:8000/swagger.json) (File will be downloaded)

Swagger is useful for development and testing, while Redoc offers a more structured documentation experience.  
The JSON schema can be used for API documentation, integrations, or importing into tools like Postman or API clients.

## Security Features

- JWT tokens stored in HttpOnly cookies
- CSRF protection
- Specific CORS configuration
- Secure session handling
- Automatic token refresh handling

## Database Tables

The application includes several models that structure the database:

- **Users:** Custom user model with roles and permissions
- **Enterprise & Clients:** Enterprises, clients, and projects linked to users
- **Orders:** Orders, order lines, order types, order classes, and order statuses
- **Inventory:** Inventory records with serial numbers, lot tracking, and location management
- **Logistics:** Warehouses, carriers, carrier services, addresses, and contacts
- **Materials:** Materials, material types, unit of measure (UOM), and price history
- **Reports:** Report definitions and configurations

## License

Distributed under the MIT License. See `LICENSE` for more information.