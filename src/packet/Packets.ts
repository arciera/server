/**
 * Client -> Server Packets (C2S)
 * 
 * @abstract Serverbound
 */
export enum C2S {
    /**
     * Handshake
     * 
     * State: None
     */
    Handshake = 0x00,

    /**
     * Login
     * 
     * State: Login
     */
    Login = 0x00,

    /**
     * Ping
     * 
     * State: any
     */
    Ping = 0x01,

    /**
     * Status
     * 
     * State: Status
     */
    Status = 0x00,
}

/**
 * Server -> Client Packets (S2C)
 * 
 * @abstract Clientbound
 */
export enum S2C {
    /**
     * Disconnect
     * 
     * State: Login
     */
    DisconnectLogin = 0x00,

    /**
     * Disconnect
     * 
     * State: Play
     */
    DisconnectPlay = 0x1A,

    /**
     * Login Success
     * 
     * State: Login
     */
    LoginSuccess = 0x02,

    /**
     * Pong
     * 
     * State: any
     */
    Pong = 0x01,

    /**
     * Status Response
     * 
     * State: status
     */
    StatusResponse = 0x00,
}