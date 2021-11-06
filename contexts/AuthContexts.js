import { createContext, useState, useEffect } from 'react'
import { db, provider, collection, getAuth, signInWithPopup, signInWithRedirect, getDocs, setDoc, doc, getDoc, signOut } from '../services/firebase'

const AuthContext = createContext();

export function AuthProvider({children}){

    const [user, setUser] = useState();    
    const auth = getAuth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {        

        const authenticated = auth.onAuthStateChanged(user => {

            if (!user) {
                setUser(null)
                setLoading(false)
                return;
            }

            setLoading(true)
            const { displayName, photoURL, uid, email } = user

            if (!displayName || !photoURL) {
                throw new error('Missing information from Google Account.')
                setLoading(false)
            }

            const fetchSub = async () => {
                
                const usersRef = collection(db, "users");
                const snap = await getDocs(usersRef);
                const subscribed = await getDoc(doc(db, "users", uid));                    
                
                subscribed && setUser({
                    id: uid,
                    name: displayName,
                    avatar: photoURL,
                    email: email,
                    isAdmin: subscribed.data()?.isAdmin || snap?.empty,                    
                    isAuthorized: subscribed.data()?.isAuthorized || snap?.empty,
                })
                setLoading(false)

            }
            fetchSub()
                

        })

        return () => {
            authenticated()            
        }        

    }, [])

    useEffect(() => {

        const fetchSub = async () => {
            
            const users = collection(db,'users')
            const snap = await getDocs(users);
            const subscribed = await getDoc(doc(db, "users", user.id))

            const hoje = new Date();
            
            if(!subscribed.data()){

                await setDoc(doc(users,user.id),{
                    name: user.name,
                    email: user.email,
                    isAdmin: snap.empty,                    
                    isAuthorized: snap.empty,
                    datetime: hoje.toISOString(),
                })

            }            

        }

        user && fetchSub()

    }, [user])

    async function signInWithGoogle(url) {
        
        setLoading(true)
        const result = await signInWithPopup(auth,provider)            
            .catch(error => { console.log(error) });

        if (result?.user) {
            const { displayName, photoURL, uid, email } = result.user

            if (!displayName || !photoURL) {
                throw new error('Missing information from Google Account.')
            }

            setUser({
                id: uid,
                name: displayName,
                avatar: photoURL,
                email: email
            })
            
        }
        setLoading(false)


    }

    function signOutGoogle(url) {

        const auth = getAuth();
        signOut(auth).then(() => {      
            window.location.href = url;
        }).catch((error) => {
            console.log(error)
        });

    }

    return (
        <AuthContext.Provider value={{
            user,
            signInWithGoogle,
            signOutGoogle,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    )

}

export const AuthConsumer = AuthContext.Consumer;

export default AuthContext;