import { useContext, createContext, useState, useEffect } from 'react'


const AuthContext = createContext({
    isAuthenticated: false,
    getAccessToken: () => { },
    saveUser: () => { },
    getRefreshToken: () => { },
    getUser: () => { },
    signOut: () => { }
})

const AuthProvider = ({ children }) => {

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [accessToken, setAccessToken] = useState("")
    const [user, setUser] = useState("")

    const requestNewAccessToken = async (refreshToken) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/refresh-token`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${refreshToken}`,
                },
            });

            if (response.ok) {
                const json = await response.json();
                return json.body.accessToken;
            }

        } catch (error) {
            console.log(error)
            return null;
        }
    }

    const getUserInfo = async (accessToken) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/user`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (response.ok) {
                const json = await response.json();
                return json.body;
            } else {
                throw new Error(response.statusText)
            }

        } catch (error) {
            console.log(error)
            return null;
        }
    }

    const checkAuth = async () => {
        if (accessToken) {
            //El usuario está autenticado
            const userInfo = await getUserInfo(accessToken);
            console.log('Informacion de usuario autenticado', userInfo)
            if (userInfo) {
                console.log(userInfo)
                saveSessionInfo(userInfo, accessToken, getRefreshToken)
            }
        } else {
            //El usuario no está autenticado
            const token = getRefreshToken();
            if (token) {
                const newAccessToken = await requestNewAccessToken(token);
                if (newAccessToken) {
                    const userInfo = await getUserInfo(newAccessToken);
                    if (userInfo) {
                        saveSessionInfo(userInfo, newAccessToken, token)
                    }
                }
            }
        }
    }

    const saveSessionInfo = (userInfo, accessToken, refreshToken) => {
        setAccessToken(accessToken);
        localStorage.setItem("token", JSON.stringify(refreshToken));
        setUser(userInfo)
        setIsAuthenticated(true);
    }

    const getAccessToken = () => {
        return accessToken;
    }

    const getRefreshToken = () => {
        const tokenData = localStorage.getItem("token")
        if (tokenData) {
            const token = JSON.parse(tokenData)
            return token;
        }
        return null;
    }

    const saveUser = (userData) => {
        console.log('SaveUser', userData)
        saveSessionInfo(userData.body.user, userData.body.accessToken, userData.body.refreshToken)
    }

    const getUser = () => {
        return user;
    }

    const signOut = () => {
        setIsAuthenticated(false);
        setAccessToken("");
        setUser(undefined);
        localStorage.removeItem("token")
    }

    useEffect(() => {
        checkAuth();
    }, []);


    return <AuthContext.Provider value={{ isAuthenticated, getAccessToken, saveUser, getRefreshToken, getUser, signOut }}>
        {children}
    </AuthContext.Provider>
}

const useAuth = () => useContext(AuthContext);

export { useAuth, AuthProvider };
