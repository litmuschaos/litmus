At the outset, ansible was primarily preferred in view of its agent-less architecture, batch deployment capabilities, 
idempotent nature of task execution & YAML usage. To know more about Ansible, visit : http://docs.ansible.com/ansible/index.html

The executor consists of the following main components:

- inventory: Holds both input files to generate the hosts file & hosts file itself
- setup: Playbooks to generate inventory (hosts) file, setup kubernetes & ARA
- provider: Playbooks to setup storage provider
- roles: Consists of ansible roles setup kubernetes testbeds, provider etc.,
- utils: Reusable taskfiles to aid in Litmus execution flow 
- plugins: Custom ansible plugins 
- vagrant: Sample Vagrantfiles to setup a local dev/test environment














