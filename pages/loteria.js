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
        maxWidth: '80rem'
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
    },
    filtro: {
        padding: "0.4rem 0.4rem",
        minWidth: '4rem'
      },
    select: {
        cursor: 'pointer',
        minWidth: '10rem',        
        color: "#fff",
        padding: "1rem 0 1.5rem",
        margin: "0.6rem 0 1rem",
        fontSize: "1.1rem",
        height: "2rem",
        textAlign: "center",
        borderColor: '#fff',
        backgroundColor: "rgba(0, 0, 0,0.1)",
        '&:hover': {
            backgroundColor: "rgba(0,0,0,0.2)",
        },
        '&:focus': {
            backgroundColor: "rgba(0,0,0,0.3)",
        },
        '&:before': {
            borderColor: '#orange'
        },
        '&:after': {
            borderColor: 'orange',
        },        
    },
    filtros: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center'
    }
}));

export default function Admin() {

    const classes = useStyles();
    const router = useRouter();
    const { user } = useAuth();
    const [loading,setLoading] = useState(false);
    const [access,setAccess] = useState(false);
    const [atualiza,setAtualiza] = useState(false)
    const [atual,setAtual] = useState()
    const [jogos,setJogos] = useState({})
    const [extracao,setExtracao] = useState();
    const [ultimas,setUltimas] = useState();

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
            setAtual(docAtual.data().extracao)

            const collUltima = collection(db,'extracoes')
            const docUltima = await getDocs(query(collUltima,orderBy("id","desc"),limit(21)))
            setUltimas(docUltima.docs.map(i=>i.data()))            
            
            setLoading(false)
             
        }        
        pegaJogos()
        
    }, [,atualiza])     

    useEffect(() => {

        const pegaNovos = async () => {
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
                    const ext = await axios.post('/api/hello', { dia: dia })
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
            setLoading(false)
        }
        pegaNovos()
    }, [])  

    const atualizar = async (event) => { 

        setLoading(true)
        const hoje = new Date()
        
        const coll = collection(db,'extracoes');
        
        const docsCal = await getDocs(query(coll,where('id','<=',event.target.value),orderBy("id","desc"),limit(220)))
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
                        }).days,
                        extracoes: docsCal.docs.filter(f=>f.id>i.ultimaExtracao).length
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
            updateDoc(doc(atualizacao,"dados"),{ extracao: event.target.value })
        } else {
            setDoc(doc(atualizacao,"dados"),{ extracao: event.target.value })
        }

        setLoading(false)
        
    }

    const ordenar = ( b,a ) => {
        if ( a.extracoes < b.extracoes ){
          return -1;
        }
        if ( a.extracoes > b.extracoes ){
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
        {user && access && ultimas && <div className={classes.root}>
            <div className={classes.filtros}>            
                <div>Exibindo dados até: &nbsp;</div>
                <div>                
                <FormControl variant="filled" sx={{ m: 1, minWidth: 120 }}>
                    <InputLabel id="demo-simple-select-label" style={{color:'#fff', padding: '0.2rem'}}></InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={atual ? atual : ultimas[0].id}
                        onChange={atualizar}
                        className={classes.select}
                        defaultValue={atual ? atual.toString().substring(6,8) + '/' + atual.toString().substring(4,6) + '/' + atual.toString().substring(0,4) + ' ' + atual.toString().substring(8,10) + ':' + atual.toString().substring(10,12) : format(parseISO(ultimas[0].data+' '+ultimas[0].hora),"dd/MM/Y '-' HH:mm'h")}
                        >
                        {ultimas.map(i=> <MenuItem value={i.id}>{format(parseISO(i.data+' '+i.hora),"dd/MM/Y ' - ' HH:mm'h")}</MenuItem>)}
                    </Select>
                </FormControl>
                </div>
            </div>            
            <Paper className={classes.paper}>
            {Array.from({length: 10}, (x, j) => j).map((p,indexp) => <Card className={classes.card} key={indexp}>
                <div className={classes.titulo}>{p+1}º Premio</div>
                <CardContent className={classes.cardContent}>
                {jogos.length>0 && jogos.filter(f=>f.premio==p+1).map(i => 
                i.grupos.sort(ordenar).map((h,index)=>
                    index<=8 && <div>
                        <Chip className={classes.chip} variant='outlined' label={`${h.grupo}`} />
                        <span className={classes.subtitulo}>{h.extracoes} extrações</span>
                        <div className={classes.subtitulo}>Última: {
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