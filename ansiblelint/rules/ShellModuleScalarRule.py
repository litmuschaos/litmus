from ansiblelint import AnsibleLintRule

class ShellModuleScalarRule(AnsibleLintRule):
  id = '700'
  shortdesc = 'Use scalar(">") for shell commands with multiple args'
  description = 'Requires scalar if shell command consist of args greater than three'
  tags = ['productivity']

  # pylint: disable=R0201
  def match(self, file, line):
    commands = line.strip().split()
    if(len(commands) > 0):
      # commands length is greater that 4 is because first command is the shell:
      # and it is restrict with the three more command length
      if(commands[0] == "shell:" and len(commands) > 4):
          return True
    return False
