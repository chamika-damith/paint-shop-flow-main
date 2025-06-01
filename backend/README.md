# Paint Shop Management System Backend

This is the backend server for the Paint Shop Management System. It provides APIs for inventory management, supplies tracking, and billing operations.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## Setup

1. Clone the repository
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/paint-shop
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret_key
   ```

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## API Endpoints

### Inventory
- GET `/api/inventory` - Get all inventory items
- GET `/api/inventory/:id` - Get a single inventory item
- POST `/api/inventory` - Create a new inventory item
- PUT `/api/inventory/:id` - Update an inventory item
- DELETE `/api/inventory/:id` - Delete an inventory item

### Supplies
- GET `/api/supplies` - Get all supplies
- GET `/api/supplies/:id` - Get a single supply
- POST `/api/supplies` - Create a new supply
- PUT `/api/supplies/:id` - Update a supply
- DELETE `/api/supplies/:id` - Delete a supply
- PATCH `/api/supplies/:id/status` - Update supplier status
- POST `/api/supplies/:id/order` - Create a new order

### Billing
- GET `/api/billing/invoices` - Get all invoices
- GET `/api/billing/invoices/:id` - Get a single invoice
- POST `/api/billing/invoices` - Create a new invoice
- PATCH `/api/billing/invoices/:id/status` - Update invoice status
- GET `/api/billing/receipts` - Get all receipts
- GET `/api/billing/receipts/:id` - Get a single receipt
- POST `/api/billing/receipts` - Create a new receipt

## Error Handling

The API uses standard HTTP response codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Server Error

Error responses include a message field with a description of the error. 