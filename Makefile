# Makefile for building Litmus and its tools
# Reference Guide - https://www.gnu.org/software/make/manual/make.html

#
# Internal variables or constants.
# NOTE - These will be executed when any make target is invoked.
#
IS_DOCKER_INSTALLED = $(shell which docker >> /dev/null 2>&1; echo $$?)

# list of playbooks which should be validated
#PLAYBOOKS = $(shell find ./ -iname 'test.yml' -printf '%P\n')
PLAYBOOKS = $(shell find ./ -iname *.yml -printf '%P\n' | grep 'ansible_logic.yml')

.PHONY: all
all: deps build syntax-checks lint-checks security-checks push

.PHONY: help
help:
	@echo ""
	@echo "Usage:-"
	@echo "\tmake all   -- [default] builds the litmus containers"
	@echo ""

.PHONY: deps
deps: _build_check_docker

_build_check_docker:
	@echo "------------------"
	@echo "--> Check the Docker deps" 
	@echo "------------------"
	@if [ $(IS_DOCKER_INSTALLED) -eq 1 ]; \
		then echo "" \
		&& echo "ERROR:\tdocker is not installed. Please install it before build." \
		&& echo "" \
		&& exit 1; \
		fi;

.PHONY: build
build: ansible-runner-build

ansible-runner-build:
	@echo "------------------"
	@echo "--> Build ansible-runner image" 
	@echo "------------------"
	sudo docker build . -f build/ansible-runner/Dockerfile -t litmuschaos/ansible-runner:ci

.PHONY: push
push: ansible-runner-push

ansible-runner-push:
	@echo "------------------"
	@echo "--> Push ansible-runner image" 
	@echo "------------------"
	REPONAME="litmuschaos" IMGNAME="ansible-runner" IMGTAG="ci" ./hack/push

.PHONY: syntax-checks
syntax-checks: ansible-syntax-check

ansible-syntax-check:
	@echo "------------------"
	@echo "--> Check playbook syntax"
	@echo "------------------"
	rc_sum=0; \
	for playbook in $(PLAYBOOKS); do \
		sudo docker run --rm -ti --entrypoint=ansible-playbook litmuschaos/ansible-runner:ci \
		$${playbook} --syntax-check -i /etc/ansible/hosts -v; \
		rc_sum=$$((rc_sum+$$?)); \
	done; \
	exit $${rc_sum}

.PHONY: security-checks
security-checks: trivy-security-check

trivy-security-check:
	@echo "------------------"
	@echo "--> Trivy Security Check"
	@echo "------------------"
	./trivy --exit-code 0 --severity HIGH --no-progress litmuschaos/ansible-runner:ci
	./trivy --exit-code 1 --severity CRITICAL --no-progress litmuschaos/ansible-runner:ci

.PHONY: lint-checks
lint-checks: ansible-lint-check

ansible-lint-check:
	@echo "------------------"
	@echo "--> Check ansible lint"
	@echo "------------------"
	docker run -ti litmuschaos/ansible-runner:ci bash -c "bash ansiblelint/lint-check.sh"