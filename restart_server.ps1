# Recreate the MySQL database with corrected schema
Write-Output "Running database initialization with corrected schema..."
Set-Location "c:\Users\abdul\Downloads\3716_2647,3664_web_proj_Task3\3716_2647,3664_web_proj_Task3\backend"
node utils/initializeDatabase.js

Write-Output "`nStarting backend server with updated code..."
Write-Output "Press Ctrl+C to stop the server once you're finished testing."
node server.js
