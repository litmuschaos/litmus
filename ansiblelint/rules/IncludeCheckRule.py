from ansiblelint import AnsibleLintRule

class IncludeCheckRule(AnsibleLintRule):
  id = '701'
  shortdesc = 'Deprecated include module'
  description = 'include module should be replace with (include_tasks/include_role/import_playbook/import_tasks)'
  tags = ['deprecated']

  # pylint: disable=R0201
  def match(self, file, line):
    commands = line.strip().split()
    if(len(commands) > 0 and 'include:' in commands):
      return True
    return False