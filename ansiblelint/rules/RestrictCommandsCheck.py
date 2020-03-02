from ansiblelint import AnsibleLintRule

class RestrictCommandsCheck(AnsibleLintRule):
  id = '702'
  shortdesc = 'Warn against usage of bash utilities like awk/sed/cut/grep'
  description = 'Certain commands like awk/sed/cut/grep should not be use'
  tags = ['productivity']

  # pylint: disable=R0201
  def match(self, file, line):
    commands = line.strip().split()
    if((len(commands) > 0) and ('awk' in commands) or ('cut' in commands) or ('sed' in commands) or ('grep' in commands)):
      return True
    return False