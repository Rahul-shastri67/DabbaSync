import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { useAppStore } from "../store/index.js";

export function useSocket({ autoConnect = true } = {}) {
  const socketUrl = useAppStore((s) => s.socketUrl);
  const token = useAppStore((s) => s.token);

  const socket = useMemo(() => {
    const s = io(socketUrl, {
      autoConnect: false,
      transports: ["websocket"],
      auth: token ? { token } : undefined
    });
    return s;
  }, [socketUrl, token]);

  const [connected, setConnected] = useState(socket.connected);

  useEffect(() => {
    function onConnect() {
      setConnected(true);
    }
    function onDisconnect() {
      setConnected(false);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    if (autoConnect) socket.connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.disconnect();
    };
  }, [socket, autoConnect]);

  return { socket, connected };
}

