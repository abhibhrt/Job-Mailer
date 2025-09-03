# Job Mailer - Bulk Email Sender

A Node.js application that sends personalized bulk emails to HR professionals using Gmail SMTP.

## Features

- Upload Excel files with company, HR name, and email data
- Personalized email templates using {{company}} and {{hr}} placeholders
- Configurable delay between emails to avoid rate limiting
- Beautiful modern UI with real-time feedback
- Gmail SMTP integration

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Gmail:**
   - The app is pre-configured with Gmail SMTP
   - Uses App Password: `qifj wjzo qoqk tqdj`
   - Email: `bhartiabhishek760@gmail.com`

3. **Run the application:**
   ```bash
   npm start
   ```
   
   For development with auto-restart:
   ```bash
   npm run dev
   ```

4. **Access the application:**
   - Open http://localhost:3000 in your browser

## Excel Format

Your Excel file should have exactly 3 columns in this order:
- **Column A**: Company name
- **Column B**: HR person's name  
- **Column C**: Email address

**Important:** Row 1 should contain headers, data starts from Row 2.

Example:
```
Company,HR,Email
Acme Corp,Riya Sharma,riya.hr@acme.com
TechStart,Arjun Patel,arjun.hr@techstart.com
```

## Usage

1. Fill in the email subject (supports {{company}} and {{hr}} placeholders)
2. Write your email body (supports {{company}} and {{hr}} placeholders)
3. Set delay between emails (recommended: 200-500ms)
4. Upload your Excel file
5. Click "Send Emails"

## Template Variables

- `{{company}}` - Replaced with company name from Excel
- `{{hr}}` - Replaced with HR person's name from Excel

## Sample Data

A `sample-data.csv` file is included for testing. Convert it to Excel format (.xlsx) before using.

## Security Notes

- Gmail credentials are hardcoded for demonstration
- In production, use environment variables
- Consider implementing rate limiting and authentication

## Troubleshooting

- **SMTP errors**: Check Gmail app password and 2FA settings
- **File upload issues**: Ensure file is .xlsx format
- **Email delivery**: Check spam folders and Gmail sending limits
