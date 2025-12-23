# Troubleshooting Guide - Network Error

## Error: "Cannot read properties of null (reading 'value')"

### What This Means:

The JavaScript code is trying to get the value of an HTML element that doesn't exist (null).

### Solution Applied:

**Fixed in sponsee-signup.html:**
Changed all element ID references to match actual HTML IDs:

```javascript
// OLD (WRONG):
document.getElementById("event-name"); // ❌ doesn't exist
document.getElementById("contact-name"); // ❌ doesn't exist
document.getElementById("organization"); // ❌ doesn't exist
document.getElementById("location"); // ❌ doesn't exist
document.getElementById("description"); // ❌ doesn't exist
document.getElementById("expected-attendees"); // ❌ doesn't exist

// NEW (CORRECT):
document.getElementById("eventName"); // ✅ exists
document.getElementById("organizerName"); // ✅ exists
document.getElementById("organizerName"); // ✅ exists
document.getElementById("venue"); // ✅ exists
document.getElementById("eventDescription"); // ✅ exists
document.getElementById("expectedAttendees"); // ✅ exists
```

### Testing:

1. **Sponsor Sign Up** - Should work fine

   - Go to: navbar → Sign Up → Sponsor Sign Up
   - Fill all fields including password
   - Click Submit
   - Should see success alert

2. **Sponsee Sign Up** - Now fixed
   - Go to: navbar → Sign Up → Sponsee Sign Up
   - Fill all fields including password
   - Click Submit
   - Should see success alert (no more null error!)

### How to Prevent This:

When collecting form data, always make sure:

1. The `getElementById()` matches the actual `id` attribute in the HTML
2. Case sensitivity matters: "eventName" ≠ "event-name"
3. Use hyphens (-) in HTML IDs, but match them exactly in JavaScript

### Element ID Mapping (Sponsee Form):

| Form Label         | HTML ID           | JavaScript Variable          |
| ------------------ | ----------------- | ---------------------------- |
| Event Name         | eventName         | eventName                    |
| Event Type         | eventType         | organizerType                |
| Email              | email             | email                        |
| Phone              | phone             | phone                        |
| Password           | password          | password                     |
| Confirm Password   | confirmPassword   | confirmPassword              |
| Organizer Name     | organizerName     | contactPerson / organization |
| Organizer Type     | organizerType     | organizerType                |
| Venue              | venue             | location                     |
| Expected Attendees | expectedAttendees | expectedAttendees            |
| Event Description  | eventDescription  | description                  |

### If You Still Get Errors:

1. **Check the browser console:**

   - Right-click → Inspect → Console tab
   - Look for red error messages
   - Note the line number

2. **Search for the ID in HTML:**

   - Right-click → Inspect → CTRL+F
   - Search for the element ID mentioned in error
   - Verify it exists

3. **Check for typos:**
   - Make sure case matches exactly
   - Make sure underscores/hyphens match

### Backend Error vs Frontend Error:

- **Frontend Error**: "Cannot read properties of null" = Element doesn't exist in HTML
- **Backend Error**: "Registration Failed: Email already registered" = Issue with API/database

If you get a backend error instead, that's actually good - it means the form is working and the backend is responding!
