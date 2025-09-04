import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Container, Box, Typography, TextField, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { signOut } from "firebase/auth";

// Olive Green Theme
const OliveBox = styled(Box)(({ theme }) => ({
  backgroundColor: '#3C4F2F',
  color: '#FFFFFF',
  padding: theme.spacing(3),
  borderRadius: theme.spacing(1),
  textAlign: 'center',
  maxWidth: 400,
  margin: '50px auto',
}));

const OliveButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#6B8A47',
  color: '#FFFFFF',
  '&:hover': { backgroundColor: '#556B2F' },
  marginTop: theme.spacing(2),
}));

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (userDoc.exists() && userDoc.data().role === 'SUPER_ADMIN') {
  console.log("✅ Role check passed, navigating to dashboard...");
  navigate('/dashboard');
} else {
  console.log("❌ Role check failed. Found role:", userDoc.data().role);
  setError('Access denied. Only Super Admin can log in.');
  await signOut(auth);
}

    } catch (err) {
      setError('Invalid email or password.');
    }
  };

  return (
    <Container>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <OliveBox>
          <Typography variant="h4" gutterBottom>
            Super Admin Login
          </Typography>
          <form onSubmit={handleLogin}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              required
              sx={{ marginBottom: 2, backgroundColor: '#FFFFFF' }}
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              required
              sx={{ marginBottom: 2, backgroundColor: '#FFFFFF' }}
            />
            <OliveButton type="submit" fullWidth>
              Login
            </OliveButton>
          </form>
          {error && (
            <Typography color="error" sx={{ marginTop: 2 }}>
              {error}
            </Typography>
          )}
        </OliveBox>
      </motion.div>
    </Container>
  );
};

export default Login;
