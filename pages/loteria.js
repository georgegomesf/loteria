import { useState, useEffect } from 'react';
import styles from '../styles/Profile.module.css'
import Header from '../components/Header'
import { makeStyles } from '@material-ui/core/styles';
import { Paper, Backdrop, IconButton, CircularProgress, Card, CardContent, CardActions, Typography, Collapse, FormControl, InputLabel, Select, Button, MenuItem, Avatar, TextField, Chip } from '@material-ui/core';
import { useRouter } from 'next/router'
import { useAuth } from '../hooks/useAuth'
import Footer from '../components/Footer';
import axios from 'axios'
import { format,parseISO,toDate,intervalToDuration,formatISO,fromUnixTime } from 'date-fns'
import { db, getDoc, getDocs, doc, collection, updateDoc, setDoc, arrayUnion, arrayRemove, query, where, limit, orderBy, deleteDoc } from '../services/firebase';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',        
        backgroundColor: 'rgba(255,255,255,0.1)',
        color: "#ffffff",
        textAlign: "left",  
        justifyContent: 'center',
        alignItems: 'center',                
        width: '100%',
        padding: '1rem',
    },
    paper: {
        display: 'flex',
        flexDirection: 'row',            
        flexWrap: 'wrap',
        backgroundColor: 'rgba(255,255,255,0.1)',
        color: "#ffffff",
        textAlign: "left",        
        justifyContent: 'center',
        alignItems: 'center',                
        width: '100%'
    }, 
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    },
    botao: {
        color: "#fff",
        backgroundColor: "rgba(0,0,0,0.2)",
        '&:hover': {
            backgroundColor: "rgba(0,0,0,0.6)",
        },
        margin: '0.2rem'
    },
    card: {
        width: '15rem',
        margin: '0.3rem',
        padding: '1rem 0.5rem',
    },
    titulo: {
        fontSize: '1.2rem',
        margin: '0.3rem 0 0.5rem 0.3rem',
        padding: 0,
        fontWeight: 700
    },
    subtitulo: {
        fontSize: '0.8rem',
        margin: '0.3rem 0 0.5rem 0.3rem',
        padding: 0
    },
    chip: {
        color: 'red',
        minWidth: '2.5rem',
        fontWeight: '700',
        fontSize: '1.3rem'
    }
}));

