// pages/_app.js
import '../styles/global.css'
import { AuthProvider } from '../context/AuthContext'
import AuthGuard from '../components/AuthGuard'

export default function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <AuthGuard>
        <Component {...pageProps} />
      </AuthGuard>
    </AuthProvider>
  )
}