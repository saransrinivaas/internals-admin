import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Container, Box, Typography, TextField, Button, Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';
import LockIcon from '@mui/icons-material/Lock';

const GradientBox = styled(Box)({
  background: "linear-gradient(135deg, #6B8A47 20%, #3C4F2F 100%)",
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const OliveCard = styled(motion.div)(({ theme }) => ({
  backgroundColor: '#fff',
  color: '#3C4F2F',
  borderRadius: 24,
  boxShadow: '0 8px 32px rgba(60,79,47,0.14)',
  padding: theme.spacing(5),
  maxWidth: 400,
  width: '100%',
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden',
}));

const OliveButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#6B8A47',
  color: '#fff',
  fontWeight: 600,
  letterSpacing: 1,
  fontSize: 16,
  borderRadius: theme.spacing(1),
  '&:hover': { backgroundColor: '#556B2F' },
  marginTop: theme.spacing(2),
  transition: '0.3s',
}));

const ErrorText = styled(Typography)({
  color: '#c62828',
  marginTop: 16,
  fontWeight: 500,
});

const LogoAvatar = styled(Avatar)({
  background: 'linear-gradient(135deg, #6B8A47 60%, #3C4F2F 100%)',
  margin: '0 auto 16px',
  width: 48,
  height: 48,
});

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (userDoc.exists() && userDoc.data().role === 'SUPER_ADMIN') {
        navigate('/dashboard');
      } else {
        setError('Access denied. Only Super Admin can log in.');
        await signOut(auth);
      }
    } catch (err) {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBox>
      <OliveCard
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
      >
        <LogoAvatar>
          <LockIcon fontSize="large" />
        </LogoAvatar>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Super Admin Login
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: '#6B8A47', fontWeight: 500 }}>
          Enter your credentials to access the dashboard
        </Typography>
        <form onSubmit={handleLogin}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            fullWidth
            required
            autoFocus
            sx={{
              mb: 2,
              backgroundColor: '#F5F7FA',
              borderRadius: 2,
              '& .MuiInputLabel-root': { color: '#6B8A47' },
            }}
            InputProps={{
              style: { color: '#3C4F2F' },
            }}
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            fullWidth
            required
            sx={{
              mb: 2,
              backgroundColor: '#F5F7FA',
              borderRadius: 2,
              '& .MuiInputLabel-root': { color: '#6B8A47' },
            }}
            InputProps={{
              style: { color: '#3C4F2F' },
            }}
          />
          <OliveButton type="submit" fullWidth disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </OliveButton>
        </form>
        {error && <ErrorText>{error}</ErrorText>}
      </OliveCard>
    </GradientBox>
  );
};

export default Login;
