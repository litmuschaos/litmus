
# Packet platform specific code and scripts

### Creating storage on Packet Cloud which provides `multi-tenant block storage` service (backed by the fine folks at Datera) https://www.packet.net/cloud/storage/

### Pre-requisites

- Packet Cluster is up and running and device Id stored in a file `/tmp/packet/device_id`

#### Execution and Inventory Requirements

- Packet api token required (https://app.packet.net/users/<`project-id`>/api-keys)

### Creating and attaching packet storage to cluster

- `create-volume`, will create and attach `Datera` volume to each of nodes present in file (/tmp/packet/device_id).

```bash
ansible-playbook create-volume.yml -vv --extra-vars "packet_api=<packet-api-token>"
```

### Detach and delete packet Volume

- `delete-volume`, will detach and delete `Datera` volume using the volume id present in (/tmp/packet/volume_id).

```bash
ansible-playbook delete-volume.yml -vv --extra-vars "packet_api=<packet-api-token>"
```