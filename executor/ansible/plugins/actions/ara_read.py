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
    from ara.webapp import create_app
    from flask import current_app
    HAS_ARA = True
except ImportError:
    HAS_ARA = False

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


class ActionModule(ActionBase):
    """ Read from recorded persistent data as key/value pairs in ARA """

    TRANSFERS_FILES = False
    VALID_ARGS = frozenset(('playbook', 'key'))

    def get_key(self, playbook_id, key):
        try:
            data = (models.Data.query
                    .filter_by(key=key)
                    .filter_by(playbook_id=playbook_id)
                    .one())
        except models.NoResultFound:
            return False

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
                    'failed': True,
                    'msg': '{0} is not a valid option.'.format(arg)
                }
                return result

        result = super(ActionModule, self).run(tmp, task_vars)

        playbook_id = self._task.args.get('playbook', None)
        key = self._task.args.get('key', None)

        required = ['key']
        for parameter in required:
            if not self._task.args.get(parameter):
                result['failed'] = True
                result['msg'] = '{0} parameter is required'.format(parameter)
                return result

        if playbook_id is None:
            # Retrieve the persisted playbook_id from tmpfile
            tmpfile = os.path.join(app.config['ARA_TMP_DIR'], 'ara.json')
            with open(tmpfile, 'rb') as file:
                data = jsonutils.load(file)
            playbook_id = data['playbook']['id']

        try:
            data = self.get_key(playbook_id, key)
            if data:
                result['key'] = data.key
                result['value'] = data.value
                result['type'] = data.type
                result['playbook_id'] = data.playbook_id
            msg = 'Sucessfully read data for the key {0}'.format(data.key)
            result['msg'] = msg
        # TODO: Do a better job for handling exception
        except Exception as e:
            result['key'] = None
            result['value'] = None
            result['type'] = None
            result['playbook_id'] = None
            result['failed'] = True
            msg = 'Could not read data for key {0}: {1}'.format(key, str(e))
            result['msg'] = msg
        return result
