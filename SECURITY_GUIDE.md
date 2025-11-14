# 🔒 Security Guide - Admin Dashboard Password Management

## ✅ Current Security Features

Your admin dashboard already has strong security:

1. **Password Hashing**: Uses bcryptjs with 12 salt rounds
2. **Rate Limiting**: Max 5 failed attempts per IP
3. **Account Locking**: 15-minute lockout after 5 failed attempts
4. **Password Strength Validation**: 
   - Minimum 8 characters
   - Must include uppercase, lowercase, number, and special character
   - Blocks common passwords
5. **Database-based Authentication**: Secure password storage in database

---

## 🔑 How to Change Admin Password

### Method 1: Using Admin Dashboard (Recommended)

1. **Login to Admin Dashboard**
   - Go to `/admin/login`
   - Login with current credentials

2. **Navigate to Settings**
   - Click "⚙️ Settings" in the navigation menu
   - Or go directly to `/admin/settings`

3. **Change Password**
   - Enter your current password
   - Enter new password (must meet strength requirements)
   - Confirm new password
   - Click "Change Password"

4. **Re-login**
   - After password change, you'll be logged out
   - Login again with your new password

### Method 2: Initial Setup (First Time)

If no admin user exists in database:

1. **Create Admin User via API**
   ```bash
   curl -X POST http://localhost:3000/api/admin/setup \
     -H "Content-Type: application/json" \
     -d '{
       "username": "admin",
       "password": "YourStrongPassword123!"
     }'
   ```

2. **Or use the setup page** (if available)
   - Visit `/admin/setup` (if implemented)

---

## 🛡️ Security Best Practices

### Password Requirements
- ✅ Minimum 8 characters
- ✅ Maximum 128 characters
- ✅ At least one uppercase letter (A-Z)
- ✅ At least one lowercase letter (a-z)
- ✅ At least one number (0-9)
- ✅ At least one special character (!@#$%^&*...)
- ✅ Cannot be a common password
- ✅ Must be different from current password

### Security Features Active

1. **Password Hashing**
   - Passwords are hashed with bcrypt (12 rounds)
   - Never stored in plain text
   - One-way encryption

2. **Rate Limiting**
   - Maximum 5 failed login attempts per IP
   - 15-minute lockout period
   - Prevents brute force attacks

3. **Account Locking**
   - Automatic lock after 5 failed attempts
   - 15-minute cooldown period
   - Auto-unlock after cooldown

4. **Session Management**
   - Session-based authentication
   - 8-hour session expiration
   - Secure session storage

5. **Input Validation**
   - All inputs sanitized
   - XSS protection
   - SQL injection prevention (via Prisma)

---

## 🔐 Making It More Secure

### Additional Security Measures (Optional)

1. **Enable HTTPS** (Production)
   - Always use HTTPS in production
   - Vercel provides free SSL certificates

2. **Two-Factor Authentication** (Future Enhancement)
   - Can be added for extra security
   - Requires additional setup

3. **IP Whitelisting** (Optional)
   - Restrict admin access to specific IPs
   - Can be implemented in middleware

4. **Regular Password Changes**
   - Change password every 90 days
   - Use password manager

5. **Strong Passwords**
   - Use unique passwords
   - Don't reuse passwords from other sites
   - Consider using a password manager

---

## 🚨 If You Forget Your Password

### Option 1: Reset via Database (Advanced)
1. Access your database
2. Find the `AdminUser` table
3. Delete the existing admin user
4. Create a new one via `/api/admin/setup`

### Option 2: Use Environment Variables (Temporary)
1. Set `ADMIN_USER` and `ADMIN_PASS` in environment variables
2. System will use these as fallback
3. Then create database user and disable env fallback

---

## 📝 Password Change Checklist

- [ ] Current password is correct
- [ ] New password meets all requirements
- [ ] New password is different from current
- [ ] Confirmed password matches new password
- [ ] Password changed successfully
- [ ] Re-logged in with new password
- [ ] Old password no longer works

---

## 🔍 Security Testing

Test your security:

1. **Try weak password**: Should be rejected
2. **Try common password**: Should be rejected
3. **Try 5 wrong passwords**: Account should lock
4. **Try password change with wrong current password**: Should fail
5. **Try password change with matching passwords**: Should fail

---

## 📞 Security Issues?

If you suspect a security breach:

1. **Immediately change password**
2. **Check login logs** (if implemented)
3. **Review failed login attempts**
4. **Consider resetting all admin credentials**
5. **Enable additional security measures**

---

## ✅ Your System is Secure!

Your admin dashboard uses industry-standard security:
- ✅ Bcrypt password hashing
- ✅ Rate limiting
- ✅ Account locking
- ✅ Password strength validation
- ✅ Secure session management
- ✅ Input sanitization

Just make sure to:
- Use strong passwords
- Change password regularly
- Don't share credentials
- Keep database secure