export default function Admin() {

    const classes = useStyles();
    const router = useRouter();
    const { user } = useAuth();
    const [loading,setLoading] = useState(false);
    const [access,setAccess] = useState(false);
    const [atualiza,setAtualiza] = useState(false)
    const [atualizacao,setAtualizacao] = useState()
    const [atual,setAtual] = useState()
    const [jogos,setJogos] = useState({})

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

    useEffect(() => {
        const pegaJogos = async () => {

            setLoading(true)
            const coll = collection(db,'calculos');
            const docs = await getDocs(coll).then(r=> { return r } )
            docs && setJogos(docs.docs.map(i=>i.data()))
            
            const atualizacao = collection(db,'atualizacao')
            const docAtual = await getDoc(doc(atualizacao,"dados"))
            setAtual(format(parseISO(docAtual.data().datahora),"dd/MM/Y à's' hh:mm'h'"))
            setLoading(false)
            
        }
        pegaJogos()
    }, [,atualiza]) 
 

    const atualizar = async () => {

        setLoading(true)
        const hoje = new Date()
        const listDate = [];
        const startDate = format(hoje - (40 * 24 * 60 * 60 * 1000),"Y-MM-dd");
        const endDate = format(hoje,"Y-MM-dd");

        const dateMove = new Date(startDate);
        let strDate = startDate;

        const coll = collection(db,'extracoes');
        const docs = await getDocs(coll);
    
        while (strDate < endDate){
            strDate = dateMove.toISOString().slice(0, 10);
            listDate.push(strDate);
            const diaMove = dateMove.setDate(dateMove.getDate() + 1);
            const dia = format(diaMove,"Y-MM-dd");            
            const docsDia = await getDocs(query(coll,where('data','==',dia)));                        
            if(docsDia.docs.length==0 || docs.docs[docs.docs.length-1].data().data==dia){
                const ext = await axios.get(`https://servico.loteriafort.site/api/Resultado/422428E7-A88F-44EB-9E14-D1DC8E3E2B40/0/${dia}/${dia}`)
                ext.data.map(i=> {  
                    const diaId = format(diaMove,"YMMdd")           
                    setDoc(doc(coll,diaId+i.nome_loteria.replace('LOTERIA FORT ','').replace(':','')),
                    {             
                        id: parseInt(diaId+i.nome_loteria.replace('LOTERIA FORT ','').replace(':','')),
                        data: i.data_resultado.substring(6,10) + '-' + i.data_resultado.substring(3,5) + '-' + i.data_resultado.substring(0,2),
                        hora: i.nome_loteria.replace('LOTERIA FORT ','')+':00',
                        premios: 
                        Array.from({length: 10}, (x, j) => j).map(p=> {
                            return i.premios[p].valor.substring(3,5)=="00" ? 25 : Math.ceil(parseInt(i.premios[p].valor.substring(3,5))/4)
                        })
                    })
                })
                console.log(dia)
            }   
        };
        
        const docsCal = await getDocs(query(coll,orderBy("data","desc"),limit(220)))
        const docsExt = Array.from({length: 10}, (x, i) => i).map(p=> {
            return Array.from({length: 25}, (y, j) => j).map(n=> {                                
                return docsCal.docs.filter(f=>f.data().premios[p]==n+1).map(n=>{ return parseInt(n.data().data.replaceAll('-','')) } ).reduce(function(a, b) {
                    return {
                        premio: p+1,
                        grupo: n+1,
                        numSaidas: docsCal.docs.filter(f=>f.data().premios[p]==n+1).map(n=>{ return parseInt(n.data().data.replaceAll('-','')) } ).length,                                
                        ultimaExtracao: docsCal.docs.filter(f=>f.data().premios[p]==n+1).map(n=>{ return parseInt(n.data().data.replaceAll('-','') + n.data().hora.replaceAll(':','').substring(0,4) ) } ).reduce(function(a, b) { return Math.max(a, b) }),
                        ultimoDia: docsCal.docs.filter(f=>f.data().premios[p]==n+1).map(n=>{ return parseInt(n.data().data.replaceAll('-','')) } ).reduce(function(a, b) { return Math.max(a, b) })
                    }
                })
            })
        })                

        const collCalculos = collection(db,'calculos');
        docsExt.map(j => {
            Array.from({length: 10}, (x, g) => g).map(p=> {
                const docPremios = j.filter(f=>f.premio==p+1).map(i => {
                    deleteDoc(doc(collCalculos,(p+1).toString().padStart(2,'0')))
                    return {
                        premio: i.premio,
                        grupo: i.grupo,
                        numSaidas: i.numSaidas,                    
                        ultimaExtracao: i.ultimaExtracao,
                        dias: intervalToDuration({
                            start: parseISO(i.ultimoDia.toString().substring(0,4) + '-' + i.ultimoDia.toString().substring(4,6) + '-' + i.ultimoDia.toString().substring(6,8) + ' 00:00:00'),
                            end: hoje
                        }).days 
                    }
                })                
                docPremios.length>0 && setDoc(
                    doc(collCalculos,(p+1).toString().padStart(2,'0')),
                    { premio: p+1, grupos: docPremios }
                )
            })         
        })

        setAtualiza(!atualiza)

        const atualizacao = collection(db,'atualizacao')
        const docAtual = await getDoc(doc(atualizacao,"dados"))
        if(docAtual.data()){            
            updateDoc(doc(atualizacao,"dados"),{ datahora: format(hoje,"yyyy-MM-dd'T'HH:mm:ss.SSSxxx") })
        } else {
            setDoc(doc(atualizacao,"dados"),{ datahora: format(hoje,"yyyy-MM-dd'T'HH:mm:ss.SSSxxx") })
        }

        setLoading(false)
        
    }

    const ordenar = ( a, b ) => {
        if ( a.ultimaExtracao < b.ultimaExtracao ){
          return -1;
        }
        if ( a.ultimaExtracao > b.ultimaExtracao ){
          return 1;
        }
        return 0;
      }

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
        {user && access && <div className={classes.root}>
            <div>            
            Última Atualização em {atual}
            <Button onClick={()=>atualizar()} className={classes.botao}>Atualizar</Button>
            </div>
            <Paper className={classes.paper}>
            {Array.from({length: 10}, (x, j) => j).map((p,indexp) => <Card className={classes.card} key={indexp}>
                <div className={classes.titulo}>{p+1}º Premio</div>
                <CardContent className={classes.cardContent}>
                {jogos.length>0 && jogos.filter(f=>f.premio==p+1).map(i => 
                i.grupos.sort(ordenar).map((h,index)=>
                    index<=8 && <div>
                        <Chip className={classes.chip} variant='outlined' label={`${h.grupo}`} />
                        <span className={classes.subtitulo}>{h.dias} dias</span>
                        <div className={classes.subtitulo}>Última vez: {
                            h.ultimaExtracao.toString().substring(6,8) + '/' + h.ultimaExtracao.toString().substring(4,6) + '/' + h.ultimaExtracao.toString().substring(0,4) + ' ' + h.ultimaExtracao.toString().substring(8,10) + ':' + h.ultimaExtracao.toString().substring(10,12)
                        }</div>
                    </div>
                ))}
                </CardContent>
                </Card>
            )}
            </Paper>
            </div>
        }        
        </main>
        <Footer />
    </div>
  );
}