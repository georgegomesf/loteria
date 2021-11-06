import { useState, useEffect } from "react";
import { Avatar, AppBar, Button, Hidden, IconButton, Drawer, List, ListItem } from "@material-ui/core"
import { Home as HomeIcon, Menu as MenuIcon, ExitToApp, Settings, VpnKey } from "@material-ui/icons"
import { makeStyles } from "@material-ui/styles";
import Image from 'next/image'
import classNames from "classnames";
import { useAuth } from '../hooks/useAuth';
import Link from 'next/link'

const useStyles = makeStyles((theme) => ({
    appBar: {
        transition: "all 150ms ease 0s",
        boxShadow:
            "0 4px 18px 0px rgba(0, 0, 0, 0.12), 0 7px 10px -5px rgba(0, 0, 0, 0.15)",
        zIndex: 999,
        borderRadius: "3px",
        color: "#ffffff",
        fontFamily: "Staatliches",        
    },
    transparent: {
        backgroundColor: "transparent !important",
        boxShadow: "none",
        color: "#ffffff",
    },
    black: {
        border: "0",        
        color: "#fff",
        backgroundColor: "rgba(87, 0, 11,1) !important",
        boxShadow:
            "0 4px 18px 0px rgba(0, 0, 0, 0.42), 0 7px 10px -5px rgba(0, 0, 0, 0.45)",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        padding: "0 1rem",
        width: "100%",
        maxWidth: "80rem",                     
        alignItems: "center",
        margin: "auto",
    },
    botao: {
        color: "#ffffff"
    },
    icone: {
        padding: "0.1rem",
        marginRight: "0.5rem"
    },
    logo: {
        display: "flex"
    },
    avatar: {
        marginRight: "0.5rem"
    },
    link: {
        color: "#ffffff"
    }
}))

export default function Header(props) {

    const classes = useStyles();
    const { corInicial, changeColorOnScroll } = props;
    const [cor, setCor] = useState(corInicial);
    const [mobileOpen, setMobileOpen] = useState(false);  
    const { user, signInWithGoogle, signOutGoogle } = useAuth();

    const headerColorChange = () => {

        const windowsScrollTop = window.pageYOffset;

        if (windowsScrollTop > 60) {
            setCor(changeColorOnScroll.color);            
        } else {
            setCor(corInicial);
        }
    };

    const appBarClasses = classNames({
        [classes.appBar]: true,
        [classes[cor]]: cor,
    });

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    useEffect(() => {
        if (changeColorOnScroll) {
            window.addEventListener("scroll", headerColorChange);
        }
        return function cleanup() {
            if (changeColorOnScroll) {
                window.removeEventListener("scroll", headerColorChange);
            }
        };
    }); 

    return <AppBar className={appBarClasses}>
        <div className={classes.header}>
            <div className={classes.logo}>
                <Link href="/"><a><Image src="/img/logo.png" alt="NextJS-Firebase-Material" height="65" width="200" objectFit="contain" /></a></Link>                
            </div>
            <div>
                <Hidden smUp>
                    <IconButton
                        aria-label="open drawer"
                        onClick={handleDrawerToggle}
                        className={classes.botao}
                    ><MenuIcon /></IconButton>
                </Hidden>
                <Hidden smDown implementation="css">
                    {user ? <Link href="/" passHref><Button className={classes.botao}><HomeIcon className={classes.icone} />Início</Button></Link>
                        : <Button onClick={signInWithGoogle} className={classes.botao}><VpnKey className={classes.icone} />Entrar</Button>}
                    {user?.isAdmin && <Link href="/admin" passHref><Button className={classes.botao}><Settings className={classes.icone} />Admin</Button></Link>}
                    {user && <Link href="/profile" passHref><Button className={classes.botao}>
                        <Avatar
                            alt={user.name}
                            src={user.avatar}
                            sx={{ width: 24, height: 24 }}
                            className={classes.avatar}
                        />
                        {user.name.substring(0,10)}{user.name.length>10 && '...'}
                    </Button></Link>}
                    {user && <Button onClick={()=>signOutGoogle('/')} className={classes.link}><ExitToApp className={classes.icone} />Sair</Button>}
                </Hidden>                  
            </div>
        </div>
        <Hidden smUp implementation="js">
            <Drawer
                variant="temporary"
                anchor={"right"}
                open={mobileOpen}
                classes={{
                    paper: classes.drawerPaper
                }}
                onClose={handleDrawerToggle}
            >
                <div className={classes.appResponsive}>
                    <List>
                        <Link href="/" style={{textDecoration:"none"}} passHref><ListItem button onClick={handleDrawerToggle}><HomeIcon className={classes.icone} />Início</ListItem></Link>
                        {user?.isAdmin && <Link href="/admin" style={{textDecoration:"none"}} passHref><ListItem button onClick={handleDrawerToggle}><Settings className={classes.icone} />Admin</ListItem></Link>}
                        {user && <Link href="/profile" style={{textDecoration:"none"}} passHref><ListItem button onClick={handleDrawerToggle}>
                        <Avatar
                            alt={user.name}
                            src={user.avatar}
                            sx={{ width: 24, height: 24 }}
                            className={classes.avatar}
                        />
                        {user.name.substring(0,10)}{user.name.length>10 && '...'}
                        </ListItem></Link>}                        
                        {user && <ListItem button onClick={()=>signOutGoogle('/')}><ExitToApp className={classes.icone} />Sair</ListItem>}
                    </List>
                </div>
            </Drawer>
        </Hidden>
    </AppBar>

}