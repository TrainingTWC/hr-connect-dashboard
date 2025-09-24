# Password Protection Setup Guide

This guide explains how to use and customize the password protection feature for the HR Connect Dashboard.

## 🔒 How It Works

The HR Connect Dashboard now includes password protection with the following features:

- **Single Password Access**: One password protects the entire dashboard
- **Persistent Login**: Users stay logged in for 24 hours on their device
- **Secure Storage**: Uses browser's localStorage to maintain session
- **Automatic Logout**: Sessions expire after 24 hours for security
- **Clean UI**: Professional login screen with error handling

## 🎯 Default Settings

- **Default Password**: `HRConnect2024!`
- **Session Duration**: 24 hours
- **Auto-logout**: Yes, after session expires

## ⚙️ Changing the Password

To change the password, edit the file `config/auth.ts`:

```typescript
export const AUTH_CONFIG = {
  // Change this password to your desired password
  password: 'YourNewPassword123!',
  
  // Session duration in milliseconds (default: 24 hours)
  sessionDuration: 24 * 60 * 60 * 1000, // 24 hours
  
  // Storage keys (you probably don't need to change these)
  storageKeys: {
    auth: 'hr_dashboard_auth',
    timestamp: 'hr_dashboard_auth_timestamp'
  }
};
```

### Password Recommendations

- Use at least 8 characters
- Include uppercase and lowercase letters
- Include numbers and special characters
- Avoid common dictionary words
- Example: `MySecureHR2024!`

## 🕒 Changing Session Duration

You can modify how long users stay logged in by changing the `sessionDuration` value:

```typescript
// Examples:
sessionDuration: 1 * 60 * 60 * 1000,  // 1 hour
sessionDuration: 8 * 60 * 60 * 1000,  // 8 hours
sessionDuration: 24 * 60 * 60 * 1000, // 24 hours (default)
sessionDuration: 7 * 24 * 60 * 60 * 1000, // 1 week
```

## 🖥️ User Experience

### Login Process
1. User visits the dashboard
2. If not logged in, they see a professional login screen
3. They enter the password and click "Sign In"
4. On successful login, they access the full dashboard
5. They stay logged in for the configured duration

### Logout Options
- **Manual**: Click the "Sign Out" button in the header
- **Automatic**: Session expires after the configured duration
- **Clear Data**: Browser data clearing will log them out

### Security Features
- Password is masked by default (can be toggled visible)
- Failed login attempts show error messages
- Confirmation prompt before manual logout
- Sessions automatically expire for security

## 🔧 Technical Details

### Files Modified
- `contexts/AuthContext.tsx` - Authentication logic
- `components/Login.tsx` - Login interface
- `components/Header.tsx` - Added logout button
- `App.tsx` - Integrated authentication flow
- `config/auth.ts` - Configuration settings

### Storage Keys
The system uses these localStorage keys:
- `hr_dashboard_auth` - Authentication status
- `hr_dashboard_auth_timestamp` - Login timestamp

### Browser Compatibility
- Works in all modern browsers
- Requires localStorage support
- Mobile-responsive design

## 📱 Mobile Experience

The login screen is fully responsive and works well on:
- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## 🚨 Troubleshooting

### Users Can't Login
1. Verify the password in `config/auth.ts`
2. Check browser console for errors
3. Try clearing browser data and retrying
4. Ensure JavaScript is enabled

### Sessions Expire Too Quickly
- Check the `sessionDuration` setting in `config/auth.ts`
- Verify system time is correct
- Clear browser data and re-login

### Login Screen Doesn't Appear
1. Check that the code changes were properly deployed
2. Verify browser cache isn't serving old version
3. Check browser console for JavaScript errors

## 🔄 Deployment

After making changes to the password or settings:

1. Save the `config/auth.ts` file
2. Rebuild the application: `npm run build`
3. Deploy the updated files
4. Test the new password

## 🔍 Development

For development purposes, you can:
- Set a simple password like `dev123`
- Use shorter session durations for testing
- Check browser localStorage to see stored values

## 📞 Support

If you need help with the password protection system:
1. Check this README first
2. Verify all configuration settings
3. Test in a clean browser session
4. Contact your developer for technical issues

---

**Remember**: Keep your password secure and only share it with authorized personnel!