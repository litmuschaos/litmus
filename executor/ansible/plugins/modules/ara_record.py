#  Copyright (c) 2017 Red Hat, Inc.
#
#  This file is part of ARA: Ansible Run Analysis.
#
#  ARA is free software: you can redistribute it and/or modify
#  it under the terms of the GNU General Public License as published by
#  the Free Software Foundation, either version 3 of the License, or
#  (at your option) any later version.
#
#  ARA is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#  GNU General Public License for more details.
#
#  You should have received a copy of the GNU General Public License
#  along with ARA.  If not, see <http://www.gnu.org/licenses/>.

# This file is purposefully left empty due to an Ansible issue
# Details at: https://github.com/ansible/ansible/pull/18208

# TODO: Remove this file and update the documentation when the issue is fixed,
# released and present in all supported versions.

DOCUMENTATION = """
---
module: ara_record
short_description: Ansible module to record persistent data with ARA.
version_added: "2.0"
author: "RDO Community <rdo-list@redhat.com>"
description:
    - Ansible module to record persistent data with ARA.
options:
    playbook:
        description:
            - uuid of the playbook to write the key to
        required: false
        version_added: 0.13.2
    key:
        description:
            - Name of the key to write data to
        required: true
    value:
        description:
            - Value of the key written to
        required: true
    type:
        description:
            - Type of the key
        choices: [text, url, json, list, dict]
        default: text

requirements:
    - "python >= 2.6"
    - "ara >= 0.10.0"
"""

EXAMPLES = """
# Write static data
- ara_record:
    key: "foo"
    value: "bar"

# Write data to a specific (previously run) playbook
# (Retrieve playbook uuid's with 'ara playbook list')
- ara_record:
    playbook: uuuu-iiii-dddd-0000
    key: logs
    value: "{{ lookup('file', '/var/log/ansible.log') }}"
    type: text

# Write dynamic data
- shell: cd dev && git rev-parse HEAD
  register: git_version
  delegate_to: localhost

- ara_record:
    key: "git_version"
    value: "{{ git_version.stdout }}"

# Write data with a type (otherwise defaults to "text")
# This changes the behavior on how the value is presented in the web interface
- ara_record:
    key: "{{ item.key }}"
    value: "{{ item.value }}"
    type: "{{ item.type }}"
  with_items:
    - { key: "log", value: "error", type: "text" }
    - { key: "website", value: "http://domain.tld", type: "url" }
    - { key: "data", value: "{ 'key': 'value' }", type: "json" }
    - { key: "somelist", value: ['one', 'two'], type: "list" }
    - { key: "somedict", value: {'key': 'value' }, type: "dict" }
"""
