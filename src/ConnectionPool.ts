import Connection from "./Connection";

export default class ConnectionPool {
    private readonly connections: Connection[] = [];

    /**
     * Add a connection to the pool
     * @param connection
     */
    public add(connection: Connection): void {
        this.connections.push(connection);
    }

    /**
     * Get connection by ID
     * @param id The ID of the connection to get
     */
    public get(id: string): Connection | null {
        return this.connections.find(connection => connection.id === id) ?? null;
    }

    /**
     * Disconnect all connections
     * @returns Whether all connections disconnected successfully
     */
    public async disconnect(): Promise<boolean>;
    /**
     * Disconnect a connection
     * @param id The ID of the connection to disconnect
     * @returns Whether the connection was found and disconnected
     */
    public async disconnect(id: string): Promise<boolean>;
    public async disconnect(id?: string): Promise<boolean> {
        const promises: Promise<boolean>[] = [];
        if (id) {
            const connection = this.get(id);
            if (!connection) return false;
            const index = this.connections.indexOf(connection);
            if (index === -1) return false;
            this.connections.splice(index, 1);
            promises.push(new Promise(resolve => connection.socket.end(() => resolve(true))));
        }
        else for (const connection of this.connections)
                promises.push(this.disconnect(connection.id));
        return (await Promise.all(promises)).every(result => result);
    }
}
