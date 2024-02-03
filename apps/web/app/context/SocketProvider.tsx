"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";

interface ISocketContext {
    sendMessage: (msg: string) => any;
    messages: string[]
}

const SocketContext = createContext<ISocketContext | null>(null);

export const useSocket = () => {
    const state = useContext(SocketContext);
    if (!state) {
        throw new Error("State is undefined")
    }

    return state;
}

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<Socket>();
    const [messages, setMessages] = useState<string[]>([]);

    const sendMessage: ISocketContext["sendMessage"] = useCallback((msg) => {
        console.log("Send message: ", msg);
        if (socket) {
            socket.emit("event:message", { message: msg })
        }
    }, [socket]);

    const onMessageRec = useCallback((msg: string) => {
        console.log('From server message received: ', msg);
        const { message } = JSON.parse(msg) as { message: string }
        setMessages((prev) => [...prev, message]);
    }, []);

    useEffect(() => {
        const _socket = io('http://localhost:8000');
        _socket.on('message', onMessageRec);
        setSocket(_socket);
        return () => {
            _socket.disconnect();
            _socket.off('message', onMessageRec);
            setSocket(undefined)
        }
    }, [])

    return <SocketContext.Provider value={{sendMessage, messages}}>{children}</SocketContext.Provider>
}