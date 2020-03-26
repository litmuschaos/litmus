# list of playbooks which should be validated
PLAYBOOKS=`find / -iname *.yml -printf '%P\n' | grep 'ansible_logic.yml'`
# Check the ansible lint in every ansible_logic file
for playbook in $PLAYBOOKS; do \
    ansible-lint /$playbook -r /ansiblelint/rules -R -vv;  \
done;
exit 0;