# 🚍 DoubleDecker

> A powerful CSV query builder and visualization platform with a London Bus Red aesthetic

DoubleDecker is a modern web application that transforms CSV data analysis into an intuitive, visual experience. Built with React and TypeScript, it provides a no-code interface for building complex data queries and generating beautiful visualizations.

---

## ✨ Features

### 🔍 **Visual Query Builder**
- **No SQL Required**: Build complex queries through an intuitive drag-and-drop interface
- **7 Operation Types**: Select, Filter, Transform, GroupBy, Sort, Limit, and Aggregations
- **Smart Column Tracking**: Automatic alias management and column transformation tracking
- **Real-time Preview**: See your query structure before execution

### 📊 **Intelligent Visualizations**
- **Auto-Detection**: Automatically suggests the best chart type based on your data
- **4 Chart Types**: Bar, Line, Pie, and Scatter plots
- **Manual Override**: Select specific columns for custom visualizations
- **Brand-Consistent Colors**: All charts use the London Bus Red color palette

### 💾 **Data Management**
- **CSV Upload**: Drag-and-drop file upload with preview
- **Recent Files**: Quick access to previously uploaded datasets
- **Saved Queries**: Save and reuse query templates across different files
- **Export Results**: Download query results as CSV

### 🎨 **Premium Design**
- **London Bus Red Branding**: Distinctive red accent color throughout
- **Glassmorphism UI**: Modern glass-card effects with backdrop blur
- **Dark Mode Support**: Seamless theme switching
- **Responsive Design**: Optimized for desktop workflows

### 🔐 **Secure Authentication**
- **JWT-based Auth**: Secure token-based authentication
- **Protected Routes**: Automatic redirect for unauthenticated users
- **User Profiles**: Track queries, files processed, and saved queries

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm (install with [nvm](https://github.com/nvm-sh/nvm))
- A backend API server (see [Backend Setup](#backend-setup))

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd doubledecker-FE

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and set VITE_API_URL to your backend URL

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

---

## 🏗️ Architecture

### Tech Stack

**Frontend Framework**
- React 18.3 with TypeScript
- Vite for fast development and building
- React Router for navigation

**UI/Design**
- Tailwind CSS with custom design tokens
- shadcn/ui component library (Radix UI)
- Recharts for data visualizations
- Outfit font family

**State Management**
- TanStack Query for server state
- React Context for authentication
- LocalStorage for session persistence

**Form Handling**
- React Hook Form with Zod validation
- Type-safe form schemas

### Project Structure

```
src/
├── components/
│   ├── QueryBuilder/      # Query builder modals and panels
│   ├── visualizations/    # Chart components (Bar, Line, Pie, Scatter)
│   └── ui/                # Reusable UI components (shadcn/ui)
├── contexts/
│   └── AuthContext.tsx    # Authentication state management
├── hooks/                 # Custom React hooks
├── lib/
│   └── axios.ts           # Configured API client
├── pages/
│   ├── Auth/              # Login and Signup pages
│   ├── Dashboard.tsx      # Main landing page
│   ├── QueryBuilder.tsx   # Query construction interface
│   ├── QueryResults.tsx   # Results table and visualizations
│   └── SavedQueries.tsx   # Query management
├── services/
│   └── api.ts             # API service layer
├── types/
│   └── api.ts             # TypeScript type definitions
└── utils/
    ├── chartColors.ts           # Brand color palettes
    ├── dataAggregation.ts       # Data processing utilities
    └── visualizationPreparers.ts # Chart data transformation
```

---

## 📖 Usage Guide

### 1. Upload a CSV File

1. Navigate to the Dashboard
2. Drag and drop a CSV file or click to browse
3. Preview the data and confirm upload
4. The file is automatically processed and ready for querying

### 2. Build a Query

**Select Columns**
- Choose which columns to include in your results
- Use "Select All" or "Deselect All" for quick selection

**Add Filters**
- Filter rows based on conditions
- Operators: Equals, Not Equals, Greater Than, Less Than, Contains
- Multiple filters are combined with AND logic

**Transform Data**
- Create new columns with mathematical operations
- Operations: Multiply, Divide, Add, Subtract
- Assign aliases to transformed columns

**Group & Aggregate**
- Group by categorical columns
- Apply aggregations: Sum, Average, Max, Min, Count
- Supports multiple aggregations per query

**Sort Results**
- Sort by any column in ascending or descending order
- Multiple sort criteria supported

**Limit Rows**
- Restrict the number of results returned
- Useful for large datasets

### 3. Execute & Visualize

1. Click "Run Query" to execute
2. View results in the table view
3. Switch to chart views for visualizations
4. Manually select columns for custom charts
5. Download results as CSV

### 4. Save & Reuse Queries

1. Click "Save Query" after building your query
2. Provide a name and description
3. Load saved queries on new datasets
4. Queries validate against available columns

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3000/api
```

### Backend Setup

DoubleDecker requires a backend API that provides:

- **Authentication**: `/auth/signup`, `/auth/login`
- **File Upload**: `/upload` (multipart/form-data)
- **Query Execution**: `/query` (POST with operations array)
- **Saved Queries**: `/saved_queries` (CRUD endpoints)
- **User Profile**: `/profile` (GET user stats)
- **File Management**: `/uploads` (list, delete)

Expected backend tech: DataFusion for query processing, S3 for file storage

---

## 🧪 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run build:dev    # Build in development mode
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Code Quality

- **TypeScript**: Strict type checking enabled
- **ESLint**: Configured with React and TypeScript rules
- **Prettier**: Code formatting (via ESLint integration)

---

## 📊 Query Operations

### Operation Types

| Operation | Description | Example |
|-----------|-------------|---------|
| **Select** | Choose columns to include | `["name", "age", "city"]` |
| **Filter** | Filter rows by condition | `column: "age", operator: "Gt", value: "18"` |
| **Transform** | Create calculated columns | `column: "price", operation: "Multiply", value: 1.2, alias: "price_with_tax"` |
| **GroupBy** | Group and aggregate data | `columns: ["city"], aggregations: [{ function: "Sum", column: "sales" }]` |
| **Sort** | Order results | `column: "name", ascending: true` |
| **Limit** | Restrict row count | `count: 100` |

### Column Aliasing

When using aggregations or transforms, columns are renamed:
- **Aggregations**: Use aliases to preserve original column names
- **Transforms**: Always require an alias for the new column
- **Post-GroupBy**: Only grouped columns and aggregations are available

See `operation_alias.md` for detailed documentation.

---

## 🎯 Visualization Intelligence

### Auto-Detection

The app automatically detects column types:
- **Numeric**: Numbers, currency, percentages, scientific notation
- **Temporal**: Dates, timestamps (ISO 8601, Unix timestamps)
- **Categorical**: Text, low-cardinality numeric fields

### Chart Selection

- **Bar Chart**: Best for categorical data with numeric values
- **Line Chart**: Ideal for time-series data
- **Pie Chart**: Shows categorical distribution
- **Scatter Plot**: Reveals correlation between two numeric columns

### Smart Features

- **ID Detection**: Prevents ID columns from being treated as numeric
- **Low Cardinality**: Detects ratings/status codes as categorical
- **Sampling**: Systematic sampling for large scatter plots (1000 points max)
- **Aggregation Awareness**: Handles pre-aggregated vs raw data

---

**Built with ❤️**
