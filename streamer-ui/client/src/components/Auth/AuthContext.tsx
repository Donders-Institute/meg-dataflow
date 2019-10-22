import React from "react";

export interface IAuthContext {
    isAuthenticated: boolean,
    username: string,
    password: string,
    ipAddress: string,
    authenticate: (username: string, password: string, ipAddress: string) => void,
    signout: () => void
}

const AuthContext = React.createContext<IAuthContext | null>(null);

const AuthContextProvider = AuthContext.Provider;

const AuthContextConsumer = AuthContext.Consumer;

export { AuthContext, AuthContextProvider, AuthContextConsumer };
