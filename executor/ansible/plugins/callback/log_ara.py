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

from __future__ import (absolute_import, division, print_function)

import flask
import itertools
import logging
import os

from ansible import __version__ as ansible_version
from ansible.plugins.callback import CallbackBase
from ara import models
from ara.models import db
from ara.webapp import create_app
from datetime import datetime
from distutils.version import LooseVersion
from oslo_serialization import jsonutils

# To retrieve Ansible CLI options
try:
    from __main__ import cli
except ImportError:
    cli = None

LOG = logging.getLogger('ara.callback')
app = create_app()


class IncludeResult(object):
    """
    This is used by the v2_playbook_on_include callback to synthesize a task
    result for calling log_task.
    """
    def __init__(self, host, path):
        self._host = host
        self._result = {'included_file': path}


class CallbackModule(CallbackBase):
    """
    Saves data from an Ansible run into a database
    """
    CALLBACK_VERSION = 2.0
    CALLBACK_TYPE = 'notification'
    CALLBACK_NAME = 'ara'

    def __init__(self):
        super(CallbackModule, self).__init__()

        if not flask.current_app:
            ctx = app.app_context()
            ctx.push()

        self.taskresult = None
        self.task = None
        self.play = None
        self.playbook = None
        self.stats = None
        self.loop_items = []

        self.play_counter = itertools.count()
        self.task_counter = itertools.count()

        if cli:
            self._options = cli.options
        else:
            self._options = None

    def get_or_create_host(self, hostname):
        try:
            host = (models.Host.query
                    .filter_by(name=hostname)
                    .filter_by(playbook_id=self.playbook.id)
                    .one())
        except models.NoResultFound:
            host = models.Host(name=hostname, playbook=self.playbook)
            db.session.add(host)
            db.session.commit()

        return host

    def get_or_create_file(self, path):
        try:
            if self.playbook.id:
                file_ = (models.File.query
                         .filter_by(path=path)
                         .filter_by(playbook_id=self.playbook.id)
                         .one())
                return file_
        except models.NoResultFound:
            pass

        file_ = models.File(path=path, playbook=self.playbook)
        db.session.add(file_)
        db.session.commit()

        try:
            with open(path, 'r') as fd:
                data = fd.read()
            sha1 = models.content_sha1(data)
            content = models.FileContent.query.get(sha1)

            if content is None:
                content = models.FileContent(content=data)

            file_.content = content
        except IOError:
            LOG.warn('failed to open %s for reading', path)

        return file_

    def log_task(self, result, status, **kwargs):
        """
        'log_task' is called when an individual task instance on a single
        host completes. It is responsible for logging a single
        'TaskResult' record to the database.
        """
        LOG.debug('logging task result for task %s (%s), host %s',
                  self.task.name, self.task.id, result._host.get_name())

        # An include_role task might end up putting an IncludeRole object
        # inside the result object which we don't need
        # https://github.com/ansible/ansible/issues/30385
        if 'include_role' in result._result:
            del result._result['include_role']

        result.task_start = self.task.time_start
        result.task_end = datetime.now()
        host = self.get_or_create_host(result._host.get_name())

        # Use Ansible's CallbackBase._dump_results in order to strip internal
        # keys, respect no_log directive, etc.
        if self.loop_items:
            # NOTE (dmsimard): There is a known issue in which Ansible can send
            # callback hooks out of order and "exit" the task before all items
            # have returned, this can cause one of the items to be missing
            # from the task result in ARA.
            # https://github.com/ansible/ansible/issues/24207
            results = [self._dump_results(result._result)]
            for item in self.loop_items:
                results.append(self._dump_results(item._result))
            results = jsonutils.loads(jsonutils.dumps(results))
        else:
            results = jsonutils.loads(self._dump_results(result._result))

        # Ignore errors can be "yes" instead of a proper boolean in <2.3
        # for some reason
        ignore_errors = kwargs.get('ignore_errors', False)
        if LooseVersion(ansible_version) < LooseVersion('2.3.0'):
            if not isinstance(ignore_errors, bool):
                ignore_errors = True if ignore_errors == "yes" else False

        self.taskresult = models.TaskResult(
            task=self.task,
            host=host,
            time_start=result.task_start,
            time_end=result.task_end,
            result=jsonutils.dumps(results),
            status=status,
            changed=result._result.get('changed', False),
            failed=result._result.get('failed', False),
            skipped=result._result.get('skipped', False),
            unreachable=result._result.get('unreachable', False),
            ignore_errors=ignore_errors,
        )

        db.session.add(self.taskresult)
        db.session.commit()

        if self.task.action == 'setup' and 'ansible_facts' in result._result:
            values = jsonutils.dumps(result._result['ansible_facts'])
            facts = models.HostFacts(values=values)
            host.facts = facts

            db.session.add(facts)
            db.session.commit()

    def log_stats(self, stats):
        """
        Logs playbook statistics to the database.
        """
        LOG.debug('logging stats')
        hosts = sorted(stats.processed.keys())
        for hostname in hosts:
            host = self.get_or_create_host(hostname)
            host_stats = stats.summarize(hostname)
            db.session.add(models.Stats(
                playbook=self.playbook,
                host=host,
                changed=host_stats['changed'],
                unreachable=host_stats['unreachable'],
                failed=host_stats['failures'],
                ok=host_stats['ok'],
                skipped=host_stats['skipped']
            ))
            db.session.commit()

    def close_task(self):
        """
        Marks the completion time of the currently active task.
        """
        if self.task is not None:
            LOG.debug('closing task %s (%s)',
                      self.task.name,
                      self.task.id)
            self.task.stop()
            db.session.add(self.task)
            db.session.commit()

            self.task = None
            self.loop_items = []

    def close_play(self):
        """
        Marks the completion time of the currently active play.
        """
        if self.play is not None:
            LOG.debug('closing play %s (%s)', self.play.name, self.play.id)
            self.play.stop()
            db.session.add(self.play)
            db.session.commit()

            self.play = None

    def close_playbook(self):
        """
        Marks the completion time of the currently active playbook.
        """
        if self.playbook is not None:
            LOG.debug('closing playbook %s', self.playbook.path)
            self.playbook.stop()
            self.playbook.complete = True
            db.session.add(self.playbook)
            db.session.commit()

    def v2_runner_item_on_ok(self, result):
        self.loop_items.append(result)

    def v2_runner_item_on_failed(self, result):
        self.loop_items.append(result)

    def v2_runner_item_on_skipped(self, result):
        self.loop_items.append(result)

    def v2_runner_retry(self, result):
        self.loop_items.append(result)

    def v2_runner_on_ok(self, result, **kwargs):
        self.log_task(result, 'ok', **kwargs)

    def v2_runner_on_unreachable(self, result, **kwargs):
        self.log_task(result, 'unreachable', **kwargs)

    def v2_runner_on_failed(self, result, **kwargs):
        self.log_task(result, 'failed', **kwargs)

    def v2_runner_on_skipped(self, result, **kwargs):
        self.log_task(result, 'skipped', **kwargs)

    def v2_playbook_on_task_start(self, task, is_conditional,
                                  is_handler=False):
        self.close_task()

        LOG.debug('starting task %s (action %s)',
                  task.name, task.action)
        pathspec = task.get_path()
        if pathspec:
            path, lineno = pathspec.split(':', 1)
            lineno = int(lineno)
            file_ = self.get_or_create_file(path)
        else:
            path = self.playbook.path
            lineno = 1
            file_ = self.get_or_create_file(self.playbook.path)

        self.task = models.Task(
            name=task.get_name(),
            sortkey=next(self.task_counter),
            action=task.action,
            play=self.play,
            playbook=self.playbook,
            tags=jsonutils.dumps(task._attributes['tags']),
            file=file_,
            lineno=lineno,
            is_handler=is_handler)

        self.task.start()
        db.session.add(self.task)
        db.session.commit()

    def v2_playbook_on_handler_task_start(self, task):
        self.v2_playbook_on_task_start(task, False, is_handler=True)

    def v2_playbook_on_start(self, playbook):
        path = os.path.abspath(playbook._file_name)
        if self._options is not None:
            options = self._options.__dict__.copy()
        else:
            options = {}

        # Potentially sanitize some user-specified keys
        for parameter in app.config['ARA_IGNORE_PARAMETERS']:
            if parameter in options:
                msg = "Parameter not saved by ARA due to configuration"
                options[parameter] = msg

        LOG.debug('starting playbook %s', path)
        self.playbook = models.Playbook(
            ansible_version=ansible_version,
            path=path,
            options=options
        )

        self.playbook.start()
        db.session.add(self.playbook)
        db.session.commit()

        file_ = self.get_or_create_file(path)
        file_.is_playbook = True

        # We need to persist the playbook id so it can be used by the modules
        data = {
            'playbook': {
                'id': self.playbook.id
            }
        }
        tmpfile = os.path.join(app.config['ARA_TMP_DIR'], 'ara.json')
        with open(tmpfile, 'w') as file:
            file.write(jsonutils.dumps(data))

    def v2_playbook_on_play_start(self, play):
        self.close_task()
        self.close_play()

        LOG.debug('starting play %s', play.name)
        if self.play is not None:
            self.play.stop()

        self.play = models.Play(
            name=play.name,
            sortkey=next(self.play_counter),
            playbook=self.playbook
        )

        self.play.start()
        db.session.add(self.play)
        db.session.commit()

    def v2_playbook_on_stats(self, stats):
        self.log_stats(stats)

        self.close_task()
        self.close_play()
        self.close_playbook()

        LOG.debug('closing database')
        db.session.close()
