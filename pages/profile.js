import { useState, useEffect } from 'react';
import styles from '../styles/Profile.module.css'
import Header from '../components/Header'
import { makeStyles } from '@material-ui/core/styles';
import { Paper, Backdrop, CircularProgress, Avatar } from '@material-ui/core';
import { useRouter } from 'next/router'
import { useAuth } from '../hooks/useAuth'
import Footer from '../components/Footer';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',            
        backgroundColor: 'rgba(255,255,255,0.1)',
        color: "#ffffff",
        textAlign: "center",        
        justifyContent: 'center',
        alignItems: 'center',
        padding: '1.5rem',        
    },    
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    },
    avatar: {
        margin: '0 0 1rem 0',
        height: '6rem',
        width: '6rem',
    }
}));

export default function Admin() {

  const classes = useStyles();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [access,setAccess] = useState(false);

  useEffect(() => {
    const loginCheck = () => {
      if(user?.isAuthorized){    
        setAccess(true)
      } else {
        if(!loading){
            if (typeof window !== 'undefined') {
            router.push('/')
            }
        }
      }
    }
    loginCheck()    
  }, [user,loading,router])

  return (    
    <div className={styles.container}>
        <Backdrop className={classes.backdrop}
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <Header corInicial="transparent"
        changeColorOnScroll={{
          height: 100,
          color: "black"
        }} />
        <main className={styles.main}>
        {user && access && 
          <Paper className={classes.root}>
          <Avatar
                alt={user.name}
                src={user.avatar}
                sx={{ width: 24, height: 24 }}
                className={classes.avatar}
            />
          <strong>{user.name}</strong><br />
          {user.email}<br />          
          </Paper>
          }
        </main>        
        <Footer />
    </div>
  );
}