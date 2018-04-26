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
module: ara_read
short_description: Ansible module to read recorded persistent data with ARA.
version_added: "2.0"
author: "RDO Community <rdo-list@redhat.com>"
description:
    - Ansible module to read recorded persistent data with ARA.
options:
    playbook:
        description:
            - uuid of the playbook to read the key from
        required: false
        version_added: 0.13.2
    key:
        description:
            - Name of the key to read from
        required: true

requirements:
    - "python >= 2.6"
    - "ara >= 0.10.0"
"""

EXAMPLES = """
# Write data
- ara_record:
    key: "foo"
    value: "bar"

# Read data
- ara_read:
    key: "foo"
  register: foo

# Read data from a specific playbook
# (Retrieve playbook uuid's with 'ara playbook list')
- ara_read:
    playbook: uuuu-iiii-dddd-0000
    key: logs
  register: logs

# Use data
- debug:
    msg: "{{ item }}"
  with_items:
    - foo.key
    - foo.value
    - foo.type
    - foo.playbook_id
"""
