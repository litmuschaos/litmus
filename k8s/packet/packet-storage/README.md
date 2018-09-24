
# Packet platform specific code and scripts

#### Creating storage on Packet Cloud which provides `multi-tenant block storage` service (backed by the fine folks at Datera) https://www.packet.net/cloud/storage/

### Pre-requisites

- Packet Cluster is up and running and device Id stored in a file `/tmp/packet/device_id`
- `packet` directory present at location `/tmp`

**Example**: Format of device_id stored in file

```bash
$ cat /tmp/packet/device_id
52793aab-02b6-4c7e-a6d8-5f7893660b18
0477161f-90f2-463f-a6f7-db63c19dbda8
07668999-37c5-4e0e-be6f-786ba8eef574
c5bb635c-2fd8-4394-bbd3-10ceb81c0876
```

#### Execution and Inventory Requirements

- Packet api token required: (https://app.packet.net/users/<`project-id`>/api-keys)

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