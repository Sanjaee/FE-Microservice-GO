# API Integration dengan Go Microservice

Dokumentasi ini menjelaskan integrasi frontend Next.js dengan Go microservice untuk user authentication.

## 🚀 Setup dan Konfigurasi

### 1. Environment Variables

Buat file `.env.local` di root project dengan konfigurasi berikut:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 2. Dependencies

Pastikan dependencies berikut sudah terinstall:

```bash
npm install next-auth
```

## 📁 Struktur File

```
src/
├── lib/
│   └── api.ts                    # API client untuk komunikasi dengan Go service
├── pages/
│   ├── api/auth/
│   │   └── [...nextauth].ts      # NextAuth configuration
│   ├── login.tsx                 # Halaman login
│   ├── register.tsx              # Halaman register
│   └── verify-otp.tsx            # Halaman verifikasi OTP
├── components/
│   └── LoginForm.tsx             # Komponen form login
└── types/
    └── next-auth.d.ts            # Type definitions untuk NextAuth
```

## 🔧 API Client (api.ts)

API client menyediakan interface untuk berkomunikasi dengan Go microservice:

### Endpoints yang Tersedia:

- `register(data)` - Registrasi user baru
- `login(data)` - Login user
- `verifyOTP(data)` - Verifikasi OTP
- `resendOTP(data)` - Kirim ulang OTP
- `refreshToken(token)` - Refresh access token
- `getProfile(token)` - Ambil profil user
- `updateProfile(token, data)` - Update profil user

### Error Handling:

API client menangani berbagai status code:

- `409` - User sudah ada (Conflict)
- `400` - Data tidak valid
- `401` - Unauthorized
- `404` - Resource tidak ditemukan
- `500` - Server error

## 🔐 NextAuth Configuration

NextAuth dikonfigurasi untuk menggunakan credentials provider yang terintegrasi dengan Go microservice:

### Features:

- JWT token management
- Automatic token refresh
- Session management
- Type-safe session data

### Session Data:

```typescript
interface Session {
  user: {
    id: string;
    email: string;
    name: string;
  };
  accessToken: string;
  refreshToken: string;
  isVerified: boolean;
}
```

## 📱 Flow Authentication

### 1. Registration Flow:

1. User mengisi form register
2. Data dikirim ke `/api/v1/auth/register`
3. Jika berhasil, redirect ke halaman OTP verification
4. Jika gagal (409), tampilkan error message

### 2. OTP Verification Flow:

1. User memasukkan 6 digit OTP
2. OTP dikirim ke `/api/v1/auth/verify-otp`
3. Jika berhasil, redirect ke halaman login
4. User perlu login untuk mendapatkan JWT tokens

### 3. Login Flow:

1. User mengisi email dan password
2. Data dikirim melalui NextAuth credentials provider
3. NextAuth memanggil Go API untuk validasi
4. Jika berhasil, session dibuat dan redirect ke dashboard

## 🎨 UI Components

### LoginForm Component:

- Form login dengan validasi
- Password visibility toggle
- Google OAuth integration
- Error handling dengan toast notifications

### Register Page:

- Form registrasi dengan validasi
- Password confirmation
- Real-time error handling
- Redirect ke OTP verification

### Verify OTP Page:

- 6-digit OTP input dengan auto-focus
- Auto-verification saat semua digit terisi
- Resend OTP functionality
- Countdown timer

## 🔄 Error Handling

### Toast Notifications:

- Success messages untuk operasi berhasil
- Error messages dengan detail spesifik
- Loading states untuk UX yang lebih baik

### Error Types:

- **409 Conflict**: User sudah terdaftar
- **400 Bad Request**: Data tidak valid
- **401 Unauthorized**: Credentials salah
- **500 Server Error**: Error server

## 🚀 Cara Menjalankan

### 1. Start Go Microservice:

```bash
cd microservicego
docker-compose up -d
```

### 2. Start Next.js Frontend:

```bash
cd fe-micro
npm run dev
```

### 3. Test Flow:

1. Buka `http://localhost:3000/register`
2. Daftar user baru
3. Verifikasi OTP
4. Login dengan credentials
5. Akses dashboard

## 🔧 Troubleshooting

### Common Issues:

1. **CORS Error**: Pastikan Go service mengizinkan origin frontend
2. **API Connection**: Pastikan `NEXT_PUBLIC_API_URL` benar
3. **NextAuth Secret**: Pastikan `NEXTAUTH_SECRET` di-set
4. **Token Expired**: NextAuth akan otomatis refresh token

### Debug Mode:

Aktifkan debug mode di NextAuth untuk melihat log detail:

```typescript
// di [...nextauth].ts
debug: process.env.NODE_ENV === "development";
```

## 📝 Notes

- OTP verification tidak langsung memberikan JWT tokens
- User perlu login setelah OTP verification
- Tokens disimpan di localStorage dan session
- NextAuth menangani token refresh otomatis
- Error messages dalam bahasa Indonesia untuk UX yang lebih baik
