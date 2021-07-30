## Pod Network Chaos

It contains tunables to execute the pod network experiment. This experiment interrupts the network of the given pod for the specified `TOTAL_CHAOS_DURATION` duration. 
It injects chaos for both `Ingress` and `Egress` traffics.

### Network Packet Loss

It defines the network packet loss percentage to be injected in the targeted application. It can be tuned via `NETWORK_PACKET_LOSS_PERCENTAGE` ENV. 

Use the following example to tune this:
<references to the sample manifest>

### Network Latency

It defines the network latency(in ms) to be injected in the targeted application. It can be tuned via `NETWORK_LATENCY` ENV. 

Use the following example to tune this:
<references to the sample manifest>

### Network Packet Corruption

It defines the network packet corruption percentage to be injected in the targeted application. It can be tuned via `NETWORK_PACKET_CORRUPTION_PERCENTAGE` ENV. 

Use the following example to tune this:
<references to the sample manifest>

### Network Packet Duplication

It defines the network packet duplication percentage to be injected in the targeted application. It can be tuned via `NETWORK_PACKET_DUPLICATION_PERCENTAGE` ENV. 

Use the following example to tune this:
<references to the sample manifest>

### Destination IPs And Destination Hosts

The network experiments interrupt traffic for all the IPs/hosts by default. The interruption of specific IPs/Hosts can be tuned via `DESTINATION_IPS` and `DESTINATION_HOSTS` ENV.
`DESTINATION_IPS`: It contains the IP addresses of the services or pods or the CIDR blocks(range of IPs), the accessibility to which is impacted.
`DESTINATION_HOSTS`: It contains the DNS Names/FQDN names of the services, the accessibility to which, is impacted.

Use the following example to tune this:
<references to the sample manifest>

### Network Interface

The defined name of the ethernet interface, which is considered for shaping traffic. It can be tuned via `NETWORK_INTERFACE` ENV. Its default value is `eth0`.

Use the following example to tune this:
<references to the sample manifest>

### Container Runtime Socket Path

It defines the `CONTAINER_RUNTIME` and `SOCKET_PATH` ENV to set the container runtime and socket file path.
- `CONTAINER_RUNTIME`: It supports `docker`, `containerd`, and `crio` runtimes. The default value is `docker`.
`SOCKET_PATH`: It contains path of docker socket file by default(`/var/run/docker.sock`). For other runtimes provide the appropriate path.

### Pumba Chaos Library

It specifies the Pumba chaos library for the chaos injection. It can be tuned via `LIB` ENV. The defaults chaos library is `litmus`.
Provide the traffic control image via `TC_IMAGE` ENV for the pumba library.

Use the following example to tune this:
<references to the sample manifest>