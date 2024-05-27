## TODO

### -> Login
    #### State `CONFIGURATION`
    - Send [registry data](https://wiki.vg/Protocol#Registry_Data) *nbt*
    - Send feature flag packet (0x08) specifying no special features
    ```json
    {
        "id": 0x08,
        "varint0": 0
    }
    ```
    - Receive client information (i.e. locale, view distance, allow server listing) [packet](https://wiki.vg/Protocol#Client_Information_.28configuration.29)
    - Receive acknowledge finish configuration (switching state to play)