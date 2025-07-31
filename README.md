# Factory Scanner PWA

A Progressive Web Application (PWA) for scanning barcodes in a factory environment. The app scans 14-character barcodes, extracts the first 8 digits (zuban), matches them against a CSV database, and redirects to the corresponding URL.

## Features

- Barcode scanning using device camera
- CSV data parsing and matching
- Progressive Web App (PWA) functionality
- Offline support
- Responsive design for mobile devices

## Installation and Development

```bash
# Install dependencies
yarn install

# Start development server
yarn dev
```

## Building for Production

```bash
# Build the application
yarn build
```

The built files will be in the `dist` directory.

## CSV Data Format

The application expects a CSV file at `/public/data.csv` with the following columns:

- `Drawing number`: The product code (zuban) to match against
- `URL`: The URL to redirect to when a match is found

Additional columns may be present but are not used by the application.

### Updating the CSV Data

To update the CSV data:

1. Replace the `public/data.csv` file with your updated version
2. Commit and push the changes to your repository
3. Netlify will automatically rebuild and deploy the site

## How It Works

1. The app loads the CSV data from `/public/data.csv`
2. When a barcode is scanned, it checks if the code is exactly 14 characters long
3. If valid, it extracts the first 8 characters (zuban)
4. It searches for a matching zuban in the CSV data
5. If a match is found, it redirects to the URL specified in the CSV
6. If no match is found, it displays an error message
