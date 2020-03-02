from ansiblelint import AnsibleLintRule

class IgnoreErrorsCheckRule(AnsibleLintRule):
  id = '703'
  shortdesc = 'ignore_errors should not be use'
  description = 'Litmus Playbook does not recommend the use of ignore_errors'
  tags = ['productivity']

  # pylint: disable=R0201
  def match(self, file, line):
    commands = line.strip().split()
    if((len(commands) > 0) and ('ignore_errors:' in  commands)):
      return True
    return False