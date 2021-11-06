import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth'
import { makeStyles } from '@material-ui/core/styles';
import { Paper, IconButton, Button, Backdrop, CircularProgress } from '@material-ui/core'
import { Settings, AccountCircle } from '@material-ui/icons'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'

const useStyles = makeStyles((theme) => ({
    root: {
      display: 'flex',
      flexDirection: 'row',            
      backgroundColor: 'rgba(255,255,255,0.1)',
      color: "#ffffff",
      textAlign: "center",      
      justifyContent: 'center',
      padding: '1.5rem',
    },
    textBox: {
        minWidth: '14rem'
    },
    botao: {
        color: "#ffffff",
        marginTop: "1rem",
        marginBottom: "0rem",
    },
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
      },
  }));

export default function Login(){
    
    const classes = useStyles();
    const { user, signInWithGoogle, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        const loginCheck = () => {
          if(user?.isAuthorized){    
            router.push('/loteria')
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

    return <div>
        <Backdrop className={classes.backdrop}
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        {
        !loading && <Paper className={classes.root}>
            {!user ?
                <div className={classes.textBox}>
                    <div>Seja bem-vindo(a),</div>
                    <br />
                    Acesse com seu Gmail
                    <br />
                    clicando no botão abaixo.
                    <br />
                    <IconButton onClick={signInWithGoogle}>
                        <Image src="/img/google.png" alt="Botão Google" height="100" width="100" objectFit="contain" />
                    </IconButton>
                </div>
            : 
                <div>
                    <div className={classes.textBox}>
                    Seja bem-vindo(a)
                    <strong> {user.name}!<br /> ({user.email})</strong>             
                    {user.isAdmin ? (
                        <div>                        
                            <br />Sua conta está configurada para
                            administrar o sistema.<br />
                            <Link href="/admin" passHref><Button className={classes.botao}><Settings /> Acesse o painel</Button></Link>                        
                        </div>
                    ):
                    user.isAuthorized ? (                        
                        <div>                        
                            <br />Você está logado.<br />
                            <Link href="/profile" passHref><Button className={classes.botao}><AccountCircle /> Acesse seu perfil.</Button></Link>                        
                        </div>
                            
                    ) :
                        <div>                        
                            <br />Sua conta ainda não foi liberada.<br />
                            Por favor, aguarde o prazo estipulado<br /> pelo administrador do sistema.                        
                        </div>
                    }
                    </div>
                </div>        
            }
            </Paper>
        }
    </div>    
}