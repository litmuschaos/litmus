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

import os

from ansible.plugins.action import ActionBase
from oslo_serialization import jsonutils

try:
    from ara import models
    from ara.models import db
    from ara.webapp import create_app
    from flask import current_app
    HAS_ARA = True
except ImportError:
    HAS_ARA = False

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

# Registering the result of an ara_record task is equivalent to doing an
# ara_read on the key
- ara_record:
    key: "git_version"
    value: "{{ git_version.stdout }}"
  register: version

- name: Print recorded data
  debug:
    msg: "{{ version.playbook_id}} - {{ version.key }}: {{ version.value }}

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


class ActionModule(ActionBase):
    """ Record persistent data as key/value pairs in ARA """

    TRANSFERS_FILES = False
    VALID_ARGS = frozenset(('playbook', 'key', 'value', 'type'))
    VALID_TYPES = ['text', 'url', 'json', 'list', 'dict']

    def create_or_update_key(self, playbook_id, key, value, type):
        try:
            data = (models.Data.query
                    .filter_by(key=key)
                    .filter_by(playbook_id=playbook_id)
                    .one())
            data.value = value
            data.type = type
        except models.NoResultFound:
            data = models.Data(playbook_id=playbook_id,
                               key=key,
                               value=value,
                               type=type)
        db.session.add(data)
        db.session.commit()

        return data

    def run(self, tmp=None, task_vars=None):
        if task_vars is None:
            task_vars = dict()

        if not HAS_ARA:
            result = {
                'failed': True,
                'msg': 'ARA is required to run this module.'
            }
            return result

        app = create_app()
        if not current_app:
            context = app.app_context()
            context.push()

        for arg in self._task.args:
            if arg not in self.VALID_ARGS:
                result = {
                    "failed": True,
                    "msg": '{0} is not a valid option.'.format(arg)
                }
                return result

        result = super(ActionModule, self).run(tmp, task_vars)

        playbook_id = self._task.args.get('playbook', None)
        key = self._task.args.get('key', None)
        value = self._task.args.get('value', None)
        type = self._task.args.get('type', 'text')

        required = ['key', 'value']
        for parameter in required:
            if not self._task.args.get(parameter):
                result['failed'] = True
                result['msg'] = "Parameter '{0}' is required".format(parameter)
                return result

        if type not in self.VALID_TYPES:
            result['failed'] = True
            msg = "Type '{0}' is not supported, choose one of: {1}".format(
                type, ", ".join(self.VALID_TYPES)
            )
            result['msg'] = msg
            return result

        if playbook_id is None:
            # Retrieve the persisted playbook_id from tmpfile
            tmpfile = os.path.join(app.config['ARA_TMP_DIR'], 'ara.json')
            with open(tmpfile, 'rb') as file:
                data = jsonutils.load(file)
            playbook_id = data['playbook']['id']

        try:
            self.create_or_update_key(playbook_id, key, value, type)
            result['key'] = key
            result['value'] = value
            result['type'] = type
            result['playbook_id'] = playbook_id
            result['msg'] = 'Data recorded in ARA for this playbook.'
        except Exception as e:
            result['failed'] = True
            result['msg'] = 'Data not recorded in ARA: {0}'.format(str(e))
        return result
