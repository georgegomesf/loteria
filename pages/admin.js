import { useState, useEffect } from 'react';
import styles from '../styles/Admin.module.css'
import Header from '../components/Header'
import { makeStyles } from '@material-ui/core/styles';
import { List, ListItem, ListItemSecondaryAction, ListItemText, ListSubheader, Switch, Fade, Backdrop, CircularProgress } from '@material-ui/core';
import { db, collection, updateDoc, doc, getDocs, getDoc } from '../services/firebase'
import { useRouter } from 'next/router'
import { useAuth } from '../hooks/useAuth'
import Footer from '../components/Footer';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    minWidth: 330,    
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
}));

export default function Admin() {

  const classes = useStyles();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [checked, setChecked] = useState([]);
  const [users, setUsers] = useState([]);
  const [access,setAccess] = useState(false);

  useEffect(() => {
    const loginCheck = () => {
      if(user?.isAdmin){    
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

  const handleToggle = (user,authorized) => async () => {    

    const currentIndex = checked.indexOf(user);
    const newChecked = [...checked];

    const userRef = doc(db,'users',user);    
    await updateDoc(userRef, {
     isAuthorized: !authorized
    });

    if (currentIndex === -1) {
      newChecked.push(user);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    setChecked(newChecked);
  };

  useEffect(() => {

    async function getUsers(){

      const collect = collection(db,'users')
      const snap = await getDocs(collect);
      const docs = snap.docs.filter(f=>!f.data().isAdmin).map((doc)=>{        
        const data = doc.data();
        const id = doc.id;
        return { id, ...data }        
      })
      setUsers(docs)
    
    }
    getUsers()

  }, [checked]) 

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
          <List subheader={<ListSubheader>Usuários</ListSubheader>} className={classes.root}>
          {users.map((i,index)=>
            <ListItem key={index}>
              <ListItemText id="switch-list-label-wifi" primary={i.name} />
              <ListItemSecondaryAction>
              <Switch
                  edge="end"s
                  onChange={handleToggle(i.id,i.isAuthorized)}
                  checked={i.isAuthorized}
                  inputProps={{ 'aria-labelledby': 'switch-list-label-wifi' }}
              />
              </ListItemSecondaryAction>
            </ListItem>
            )}
          </List>
          }
        </main>        
        <Footer />
    </div>
  );
}