# setup_and_run.ps1
# This script sets up and runs the Agri-Connect application with MySQL for MarketPrice

Write-Output "Setting up Agri-Connect with MySQL..."

# Ensure XAMPP MySQL is running
Write-Output "Please make sure XAMPP MySQL service is running."
Write-Output "Press Enter to continue once the MySQL service is running."
Read-Host

# Navigate to backend directory
Set-Location .\backend

# Install dependencies
Write-Output "`nInstalling backend dependencies..."
npm install

# Create .env if it doesn't exist
if (-not(Test-Path -Path ".env" -PathType Leaf)) {
    Write-Output "`nCreating .env file from example..."
    Copy-Item ".env.example" ".env"
    Write-Output "Please edit .env file with your database credentials if needed."
    Write-Output "Press Enter to continue after editing the .env file."
    Read-Host
}

# Initialize database
Write-Output "`nInitializing MySQL database..."
npm run init-db

# Ask if migration is needed
$migrationNeeded = Read-Host "`nDo you want to migrate existing MongoDB data to MySQL? (y/n)"
if ($migrationNeeded -eq "y" -or $migrationNeeded -eq "Y") {
    Write-Output "Running data migration..."
    npm run migrate-market-prices
}

# Start backend server in a new terminal
Write-Output "`nStarting backend server..."
Start-Process powershell -ArgumentList "-Command", "cd '$PWD'; npm start"

# Navigate to frontend directory
Set-Location ..\agri-connect-frontend

# Install frontend dependencies
Write-Output "`nInstalling frontend dependencies..."
npm install

# Start frontend development server
Write-Output "`nStarting frontend development server..."
npm run dev

# Return to original directory
Set-Location ..
