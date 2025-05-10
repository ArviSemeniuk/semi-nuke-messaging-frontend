const { useEffect, createContext, useRef } = require("react");

const WebSocketContext = createContext()


function WebSocketProvider({ children }) {
    const ws = useRef(null)
    const channels = useRef({}) // maps each channel to the callback

    // called from a component that registers a callback for a channel
    const subscribe = (channel, callback) => {
        channels.current[channel] = callback
    };

    // remove callback
    const unsubscribe = (channel) => {
        delete channels.current[channel]
    };

    // send message to server on page refresh
    const sendMessage = (message) => {
        const send = () => {
            if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                ws.current.send(JSON.stringify(message));
            } else {
                //console.log("WebSocket not ready, retrying...");
                setTimeout(send, 10); // Retry every 10ms until open
            }
        };
        send();
    };

    useEffect(() => {
        // WS initialisation and cleanup
        ws.current = new WebSocket('wss://192.168.0.207:36150');

        ws.current.onopen = () => {console.log('WebSocket is open.')};
        
        ws.current.onclose = () => {console.log('WebSocket is closed.')};
        
        ws.current.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                const type = message.type;
                const callback = channels.current[type];

                //console.log("Raw WebSocket message:", message);
                //console.log("Type:", type, "Typeof:", typeof type);
                //console.log("Registered channels:", Object.keys(channels.current));
               
                if (callback) {
                    callback(message);
                }
                else {
                    console.warn("No callback registered for message type: ", {type});
                }
            } catch (error) {
                console.error("Error handling WebSocket message: ", error);
            }
        };

        return () => { ws.current.close() }

    }, [])

    return (
        <WebSocketContext.Provider value={{subscribe, unsubscribe, sendMessage, getWS: () => ws.current}}>
            {children}
        </WebSocketContext.Provider>
    )
}


export { WebSocketContext, WebSocketProvider }